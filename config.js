module.exports = {
    password: '666233',
    server: {
        port: 443,
        hostname: '0.0.0.0',
        key: '/etc/letsencrypt/live/test.zhangzisu.cn/privkey.pem',
        cert: '/etc/letsencrypt/live/test.zhangzisu.cn/fullchain.pem'
    },
    client: {
        port: 1080,
        hostname: '0.0.0.0',
        serverAddr: 'https://test.zhangzisu.cn/'
    }
}