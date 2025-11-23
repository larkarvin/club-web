<script setup lang="ts">
import BaseInput from '@/components/forms/BaseInput.vue';
import PasswordInput from '@/components/forms/PasswordInput.vue';
import { useValidation } from '@/composables/useValidation';

// Use Sanctum composables
const { login } = useSanctumAuth();
const client = useSanctumClient();

// Get validation rules
const { VALIDATIONS } = useValidation();

// Form data (using reactive for consistency)
const formData = reactive({
  clubName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  password_confirmation: '',
  agreeToTerms: false,
});

// Create refs for v-model bindings
const clubName = computed({
  get: () => formData.clubName,
  set: (val) => (formData.clubName = val),
});
const firstName = computed({
  get: () => formData.firstName,
  set: (val) => (formData.firstName = val),
});
const lastName = computed({
  get: () => formData.lastName,
  set: (val) => (formData.lastName = val),
});
const email = computed({
  get: () => formData.email,
  set: (val) => (formData.email = val),
});
const agreeToTerms = computed({
  get: () => formData.agreeToTerms,
  set: (val) => (formData.agreeToTerms = val),
});

// Form object for password fields (to maintain compatibility with PasswordInput)
const form = reactive({
  password: computed({
    get: () => formData.password,
    set: (val) => (formData.password = val),
  }),
  password_confirmation: computed({
    get: () => formData.password_confirmation,
    set: (val) => (formData.password_confirmation = val),
  }),
});

// Error handling
const errors = reactive({
  club_name: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  agreeToTerms: '',
  general: '',
});

// Loading state
const isLoading = ref(false);

// Submission guard to prevent double-submission
const isSubmitting = ref(false);

// Clear all errors
const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = '';
  });
};

// Client-side validation
const validateForm = (): boolean => {
  clearErrors();
  let isValid = true;

  // Validate club name
  if (!formData.clubName.trim()) {
    errors.club_name = 'Club name is required';
    isValid = false;
  }

  // Validate first name
  if (!formData.firstName.trim()) {
    errors.first_name = 'First name is required';
    isValid = false;
  }

  // Validate last name
  if (!formData.lastName.trim()) {
    errors.last_name = 'Last name is required';
    isValid = false;
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  } else {
    // Check password requirements
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      errors.password = 'Password must contain uppercase, lowercase, number, and symbol';
      isValid = false;
    }
  }

  // Validate password confirmation
  if (!formData.password_confirmation) {
    errors.password_confirmation = 'Please confirm your password';
    isValid = false;
  } else if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Passwords do not match';
    isValid = false;
  }

  // Validate terms agreement
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions';
    isValid = false;
  }

  return isValid;
};

// Handle form submission with Sanctum
const handleSubmit = async () => {
  // Prevent double submission
  if (isSubmitting.value) {
    return;
  }

  // Validate form before submission
  if (!validateForm()) {
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    isSubmitting.value = true;

    // Prepare registration data
    const registrationData = {
      club_name: formData.clubName.trim(),
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    };

    // Register the user using Sanctum client
    await client('/api/v1/register', {
      method: 'POST',
      body: registrationData,
    });

    // Log the user in after successful registration
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Redirect to dashboard on success
      navigateTo('/');
    } catch (loginError: any) {
      console.error('Login after registration failed:', loginError);
      errors.general = 'Registration successful, but automatic login failed. Please sign in manually.';

      // Redirect to signin page after a delay
      setTimeout(() => {
        navigateTo('/auth/signin');
      }, 3000);
    }
  } catch (error: any) {
    console.error('Registration failed:', error);

    // Check if response exists (network error handling)
    if (!error.response) {
      errors.general = 'Network error. Please check your connection and try again.';
      return;
    }

    // Handle validation errors (422)
    if (error.response?.status === 422 && error.response?._data?.errors) {
      const validationErrors = error.response._data.errors;

      // Map backend errors (snake_case) to frontend errors
      const errorMap: Record<string, keyof typeof errors> = {
        'club_name': 'club_name',
        'clubName': 'club_name',
        'first_name': 'first_name',
        'firstName': 'first_name',
        'last_name': 'last_name',
        'lastName': 'last_name',
        'email': 'email',
        'password': 'password',
        'password_confirmation': 'password_confirmation',
        'agree_to_terms': 'agreeToTerms',
        'agreeToTerms': 'agreeToTerms',
      };

      Object.keys(validationErrors).forEach((key) => {
        const mappedKey = errorMap[key];
        if (mappedKey) {
          errors[mappedKey] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        }
      });
    }
    // Handle CSRF errors (419)
    else if (error.response?.status === 419) {
      errors.general = 'Session expired. Please refresh the page and try again.';
    }
    // Handle other errors
    else {
      const message = error.response?._data?.message;
      errors.general = message || 'Registration failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
    isSubmitting.value = false;
  }
};
</script>

