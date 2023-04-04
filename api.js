import * as dotenv from 'dotenv'

dotenv.config()

import mysql from 'mysql2/promise';
import cors from "cors";
import express from 'express';


const app = express();
const port = 3000;
app.use(cors());

app.get('/episode', async (req, res) => {
    const sqlhost = process.env.sqlhost;
    const sqldb = process.env.sqldb;
    const sqluser = process.env.sqluser;
    const sqlpass = process.env.sqlpass;
  
    try {
      const connection = await mysql.createConnection({
        host: sqlhost,
        user: sqluser,
        password: sqlpass,
        database: sqldb
      });
  
      const [rows, fields] = await connection.execute('SELECT * FROM sanedb ORDER BY id DESC LIMIT 1');
  
      // Check if any rows were returned by the query
      if (rows.length > 0) {
        // Store each column's data for the row in a variable
        const title = rows[0].title;
        const script = rows[0].script;
        const audio = rows[0].audio;
        const voice = rows[0].name;
        const world = rows[0].world;
        const subject = rows[0].subject;
        const model = rows[0].model;
        const location = rows[0].location;
  
        const data = { title, script, audio, voice, world, subject, model, location };
        res.send(data);
      } else {
        // No rows were returned
        res.status(404).send('Episode not found');
      }
  
      await connection.end();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

  // Start the API server
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });