const { StaticFileHandler } = require('./server/dist/handler')

module.exports = {
    password: 'password',
    server: {
        port: 443,
        hostname: '0.0.0.0',
        key: '/path/to/privkey.pem',
        cert: '/path/to/cert.pem',
        handlers: [
            new StaticFileHandler(".")
        ]
    },
    client: {
        port: 1992,
        hostname: '0.0.0.0',
        serverAddr: 'https://localhost/'
    }
}