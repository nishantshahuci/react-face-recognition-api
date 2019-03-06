module.exports.handleProfile = db => (req, res) => {
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
};
