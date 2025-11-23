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

    <!-- Input wrapper -->
    <div class="relative">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :type="type"
        :id="id"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
      />

      <!-- Icons -->
      <InputIcon v-if="success" type="success" />
      <InputIcon v-if="error" type="error" />
    </div>

    <!-- Messages -->
    <InputMessage :success="!!success" :error="!!error" :message="success || error" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputIcon from './InputIcon.vue'
import InputMessage from './InputMessage.vue'
import { defineProps, defineEmits } from 'vue'


const props = defineProps({
  modelValue: String,
  type: { type: String, default: 'text' },
  id: String,
  label: String,
  placeholder: String,
  error: String,
  success: String,
  disabled: Boolean,
  required: Boolean
})
import { useInputClasses } from '~/composables/useInputClasses'

const { classes: inputClasses } = useInputClasses(props)

const emit = defineEmits(['update:modelValue'])


</script>
