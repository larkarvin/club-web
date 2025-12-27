# Dynamic Form Fields - Vueform-Compatible Architecture

## UI-Only Wizard/Steps Implementation (Current Task)

Implement multi-step wizard UI for form builder with **mock data only** - no API calls.

### Files to Create
- `app/components/form-builder/pages/PageManager.vue` - Page list/management in sidebar
- `app/components/form-builder/preview/FormPreviewModal.vue` - Preview modal with wizard

### Files to Modify
- `app/pages/forms/[id]/fields.vue` - Add pages state, integrate PageManager
- `app/components/form-builder/canvas/FormCanvas.vue` - Filter fields by page, show page header
- `app/composables/useFormBuilder.js` - Add pages state, currentPageId, pageId on fields

### Mock Data Structure
```javascript
// Pages (local state, no API)
const pages = ref([
  { id: 'page-1', title: 'Personal Information', description: '' },
])
const currentPageId = ref('page-1')

// Fields get pageId when created
const field = { id: 'field-1', type: 'text', label: 'Name', pageId: 'page-1' }
```

### Implementation Order
1. Update useFormBuilder.js - add pages state and helpers
2. Create PageManager.vue component
3. Update fields.vue - integrate PageManager
4. Update FormCanvas.vue - filter by page, show page header
5. Create FormPreviewModal.vue with wizard navigation

---

## Problem Statement

The current `form_fields` table has fixed columns for specific field types. Adding new field types (country selector, address, file upload, image, video, phone with country code, HTML/paragraph, divider) would require adding many columns.

### User Requirements
- Country field with auto-populated options (no manual option creation)
- Ability to prioritize/pin certain countries at top
- Address field with complete address components
- File upload with configurable mimetypes and file size
- Image upload / Video upload
- Phone number with country code whitelisting
- Image-only display field (renders an image)
- HTML/paragraph field (static content)
- `<hr>` divider field

## How Vueform Does It

Vueform stores the **entire field configuration as a JSON schema object**. Each field is a key-value pair where:
- **Key** = field name (e.g., `email`, `country`, `avatar`)
- **Value** = object with `type` + all options for that type

```javascript
{
  "email": { "type": "text", "inputType": "email", "label": "Email", "rules": "required|email" },
  "country": { "type": "select", "items": "/api/countries", "search": true, "label": "Country" },
  "avatar": { "type": "file", "accept": "image/*", "drop": true, "view": "image" }
}
```

This is exactly what we should do.

## Recommended Database Schema

**Option A: Keep current structure + add `config` column** (Minimal change - RECOMMENDED)
```sql
ALTER TABLE form_fields ADD COLUMN config JSON NULL;
ALTER TABLE form_fields MODIFY type ENUM('text','textarea','email','phone','number','select','file','multiselect','country','address','image','video','html','divider');
```

**Option B: Simplify to pure schema storage** (Vueform-like)
```sql
-- Just store the whole schema as JSON per form
ALTER TABLE forms ADD COLUMN schema JSON NULL;
-- Keep form_fields for indexing/querying individual fields if needed
```

## Recommended: Option A (Hybrid)

Keep the structured columns for common properties, use `config` JSON for type-specific options.

### Updated `form_fields` Table

| Column | Type | Purpose |
|--------|------|---------|
| id | bigint | PK |
| form_id | bigint | FK |
| field_key | varchar(100) | Vueform schema key |
| type | enum | Element type |
| label | varchar(255) | Display label |
| placeholder | varchar(255) | Placeholder |
| description | text | Help text |
| required | bool | Is required |
| sort_order | int | Display order |
| **config** | **json** | **All type-specific options** |

### Type-Specific Config (Vueform-Compatible)

```json
// SelectElement
{
  "items": [{"value": "us", "label": "United States"}],  // or "/api/countries"
  "native": false,
  "search": true,
  "create": false,
  "multiple": false,
  "trackBy": ["label", "value"],
  "labelProp": "label",
  "valueProp": "value"
}

// FileElement
{
  "accept": ["image/*", "application/pdf"],
  "drop": true,
  "auto": true,
  "view": "file",           // file, image, gallery
  "maxSize": 5242880,       // 5MB
  "uploadEndpoint": "/api/upload"
}

// PhoneElement
{
  "include": ["US", "CA", "GB"],   // ISO country codes to show
  "exclude": [],                    // codes to hide
  "allowIncomplete": false,
  "unmask": true
}

// Country (special select with predefined items)
{
  "source": "countries",           // tells frontend to load from /api/data/countries
  "prioritize": ["US", "CA"],      // show these first
  "exclude": ["XX"],
  "search": true,
  "native": false
}

// AddressElement (composite field)
{
  "fields": ["street", "city", "state", "zip", "country"],
  "countrySource": "countries",
  "stateSource": "states:{country}",  // dynamic based on country
  "autocomplete": true                 // Google Places
}

// HtmlElement (static content)
{
  "content": "<p>Please read the <a href='/terms'>terms</a></p>",
  "tag": "div"
}

// DividerElement
{
  "style": "solid",
  "label": "Section Title"   // optional label in divider
}

// ImageElement (display only)
{
  "src": "/images/header.png",
  "alt": "Form Header",
  "width": 200
}
```

## API Response Format

The API should return Vueform-compatible schema:

