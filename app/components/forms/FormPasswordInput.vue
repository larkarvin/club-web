<!-- components/forms/FormPasswordInput.vue -->

<!--
  WHY THIS COMPONENT EXISTS:
  
  Password inputs need special features that regular inputs don't:
  1. Show/hide password toggle (eye icon)
  2. Real-time strength indicator (weak/medium/strong)
  3. Visual feedback as user types
  4. VeeValidate integration for validation
  
  WHY NOT USE BaseInput:
  - BaseInput is too simple for password-specific features
  - We need custom UI (strength meter, toggle button)
  - But we still reuse the same styling patterns (useInputClasses)
  
  VALIDATION TIMING:
  - Validation on blur (like FormInput)
  - But strength meter updates in real-time as you type
  - This gives instant feedback without annoying errors
-->

<template>
  <Field :name="name" v-slot="{ field, errorMessage, meta }" :validate-on-input="false" :validate-on-blur="true">
    <div class="w-full">
      <!-- Label -->
      <label v-if="label" :for="id || name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {{ label }}
        <span v-if="required" class="text-error-500">*</span>
      </label>

      <!-- Password Input with Toggle -->
      <div class="relative">
        <input
          :value="field.value"
          @input="handleInput($event, field.onChange)"
          @blur="field.onBlur"
          :type="showPassword ? 'text' : 'password'"
          :id="id || name"
          :placeholder="placeholder"
          :disabled="disabled"
          :class="inputClasses"
        />

        <!-- Show/Hide Password Toggle Button -->
        <!--
          WHY THIS BUTTON:
          - Users want to verify what they typed
          - Common UX pattern (every major site has this)
          - Better than forcing users to retype to confirm
        -->
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          :class="{ 'right-10': errorMessage }"
          tabindex="-1"
        >
          <!-- Eye Open Icon (hide password) -->
          <svg
            v-if="showPassword"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.99999 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 9.99999 7.5C8.61928 7.5 7.49999 8.61929 7.49999 10C7.49999 11.3807 8.61928 12.5 9.99999 12.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2.04999 10C3.11832 6.61917 6.26999 4.16667 10 4.16667C13.73 4.16667 16.8817 6.61917 17.95 10C16.8817 13.3808 13.73 15.8333 10 15.8333C6.26999 15.8333 3.11832 13.3808 2.04999 10Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <!-- Eye Closed Icon (show password) -->
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.95 14.95C13.5255 16.0358 11.7904 16.6374 10 16.6667C6.26999 16.6667 3.11832 14.2142 2.04999 10.8333C2.9658 8.45829 4.75249 6.48579 7.04999 5.38329M10.8833 4.24996C10.5945 4.20692 10.2977 4.18163 9.99999 4.16663C6.26999 4.16663 3.11832 6.61913 2.04999 9.99996C2.48332 11.2308 3.16749 12.3483 4.04999 13.2916M11.7667 11.7666C11.5377 12.0123 11.2617 12.2093 10.9551 12.3459C10.6485 12.4825 10.3175 12.556 9.98178 12.5619C9.64604 12.5679 9.31266 12.5062 9.00132 12.3806C8.68998 12.255 8.40707 12.068 8.16999 11.8308C7.93291 11.5937 7.74587 11.3108 7.62027 10.9995C7.49467 10.6882 7.43293 10.3548 7.43891 10.019C7.44489 9.68331 7.51843 9.35233 7.65504 9.04573C7.79164 8.73913 7.98866 8.46308 8.23432 8.23413"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2.5 2.5L17.5 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Error Icon (same as BaseInput) -->
        <InputIcon v-if="errorMessage" type="error" class="mr-8" />
      </div>

      <!-- Password Strength Meter -->
      <!--
        WHY STRENGTH METER:
        - Encourages users to create strong passwords
        - Visual feedback is better than just text rules
        - Shows progress as they improve password
        - You requested this feature ✅
      -->
      <div v-if="field.value && showStrength" class="mt-2">
        <div class="flex items-center gap-2">
          <!-- Strength Bar -->
          <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-300 rounded-full"
              :class="strengthColor"
              :style="{ width: `${strength.percentage}%` }"
            ></div>
          </div>
          <!-- Strength Text -->
          <span class="text-xs font-medium" :class="strengthTextColor">
            {{ strengthLabel }}
          </span>
        </div>
      </div>

      <!-- Error Message (same as BaseInput) -->
      <InputMessage :error="!!errorMessage" :message="errorMessage" />
    </div>
  </Field>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate';
