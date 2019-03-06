const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const db = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'nishant',
    password: '',
    database: 'face-recognition'
  }
});

const app = express();

app.use(cors());

app.use(bodyParser.json());

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      entries: 0,
      joined: new Date()
    }
  ],
  login: [
    {
      id: '987',
      hash: '',
      email: 'john@gmail.com'
    }
  ]
};

app.get('/', (req, res) => {
  res.send(database);
});

app.post('/signin', (req, res) => {
  db.select('email', 'hash')
    .from('login')
    .where('email', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', req.body.email)
          .then(user => {
            res.status(200).json(user[0]);
          })
          .catch(err => res.status(400).json('Uable to get user'));
      } else {
        return res.status(400).json('Wrong credentials');
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'));
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            name: name,
            email: loginEmail[0],
            joined: new Date()
          })
          .then(user => {
            res.status(201).json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json('Unable to register'));
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({ id })
    .then(user => {
      if (user.length) res.status(200).json(user);
      else res.status(404).json('User not found');
    })
    .catch(err => {
      res.status(500).json('Error getting user');
    });
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.status(200).json(entries[0]);
    })
    .catch(err => {
      res.status(400).json('Unable to get entries');
    });
});

app.listen(3000, () => {
  console.log('App is running on port 3000');
});