```json
{
  "form": {
    "id": 1,
    "title": "Registration Form",
    "schema": {
      "name": { "type": "text", "label": "Full Name", "rules": "required" },
      "email": { "type": "text", "inputType": "email", "label": "Email" },
      "country": {
        "type": "select",
        "label": "Country",
        "items": "/api/data/countries",
        "search": true
      },
      "avatar": {
        "type": "file",
        "label": "Profile Photo",
        "accept": ["image/*"],
        "view": "image"
      }
    }
  }
}
```

## Implementation Steps

### 1. Database Migration
```php
Schema::table('form_fields', function (Blueprint $table) {
    $table->json('config')->nullable()->after('sort_order');
});

// Expand type enum
DB::statement("ALTER TABLE form_fields MODIFY COLUMN type ENUM(
    'text','textarea','email','phone','number',
    'select','multiselect','file','multifile',
    'country','address','image','video',
    'html','divider','static'
)");
```

### 2. Laravel Model Update
```php
// FormField.php
protected $casts = [
    'config' => 'array',
    'required' => 'boolean',
];

// Generate Vueform-compatible schema
public function toVueformSchema(): array
{
    return array_merge([
        'type' => $this->type,
        'label' => $this->label,
        'placeholder' => $this->placeholder,
        'description' => $this->description,
        'rules' => $this->required ? 'required' : null,
    ], $this->config ?? []);
}
```

### 3. Form Resource
```php
// FormResource.php
public function toArray($request)
{
    $schema = [];
    foreach ($this->fields as $field) {
        $schema[$field->field_key] = $field->toVueformSchema();
    }

    return [
        'id' => $this->id,
        'title' => $this->title,
        'schema' => $schema,
    ];
}
```

### 4. Data Sources API
```php
// routes/api.php
Route::get('/data/countries', [DataController::class, 'countries']);
Route::get('/data/states/{country}', [DataController::class, 'states']);

// DataController.php
public function countries()
{
    return collect(Countries::all())->map(fn($c) => [
        'value' => $c->cca2,
        'label' => $c->name->common,
    ]);
}
```

### 5. Frontend Field Registry
```javascript
// useFieldRegistry.js
const fieldTypes = {
  text: { icon: 'TextIcon', label: 'Text Input', configSchema: {...} },
  select: { icon: 'ListIcon', label: 'Dropdown', configSchema: {...} },
  country: { icon: 'GlobeIcon', label: 'Country', configSchema: {...} },
  file: { icon: 'UploadIcon', label: 'File Upload', configSchema: {...} },
  phone: { icon: 'PhoneIcon', label: 'Phone Number', configSchema: {...} },
  html: { icon: 'CodeIcon', label: 'HTML Content', configSchema: {...} },
  divider: { icon: 'MinusIcon', label: 'Divider', configSchema: {...} },
}
```

## Files to Modify

### Backend (Laravel - api.raceyaclub)
- `database/migrations/xxxx_add_config_to_form_fields.php` - New migration
- `app/Models/FormField.php` - Add config cast, toVueformSchema()
- `app/Http/Resources/FormResource.php` - Return Vueform schema
- `app/Http/Controllers/DataController.php` - New controller for data sources
- `routes/api.php` - Add data source routes

### Frontend (Nuxt - web.raceyaclub)
- `app/composables/useFieldRegistry.js` - Register new field types
- `app/components/form-builder/properties/*` - Config editors per type
- `app/components/form-builder/canvas/*` - Preview components per type

## Benefits

- **No schema changes** when adding new field types
- **Flexible** per-type configuration
- **Easy to extend** with new options
- **Backward compatible** with existing fields (config defaults to null)
- **Vueform compatible** - Can render forms using Vueform library directly

---

## Submissions (No Versioning)

Simple approach: store submission data as JSON, always use current schema.

### Database Schema

