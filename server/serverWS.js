const WebSocket = require('ws');

const server = require("./serverDB");

const wss = new WebSocket.Server({ server });

const clients = {};
const gamers = {};
const games = {};
let serial = 1;

wss.on('connection', (ws) => {

    clients[serial] = ws;
    const res = JSON.stringify({ ID: serial }, null, 1);
    ws.send(res);
    serial++;

    ws.on('close', () => {
        // delete gamers[IDtheme];
        // delete games[ws.toString()];
    });

    let timeout = 10;

    ws.on('message', (data) => {
        let obj;
        try {
            obj = JSON.parse(data);
        } catch (err) {
            console.error(err);
        }

        if (obj && obj.game && obj.ID) {
            if (games[obj.ID] && games[obj.ID].readyState === WebSocket.OPEN) {
                games[obj.ID].send(data);
            }
            return;
        }

        if (obj && obj.disconnect && obj.IDtheme) {
            delete gamers[obj.IDtheme];
            return;
        }

        if (obj && obj.connect && obj.IDtheme && obj.ID) {
            const gamer = gamers[obj.IDtheme];
            if (!gamer || gamer.ws.readyState !== WebSocket.OPEN) {
                gamers[obj.IDtheme] = { ws, ID: obj.ID };
                const res = JSON.stringify({ wait: true, ID: obj.ID }, null, 1);
                ws.send(res);
            } else {
                games[gamer.ID] = ws;
                // console.log(games[gamer.ID]);
                games[obj.ID] = gamer.ws;
                // console.log(games[obj.ID] === games[gamer.ID]);
                delete gamers[obj.IDtheme];

                timeout = 15;
                const intervalID = setInterval(() => {
                    const res = JSON.stringify({ connected: true, timeout }, null, 1);
                    ws.send(res); // new Date().toTimeString()
                    gamer.ws.send(res);
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



