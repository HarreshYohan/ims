const { where } = require('sequelize');
const { Chatroom , User} = require('../models');
const { check, validationResult } = require('express-validator');

// Validation rules
exports.validate = (method) => {
  switch (method) {
    case 'createSubject':
    case 'updateSubject': {
      return [
        check('name', 'Name is required').notEmpty()
      ];
    }
  }
};


exports.create = async (req, res) => {
    
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
 
  try {
    const { user_id , message, subjecttutorid } = req.body;
    const chatroom = await Chatroom.create({ user_id , message, subjecttutorid });

    res.status(201).send(chatroom);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Chatroom name already exists.'
      });
    } else {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Chatroom.'
      });
    }
  }
};


exports.findAll = async (req, res) => {
  try {
    const chatrooms = await Chatroom.findAll({
      include: [
        { model: User,  as: 'user' },
      ]
    });
    res.status(200).send(chatrooms);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving Chatrooms.'
    });
  }
};


exports.findOne = async (req, res) => {
  try {
    const subjectId = req.params.id;

    const chatrooms = await Chatroom.findAll({
      where:{
        subjecttutorid : subjectId
      },
      include: [
        { model: User,  as: 'user' },
      ],
    });
    res.status(200).send(chatrooms);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving Chatrooms.'
    });
  }
};


// exports.findOne = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const Chatroom = await Chatroom.findByPk(id);
//     if (!Chatroom) {
//       return res.status(404).send({ message: `Cannot find Chatroom with id=${id}.` });
//     }
//     res.status(200).send(Chatroom);
//   } catch (err) {
//     res.status(500).send({
//       message: `Error retrieving Chatroom with id=${id}`
//     });
//   }
// };


// exports.update = async (req, res) => {
//   const id = req.params.id;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name } = req.body;

//   try {
//     const Chatroom = await Chatroom.findByPk(id);
//     if (!Chatroom) {
//       return res.status(404).send({ message: `Cannot find Chatroom with id=${id}.` });
//     }

//     await Chatroom.update({ name });
//     res.status(200).send({ message: "Chatroom was updated successfully." });
//   } catch (err) {
//     if (err.name === 'SequelizeUniqueConstraintError') {
//       res.status(400).send({
//         message: 'Chatroom name already exists.'
//       });
//     } else {
//       res.status(500).send({
//         message: `Error updating Chatroom with id=${id}`
//       });
//     }
//   }
// };


// exports.delete = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const Chatroom = await Chatroom.findByPk(id);
//     if (!Chatroom) {
//       return res.status(404).send({ message: `Cannot find Chatroom with id=${id}.` });
//     }

//     await Chatroom.destroy();
//     res.status(200).send({ message: "Chatroom was deleted successfully!" });
//   } catch (err) {
//     res.status(500).send({
//       message: `Could not delete Chatroom with id=${id} err ${err}`
//     });
//   }
// };
