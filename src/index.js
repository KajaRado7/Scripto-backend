import express from 'express';
import cors from 'cors';
import data from './storage.js';
import connect from './db.js';
import auth from './auth.js';
import mongo from 'mongodb';

const app = express(); // instanciranje aplikacije
const port = process.env.PORT || 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json());

app.post('/users', async (req, res) => {
  let user = req.body;
  let id;

  try {
    id = await auth.registerUser(user);
  } catch (e) {
    // prikaz greške da korisničko ime već postoji
    res.status(500).json({ error: e.message });
  }
  res.json({ id: id });
});

// postanje skripti
app.post('/scripts', async (req, res) => {
  let data = req.body;
  let db = await connect();
  let result = await db.collection('scripts').insert(data);

  if (result && result.insertedCount == 1) {
    res.json({ result, status: 'ok' });
  } else {
    res.json({ status: 'fail' });
  }
});

/*

Home
app.get('/', (req, res) => {
  res.json('Welcome to Home page! :)');
});

Script
app.get('/scripts', (req, res) => {
  res.json({});
});

My Account
app.get('/users/:id', (req, res) => {
  res.json({});
});

Login/Sign up ?
app.post('/users/:id', (req, res) => {
  res.json({});
});

Add Script
app.post('/add_script', (req, res) => {
  res.json({});
});

My Downloads
app.get('/my_downloads', (req, res) => {
  res.json({});
});
*/

app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);
