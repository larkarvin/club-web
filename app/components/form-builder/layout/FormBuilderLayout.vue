<!-- app/components/form-builder/layout/FormBuilderLayout.vue -->
<template>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- Left: Component Library (20%) -->
        <div class="lg:col-span-2">
            <slot name="library" />
        </div>

        <!-- Center: Canvas (50%) -->
        <div class="lg:col-span-6">
            <slot name="canvas" />
        </div>

        <!-- Right: Properties Panel (30%) -->
        <div class="lg:col-span-4">
            <slot name="properties" />
        </div>
    </div>
</template>

<script setup>
// No props or logic needed - pure layout component with slots
</script>