```sql
CREATE TABLE form_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    data JSON NOT NULL,                -- { "field_key": "value", ... }
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'submitted',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### How It Works

1. **User submits** → save field values as JSON `data`
2. **Form owner adds new field** → existing submissions unaffected
3. **User edits submission** → current schema loads, old data fills matching fields, new fields empty
4. **User saves** → `data` JSON now includes new field values

### Editing Submissions

```javascript
// Frontend: Load submission for editing
const loadSubmission = async (submissionId) => {
  const { submission, schema } = await api.get(`/submissions/${submissionId}/edit`)

  // Vueform's load() fills matching fields, leaves new fields empty
  form$.value.load(submission.data)
}
```

```php
// Backend: Always return current schema
public function edit(FormSubmission $submission)
{
    return [
        'submission' => $submission,
        'schema' => $submission->form->fields->mapWithKeys(fn($f) => [
            $f->field_key => $f->toVueformSchema()
        ]),
    ];
}
```

### Handling Schema Changes

- **Missing fields** (new fields added): Show empty in form, user can fill
- **Orphaned data** (fields deleted): Kept in JSON, ignored in form view, included in export
- **No versioning needed**: Submissions always upgrade to latest schema on edit

---

## URL Structure & Routes

### Form Management (Admin)

| URL | Purpose |
|-----|---------|
| `/{club}.raceyaclub.com/forms` | List all forms |
| `/{club}.raceyaclub.com/forms/new` | Create new form |
| `/{club}.raceyaclub.com/forms/{id}/fields` | Form builder (edit fields) |
| `/{club}.raceyaclub.com/forms/{id}/settings` | Form settings (title, visibility, etc) |
| `/{club}.raceyaclub.com/forms/{id}/submissions` | View submissions list |
| `/{club}.raceyaclub.com/forms/{id}/submissions/{submissionId}` | View single submission |

### Public Form Access

| URL | Purpose |
|-----|---------|
| `/{club}.raceyaclub.com/f/{slug}` | Public form page (submit new) |
| `/{club}.raceyaclub.com/f/{slug}/submit` | Alternative submit URL |
| `/{club}.raceyaclub.com/f/{slug}/success` | Thank you page after submit |

### User Submissions (Members)

| URL | Purpose |
|-----|---------|
| `/{club}.raceyaclub.com/my-submissions` | User's own submissions |
| `/{club}.raceyaclub.com/my-submissions/{id}` | View own submission |
| `/{club}.raceyaclub.com/my-submissions/{id}/edit` | Edit own submission |

### API Routes

```php
// Form management (authenticated, club admin)
Route::prefix('forms')->group(function () {
    Route::get('/', [FormController::class, 'index']);
    Route::post('/', [FormController::class, 'store']);
    Route::get('/{form}', [FormController::class, 'show']);
    Route::put('/{form}', [FormController::class, 'update']);
    Route::delete('/{form}', [FormController::class, 'destroy']);

    // Fields
    Route::get('/{form}/fields', [FormFieldController::class, 'index']);
    Route::post('/{form}/fields', [FormFieldController::class, 'store']);
    Route::put('/{form}/fields/{field}', [FormFieldController::class, 'update']);
    Route::delete('/{form}/fields/{field}', [FormFieldController::class, 'destroy']);
    Route::post('/{form}/fields/reorder', [FormFieldController::class, 'reorder']);

    // Submissions (admin view)
    Route::get('/{form}/submissions', [FormSubmissionController::class, 'index']);
    Route::get('/{form}/submissions/export', [FormSubmissionController::class, 'export']);
    Route::get('/{form}/submissions/{submission}', [FormSubmissionController::class, 'show']);
    Route::delete('/{form}/submissions/{submission}', [FormSubmissionController::class, 'destroy']);
});

// Public form access (by slug)
Route::get('/f/{slug}', [PublicFormController::class, 'show']);
Route::post('/f/{slug}/submit', [PublicFormController::class, 'submit']);

// User's own submissions
Route::prefix('my-submissions')->group(function () {
    Route::get('/', [UserSubmissionController::class, 'index']);
    Route::get('/{submission}', [UserSubmissionController::class, 'show']);
    Route::get('/{submission}/edit', [UserSubmissionController::class, 'edit']);
    Route::put('/{submission}', [UserSubmissionController::class, 'update']);
});
```

### Form Visibility

```php
// forms table
ALTER TABLE forms ADD COLUMN visibility ENUM('public', 'members', 'private') DEFAULT 'members';
ALTER TABLE forms ADD COLUMN slug VARCHAR(100) UNIQUE;
ALTER TABLE forms ADD COLUMN allow_edit BOOLEAN DEFAULT TRUE;  -- Can users edit their submission?
ALTER TABLE forms ADD COLUMN one_per_user BOOLEAN DEFAULT FALSE;  -- One submission per user?
```

**Visibility options:**
- `public` - Anyone can view and submit (no login required)
- `members` - Only club members can view and submit
- `private` - Only visible in admin, used for internal forms

---

## File Uploads (S3) - Upload on Submit

Files are uploaded **when the form is submitted**, not before. This eliminates orphaned files.

### Upload Flow

1. User selects file → stored in browser memory
2. User clicks submit → frontend uploads files to S3 first
3. Frontend sends S3 keys with form data to API
4. API saves submission with file references

**No `form_uploads` table needed** - file info stored directly in submission JSON.

### S3 Key Structure

```
clubs/{club_id}/forms/{form_id}/submissions/{submission_id}/{field_key}/{filename}
```

Example: `clubs/5/forms/12/submissions/99/profile_photo/photo.jpg`

### API Endpoints

```php
// Get presigned upload URL (called during submit)
Route::post('/forms/{form}/upload-url', [FormUploadController::class, 'getUploadUrl']);

// Download file (generates presigned download URL)
Route::get('/forms/{form}/download', [FormUploadController::class, 'download']);
```

### Backend Implementation

```php
// FormUploadController.php
public function getUploadUrl(Request $request, Form $form)
{
    $request->validate([
        'field_key' => 'required|string',
        'filename' => 'required|string',
        'content_type' => 'required|string',
        'submission_id' => 'nullable|integer',  // For edits
    ]);

    // Validate field exists and accepts this file type
    $field = $form->fields()->where('field_key', $request->field_key)->firstOrFail();
    $this->validateMimeType($request->content_type, $field->config['accept'] ?? null);

    $uuid = Str::uuid();
    $submissionPart = $request->submission_id ?? "new-{$uuid}";
    $s3Key = "clubs/{$form->club_id}/forms/{$form->id}/submissions/{$submissionPart}/{$request->field_key}/{$request->filename}";

    // Generate presigned URL (10 min expiry for upload)
    $presignedUrl = Storage::disk('s3')->temporaryUploadUrl(
        $s3Key,
        now()->addMinutes(10),
        ['ContentType' => $request->content_type]
    );

    return [
        'upload_url' => $presignedUrl,
        's3_key' => $s3Key,
    ];
}

