import { createInterface } from "readline";
import { config } from "../config";
import { Cipher, ConnectionType, Decipher, encodeConnectionInfo } from "../protocol";
import { KCPStream } from "./kcpstream";
import { log } from "./log";
import { createSocks5Server } from "./socks5";

log("client started");

const controlStream = new KCPStream({ address: config.client.serverHost, port: config.client.serverPort });
const cipher = Cipher();
cipher.pipe(controlStream);
const decipher = Decipher();
controlStream.pipe(decipher);
cipher.write(encodeConnectionInfo({ host: "", port: 0, type: ConnectionType.control }));
const readline = createInterface(decipher);
readline.on("line", (input) => {
    log(input);
});
cipher.write("Hello\n");

if (config.client.socks5.enable) {
    createSocks5Server();
}
