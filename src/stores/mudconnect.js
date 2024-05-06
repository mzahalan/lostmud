import { ref } from 'vue'
import { defineStore } from 'pinia'

const MAX_COMMAND_HISTORY = 50
const MAX_MESSAGE_HISTORY = 25

const controlMessageBuilder = (message) => {
    return JSON.stringify({
      type: 'control',
      message: message
    })
}

const commandMessageBuilder = (message) => {
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

  function connect() {
    sock.value = new WebSocket('wss://socket.zahalan.com')
  
    sock.value.onmessage = (messageRx) => {
        let msg = JSON.parse(messageRx.data)
        msg.id = messageCounter
        messageCounter += 1

        // We can ignore these for now
        if (msg.type == 'control') {
          console.log(msg.text)
        }
      
        messages.value.push(msg)
        if(messages.value.length > MAX_MESSAGE_HISTORY) {
            messages.value.shift()
        }
        lastMessage.value = msg
    }
    
    sock.value.onclose = () => {
      connected.value = false
      sock.value = null
    }

    sock.value.onopen = () => {
      connected.value = true
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

  function disconnect() {
    sock.value.close()
    connected.value = false
  }

  function send(message, saveToHistory=true) {
    sock.value.send(commandMessageBuilder(message))

    if(saveToHistory && message.trim() != '') {
        commands.value.push(message)
        if(commands.value.length > MAX_COMMAND_HISTORY) {
            commands.value.shift()
        }
    }
  }

  return { connected, messages, lastMessage, commands, connect, disconnect, send }
})