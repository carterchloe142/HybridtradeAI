"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEARTBEAT_MS = void 0;
exports.publish = publish;
exports.subscribe = subscribe;
exports.encodeSSE = encodeSSE;
const redis_1 = require("./redis");
async function publish(channel, payload) {
    const data = JSON.stringify(payload);
    await redis_1.pub.publish(channel, data);
}
function subscribe(channel, handler, client = redis_1.sub) {
    client.subscribe(channel);
    const onMessage = (ch, message) => {
        if (ch !== channel)
            return;
        try {
            handler(JSON.parse(message));
        }
        catch {
            handler(message);
        }
    };
    client.on('message', onMessage);
    return () => {
        client.off('message', onMessage);
        client.unsubscribe(channel);
    };
}
exports.HEARTBEAT_MS = 25000;
function encodeSSE(data, id, event) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const idLine = id ? `id: ${id}\n` : '';
    const eventLine = event ? `event: ${event}\n` : '';
    return new TextEncoder().encode(`${idLine}${eventLine}data: ${payload}\n\n`);
}
