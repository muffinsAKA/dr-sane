import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { gather } from './gather.js';

dotenv.config()

import cors from "cors";
import express from 'express';


const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.json());

// define a route
app.get('/gather', async (req, res) => {
    try {
        const result = await gather();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while running gather()' });
    }
});

// start server
app.listen(port, () => console.log(`Server is running on port ${port}`));