<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900">
        <div class="flex flex-col flex-1 lg:w-1/2 w-full">
          <div class="w-full max-w-md pt-10 mx-auto">
            <NuxtLink
              to="/"
              class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                class="stroke-current"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Back to dashboard
            </NuxtLink>
          </div>
          <!-- Form -->
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div class="mb-5 sm:mb-8">
              <h1 class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign Up
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">Enter your email and password to sign up!</p>
            </div>
            <div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
                <button
                  class="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                      fill="#EB4335"
                    />
                  </svg>
                  Sign up with Google
                </button>
              </div>
              <div class="relative py-3 sm:py-5">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">Or</span>
                </div>
              </div>
              <form @submit.prevent="handleSubmit">
                <!-- General Error Message -->
                <div
                  v-if="errors.general"
                  class="mb-5 p-4 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400"
                >
                  {{ errors.general }}
                </div>

                <div class="space-y-5">
                  <div class="mb-1.5">
                    <BaseInput
                      v-model="clubName"
                      label="Club Name"
                      placeholder="Enter your club name"
                      required
                      :error="errors.club_name"
                    />
                  </div>
                  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <!-- First Name -->
                    <div class="sm:col-span-1">
                      <BaseInput
                        v-model="firstName"
                        label="First Name"
                        placeholder="Enter your First Name"
                        required
                        :error="errors.first_name"
                      />
                    </div>
                    <!-- Last Name -->
                    <div class="sm:col-span-1">
                      <BaseInput
                        v-model="lastName"
                        label="Last Name"
                        placeholder="Enter your Last Name"
                        required
                        :error="errors.last_name"
                      />
                    </div>
                  </div>
                  <!-- Email -->
                  <div>
                    <BaseInput
                      v-model="email"
                      label="Email"
                      placeholder="Enter your E-mail"
                      required
                      :error="errors.email"
                    />
                  </div>
                  <!-- Password -->
                  <div>
                    <PasswordInput
                      v-model="form.password"
                      id="password"
                      label="Password"
                      placeholder="Enter your password"
                      :live-validation="true"
                      required
                      :error="errors.password"
                    />
                  </div>

                  <div>
                    <PasswordInput
                      v-model="form.password_confirmation"
                      id="password_confirmation"
                      label="Confirm your Password"
                      placeholder="Confirm your password"
                      :match-with="form.password"
                      :live-validation="false"
                      required
                      :error="errors.password_confirmation"
                    />
                  </div>
                  <!-- Checkbox -->
                  <div>
                    <div>
                      <label
                        for="checkboxLabelOne"
                        class="flex items-start text-sm font-normal text-gray-700 cursor-pointer select-none dark:text-gray-400"
                      >
                        <div class="relative">
                          <input v-model="agreeToTerms" type="checkbox" id="checkboxLabelOne" class="sr-only" />
                          <div
                            :class="
                              agreeToTerms
                                ? 'border-brand-500 bg-brand-500'
                                : 'bg-transparent border-gray-300 dark:border-gray-700'
                            "
                            class="mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]"
                          >
                            <span :class="agreeToTerms ? '' : 'opacity-0'">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                  stroke="white"
                                  stroke-width="1.94437"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <p class="inline-block font-normal text-gray-500 dark:text-gray-400">
                          By creating an account means you agree to the
                          <a href="#" target="_blank" class="text-gray-800 dark:text-white/90">
                            Terms and Conditions,
                          </a>
                          and our
                          <a href="#" target="_blank" class="text-gray-800 dark:text-white"> Privacy Policy </a>
                        </p>
                      </label>
                      <p v-if="errors.agreeToTerms" class="mt-1 text-xs text-red-600 dark:text-red-400">
                        {{ errors.agreeToTerms }}
                      </p>
                    </div>
                  </div>
                  <!-- Button -->
                  <div>
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        v-if="isLoading"
                        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {{ isLoading ? 'Signing Up...' : 'Sign Up' }}
                    </button>
                  </div>
                </div>
              </form>
              <div class="mt-5">
                <p class="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Already have an account?
                  <NuxtLink to="/auth/signin" class="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >Sign In</NuxtLink
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden relative">
          <div class="items-center justify-center flex z-1">
            <common-grid-shape />
            <div class="flex flex-col items-center max-w-xs">
              <router-link to="/" class="block mb-4">
                <img width="{231}" height="{48}" src="/images/logo/auth-logo.svg" alt="Logo" />
              </router-link>
              <p class="text-center text-gray-400 dark:text-white/60">
                Free and Open-Source Tailwind CSS Admin Dashboard Template
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>
