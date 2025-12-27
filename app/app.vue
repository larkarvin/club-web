<template>
  <ThemeProvider>
    <SidebarProvider>
      <NuxtPage />
      <Toaster position="top-right" :richColors="true" />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import SidebarProvider from './components/layout/SidebarProvider.vue';
import ThemeProvider from './components/layout/ThemeProvider.vue';
</script>
