import dotenv from 'dotenv';
dotenv.config(); // čita .env datoteku

import express from 'express';
import cors from 'cors';
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
    console.log(e);
    // problem sa autentifikacijom
    res.status(500).json({ error: e.message });
  }
});
//USERS--------------------------------------------------------------------------------//
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
// dohvat kor.imena korisnika
app.get('/users/:username', async (req, res) => {
  let username = req.params.username;
  let db = await connect();

  let doc = await db.collection('users').findOne({ username: username });

  res.json(doc);
});
//SCRIPTS-----------------------------------------------------------------------------//
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
// dohvat id-a za zasebnu skriptu
app.get('/scripts/:id', [auth.verify], async (req, res) => {
  let id = req.params.id;
  let db = await connect();

  let doc = await db.collection('scripts').findOne({ _id: mongo.ObjectId(id) });
  res.json(doc);
});
// pretraga skripti
app.get('/scripts', async (req, res) => {
  let db = await connect();
  let query = req.query;
  let selekcija = {};

  if (query._any) {
    // kompozitni upiti
    let pretraga = query._any;
    let terms = pretraga.split(' ');
    let atributi = ['script_name', 'study', 'university', 'script_rating']; // po cemu cemo vrsiti pretragu

    selekcija = {
      $and: [],
    };

    terms.forEach((term) => {
      let or = {
        $or: [],
      };
      atributi.forEach((atribut) => {
        or.$or.push({ [atribut]: new RegExp(term) }); // [] iščitava što je u atributu
      });
      selekcija.$and.push(or);
    });
  }

  console.log('Selekcija: ', selekcija);

  let cursor = await db.collection('scripts').find(selekcija);
  let results = await cursor.toArray();

  res.json(results);
});
//COMMENTS----------------------------------------------------------------------------//
//dohvat komentara za svaku skriptu
app.get('/comments/:script_id', [auth.verify], async (req, res) => {
  let db = await connect();
  let scriptId = req.params.script_id;

  let result = await db.collection('comments').find({ script_id: scriptId });
  let cursor = await result.toArray();
  res.json(cursor);
});
// objava komentara
app.post('/comments', [auth.verify], async (req, res) => {
  let data = req.body;

  delete data._id;

  let db = await connect();
  let result = await db.collection('comments').insertOne(data);

  if (result && result.insertedCount == 1) {
    res.json(result.ops[0]);
  } else {
    res.json({
      status: 'fail',
    });
  }
});
// brisanje komentara
app.post('/comments/delete/:comment', [auth.verify], async (req, res) => {
  let cName = req.params.comment;
  console.log(cName);

  let db = await connect();
  let result = await db.collection('comments').deleteOne({ comment: cName });

  if (result && result.deletedCount == 1) {
    res.json(result);
  } else {
    res.json({
      status: 'fail',
    });
  }
});
//DOWNLOADS-----------------------------------------------------------------------------//
// dodavanje skripte u kolekciju
app.post('/my_downloads', async (req, res) => {
  let data = req.body;

  delete data._id;

  let db = await connect();
  let result = await db.collection('myDownloads').insertOne(data);

  if (result && result.insertedCount == 1) {
    res.json({ result, status: 'ok' });
  } else {
    res.json({
      status: 'fail',
    });
  }
});
app.get('/my_downloads', async (req, res) => {
  let db = await connect();

  let cursor = await db.collection('myDownloads').find();
  let results = await cursor.toArray();
  res.json(results);
});

app.get('/my_downloads/:scriptId', [auth.verify], async (req, res) => {
  let db = await connect();
  let script_id = req.params.script_id;

  let results = await db
    .collection('myDownloads')
    .findOne({ script_id: script_id });
  res.json(results);
});

app.get('/my_downloads/:username', [auth.verify], async (req, res) => {
  let db = await connect();
  let username = req.params.username;

  let cursor = await db.collection('myDownloads').find({ username: username });
  let results = await cursor.toArray();
  res.json(results);
});

app.post(
  '/my_downloads/delete/:script_name',
  [auth.verify],
  async (req, res) => {
    let script_name = req.params.script_name;
    console.log(script_name);

    let db = await connect();
    let result = await db
      .collection('myDownloads')
      .deleteOne({ script_name: script_name });

    if (result && result.deletedCount == 1) {
      res.json({ result, status: 'ok' });
    } else {
      res.json({
        status: 'fail',
      });
    }
  }
);

app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);
