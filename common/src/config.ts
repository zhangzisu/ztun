import { IHandler } from "./handler";

export const config: {
    password: string,
    server: {
        port: number,
        hostname: string;
        key: string;
        cert: string;
        handlers: IHandler[];
    },
    client: {
        port: number;
        hostname: string;
        serverAddr: string;
        parallel: number;
    },
} = require("../../config");
