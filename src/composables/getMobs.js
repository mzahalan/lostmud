import {ref} from "vue"

let URL_BASE = ""
if(import.meta.env.MODE == "dev_local") {
    URL_BASE = "http://localhost:9081"
} else {
    URL_BASE = "https://socket.lostmud.com"
}

const API_PATH = "/api/mobs"

const getMobs = () => {
    const mobs = ref([])
    const error = ref(null)

    const load = async() => {
        try {
            let data = await fetch(`${URL_BASE}${API_PATH}`)
            if(!data.ok) {
                throw Error("No Data Available")
            }
            mobs.value = await data.json()
        } catch(err) {
            error.value = err.message
            console.log(error.value)
        }
    }
    return {mobs, error, load}
}

export default getMobs