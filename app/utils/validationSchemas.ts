// utils/validationSchemas.ts
import * as yup from 'yup';

// Reusable field validations
export const validations = {
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character (@$!%*?&#)'),

  name: (fieldName: string) =>
    yup
      .string()
      .required(`${fieldName} is required`)
      .min(2, `${fieldName} must be at least 2 characters`)
      .max(50, `${fieldName} must not exceed 50 characters`)
      .matches(/^[a-zA-Z0-9\s'-]+$/, `${fieldName} can only contain letters, numbers, spaces, hyphens and apostrophes`),

  confirmPassword: (fieldName: string = 'password') =>
    yup
      .string()
      .required('Password confirmation is required')
      .oneOf([yup.ref(fieldName)], 'Passwords must match'),

  terms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),

  phone: yup.string().matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number format'),

  url: yup.string().url('Invalid URL format').max(255, 'URL must not exceed 255 characters'),

  textarea: (fieldName: string, maxLength: number = 500) =>
    yup.string().max(maxLength, `${fieldName} must not exceed ${maxLength} characters`),
};

// Complete schemas for different forms
export const schemas = {
  // Registration form (with club)
  register: yup.object({
    club_name: validations.name('Club name'),
    name: validations.name('Your Name'),
    email: validations.email,
    password: validations.password,
    password_confirmation: validations.confirmPassword(),
    agreeToTerms: validations.terms,
  }),

  // Registration form (user only - no club)
  registerUserOnly: yup.object({
    name: validations.name('Your Name'),
    email: validations.email,
    password: validations.password,
    password_confirmation: validations.confirmPassword(),
    agreeToTerms: validations.terms,
  }),

  // Login form
  login: yup.object({
    email: validations.email,
    password: yup.string().required('Password is required'),
    remember: yup.boolean(),
  }),

  // Forgot password form
  forgotPassword: yup.object({
    email: validations.email,
  }),

  // Reset password form
  resetPassword: yup.object({
    password: validations.password,
    password_confirmation: validations.confirmPassword(),
  }),

  // Profile update form
  profile: yup.object({
    first_name: validations.name('First name'),
    last_name: validations.name('Last name'),
    email: validations.email,
    phone: validations.phone.optional(),
    bio: validations.textarea('Bio', 500).optional(),
  }),

  // Change password form
  changePassword: yup.object({
    current_password: yup.string().required('Current password is required'),
    password: validations.password,
    password_confirmation: validations.confirmPassword(),
  }),
};

// Helper function to check password strength
export const getPasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; percentage: number } => {
  if (!password) return { strength: 'weak', percentage: 0 };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[@$!%*?&#]/.test(password)) score += 15;

  // Determine strength
  if (score < 40) return { strength: 'weak', percentage: score };
  if (score < 70) return { strength: 'medium', percentage: score };
  return { strength: 'strong', percentage: Math.min(score, 100) };
};
