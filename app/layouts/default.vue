<template>
  <div>
    <slot />
    <Toaster position="top-right" :richColors="true" />
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner';
</script>
