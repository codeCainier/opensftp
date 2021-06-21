import info from '../package.json'

const config = {
    version: info.version,
    aes: {
        key : 'APP_AES_192_CBC_KEY_____',
        iv  : 'APP_AES_IV______',
    },
}

// development
if (process.env.NODE_ENV === 'development') {
}

export default config
