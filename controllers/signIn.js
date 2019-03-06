module.exports.handleSignIn = (db, bcrypt) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json('Invalid form data');
  db.select('email', 'hash')
    .from('login')
    .where('email', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', email)
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
