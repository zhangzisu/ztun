import { createSocks5 } from "../socks5";
import { KCPStream } from "./kcpstream";
import { log } from "./log";

const serverContext = {
    address: "127.0.0.1",
    port: 12345,
};

createSocks5(6666, "localhost", (info, socket) => {
    log(`Connect to ${info.dstAddr}:${info.dstPort}`);
    const stream = new KCPStream({ host: info.dstAddr, port: info.dstPort }, serverContext);
    socket.pipe(stream);
    stream.pipe(socket);
    socket.on("error", (err) => {
        log(err.message);
        stream.end();
    });
    stream.on("error", (err) => {
        log(err.message);
        socket.end();
    });
});
