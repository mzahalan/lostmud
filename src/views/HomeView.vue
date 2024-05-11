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
    <MudBox></MudBox>
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
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import MudBox from '@/components/MudBox.vue'
import { useMudConnectStore } from '@/stores/mudconnect.js'

const mud = useMudConnectStore()

const { connected, commands, numClients } = storeToRefs(mud)

const commandLine = ref(null)
const commandLineType = ref('text')

const message = ref('')
const password = ref('')
const character = ref('')
const showPW = ref(false)

let historyPointer = -1

const handleConnect = () => {
  mud.addListener(checkPW)
  mud.connect(character.value, password.value)

  nextTick(() => {
    commandLine.value.focus()
  })
}

const handleClose = () => {
  mud.disconnect()
}

const checkPW = async (msg) => {
  const PROMPT_PATTERN_PASSWORD = /^Password:$/

  let rawMessage = msg.text.trim()
  if(PROMPT_PATTERN_PASSWORD.test(rawMessage)) {
    commandLineType.value = 'password'
    message.value = ''

    mud.removeListener(checkPW)   // Don't need to check again.
  }
}

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

</style>
