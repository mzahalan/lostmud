<template>
    <div id="mudbox" class="overflow-auto flex-grow-1 pl-5">
      <div class="ma-0 pa-0" v-for="msg in mud.messages" :key="msg.id">
        <span class="content ma-0 pa-0" v-html="msg.html"></span>
        <span class="content ma-0 pa-0 text-blue-darken-1" v-if="msg.response">{{ msg.response }}</span>
      </div>
    </div>
</template>

<script setup>
import { nextTick, onMounted } from 'vue'
import { useMudConnectStore } from '@/stores/mudconnect.js'

const mud = useMudConnectStore()

// Stay scrolled to the bottom when new messages come in.
mud.addListener(async () => {
    nextTick(() => {
      let mudbox = document.getElementById('mudbox')
      mudbox.scrollTop = mudbox.scrollHeight
    })
})

// This is so if you switch to a different page in the app and come back
// the scroll point gets set to the bottom of the box.
onMounted(() => {
  let mudbox = document.getElementById('mudbox')
  mudbox.scrollTop = mudbox.scrollHeight
})
</script>

<style scoped>
.content {
  font-family: monospace;
}
</style>