<template>
    <v-expansion-panel title="Triggers">
    <v-expansion-panel-text>
        <v-list class="ma-0 pa-0" lines="one" nav>
            <v-list-item v-for="trigger in triggers" :key="trigger.name" :value="trigger.name" density="compact">
                <template v-slot:append><v-chip pill>{{ trigger.count }}</v-chip></template>
                <template v-slot:prepend>
                    <v-list-item-action start>
                        <v-checkbox-btn v-model="trigger.enabled"></v-checkbox-btn>
                    </v-list-item-action>
                </template>
                <v-list-item-title>{{ trigger.name }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-expansion-panel-text>
    </v-expansion-panel>
</template>

<script setup>
import { useMudConnectStore } from '@/stores/mudconnect';
import { ref } from 'vue';

const mud = useMudConnectStore()

mud.addListener(async (message)=>{
    for(let i = 0; i < triggers.value.length; i++) {
        if(!triggers.value[i].enabled) {
            continue
        }
        let lines = message.text.split('\n')
        for(let j = 0; j < lines.length; j++){
            if(triggers.value[i].re.test(lines[j])) {
                triggers.value[i].count = triggers.value[i].count + 1
                let commands = triggers.value[i].command.split(';')
                for(let k = 0; k < commands.length; k++) {
                    mud.send(commands[k])
                }
            }
        }
    }
})

const triggers = ref([])

triggers.value.push({
    name:"Food",
    re: /^You are hungry.$/,
    enabled: false,
    count: 0,
    command: "get rat bag; eat rat"
})

triggers.value.push({
    name: "Drink",
    re: /^You are thirsty.$/,
    enabled: false,
    count: 0,
    command: "drink bar; drink bar; drink bar"
})

triggers.value.push({
    name: "Void",
    re: /^You disappear into the void.$/,
    enabled: false,
    count: 0,
    command: "cough"
})



</script>

<style scoped>
</style>