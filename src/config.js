const info = require('../package.json')
const config = {
    version: info.version,
    homepage: 'https://opensftp.com:9443',
    distPath: '/statics/download/opensftp/latest',
    aes: {
        key : 'APP_AES_192_CBC_KEY_____',
        iv  : 'APP_AES_IV______',
    },
}

// development
if (process.env.NODE_ENV === 'development') {
    config.homepage = 'http://localhost'
}

module.exports = config
