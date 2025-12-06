<!-- components/forms/FormInput.vue -->

<!--
  2. Adds automatic validation without manual error handling
  3. No prop drilling - VeeValidate handles value/errors automatically
  4. Reusable across all forms
  
  HOW IT WORKS:
  - VeeValidate's <Field> component tracks field state (value, errors, touched)
  - We pass that state to BaseInput via props
  - BaseInput doesn't know VeeValidate exists (separation of concerns)
  
  VALIDATION TIMING:
  - validateOnInput: false = only validates on blur (after leaving field)
  - This prevents annoying "error while typing" experience
  - User types freely, sees errors after moving to next field
-->

<template>
  <Field :name="name" v-slot="{ field, errorMessage, meta }" :validate-on-input="false" :validate-on-blur="true">
    <!--
      field: { value, onChange, onBlur } - VeeValidate's field object
      errorMessage: Current validation error (if any)
      meta: { touched, valid, dirty } - Field state metadata
    -->
    <BaseInput
      :model-value="field.value"
      @update:model-value="field.onChange"
      @blur="field.onBlur"
      :type="type"
      :id="id || name"
      :label="label"
      :placeholder="placeholder"
      :error="errorMessage"
      :disabled="disabled"
      :required="required"
    />
    <!--
      WHY WE PASS THESE PROPS:
      - :model-value="field.value" - VeeValidate controls the value
      - @update:model-value="field.onChange" - Tell VeeValidate when value changes
      - @blur="field.onBlur" - Trigger validation when user leaves field
      - :error="errorMessage" - Show validation error from VeeValidate
    -->
  </Field>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate';
import BaseInput from './BaseInput.vue';

/**
 * Props for FormInput
 *
 * WHY THESE PROPS:
 * - name: Required by VeeValidate to identify field in schema
 * - Other props: Pass-through to BaseInput for normal input behavior
 */
interface Props {
  name: string; // Required: VeeValidate needs this to match validation rules
  label?: string; // Optional: Display label above input
  type?: string; // Optional: Input type (text, email, etc.) - default 'text'
  id?: string; // Optional: HTML id attribute - defaults to name if not provided
  placeholder?: string; // Optional: Placeholder text
  disabled?: boolean; // Optional: Disable input
  required?: boolean; // Optional: Show asterisk (*) in label
}

withDefaults(defineProps<Props>(), {
  type: 'text', // Default to text input if not specified
});

/**
 * USAGE EXAMPLE:
 *
 * <Form :validation-schema="schema" @submit="handleSubmit">
 *   <FormInput
 *     name="email"
 *     label="Email Address"
 *     type="email"
 *     placeholder="Enter your email"
 *     required
 *   />
 * </Form>
 *
 * No v-model, no error handling, no manual validation.
 * VeeValidate handles everything automatically.
 */
</script>

<!--
  WHY NO SUCCESS STATE:
  - Keeps UI cleaner - only show errors when there's a problem
  - If needed later later, just add:
    :success="meta.valid && meta.touched ? 'Looks good!' : undefined"
  
  WHY VALIDATE ON BLUR:
  - Better UX - users can type freely without immediate errors
  - Errors appear after they move to next field
  - Matches standard web form behavior
  
  NOTE
  - Just use <FormInput name="email" />
  - VeeValidate + schema handles everything
  - Consistent behavior across all forms
-->
