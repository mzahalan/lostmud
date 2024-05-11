<template>
  <v-sheet class="d-flex flex-column fill-height overflow-auto" max-height="90dvh">
    <div class="shrink">
      <v-toolbar>
        <v-toolbar-title>MudConnect</v-toolbar-title>

        <v-text-field
          label="Character"
          type="text"
          variant="outlined"
          hide-details
          density="compact"
          v-model="character"
        >
        </v-text-field>
        <v-spacer></v-spacer>
        <v-text-field
          label="Password"
          :type="showPW ? 'text' : 'password'"
          variant="outlined"
          hide-details
          density="compact"
          :append-inner-icon="showPW ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPW = !showPW"
          @keyup.enter="handleConnect"
          v-model="password"
        >
        </v-text-field>
        <v-spacer></v-spacer>
        <v-btn v-if="!connected" @click="handleConnect" type="submit">Connect!</v-btn>
        <v-btn v-if="connected" @click="handleClose">Disconnect!</v-btn>
      </v-toolbar>
      <v-card class="text-right text-blue-darken-1 mr-1" variant="plain">
        Socket Status: {{ connected ? "Connected" : "Disconnected" }}
        <v-spacer></v-spacer>
        Clients: {{ connected ? numClients : "~" }}
      </v-card>
    </div>
    <div id="mudbox" class="overflow-auto flex-grow-1 pl-5">
      <div class="ma-0 pa-0" v-for="msg in messages" :key="msg.id">
        <span class="content ma-0 pa-0" v-html="msg.html"></span>
        <span class="content ma-0 pa-0 text-blue-darken-1" v-if="msg.response">{{ msg.response }}</span>
      </div>
    </div>
    <div class="shrink">
      <v-text-field
        ref="commandLine"
        v-model="message"
        :type="commandLineType"
        @keyup.enter="sendMessage"
        @keyup.arrow-up="handleScroll(-1)"
        @keyup.arrow-down="handleScroll(1)"
        class="flex-1-1-100"
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-code-greater-than</v-icon>
        </template>
        <template v-slot:append-inner>
          <button @click="sendMessage"><v-icon>mdi-send</v-icon></button>
        </template>
      </v-text-field>
    </div>
  </v-sheet>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMudConnectStore } from '@/stores/mudconnect.js'

const mud = useMudConnectStore()

const { connected, messages, lastMessage, commands, numClients } = storeToRefs(mud)

const commandLine = ref(null)
const commandLineType = ref('text')

const message = ref('')
const password = ref('')
const character = ref('')
const showPW = ref(false)
const sendLogin = ref(false)

let historyPointer = -1

const handleConnect = () => {
  mud.connect()
  sendLogin.value = password.value != '' && character.value != ''

  nextTick(() => {
    commandLine.value.focus()
  })
}

const handleClose = () => {
  mud.disconnect()
}

// TODO - Move this to triggers (refactor triggers to be a store)
// Then add concept of 1-time trigger. Trigger goes away when it's not needed
// to save processing.
mud.addListener(async (message) => {
  const PROMPT_PATTERN_CHARACTER = /By what name do you wish to be known\?$/
  const PROMPT_PATTERN_PASSWORD = /^Password:$/

  let rawMessage = message.text.trim()

  if (sendLogin.value) {
      if (PROMPT_PATTERN_CHARACTER.test(rawMessage)) {
        mud.send(character.value, false)
      } else if (PROMPT_PATTERN_PASSWORD.test(rawMessage)) {
        mud.send(password.value, false)
      }
    } else if (PROMPT_PATTERN_PASSWORD.test(rawMessage)) {
      commandLineType.value = 'password'
      message.value = ''
    }

    nextTick(() => {
      let mudbox = document.getElementById('mudbox')
      mudbox.scrollTop = mudbox.scrollHeight
    })
})

onMounted(() => {
  let mudbox = document.getElementById('mudbox')
  mudbox.scrollTop = mudbox.scrollHeight
})

const handleScroll = (inc) => {
  if (commands.value.length > 0) {
    historyPointer = (historyPointer + inc) % commands.value.length

    if (historyPointer < 0) {
      historyPointer = commands.value.length - 1
    }

    message.value = commands.value[historyPointer]
    nextTick(() => {
      commandLine.value.select()
    })
  }
}

const sendMessage = () => {
  let msg = message.value

  // Don't save passwords in the outbound history
  if(commandLineType.value == 'password') {
    mud.send(msg, false)
    message.value = ""
    commandLineType.value = 'text'
  } else {
    mud.send(msg)
  }

  historyPointer = commands.value.length - 1
  commandLine.value.select()
}
</script>

<style scoped>
.content {
  font-family: monospace;
}
</style>
