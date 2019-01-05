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
        enable: false,
    },
    reverseProxy: [],
    server: {
        enable: true,
        bindPort: 6666,
        bindHost: "localhost",
    },
    password: "233666",
};