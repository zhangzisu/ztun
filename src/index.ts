import { createSocks5Server } from "./client/socks5";
import { config } from "./config";
import { log } from "./log";
import { socket } from "./sessionmanager";

if (config.server.enable) {
    log("server started");
    socket.bind(config.server.bindPort, config.server.bindHost, () => {
        log("bind on", config.server.bindHost, config.server.bindPort);
    });
}
if (config.socks5.enable) {
    log("socks5 started");
    createSocks5Server();
}
