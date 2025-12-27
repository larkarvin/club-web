<!-- app/components/form-builder/layout/FormBuilderLayout.vue -->
<template>
    <div class="flex flex-col gap-6 lg:grid lg:grid-cols-12">
        <!-- Component Library - horizontal on mobile, left column on desktop -->
        <div class="order-1 lg:order-1 lg:col-span-2">
            <slot name="library" />
        </div>

        <!-- Canvas - main content area -->
        <div class="order-2 lg:order-2 lg:col-span-6">
            <slot name="canvas" />
        </div>

        <!-- Properties Panel - bottom on mobile, right column on desktop -->
        <div class="order-3 lg:order-3 lg:col-span-4">
            <slot name="properties" />
        </div>
    </div>
</template>

<script setup>
// No props or logic needed - pure layout component with slots
</script>