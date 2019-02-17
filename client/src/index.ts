import { random } from "lodash";
import { config } from "../../common";
import { Connection } from "./connection";
import { createSock5 } from "./socks5";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const Connections = [...Array(config.client.parallel)].map(() => new Connection(config.client.serverAddr));

createSock5(config.client.port, config.client.hostname, (info, socket) => {
    try {
        const connection = Connections[random(Connections.length - 1)];
        connection.handle(socket, info);
    } catch (e) {
        console.log(e.message);
    }
});
