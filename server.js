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
  let hash = '';
  database.login.forEach(user => {
    if (user.email === req.body.email) {
      hash = user.hash;
    }
  });
  if (!hash) {
    return res.status(400).json('error signing in');
  }
  bcrypt.compare(req.body.password, hash, function(error, response) {
    if (response) {
      return res
        .status(200)
        .json(database.users.find(user => user.email === req.body.email));
    } else {
      return res.status(400).json('Incorrect username or password');
    }
  });
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  bcrypt.hash(password, null, null, function(err, hash) {
    database.login.push({
      id: '987',
      email: email,
      hash: hash
    });
  });
  db('users')
    .returning('*')
    .insert({
      name: name,
      email: email,
      joined: new Date()
    })
    .then(user => {
      res.status(201).json(user[0]);
    })
    .catch(err => res.status(400).json('Unable to register'));
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
