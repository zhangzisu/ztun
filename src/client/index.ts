import { log } from "./log";
import { createSocks5Server } from "./socks5";

log("client started");
(async () => {
    await createSocks5Server();
    // initControl();
})();
