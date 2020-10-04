const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const app = express();
const http = require('http');
const cors = require('cors');
const Measure = require('./app/models/measure');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.get('/', (req, res) => {
    res.send("BeThere WebSocket - Home");
})

const server = http.createServer(app); // is this necessary? re-check
const port = 4000;

require('./app/controllers/index')(app); //importa controllers

server.listen(port, () => {
    console.log(`Server running in the port ${port}`);
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection' , async ws => {
    app.post('/send', async function (req, res) {
        const measure = await Measure.create(req.body);
        res.send(measure);
        ws.send(req.body.value);
    });

    ws.on('message', message => {
        console.log(`Received message => ${message}`)
    });

    const lastMeasure = await Measure.find( { measureName: "Pump Status"}).sort( { _id: -1 }).limit(1);
    console.log(lastMeasure);
    ws.send('I touched the server!');
});