import { computed, ref } from 'vue';
import { useInputClasses } from '~/composables/useInputClasses';
import { getPasswordStrength } from '~/utils/validationSchemas';
import InputIcon from './InputIcon.vue';
import InputMessage from './InputMessage.vue';

/**
 * WHY THESE PROPS:
 * - name: Required by VeeValidate
 * - showStrength: Toggle strength meter (default true for registration, false for login)
 * - Other props: Same as BaseInput for consistency
 */
interface Props {
  name: string;
  label?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showStrength?: boolean; // Show password strength meter
}

const props = withDefaults(defineProps<Props>(), {
  showStrength: true,
});

// Show/hide password state
const showPassword = ref(false);

// Current password strength
const strength = ref({ strength: 'weak' as 'weak' | 'medium' | 'strong', percentage: 0 });

/**
 * Handle input changes
 * WHY SEPARATE HANDLER:
 * - Need to calculate strength in real-time
 * - Update VeeValidate's field value
 * - Both happen on every keystroke
 */
const handleInput = (event: Event, fieldOnChange: any) => {
  const value = (event.target as HTMLInputElement).value;

  // Update VeeValidate field value
  fieldOnChange(value);

  // Calculate strength for visual feedback
  strength.value = getPasswordStrength(value);
};

// Compute input classes (reuse same logic as BaseInput)
const inputClasses = computed(() => {
  const { classes } = useInputClasses({
    disabled: props.disabled,
    error: undefined, // Handled by VeeValidate
    success: undefined,
  });
  return classes.value;
});

/**
 * Strength meter colors
 * WHY THESE COLORS:
 * - Red = weak (danger, warning)
 * - Yellow = medium (caution, getting better)
 * - Green = strong (success, safe)
 * - Standard color psychology
 */
const strengthColor = computed(() => {
  switch (strength.value.strength) {
    case 'weak':
      return 'bg-error-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-success-500';
    default:
      return 'bg-gray-300';
  }
});

const strengthTextColor = computed(() => {
  switch (strength.value.strength) {
    case 'weak':
      return 'text-error-500';
    case 'medium':
      return 'text-yellow-500';
    case 'strong':
      return 'text-success-500';
    default:
      return 'text-gray-500';
  }
});

const strengthLabel = computed(() => {
  switch (strength.value.strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    default:
      return '';
  }
});
</script>

<!--
  USAGE EXAMPLES:
  
  1. Registration (with strength meter):
  <FormPasswordInput
    name="password"
    label="Password"
    placeholder="Enter your password"
    required
  />
  
  2. Login (without strength meter):
  <FormPasswordInput
    name="password"
    label="Password"
    placeholder="Enter your password"
    :show-strength="false"
  />
  
  3. Confirm Password (without strength meter):
  <FormPasswordInput
    name="password_confirmation"
    label="Confirm Password"
    placeholder="Confirm your password"
    :show-strength="false"
  />
  
  WHY THIS IS BETTER THAN PasswordInput.vue:
  - You said "we will rewrite it" - this is the rewrite ✅
  - Integrated with VeeValidate (auto validation)
  - Show/hide toggle built-in
  - Strength meter with real-time feedback
  - Consistent with FormInput patterns
  - Reuses TailAdmin styling via useInputClasses
-->
