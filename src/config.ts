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
    },
    client: {
        socks5: {
            enable: true,
            bindPort: 1081,
            bindHost: "localhost",
        },
        reserveProxy: {
            enable: false,
        },
        serverPort: 6666,
        serverHost: "localhost",
    },
    server: {
        bindPort: 6666,
        bindHost: "localhost",
    },
    password: "233666",
};
