import { join } from "path";

// tslint:disable-next-line:no-var-requires
// export const config = require(join(__dirname, "..", "config"));

export const config = {
    common: {
        conv: 666,
        nodelay: 1,
        interval: 50,
        resend: 2,
        nc: 1,
        mtu: 65534,
        timeout: 20000,
        beat: 10000,
    },
    client: {
        socks5: {
            bindPort: 1081,
            bindHost: "localhost",
        },
        reserveProxy: {
        },
        serverPort: 6666,
        serverHost: "localhost",
        serverControlPort: 10086,
    },
    server: {
        bindPort: 6666,
        bindHost: "localhost",
        controlPort: 10086,
    },
    password: "233666",
};
