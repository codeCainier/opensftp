import axios from 'axios'

class Axios {
    constructor(config) {
        const { baseURL } = config
        axios.defaults.baseURL = baseURL
        axios.defaults.adapter = require('axios/lib/adapters/http')
    }

    get(props) {
        const { path, params } = props
        return new Promise((resolve, reject) => {
            axios.get(path, { params })
                .then(res => resolve(res.data))
                .catch(err => reject(err))
        })
    }

    post(props) {
        const { path, params } = props
        return new Promise((resolve, reject) => {
            axios.post(path, params)
                .then(res => resolve(res.data))
                .catch(err => reject(err))
        })
    }
}

export default Axios
