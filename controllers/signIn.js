module.exports.handleSignIn = (db, bcrypt) => (req, res) => {
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
};
