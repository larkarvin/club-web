/**
 * Signup Form Composable
 * Encapsulates all signup form state, validation, and submission logic
 * Following the composable pattern from reference implementation
 */

import { reactive, ref, computed, watch } from 'vue';

export interface SignupFormData {
  clubName: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  agreeToTerms: boolean;
}

export interface SignupErrors {
  club_name: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  agreeToTerms: string;
  general: string;
}

export function useSignup() {
  // Use Sanctum composables for authentication
  const { login } = useSanctumAuth();
  const client = useSanctumClient();
  const router = useRouter();

  // Form data
  const formData = reactive<SignupFormData>({
    clubName: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    agreeToTerms: false,
  });

  // Error tracking
  const errors = reactive<SignupErrors>({
    club_name: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    agreeToTerms: '',
    general: '',
  });

  // Loading and submission states
  const isLoading = ref(false);
  const isSubmitting = ref(false);

  // Computed properties for v-model bindings
  const clubName = computed({
    get: () => formData.clubName,
    set: (val) => (formData.clubName = val),
  });

  const name = computed({
    get: () => formData.name,
    set: (val) => (formData.name = val),
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
  // Using plain reactive properties instead of computed for v-model compatibility
  const form = reactive({
    password: '',
    password_confirmation: '',
  });

  // Sync form object with formData
  watch(() => form.password, (val) => { formData.password = val; });
  watch(() => form.password_confirmation, (val) => { formData.password_confirmation = val; });
  watch(() => formData.password, (val) => { form.password = val; });
  watch(() => formData.password_confirmation, (val) => { form.password_confirmation = val; });

  /**
   * Clear all error messages
   */
  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      errors[key as keyof SignupErrors] = '';
    });
  };

  /**
   * Validate form data
   * Returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    clearErrors();
    let isValid = true;

    // Validate club name
    if (!formData.clubName.trim()) {
      errors.club_name = 'Club name is required';
      isValid = false;
    }

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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

  /**
   * Handle backend errors from API
   */
  const handleBackendErrors = (error: any) => {
    // Check if response exists (network error handling)
    if (!error.response) {
      errors.general = 'Network error. Please check your connection and try again.';
      return;
    }

    // Handle validation errors (422)
    if (error.response?.status === 422 && error.response?._data?.errors) {
      handleServerErrors(error.response._data.errors);
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
  };

  /**
   * Submit signup form
   * Handles complete registration flow including auto-login
   */
  const submit = async () => {
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
      const registrationData = getRegistrationData();

      // Register the user using Sanctum client
      await client('/api/v1/register', {
        method: 'POST',
        body: registrationData,
      });

      // Log the user in after successful registration
      try {
        await login({
          email: registrationData.email,
          password: registrationData.password,
        });

        // Redirect to dashboard on success
        await router.push('/');
      } catch (loginError: any) {
        console.error('Login after registration failed:', loginError);
        errors.general = 'Registration successful, but automatic login failed. Please sign in manually.';

        // Redirect to signin page after a delay
        setTimeout(async () => {
          await router.push('/auth/signin');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      handleBackendErrors(error);
    } finally {
      isLoading.value = false;
      isSubmitting.value = false;
    }
  };

  /**
   * Get registration data (trimmed)
   */
  const getRegistrationData = () => ({
    club_name: formData.clubName.trim(),
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password,
    password_confirmation: formData.password_confirmation,
  });

  /**
   * Handle server validation errors
   */
  const handleServerErrors = (serverErrors: Record<string, string | string[]>) => {
    const errorMap: Record<string, keyof SignupErrors> = {
      'club_name': 'club_name',
      'clubName': 'club_name',
      'name': 'name',
      'email': 'email',
      'password': 'password',
      'password_confirmation': 'password_confirmation',
      'agree_to_terms': 'agreeToTerms',
      'agreeToTerms': 'agreeToTerms',
    };

    Object.keys(serverErrors).forEach((key) => {
      const mappedKey = errorMap[key];
      if (mappedKey) {
        const errorValue = serverErrors[key];
        errors[mappedKey] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
      }
    });
  };

  /**
   * Set general error message
   */
  const setGeneralError = (message: string) => {
    errors.general = message;
  };

  /**
   * Clear form data
   */
  const clearForm = () => {
    formData.clubName = '';
    formData.name = '';
    formData.email = '';
    formData.password = '';
    formData.password_confirmation = '';
    formData.agreeToTerms = false;
    clearErrors();
  };

  /**
   * Get current form values
   */
  const getFormValues = () => ({
    clubName: formData.clubName,
    name: formData.name,
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.password_confirmation,
    agreeToTerms: formData.agreeToTerms,
  });

  return {
    // State
    formData,
    errors,
    isLoading,
    isSubmitting,

    // Computed properties for v-model bindings
    clubName,
    name,
    email,
    agreeToTerms,
    form,

    // Methods
    submit,
    submitForm: submit, // Alias for compatibility
    validateForm,
    clearErrors,
    clearForm,
    getFormValues,
    getRegistrationData,
    handleServerErrors,
    setGeneralError,
    handleBackendErrors,
  };
}
