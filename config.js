module.exports = {
    conv: 666,
    client: {
        socks5: {
            enable: true,
            bindPort: 1081,
            bindHost: 'localhost',
        },
        reserveProxy: {
            enable: false
        },
        serverPort: 6666,
        serverHost: 'localhost',
    },
    server: {
        bindPort: 6666,
        bindHost: 'localhost',
    },
    password: '233666',
}