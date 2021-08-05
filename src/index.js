import express from 'express';
import cors from 'cors';
import data from './storage.js';

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json());

// dohvat podataka sa storage.js(vjezba)
app.get('/users', (req, res) => {
  let users = data.users;
  let query = req.query;
  res.json(users);
});

// Home
app.get('/', (req, res) => {
  res.json('Welcome to Home page! :)');
});
// Script
app.get('/scripts', (req, res) => {
  res.json({});
});
app.post('/scripts', (req, res) => {
  res.json({});
});
// My Account
app.get('/users/:id', (req, res) => {
  res.json({});
});
// Login/Sign up ?
app.post('/users/:id', (req, res) => {
  res.json({});
});
// Add Script
app.post('/add_script', (req, res) => {
  res.json({});
});
// My Downloads
app.get('/my_downloads', (req, res) => {
  res.json({});
});
// rezultati pretrage
app.get('/search_results', (req, res) => {
  res.json({});
});

app.get('/search-results/scripts/:script_name', (req, res) => {
  res.json({});
});

app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);
