const db = require("../models");
const User = db.users;

// Retrieve all Users from the database
exports.findAll = (req, res) => {
  User.findAll()
    .then(data => res.status(200).send({ data }))
    .catch(err => res.status(500).send({ message: err.message  }));
};

// Find a single User by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Cannot find User with id=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: `Error retrieving User with id=${id}` }));
};

// Update a User by id
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, { where: { id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "User was updated successfully." });
      } else {
        res.send({ message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!` });
      }
    })
    .catch(err => res.status(500).send({ message: `Error updating User with id=${id}` }));
};

// Delete a User by id
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({ where: { id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "User was deleted successfully!" });
      } else {
        res.send({ message: `Cannot delete User with id=${id}. Maybe User was not found!` });
      }
    })
    .catch(err => res.status(500).send({ message: `Could not delete User with id=${id}` }));
};

// Delete all Users from the database
exports.deleteAll = (req, res) => {
  User.destroy({ where: {}, truncate: false })
    .then(nums => res.send({ message: `${nums} Users were deleted successfully!` }))
    .catch(err => res.status(500).send({ message: err.message || "Some error occurred while removing all Users." }));
};

// Find all published Users
exports.findAllPublished = (req, res) => {
  User.findAll({ where: { published: true } })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Some error occurred while retrieving Users." }));
};
