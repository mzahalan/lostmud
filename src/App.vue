<template>
  <v-app app>
    <v-app-bar title="LostMud.com" density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <template v-slot:append>
        <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-expansion-panels>
        <Triggers></Triggers>
      </v-expansion-panels>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-footer app>LostMud.com | <router-link :to="{ name: 'home' }">Home</router-link> | <router-link :to="{ name: 'about' }">About</router-link></v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import Triggers from './components/Triggers.vue';

const theme = useTheme()
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const drawer = ref(false)

document.title = 'The Lost Mud'
</script>

<style scoped></style>
