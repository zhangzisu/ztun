import { random } from "lodash";
import { Socket } from "net";
import { ISocks5ConnectInfo } from "../../common";
import { Connection } from "./connection";

export let connections: Connection[] = [];

export const createHandler = (parallel: number, serverAddr: string) => {
    connections.length = 0;
    for (let i = 0; i < parallel; i++) {
        connections.push(new Connection(serverAddr));
    }
    return (info: ISocks5ConnectInfo, socket: Socket) => {
        try {
            const connection = connections[random(connections.length - 1)];
            connection.handle(socket, info);
        } catch (e) {
            console.log(e);
        }
    };
};
