<template>
  <Field :name="name" type="checkbox" v-slot="{ field, errorMessage }" :validate-on-input="true">
    <div>
      <label
        :for="id || name"
        class="flex items-start text-sm font-normal text-gray-700 cursor-pointer select-none dark:text-gray-400"
      >
        <div class="relative">
          <!-- Hidden native checkbox -->
          <input v-bind="field" type="checkbox" :id="id || name" class="sr-only" />

          <!-- Custom checkbox visual -->
          <div
            :class="[
              field.checked ? 'border-brand-500 bg-brand-500' : 'bg-transparent border-gray-300 dark:border-gray-700',
              'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 transition-colors',
            ]"
          >
            <span :class="field.checked ? '' : 'opacity-0'" class="transition-opacity">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <!-- Label / slot -->
        <span class="inline-block font-normal text-gray-500 dark:text-gray-400">
          <slot>{{ label }}</slot>
        </span>
      </label>

      <!-- Error -->
      <p v-if="errorMessage" class="mt-1 ml-8 text-sm text-error-500">
        {{ errorMessage }}
      </p>
    </div>
  </Field>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate';

interface Props {
  name: string;
  label?: string;
  id?: string;
}

defineProps<Props>();
</script>
