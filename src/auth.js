import mongo from 'mongodb';
import connect from './db.js';
import bcrypt from 'bcrypt';

/*(async () => {
  // spriječava pojavu istih korisničkih imena
  let db = await connect();
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
})();*/

export default {
  async registerUser(userData) {
    let db = await connect();

    let doc = {
      // spremanje korisničkih podataka u bazu (+ heširamo lozinku)
      username: userData.username,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 8),
    };
    await db.collection('users').insertOne(doc);
  },
};
