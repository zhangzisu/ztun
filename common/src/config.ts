import { join } from "path";

export const config = {
    password: "123456",
    key: join(__dirname, "..", "..", "cert", "dev-key.pem"),
    cert: join(__dirname, "..", "..", "cert", "dev-cert.pem"),
};
