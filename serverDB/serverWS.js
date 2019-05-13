const WebSocketServer = require('ws').Server;

const server = require("./serverDB");

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));

    let timeout = 15;
    const intervalID = setInterval(() => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(timeout); // new Date().toTimeString()
            }
        });
        --timeout;
        if (timeout < 0) clearInterval(intervalID);
    }, 1000);

    ws.on('message', (data) => {
        console.log('received: %s', data);
        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    // ws.send('something');
});



