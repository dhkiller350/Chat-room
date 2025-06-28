const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let clients = [];

server.on('connection', function(socket) {
    socket.nickname = "Anonymous";

    socket.on('message', function(data) {
        try {
            let parsed = JSON.parse(data);
            if (parsed.type === 'set_nickname') {
                socket.nickname = parsed.nickname;
            } else if (parsed.type === 'chat_message') {
                const timestamp = new Date().toLocaleTimeString();
                const messagePayload = JSON.stringify({
                    type: 'chat_message',
                    nickname: socket.nickname,
                    timestamp: timestamp,
                    message: parsed.message
                });

                // Broadcast to all clients
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(messagePayload);
                    }
                });
            }
        } catch (err) {
            console.error('Invalid JSON', err);
        }
    });

    socket.on('close', function() {
        clients = clients.filter(c => c !== socket);
    });

    clients.push(socket);
});

console.log('✅ WebSocket server running at ws://localhost:8080');
