<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
    >
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>

    <div class="relative">
      <!-- Password input -->
      <input
        v-model="localValue"
        :type="showPassword ? 'text' : 'password'"
        :id="id"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
      />

      <!-- Eye toggle -->
      <span
        @click="togglePasswordVisibility"
        class="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 dark:text-gray-400"
      >
        <template v-if="!showPassword"><EyeIcon /></template>
        <template v-else><EyeOffIcon /></template>
      </span>

      <!-- Success/Error icons -->
      <InputIcon v-if="success && !matchError" type="success" />
      <InputIcon v-if="error || matchError" type="error" />
    </div>

    <!-- Password requirements -->
    <ul v-if="localValue" class="mt-2 ml-2 text-xs text-gray-500 dark:text-gray-400">
      <li
        v-for="(req, index) in requirements"
        :key="index"
        class="flex items-center space-x-1"
        :class="req.fulfilled ? 'text-success-500' : 'text-gray-400'"
      >
        <CheckIcon v-if="req.fulfilled" class="h-3 w-3 text-success-500 shrink-0" />
        <span>{{ req.label }}</span>
      </li>
    </ul>

    <!-- Confirmation password match -->
    <p v-if="matchWith" class="mt-1.5 text-theme-xs" :class="matchError ? 'text-error-500' : 'text-success-500'">
      {{ matchError ? 'Passwords do not match' : 'Passwords match' }}
    </p>

    <!-- Messages -->
    <InputMessage :success="!!success" :error="!!error" :message="error || success" />

    <!-- Confirmation password match -->
    <InputMessage
    v-if="matchWith"
    :error="matchError ? 'Passwords do not match' : ''"
    :success="!matchError && localValue.length > 0 ? 'Passwords match' : ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import InputIcon from './InputIcon.vue'
import InputMessage from './InputMessage.vue'
import EyeIcon from '~/icons/EyeIcon.vue'
import EyeOffIcon from '~/icons/EyeOffIcon.vue'
import CheckIcon from '~/icons/CheckIcon.vue'
import { useInputClasses } from '~/composables/useInputClasses'

const props = defineProps({
  modelValue: String,
  id: String,
  placeholder: String,
  label: String,
  disabled: Boolean,
  error: { type: String, default: '' },
  success: { type: String, default: '' },
  required: Boolean,
  liveValidation: { type: Boolean, default: false },
  matchWith: { type: String, default: '' }, // For confirmation password
})

const emit = defineEmits(['update:modelValue', 'update:error', 'update:success'])

const showPassword = ref(false)
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

// Local v-model
const localValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// Input classes
const { classes: inputClasses } = useInputClasses(props)

// Password requirements
const requirements = ref([
  { label: 'At least 8 characters', fulfilled: false },
  { label: 'At least one uppercase letter', fulfilled: false },
  { label: 'At least one lowercase letter', fulfilled: false },
  { label: 'At least one number', fulfilled: false },
  { label: 'At least one symbol', fulfilled: false },
])

const matchError = ref(false)

// Watch password typing for requirements
watch([() => props.matchWith, localValue], () => {
  if (!props.matchWith) {
    matchError.value = false
    return
  }
  matchError.value = props.matchWith !== localValue.value
})

watch(localValue, (val) => {
  if (!props.liveValidation) return

  // Only show requirements after typing
  const hasTyped = val.length > 0

  requirements.value[0].fulfilled = val.length >= 8
  requirements.value[1].fulfilled = /[A-Z]/.test(val)
  requirements.value[2].fulfilled = /[a-z]/.test(val)
  requirements.value[3].fulfilled = /[0-9]/.test(val)
  requirements.value[4].fulfilled = /[!@#$%^&*(),.?":{}|<>]/.test(val)

  const allFulfilled = requirements.value.every(r => r.fulfilled)

  if (!val) {
    emit('update:error', '')
    emit('update:success', '')
  } else if (!allFulfilled) {
    emit('update:error', 'Password does not meet all requirements')
    emit('update:success', '')
  } else {
    emit('update:error', '')
    emit('update:success', 'Password looks good')
  }
})

// Watch confirmation password match
watch([() => props.matchWith, localValue], () => {
  if (!props.matchWith) return
  matchError.value = props.matchWith !== localValue.value
})
</script>