public function download(Request $request, Form $form)
{
    $request->validate(['s3_key' => 'required|string']);

    // Verify the s3_key belongs to this form
    if (!str_contains($request->s3_key, "forms/{$form->id}/")) {
        abort(403);
    }

    $url = Storage::disk('s3')->temporaryUrl($request->s3_key, now()->addHour());
    return ['download_url' => $url];
}
```

### Frontend Submit with Files

```javascript
const handleSubmit = async (formData) => {
    const processedData = { ...formData };

    // Upload files first
    for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
            processedData[key] = await uploadFile(value, key);
        }
        // Handle multiple files
        if (Array.isArray(value) && value[0] instanceof File) {
            processedData[key] = await Promise.all(
                value.map(file => uploadFile(file, key))
            );
        }
    }

    // Submit form with S3 keys
    await api.post(`/f/${slug}/submit`, { data: processedData });
}

const uploadFile = async (file, fieldKey) => {
    // 1. Get presigned URL
    const { upload_url, s3_key } = await api.post(`/forms/${formId}/upload-url`, {
        field_key: fieldKey,
        filename: file.name,
        content_type: file.type,
        submission_id: existingSubmissionId || null,
    });

    // 2. Upload directly to S3
    await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
    });

    // 3. Return file info for submission data
    return {
        s3_key,
        name: file.name,
        size: file.size,
        type: file.type,
    };
}
```

### Submission Data with Files

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "profile_photo": {
    "s3_key": "clubs/5/forms/12/submissions/99/profile_photo/photo.jpg",
    "name": "photo.jpg",
    "size": 245678,
    "type": "image/jpeg"
  },
  "documents": [
    { "s3_key": "...", "name": "doc1.pdf", "size": 102400, "type": "application/pdf" },
    { "s3_key": "...", "name": "doc2.pdf", "size": 204800, "type": "application/pdf" }
  ]
}
```

### File Display in Form (Edit Mode)

```vue
<template>
  <div v-if="existingFile" class="existing-file flex items-center gap-2">
    <span>{{ existingFile.name }}</span>
    <button @click="downloadFile" class="text-brand-500">Download</button>
    <button @click="removeFile" class="text-error-500">Remove</button>
  </div>
  <input v-else type="file" @change="handleFileSelect" :accept="field.config?.accept" />
</template>

<script setup>
const downloadFile = async () => {
    const { download_url } = await api.post(`/forms/${formId}/download`, {
        s3_key: existingFile.s3_key
    });
    window.open(download_url, '_blank');
}

const removeFile = () => {
    // Just clear from form data - file stays in S3 until submission deleted
    // Or delete immediately if you prefer
    emit('update:modelValue', null);
}
</script>
```

### Deleting Files

When a submission is deleted, clean up S3 files:

```php
// FormSubmission model
protected static function booted()
{
    static::deleting(function ($submission) {
        // Delete all files for this submission
        $prefix = "clubs/{$submission->form->club_id}/forms/{$submission->form_id}/submissions/{$submission->id}/";
        Storage::disk('s3')->deleteDirectory($prefix);
    });
}
```

---

## CSV Export with File URLs

For file fields, export **presigned download URLs** (valid for 24 hours):

```php
public function export(Form $form)
{
    $submissions = $form->submissions()->get();
    $fields = $form->fields()->orderBy('sort_order')->get();

    $rows = $submissions->map(function ($sub) use ($fields) {
        $row = [
            'id' => $sub->id,
            'user_id' => $sub->user_id,
            'submitted_at' => $sub->submitted_at,
        ];

        foreach ($fields as $field) {
            $value = $sub->data[$field->field_key] ?? null;

            if (in_array($field->type, ['file', 'image', 'video', 'multifile'])) {
                $row[$field->field_key] = $this->formatFileForExport($value);
            } else {
                $row[$field->field_key] = $value;
            }
        }

        return $row;
    });

    return $this->toCsv($rows);
}

private function formatFileForExport($fileData)
{
    if (!$fileData) return '';

    // Single file
    if (isset($fileData['s3_key'])) {
        $url = Storage::disk('s3')->temporaryUrl($fileData['s3_key'], now()->addDay());
        return "{$fileData['name']}: {$url}";
    }

    // Multiple files
    if (is_array($fileData) && isset($fileData[0]['s3_key'])) {
        return collect($fileData)->map(function ($f) {
            $url = Storage::disk('s3')->temporaryUrl($f['s3_key'], now()->addDay());
            return "{$f['name']}: {$url}";
        })->join("\n");
    }

    return '';
}
```

### CSV Output Example

| id | name | email | profile_photo | documents |
|----|------|-------|---------------|-----------|
| 1 | John | john@... | photo.jpg: https://s3.../... | doc1.pdf: https://s3.../...<br>doc2.pdf: https://s3.../... |

---

## Payments (Omnipay)

Support for multiple payment gateways using Omnipay (PayPal + custom gateway).

### Database Schema

