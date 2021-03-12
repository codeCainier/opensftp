import { uid } from 'quasar'
const { Client } = require('ssh2')

class Session {
    constructor() {
    }

    init(sessionInfo) {
        return new Promise((resolve, reject) => {
            this.conn = new Client()
            this.conn
                .on('ready', () => resolve())
                .on('error', err => reject(err))
                .connect(sessionInfo)
        })
    }

    shell(window, options) {
        return new Promise((resolve, reject) => {
            this.conn.shell(window, options, (err, stream) => {
                if (err) return reject(err)
                resolve(stream)
            })
        })
    }
}

export default Session
