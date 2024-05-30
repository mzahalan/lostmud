<template>
    <v-container class="area-list">
        <v-row>
        <v-card v-for="area in areas" :key="area.name">
            <span>{{area.name}}</span>
        </v-card>

        </v-row>
    </v-container>
</template>

<script setup>
const props = defineProps(['areas'])

</script>

<style scoped>

</style>