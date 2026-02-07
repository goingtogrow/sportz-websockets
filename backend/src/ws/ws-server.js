import { WebSocket, WebSocketServer } from "ws"

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        client.send(JSON.stringify(payload));
    }
}

function broadcastToMatch(wss, matchId, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        if (!client.subscriptions?.has(matchId)) continue;
        sendJson(client, payload);
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 })

    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.subscriptions = new Set();

        ws.on('pong', () => { ws.isAlive = true })
        sendJson(ws, { type: 'welcome' })

        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.type === 'subscribe' && typeof msg.matchId === 'number') {
                    ws.subscriptions.add(msg.matchId);
                    sendJson(ws, { type: 'subscribed', matchId: msg.matchId });
                }
                if (msg.type === 'unsubscribe' && typeof msg.matchId == 'number') {
                    ws.subscriptions.delete(msg.matchId);
                    sendJson(ws, { type: 'unsubscribed', matchId: msg.matchId })
                }

            } catch (e) {
                console.error('invalid ws message', e)
            }
        })
    })

    const interval = setInterval(() => {
        for (const ws of wss.clients) {
            if (!ws.isAlive) {
                ws.terminate();
                continue;
            }
            ws.isAlive = false;
            ws.ping();
        }
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_created', data: match })
    }

    function broadcastCommentCreated(comment) {
        console.log('📢 WS broadcast comment', comment.matchId);
        broadcastToMatch(wss, comment.matchId, { type: 'comment_created', data: comment })
    }

    return { broadcastMatchCreated, broadcastCommentCreated }
}