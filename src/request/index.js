import Axios from 'src/request/axios'
import config from 'src/config'

const request = new Axios({
    baseURL: config.homepage,
})

export default request
