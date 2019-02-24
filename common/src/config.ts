import { join } from "path";

export const config = {
    password: "123456",
    server: {
        key: join(__dirname, "..", "..", "cert", "dev-key.pem"),
        cert: join(__dirname, "..", "..", "cert", "dev-cert.pem"),
    },
    client: {
        port: 1080,
        hostname: "localhost",
        serverAddr: "https://localhost",
        parallel: 4,
    },
};
