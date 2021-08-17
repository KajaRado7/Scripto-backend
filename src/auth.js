import mongo from 'mongodb';
import connect from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

(async () => {
  // funk. koja spriječava pojavu istih korisničkih imena
  let db = await connect();
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
})();

export default {
  // REGISTRACIJA-----------------------------------------------------------//
  async registerUser(userData) {
    let db = await connect();

    let doc = {
      // spremanje korisničkih podataka u bazu (+ heširamo lozinku 8 puta)
      username: userData.username,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 8),
    };
    try {
      // korisničko ime je unique
      let result = await db.collection('users').insertOne(doc);
      if (result && result.insertedId) {
        return result.insertedId;
      }
    } catch (e) {
      // korisničko ime već postoji te obavještavamo korisnika o grešci
      if (e.name == 'MongoError' && e.code == 11000) {
        throw new Error('Username already exists!');
      }
    }
  },
  // PRIJAVA-----------------------------------------------------------------//
  async authenticateUser(username, password) {
    let db = await connect();
    let user = await db.collection('users').findOne({ username: username });

    // provjera da li se podudaraju pass sa front-a i pass u bazi(koji je kriptiran)
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      // vraćamo TOKEN korisniku
      delete user.password;
      let token = jwt.sign(user, process.env.JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: '4 weeks',
      });
      return {
        token,
        username: user.username,
      };
    } else {
      // ne vrećamo TOKEN korisniku(ne podudaraju se podaci)
      throw new Error('Cannot authenticate!');
    }
  },
  // PROVJERA VALJANOSTI JWT POTPISA------------------------------------------//
  verify(req, res, next) {
    try {
      // izvlačimo iz headers auth. te ga splitamo i spremamo u var. ovisno o indexima
      let authorization = req.headers.authorization.split(' ');
      let type = authorization[0];
      let token = authorization[1];

      // ako tip tokena nije Bearer vrati error
      if (type !== 'Bearer') {
        return res.status(401).send();
      } else {
        // ako je Bearer, JWT-om dekodiramo token te njegove podatke spremimo uz req
        req.jwt = jwt.verify(token, process.env.JWT_SECRET);
        return next(); // pozivanje 3.parametra iz verify funk.(ako ne dođe do error 401)
      }
    } catch (e) {
      return res.status(401).send();
    }
  },
};
