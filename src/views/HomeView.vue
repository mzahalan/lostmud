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
        <v-btn v-if="!sock" @click="handleConnect" type="submit">Connect!</v-btn>
        <v-btn v-if="sock" @click="handleClose">Disconnect!</v-btn>
      </v-toolbar>
      <v-card v-model="sockStatus" class="text-right text-blue-darken-1 mr-1" variant="plain">
        Socket Status: {{ sockStatus }}
      </v-card>
    </div>
    <div id="mudbox" class="overflow-auto flex-grow-1 pl-5">
      <div class="content ma-0 pa-0" v-for="msg in messages" v-html="msg"></div>
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
import { nextTick, ref, watch } from 'vue'
const sock = ref(null)
const sockStatus = ref('Disconnected')
const commandLine = ref(null)
const commandLineType = ref('text')
const messages = ref([])
const message = ref('')
const password = ref('')
const character = ref('')
const showPW = ref(false)
const sendLogin = ref(false)

const commandMessageBuilder = (message) => {
  return JSON.stringify({
    type: 'command',
    message: message
  })
}

const controlMessageBuilder = (message) => {
  return JSON.stringify({
    type: 'control',
    message: message
  })
}

const sendCharName = () => {
  sock.value.send(commandMessageBuilder(character.value))
}

const sendPassword = () => {
  sock.value.send(commandMessageBuilder(password.value))
}

const receiveData = (ev) => {
  const PROMPT_PATTERN_CHARACTER = /By what name do you wish to be known\?$/
  const PROMPT_PATTERN_PASSWORD = /^Password:$/
  let msg = JSON.parse(ev.data)

  // We can ignore these for now
  if (msg.type == 'control') {
    return
  }

  messages.value.push(msg.html + '\n')

  if (sendLogin.value) {
    if (PROMPT_PATTERN_CHARACTER.test(msg.text.trim())) {
      sendCharName()
      messages.value.push(`<div class='text-blue-darken-1'>${character.value}</div>`)
    } else if (PROMPT_PATTERN_PASSWORD.test(msg.text.trim())) {
      sendPassword()
      messages.value.push(
        `<div class='text-blue-darken-1'>${'*'.repeat(password.value.length)}</div>`
      )
    }
  } else if (PROMPT_PATTERN_PASSWORD.test(msg.text.trim())) {
    commandLineType.value = 'password'
    message.value = ''
  }
}

const connect = () => {
  sock.value = new WebSocket('wss://socket.zahalan.com')
  //sock.value = new WebSocket('ws://localhost:9181')

  sock.value.onmessage = receiveData
  sock.value.onclose = () => {
    sockStatus.value = 'Closed'
    sock.value = null
  }
  sock.value.onopen = () => {
    sockStatus.value = 'Connected'
    console.log('connected')

    let clockId = setInterval(() => {
      if (sock.value && sock.value.readyState == 1) {
        sock.value.send(controlMessageBuilder('ping'))
      } else {
        clearInterval(clockId)
      }
    }, 3000)
  }
}

const handleConnect = () => {
  connect()
  sendLogin.value = password.value != '' && character.value != ''

  nextTick(() => {
    commandLine.value.focus()
  })
}

const handleClose = () => {
  sock.value.close()
}

watch(
  () => messages.value,
  async (msgs) => {
    if (msgs.length > MAX_MESSAGE_HISTORY) {
      msgs.shift()
    }
    nextTick(() => {
      let mudbox = document.getElementById('mudbox')
      mudbox.scrollTop = mudbox.scrollHeight
    })
  },
  { deep: true }
)

const history = []
const MAX_COMMAND_HISTORY = 50
const MAX_MESSAGE_HISTORY = 25
let historyPointer = -1

const handleScroll = (inc) => {
  if (history.length > 0) {
    historyPointer = (historyPointer + inc) % history.length

    if (historyPointer < 0) {
      historyPointer = history.length - 1
    }

    message.value = history[historyPointer]
    nextTick(() => {
      commandLine.value.select()
    })
  }
}

const wrapCommand = (msg, type) => {
  return `<${type} class='text-blue-darken-1'>${msg}</${type}`
}

const addHistory = (msg) => {
  if (msg.trim() != '') {
    history.push(msg)
    if (history.length > MAX_COMMAND_HISTORY) {
      history.shift()
    }
    historyPointer = history.length - 1
  }

  let newMessage = messages.value[messages.value.length - 1].concat(wrapCommand(msg))
  messages.value[messages.value.length - 1] = newMessage
}

const sendMessage = () => {
  let msg = message.value

  if (commandLineType.value == 'password') {
    commandLineType.value = 'text'
    message.value = ''
  } else {
    addHistory(msg)
  }

  if (sock.value) {
    sock.value.send(commandMessageBuilder(msg))
    commandLine.value.select()
  }
}
</script>

<style scoped>
.content {
  font-family: monospace;
}
</style>
