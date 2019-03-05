const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

app.user(cors());

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
      return res.status(200).json('Success');
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
  database.users.push({
    id: '123',
    name: name,
    email: email,
    entries: 0,
    joined: new Date()
  });
  res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  database.users.forEach(user => {
    if (user.id === id) {
      return res.json(user);
    }
  });
  return res.status(404).json('No user found');
});

app.post('/image', (req, res) => {
  const { id } = req.body;
  database.users.forEach(user => {
    if (user.id === id) {
      user.entries++;
      return res.json(user.entries);
    }
  });
  return res.status(404).json('No user found');
});

app.listen(3000, () => {
  console.log('App is running on port 3000');
});
