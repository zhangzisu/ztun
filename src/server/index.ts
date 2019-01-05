import { config } from "../config";
import { socket } from "../sessionmanager";
import { createControlServer } from "./control";
import { log, verbose } from "./log";

log("server started");

socket.bind(config.server.bindPort, config.server.bindHost, () => {
    log("bind on", config.server.bindHost, config.server.bindPort);
});

createControlServer();
