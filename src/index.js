import express from 'express';
import cors from 'cors';
import storage from './storage';

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json());

//početna stranica
app.get('/', (req, res) => {
  res.json('Welcome to Home page! :)');
});

app.get('/users/:username', (req, res) => {
  res.json({});
});

app.post('/users/:username', (req, res) => {
  res.json({});
});

app.post('/scripts/new', (req, res) => {
  res.json({});
});

app.get('/scripts/users/:username', (req, res) => {
  res.json({});
});

app.get('/scripts/downloads', (req, res) => {
  res.json({});
});

app.get('/search-results', (req, res) => {
  res.json({});
});

app.get('/search-results/scripts/:script_name', (req, res) => {
  res.json({});
});

app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);