```sql
-- Payment columns on form_submissions
ALTER TABLE form_submissions ADD COLUMN payment_status ENUM('not_required', 'pending', 'paid', 'failed', 'refunded') DEFAULT 'not_required';
ALTER TABLE form_submissions ADD COLUMN payment_amount INT UNSIGNED NULL;  -- cents
ALTER TABLE form_submissions ADD COLUMN payment_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE form_submissions ADD COLUMN payment_gateway VARCHAR(50) NULL;  -- 'paypal', 'custom', etc.
ALTER TABLE form_submissions ADD COLUMN payment_transaction_id VARCHAR(255) NULL;
ALTER TABLE form_submissions ADD COLUMN payment_data JSON NULL;  -- Gateway-specific data
ALTER TABLE form_submissions ADD COLUMN paid_at TIMESTAMP NULL;

-- Payment gateway settings per club
CREATE TABLE club_payment_gateways (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT UNSIGNED NOT NULL,
    gateway VARCHAR(50) NOT NULL,  -- 'paypal', 'custom'
    is_active BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    config JSON NOT NULL,  -- Encrypted credentials
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (club_id, gateway),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);
```

### Select Field with Prices

```json
// Field config for select with prices
{
  "type": "select",
  "label": "Registration Package",
  "items": [
    { "value": "basic", "label": "Basic", "price": 0 },
    { "value": "standard", "label": "Standard", "price": 2500 },
    { "value": "premium", "label": "Premium", "price": 5000 }
  ],
  "showPrice": true  // Display price next to label
}
```

### Payment Flow

```
┌─────────────────────────────────────────────┐
│  1. User fills form                         │
│  2. Order summary shows at bottom           │
│  3. Click "Submit & Pay $75.00"             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. Upload files to S3                      │
│  5. Create submission (payment_status:      │
│     'pending')                              │
│  6. Create Omnipay purchase request         │
│  7. Redirect to PayPal/gateway              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  8. User completes payment                  │
│  9. Gateway redirects to callback URL       │
│  10. Webhook/callback updates submission    │
│      (payment_status: 'paid')               │
│  11. Redirect to success page               │
└─────────────────────────────────────────────┘
```

### API Routes

```php
// Payment routes
Route::post('/f/{slug}/submit', [PublicFormController::class, 'submit']);
Route::get('/payments/{submission}/checkout', [PaymentController::class, 'checkout']);
Route::get('/payments/{submission}/complete', [PaymentController::class, 'complete']);  // Return URL
Route::get('/payments/{submission}/cancel', [PaymentController::class, 'cancel']);
Route::post('/payments/webhook/{gateway}', [PaymentController::class, 'webhook']);

// Resume incomplete payment
Route::post('/my-submissions/{submission}/pay', [UserSubmissionController::class, 'pay']);
```

### Backend Implementation

```php
// app/Services/PaymentService.php
class PaymentService
{
    public function getGateway(Club $club, string $gatewayName = null): \Omnipay\Common\GatewayInterface
    {
        $settings = $club->paymentGateways()
            ->where('gateway', $gatewayName ?? $club->default_gateway)
            ->where('is_active', true)
            ->firstOrFail();

        $gateway = Omnipay::create($this->getGatewayClass($settings->gateway));
        $gateway->initialize(decrypt($settings->config));

        return $gateway;
    }

    private function getGatewayClass(string $name): string
    {
        return match($name) {
            'paypal' => 'PayPal_Rest',
            'custom' => 'App\\Payment\\CustomGateway',
            default => throw new \Exception("Unknown gateway: {$name}"),
        };
    }

    public function calculateTotal(array $formData, Collection $fields): int
    {
        $total = 0;

        foreach ($fields as $field) {
            if (!isset($formData[$field->field_key])) continue;

            $value = $formData[$field->field_key];
            $items = $field->config['items'] ?? [];

            // Handle single select
            if (is_string($value)) {
                $selected = collect($items)->firstWhere('value', $value);
                $total += $selected['price'] ?? 0;
            }

            // Handle multi-select
            if (is_array($value)) {
                foreach ($value as $v) {
                    $selected = collect($items)->firstWhere('value', $v);
                    $total += $selected['price'] ?? 0;
                }
            }
        }

        return $total;
    }
}

// app/Http/Controllers/PublicFormController.php
public function submit(Request $request, string $slug)
{
    $form = Form::where('slug', $slug)->firstOrFail();
    $paymentService = app(PaymentService::class);

    // Calculate total
    $total = $paymentService->calculateTotal($request->data, $form->fields);

    // Create submission
    $submission = FormSubmission::create([
        'form_id' => $form->id,
        'user_id' => auth()->id(),
        'data' => $request->data,
        'payment_status' => $total > 0 ? 'pending' : 'not_required',
        'payment_amount' => $total,
        'submitted_at' => $total > 0 ? null : now(),  // Only set if no payment needed
    ]);

    if ($total > 0) {
        // Return checkout URL
        return [
            'submission_id' => $submission->id,
            'requires_payment' => true,
            'checkout_url' => "/payments/{$submission->id}/checkout",
        ];
    }

    return [
        'submission_id' => $submission->id,
        'requires_payment' => false,
        'redirect_url' => "/f/{$slug}/success",
    ];
}

// app/Http/Controllers/PaymentController.php
public function checkout(FormSubmission $submission)
{
    $club = $submission->form->club;
    $gateway = app(PaymentService::class)->getGateway($club);

    $response = $gateway->purchase([
        'amount' => $submission->payment_amount / 100,
        'currency' => $submission->payment_currency,
        'description' => "Form: {$submission->form->title}",
        'returnUrl' => url("/payments/{$submission->id}/complete"),
        'cancelUrl' => url("/payments/{$submission->id}/cancel"),
        'metadata' => [
            'submission_id' => $submission->id,
        ],
    ])->send();

    if ($response->isRedirect()) {
        // Store transaction reference for later
        $submission->update([
            'payment_gateway' => $club->default_gateway,
            'payment_transaction_id' => $response->getTransactionReference(),
        ]);

        return redirect($response->getRedirectUrl());
    }

    // Handle immediate success (some gateways)
    if ($response->isSuccessful()) {
        $this->markAsPaid($submission, $response);
        return redirect("/f/{$submission->form->slug}/success");
    }

    // Handle error
    return redirect("/f/{$submission->form->slug}?error=" . urlencode($response->getMessage()));
}

public function complete(FormSubmission $submission)
{
    $gateway = app(PaymentService::class)->getGateway(
        $submission->form->club,
        $submission->payment_gateway
    );

    $response = $gateway->completePurchase([
        'transactionReference' => $submission->payment_transaction_id,
    ])->send();

    if ($response->isSuccessful()) {
        $this->markAsPaid($submission, $response);
        return redirect("/f/{$submission->form->slug}/success");
    }

    $submission->update(['payment_status' => 'failed']);
    return redirect("/f/{$submission->form->slug}?error=payment_failed");
}

public function cancel(FormSubmission $submission)
{
    // Payment status stays 'pending' - user can retry later
    return redirect("/my-submissions/{$submission->id}?status=cancelled");
}

private function markAsPaid(FormSubmission $submission, $response)
{
    $submission->update([
        'payment_status' => 'paid',
        'payment_transaction_id' => $response->getTransactionReference(),
        'payment_data' => $response->getData(),
        'paid_at' => now(),
        'submitted_at' => now(),
    ]);
}
```

