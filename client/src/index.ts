import { random } from "lodash";
import { config } from "../../common";
import { Connection } from "./connection";
import { formatDataSize } from "./format";
import { createSock5 } from "./socks5";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const Connections = [...Array(config.client.parallel)].map(() => new Connection(config.client.serverAddr));

createSock5(config.client.port, config.client.hostname, (info, socket) => {
    try {
        const connection = Connections[random(Connections.length - 1)];
        connection.handle(socket, info);
    } catch (e) {
        console.log(e);
    }
});

setInterval(() => {
    // Report info
    let count = 0;
    let inbound = 0;
    let outbound = 0;
    for (const connection of Connections) {
        if (!connection.isIdle()) { count++; }
        inbound += connection.inbound;
        outbound += connection.outbound;
    }
    console.log(`Act ${count} Inb ${formatDataSize(inbound)} Oub ${formatDataSize(outbound)}`);
}, 60 * 1000);
