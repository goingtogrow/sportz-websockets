import express from 'express';
import http from 'http'
import { matchRouter } from './routes/matches.js';
import { commentRouter } from './routes/comments.js';
import { apiLimiter } from './middleware/limiter.js';
import { attachWebSocketServer } from './ws/ws-server.js';

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app)
const ws = attachWebSocketServer(server)

app.use(express.json())
app.use(apiLimiter)

app.get('/', (req, res) => {
    res.send('Hello from Express server!')
})

app.use('/matches', matchRouter)  
app.use('/matches/:id/comment', commentRouter);

app.locals.ws = ws;

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost${PORT}` : `http://${HOST}:${PORT}`
    console.log(`Server is ronning on ${baseUrl}`)
    console.log(`Websocket server is running on ${baseUrl.replace('http', 'ws')}/ws`)
})