### Frontend: Order Summary Component

```vue
<!-- components/form/OrderSummary.vue -->
<template>
  <div v-if="lineItems.length > 0" class="border-t border-gray-200 mt-6 pt-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

    <div class="space-y-2">
      <div
        v-for="item in lineItems"
        :key="item.fieldKey"
        class="flex justify-between text-sm"
      >
        <span class="text-gray-600">{{ item.label }}</span>
        <span class="text-gray-900">{{ formatPrice(item.price) }}</span>
      </div>
    </div>

    <div class="border-t border-gray-200 mt-4 pt-4 flex justify-between font-medium">
      <span>Total</span>
      <span class="text-lg">{{ formatPrice(total) }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: Object,
  schema: Object,
})

const lineItems = computed(() => {
  const items = []

  for (const [key, field] of Object.entries(props.schema)) {
    const value = props.formData[key]
    if (!value || !field.config?.items) continue

    const fieldItems = field.config.items

    // Single select
    if (typeof value === 'string') {
      const selected = fieldItems.find(i => i.value === value)
      if (selected?.price > 0) {
        items.push({
          fieldKey: key,
          label: `${field.label}: ${selected.label}`,
          price: selected.price,
        })
      }
    }

    // Multi-select
    if (Array.isArray(value)) {
      value.forEach(v => {
        const selected = fieldItems.find(i => i.value === v)
        if (selected?.price > 0) {
          items.push({
            fieldKey: `${key}-${v}`,
            label: `${field.label}: ${selected.label}`,
            price: selected.price,
          })
        }
      })
    }
  }

  return items
})

const total = computed(() => lineItems.value.reduce((sum, item) => sum + item.price, 0))

const formatPrice = (cents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
</script>
```

### Frontend: Submit with Payment

```javascript
const handleSubmit = async (formData) => {
    // Upload files first
    const processedData = await processFilesForSubmit(formData);

    // Submit form
    const response = await api.post(`/f/${slug}/submit`, { data: processedData });

    if (response.requires_payment) {
        // Redirect to payment gateway
        window.location.href = response.checkout_url;
    } else {
        // No payment needed, go to success
        router.push(response.redirect_url);
    }
}
```

### Resume Incomplete Payment

```vue
<!-- In my-submissions/[id].vue -->
<template>
  <div v-if="submission.payment_status === 'pending'" class="bg-warning-50 p-4 rounded-lg">
    <p class="text-warning-800">Payment incomplete. Please complete your payment to finalize submission.</p>
    <button
      @click="resumePayment"
      class="mt-2 bg-brand-500 text-white px-4 py-2 rounded-lg"
    >
      Complete Payment ({{ formatPrice(submission.payment_amount) }})
    </button>
  </div>
</template>

<script setup>
const resumePayment = async () => {
    const response = await api.post(`/my-submissions/${submission.id}/pay`);
    window.location.href = response.checkout_url;
}
</script>
```

### Custom Omnipay Gateway Template

