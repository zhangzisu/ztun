import { Router } from "express";
import { connections } from ".";

export const api = Router();

api.get("/info", (req, res) => {
    const details = connections.map((c) => ({
        inbound: {
            total: c.inbound,
            speed: c.inboundLastSec,
        },
        outbound: {
            total: c.outbound,
            speed: c.outboundLastSec,
        },
        status: c.isIdle() ? "Idle" : "Active",
        connections: c.count,
        duration: c.duration,
        id: c.id,
        address: c.address,
    }));
    const general = {
        inbound: {
            total: 0,
            speed: 0,
        },
        outbound: {
            total: 0,
            speed: 0,
        },
        sessions: {
            total: connections.length,
            active: 0,
        },
    };
    for (const connection of connections) {
        general.inbound.total += connection.inbound;
        general.inbound.speed += connection.inboundLastSec;
        general.outbound.total += connection.outbound;
        general.outbound.speed += connection.outboundLastSec;
        if (!connection.isIdle()) { general.sessions.active++; }
    }
    res.json({ general, details });
});
