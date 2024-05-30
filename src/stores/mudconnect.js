import { ref } from 'vue'
import { defineStore } from 'pinia'

const MAX_COMMAND_HISTORY = 50
const MAX_MESSAGE_HISTORY = 25


const PROMPT_PATTERN_CHARACTER = /By what name do you wish to be known\?$/
const PROMPT_PATTERN_PASSWORD = /^Password:$/

function controlMessageBuilder(message) {
    return JSON.stringify({
      type: 'control',
      message: message
    })
}

function commandMessageBuilder(message) {
    return JSON.stringify({
      type: 'command',
      message: message
    })
}

export const useMudConnectStore = defineStore('mudconnect', () => {
  
  let messageCounter = 0

  const connected = ref(false)
  const sock = ref(null)
  const messages = ref([])
  const lastMessage = ref(null)
  const commands = ref([])
  const numClients = ref(0)

  function connect(username="", password="") {
    if(import.meta.env.MODE == "dev_local") {
      sock.value = new WebSocket('ws://localhost:9081')
    } else {
      sock.value = new WebSocket('wss://socket.lostmud.com')
    }

    sock.value.onmessage = (messageRx) => {
        let msg = JSON.parse(messageRx.data)
        
        // We can ignore these for now
        if (msg.type == 'control') {
          if(msg.text == 'pong') {
            numClients.value = msg.numClients
          }
          return
        }

        msg.id = messageCounter
        msg.response = ""
        messageCounter += 1

        if (username && PROMPT_PATTERN_CHARACTER.test(msg.text.trim())) {
            msg.response = username
            send(username, false)
            username = "" // Short circuit the pattern match
        } else if (password && PROMPT_PATTERN_PASSWORD.test(msg.text.trim())) {
            msg.response = "*".repeat(password.length)
            send(password, false)
            password = ""
        }

        messages.value.push(msg)
        if(messages.value.length > MAX_MESSAGE_HISTORY) {
            messages.value.shift()
        }
        lastMessage.value = msg
        notifyListeners(msg)
    }
    
    sock.value.onclose = () => {
      connected.value = false
      sock.value = null
    }

    sock.value.onopen = () => {
      connected.value = true
      console.log('connected')
      sock.value.send(controlMessageBuilder('ping'))
  
      let clockId = setInterval(() => {
        if (sock.value && sock.value.readyState == 1) {
          sock.value.send(controlMessageBuilder('ping'))
        } else {
          clearInterval(clockId)
        }
      }, 3000)
    }
  }

  function disconnect() {
    sock.value.close()
    connected.value = false
  }

  function send(message, saveToHistory=true) {
    sock.value.send(commandMessageBuilder(message))

    if(saveToHistory && message.trim() != '') {
        messages.value[messages.value.length -1].response = messages.value[messages.value.length-1].response.concat(message)
        commands.value.push(message)
        if(commands.value.length > MAX_COMMAND_HISTORY) {
            commands.value.shift()
        }
    }
  }


  //Super Cheap Event Handling
  const callbacks = []
  function addListener(listener) {
    callbacks.push(listener)
  }

  function removeListener(listener) {
    callbacks.splice(callbacks.indexOf(listener) >>> 0, 1);
  }

  function notifyListeners(msg) {
    for(let i = 0; i < callbacks.length; i++) {
      callbacks[i](msg)
    }
  }

  return { connected, messages, lastMessage, commands, numClients, connect, disconnect, send, addListener, removeListener }
})