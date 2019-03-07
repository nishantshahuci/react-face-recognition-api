const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const db = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('it is working'));

app.post('/signin', signIn.handleSignIn(db, bcrypt));

app.post('/register', register.handleRegister(db, bcrypt));

app.get('/profile/:id', profile.handleProfile(db));

app.put('/image', image.handleImage(db));

app.post('/imageurl', image.handleApiCall);

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on port ${process.env.PORT || 3000}`);
});
