import dotenv from 'dotenv';
dotenv.config(); // čita .env datoteku

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

// provjera valjanosti JWT potpisa
app.get('/secret', [auth.verify], (req, res) => {
  res.json({ message: 'This is the secret: ' + req.jwt.username });
});

// prijava korisnika
app.post('/auth', async (req, res) => {
  let user = req.body;
  try {
    let result = await auth.authenticateUser(user.username, user.password);
    res.json(result);
  } catch (e) {
    // problem sa autentifikacijom
    res.status(500).json({ error: e.message });
  }
});
// promijena password-a(sa middleware-om za provjeru ulogiranosti korisnika)
app.patch('/users', [auth.verify], async (req, res) => {
  let changes = req.body;
  let username = req.jwt.username;
  //console.log(changes.new_password);

  if (changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      username,
      changes.old_password,
      changes.new_password
    );

    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: 'Cannot change your password!' });
    }
  } else {
    // ako korisnik nije poslao dobar upit sa front-a
    res.status(400).json({ error: 'Invalid inquiry!' });
  }
});

// registracija korisnika
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

// postanje skripti(sa middleware-om za provjeru ulogiranosti korisnika)
app.post('/scripts', [auth.verify], async (req, res) => {
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
