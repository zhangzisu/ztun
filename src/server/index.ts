import { config } from "../config";
import { server } from "./kcpstream";
import { log } from "./log";

log("server started");
server.bind(config.server.bindPort, config.server.bindHost);
