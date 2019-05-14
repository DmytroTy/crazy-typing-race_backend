const WebSocket = require('ws');

const server = require("./serverDB");

const wss = new WebSocket.Server({ server });

const gamers = {};
const games = {};

wss.on('connection', (ws) => {

    ws.on('close', () => {
        // delete gamers[IDtheme];
        delete games[ws];
    });

    let timeout = 15;

    ws.on('message', (data) => {
        let obj;
        try {
            obj = JSON.parse(data);
        } catch (err) {
            console.error(err);
        }
        
        if (obj && obj.game) {
            if (games[ws] && games[ws].readyState === WebSocket.OPEN) {
                games[ws].send(data);
            }
            return;
        }
        
        if (obj && obj.connect && obj.IDtheme) {
            const gamer = gamers[obj.IDtheme];
            if (!gamer || gamer.readyState !== WebSocket.OPEN) {
                gamers[obj.IDtheme] = ws;
                const res = JSON.stringify({ wait: true }, null, 1);
                ws.send(res);
            } else {
                games[gamer] = ws;
                games[ws] = gamer;
                delete gamers[obj.IDtheme];

                timeout = 15;
                const intervalID = setInterval(() => {
                    const res = JSON.stringify({ connected: true, timeout }, null, 1);
                    ws.send(res); // new Date().toTimeString()
                    gamer.send(res);
                    --timeout;
                    if (timeout < 0) clearInterval(intervalID);
                }, 1000);
            }
        }
        /* // Broadcast to everyone else.
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        }); */
    });
});



