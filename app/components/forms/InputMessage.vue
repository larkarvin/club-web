<template>
  <p v-if="error" class="mt-1.5 text-theme-xs text-error-500">{{ message }}</p>
  <p v-else-if="success" class="mt-1.5 text-theme-xs text-success-500">{{ message }}</p>
</template>

<script setup lang="ts">
const props = defineProps({
  message: String,
  error: Boolean,
  success: Boolean
})
</script>