```php
// app/Payment/CustomGateway.php
namespace App\Payment;

use Omnipay\Common\AbstractGateway;

class CustomGateway extends AbstractGateway
{
    public function getName()
    {
        return 'Custom';
    }

    public function getDefaultParameters()
    {
        return [
            'apiKey' => '',
            'secretKey' => '',
            'testMode' => true,
        ];
    }

    public function purchase(array $parameters = [])
    {
        return $this->createRequest(CustomPurchaseRequest::class, $parameters);
    }

    public function completePurchase(array $parameters = [])
    {
        return $this->createRequest(CustomCompletePurchaseRequest::class, $parameters);
    }
}
```

### Admin: Submissions List with Payment Status

```php
// In export, include payment info
$row['payment_status'] = $sub->payment_status;
$row['payment_amount'] = $sub->payment_amount ? $sub->payment_amount / 100 : '';
$row['paid_at'] = $sub->paid_at;
```

---

## Multi-Step Forms (Wizard)

Form owners can organize fields into pages/steps with titles.

### How It Works

- **Page** = a step in the wizard with a title
- Fields belong to a page (via `page_id` or page order)
- User navigates: Previous / Next between pages
- Submit button only on last page
- Order summary (if payments) shows on last page before submit

### Database Schema

```sql
-- Form pages/steps
CREATE TABLE form_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Add page reference to fields
ALTER TABLE form_fields ADD COLUMN page_id BIGINT UNSIGNED NULL;
ALTER TABLE form_fields ADD FOREIGN KEY (page_id) REFERENCES form_pages(id) ON DELETE SET NULL;
```

**Note:** If `page_id` is NULL, field belongs to a default "untitled" page (for single-page forms).

### API Response with Pages

```json
{
  "form": {
    "id": 1,
    "title": "Race Registration",
    "pages": [
      {
        "id": 1,
        "title": "Personal Information",
        "description": "Tell us about yourself",
        "sort_order": 0,
        "fields": {
          "name": { "type": "text", "label": "Full Name", "rules": "required" },
          "email": { "type": "text", "inputType": "email", "label": "Email" }
        }
      },
      {
        "id": 2,
        "title": "Race Options",
        "description": "Choose your race category",
        "sort_order": 1,
        "fields": {
          "category": { "type": "select", "label": "Category", "items": [...] },
          "tshirt": { "type": "select", "label": "T-Shirt Size", "items": [...] }
        }
      },
      {
        "id": 3,
        "title": "Review & Pay",
        "description": null,
        "sort_order": 2,
        "fields": {}
      }
    ]
  }
}
```

### Backend: Form Resource with Pages

```php
// FormResource.php
public function toArray($request)
{
    $pages = $this->pages()->orderBy('sort_order')->get();

    // Group fields by page
    $fieldsByPage = $this->fields()
        ->orderBy('sort_order')
        ->get()
        ->groupBy('page_id');

    $pagesData = $pages->map(function ($page) use ($fieldsByPage) {
        $pageFields = $fieldsByPage->get($page->id, collect());

        return [
            'id' => $page->id,
            'title' => $page->title,
            'description' => $page->description,
            'sort_order' => $page->sort_order,
            'fields' => $pageFields->mapWithKeys(fn($f) => [
                $f->field_key => $f->toVueformSchema()
            ]),
        ];
    });

    // Handle fields without a page (single-page form or orphaned fields)
    $orphanFields = $fieldsByPage->get(null, collect());
    if ($orphanFields->isNotEmpty() && $pages->isEmpty()) {
        $pagesData = collect([[
            'id' => null,
            'title' => null,
            'description' => null,
            'sort_order' => 0,
            'fields' => $orphanFields->mapWithKeys(fn($f) => [
                $f->field_key => $f->toVueformSchema()
            ]),
        ]]);
    }

    return [
        'id' => $this->id,
        'title' => $this->title,
        'slug' => $this->slug,
        'pages' => $pagesData,
    ];
}
```

### Frontend: Wizard Component

