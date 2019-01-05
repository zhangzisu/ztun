module.exports = {
    common: {
        conv: 666,
        nodelay: 1,
        interval: 50,
        resend: 2,
        nc: 1,
        mtu: 65535 - 20,
        sndwnd: 32,
        rcvwnd: 32,
        timeout: 10000,
        beat: 5000,
    },
    socks5: {
        enable: true,
        bindPort: 1081,
        bindHost: "localhost",
    },
    reverseProxy: [
        {
            remoteHost: "localhost",
            remotePort: 1666,
            localHost: "www.baidu.com",
            localPort: 80,
        },
    ],
    server: {
        enable: false,
    },
    connect: {
        port: 6666,
        host: "localhost",
    },
    password: "233666",
};