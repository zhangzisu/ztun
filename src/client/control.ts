import { defaults } from "request-promise-native";
import { config } from "../config";
import { createConnection, createRequest } from "../socks5";
import { log } from "./log";

export const initControl = async () => {
    log("init control");
    const request = createRequest();
    const result = await request.get("/");
    log(result.data);
};
