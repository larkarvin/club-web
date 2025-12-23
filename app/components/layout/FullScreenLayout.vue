<template>
  <div class="min-h-screen">
    <main>
      <slot></slot>
    </main>
    <Toaster position="top-right" :richColors="true" />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner';
</script>
