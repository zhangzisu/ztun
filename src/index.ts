import { config } from "./config";
import { log } from "./log";
import { registerReserveProxy } from "./reverseproxy";
import { socket } from "./sessionmanager";
import { createSocks5Server } from "./socks5";

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
registerReserveProxy();