```vue
<!-- components/form/FormWizard.vue -->
<template>
  <div class="form-wizard">
    <!-- Progress indicator -->
    <div v-if="pages.length > 1" class="flex items-center justify-center mb-8">
      <template v-for="(page, index) in pages" :key="page.id">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium"
          :class="{
            'bg-brand-500 text-white': index <= currentPage,
            'bg-gray-200 text-gray-600': index > currentPage
          }"
        >
          {{ index + 1 }}
        </div>
        <div
          v-if="index < pages.length - 1"
          class="w-16 h-1 mx-2"
          :class="{
            'bg-brand-500': index < currentPage,
            'bg-gray-200': index >= currentPage
          }"
        />
      </template>
    </div>

    <!-- Page title -->
    <div v-if="currentPageData.title" class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900">{{ currentPageData.title }}</h2>
      <p v-if="currentPageData.description" class="text-gray-600 mt-1">
        {{ currentPageData.description }}
      </p>
    </div>

    <!-- Fields for current page -->
    <Vueform
      ref="form$"
      :schema="currentPageData.fields"
      v-model="formData"
      :display-errors="false"
    />

    <!-- Order summary on last page -->
    <OrderSummary
      v-if="isLastPage && hasPayment"
      :form-data="formData"
      :schema="allFields"
    />

    <!-- Navigation -->
    <div class="flex justify-between mt-8">
      <button
        v-if="currentPage > 0"
        @click="previousPage"
        type="button"
        class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Previous
      </button>
      <div v-else></div>

      <button
        v-if="!isLastPage"
        @click="nextPage"
        type="button"
        class="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
      >
        Next
      </button>

      <button
        v-else
        @click="handleSubmit"
        type="button"
        :disabled="isSubmitting"
        class="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
      >
        <span v-if="total > 0">Submit & Pay {{ formatPrice(total) }}</span>
        <span v-else>Submit</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import OrderSummary from './OrderSummary.vue'

const props = defineProps({
  pages: Array,
  hasPayment: Boolean,
})

const emit = defineEmits(['submit'])

const form$ = ref(null)
const formData = ref({})
const currentPage = ref(0)
const isSubmitting = ref(false)

const currentPageData = computed(() => props.pages[currentPage.value])
const isLastPage = computed(() => currentPage.value === props.pages.length - 1)

// Combine all fields for total calculation
const allFields = computed(() => {
  return props.pages.reduce((acc, page) => ({ ...acc, ...page.fields }), {})
})

const total = computed(() => {
  // Calculate from fields with prices
  let sum = 0
  for (const [key, field] of Object.entries(allFields.value)) {
    const value = formData.value[key]
    if (!value || !field.items) continue

    if (typeof value === 'string') {
      const selected = field.items.find(i => i.value === value)
      sum += selected?.price ?? 0
    }
    if (Array.isArray(value)) {
      value.forEach(v => {
        const selected = field.items.find(i => i.value === v)
        sum += selected?.price ?? 0
      })
    }
  }
  return sum
})

const nextPage = async () => {
  // Validate current page fields
  const isValid = await form$.value.validate()
  if (!isValid) return

  currentPage.value++
}

const previousPage = () => {
  currentPage.value--
}

const handleSubmit = async () => {
  // Validate last page
  const isValid = await form$.value.validate()
  if (!isValid) return

  isSubmitting.value = true
  emit('submit', formData.value)
}

const formatPrice = (cents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
</script>
```

### Form Builder: Page Management

```vue
<!-- In form builder sidebar or canvas -->
<template>
  <div class="pages-manager">
    <h3 class="font-medium mb-4">Pages</h3>

    <draggable
      v-model="pages"
      item-key="id"
      @end="reorderPages"
      class="space-y-2"
    >
      <template #item="{ element: page, index }">
        <div
          class="p-3 bg-white border rounded-lg cursor-pointer"
          :class="{ 'border-brand-500': selectedPageId === page.id }"
          @click="selectPage(page.id)"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ page.title || `Page ${index + 1}` }}</span>
            <button @click.stop="deletePage(page.id)" class="text-error-500">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
          <span class="text-sm text-gray-500">
            {{ getFieldCount(page.id) }} fields
          </span>
        </div>
      </template>
    </draggable>

    <button
      @click="addPage"
      class="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-500 hover:text-brand-500"
    >
      + Add Page
    </button>
  </div>
</template>

<script setup>
const addPage = async () => {
  const page = await api.post(`/forms/${formId}/pages`, {
    title: `Page ${pages.value.length + 1}`,
    sort_order: pages.value.length,
  })
  pages.value.push(page)
  selectPage(page.id)
}

const deletePage = async (pageId) => {
  if (!confirm('Delete this page? Fields will be moved to the first page.')) return

  await api.delete(`/forms/${formId}/pages/${pageId}`)
  pages.value = pages.value.filter(p => p.id !== pageId)
}

const reorderPages = async () => {
  await api.post(`/forms/${formId}/pages/reorder`, {
    order: pages.value.map(p => p.id)
  })
}
</script>
```

### API Routes for Pages

```php
// Page management
Route::prefix('forms/{form}/pages')->group(function () {
    Route::get('/', [FormPageController::class, 'index']);
    Route::post('/', [FormPageController::class, 'store']);
    Route::put('/{page}', [FormPageController::class, 'update']);
    Route::delete('/{page}', [FormPageController::class, 'destroy']);
    Route::post('/reorder', [FormPageController::class, 'reorder']);
});
```

### Drag Field to Different Page

When dragging fields in the builder, allow moving between pages:

```javascript
// In form builder
const moveFieldToPage = async (fieldId, newPageId) => {
  await api.put(`/forms/${formId}/fields/${fieldId}`, {
    page_id: newPageId
  })
}

// Or batch update when reordering
const reorderFields = async (pageId, fieldIds) => {
  await api.post(`/forms/${formId}/fields/reorder`, {
    page_id: pageId,
    order: fieldIds
  })
}
```

### Single-Page Forms (Backward Compatible)

Forms without pages work as before:
- No `form_pages` records
- All fields have `page_id = NULL`
- API returns one page with `id: null, title: null`
- Frontend renders without wizard UI

---

## Sources
- [Vueform SelectElement Reference](https://vueform.com/reference/select-element)
- [Vueform FileElement Reference](https://vueform.com/reference/file-element)
- [Vueform PhoneElement Reference](https://vueform.com/reference/phone-element)
- [Vueform MultifileElement Reference](https://vueform.com/reference/multifile-element)
- [Vueform Handling Form Data](https://vueform.com/docs/handling-form-data)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
- [Laravel S3 Temporary URLs](https://laravel.com/docs/filesystem#temporary-urls)
