import express from 'express';
import storage from './storage.js';
import cors from 'cors';

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json('Welcome to Home page! :)');
});
//app.get('/user', (req, res) => res.json(data.user));

app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);
