<template>
    <v-container class="area-list">
        <v-row class="justify-center">
        <v-card elevation="4" class="ma-2 text-capitalize" max-width="200" min-width="200" v-for="area in areas" :key="area.name">
            <v-card-title>{{ area.name }}</v-card-title>
            <v-card-subtitle>Rooms: {{ area.numRooms }}<v-spacer></v-spacer>Levels: {{ area.range }}</v-card-subtitle>
        </v-card>

        </v-row>
    </v-container>
</template>

<script setup>
const props = defineProps(['areas'])

</script>

<style scoped>

</style>