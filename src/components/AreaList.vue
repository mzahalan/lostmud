<template>
    <div class="area-list">
        <div v-for="area in areas" :key="area.name">
            <span>area.name</span>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['areas'])

</script>

<style scoped>

</style>