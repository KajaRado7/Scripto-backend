import mongo from 'mongodb';
import connect from './db.js';
import bcrypt from 'bcrypt';

(async () => {
  // funk. koja spriječava pojavu istih korisničkih imena
  let db = await connect();
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
})();

export default {
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
};
