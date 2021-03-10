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

    shell() {
        this.conn.shell((err, stream) => {
            if (err) throw err

            stream
                .on('close', () => {
                    console.log('Stream :: close')
                })
                .on('data', data => {
                    console.log('OUTPUT: ' + data)
                })

            stream.end('top\nexit\n')
        });
    }
}

export default Session
