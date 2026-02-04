import express from 'express';
import { matchRouter } from './routes/matches.js';
import { apiLimiter } from './middleware/limiter.js';

const app = express();
const port = 8000;

app.use(express.json())
app.use(apiLimiter)

app.get('/', (req, res) => {
    res.send('Hello from Express server!')
})

app.use('/matches', matchRouter)

app.listen(port, () => {
    console.log(`Server is ronning at http://localhost:${port}`)
})

