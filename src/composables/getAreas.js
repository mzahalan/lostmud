import {ref} from "vue"
const URL_BASE = "https://socket.lostmud.com"
const AREA_PATH = "/api/areas"

const getAreas = () => {
    const areas = ref([])
    const error = ref(null)

    const load = async() => {
        try {
            let data = await fetch(`${URL_BASE}${AREA_PATH}`)
            if(!data.ok) {
                throw Error("No Data Available")
            }
            areas.value = await data.json()
        } catch(err) {
            error.value = err.message
            console.log(error.value)
        }
    }
    return {areas, error, load}
}

export default getAreas