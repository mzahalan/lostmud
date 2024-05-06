<template>
    <button @click="store.increment()">Click Me</button>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter';
const store = useCounterStore()
</script>