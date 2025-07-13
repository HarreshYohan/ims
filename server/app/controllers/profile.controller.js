const { User, Student, Tutor, Staff, Admin } = require('../models');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models/index');

exports.getProfile = async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).send({ message: 'User not found' });
  
      const { user_type } = user;
  console.log(user_type)
      switch (user_type) {
        case 'STUDENT':
          return await getStudentProfile(id, res);
        case 'TUTOR':
          return await getTutorProfile(id, res);
        case 'STAFF':
          return await getStaffProfile(id, res);
        case 'ADMIN':
          return await getAdminProfile(id, res);
        default:
          return res.status(400).send({ message: 'Invalid user type' });
      }
    } catch (error) {
      return res.status(500).send({ message: 'Failed to get profile', error: error.message });
    }
  };
  

// Sub-profiles
const getStudentProfile = async (id, res) => {
    try {
      console.log("Fetching student for user ID:", id);
  
      const [student] = await sequelize.query(`
        SELECT * FROM student WHERE user_id = :userId LIMIT 1
      `, {
        replacements: { userId: id },
        type: sequelize.QueryTypes.SELECT
      });
      if (!student) {
        return res.status(404).send({ message: 'Student not found' });
      }
  
      return res.status(200).send(student);
  
    } catch (err) {
      console.error('Error fetching student profile:', err);
      return res.status(500).send({
        message: 'Error fetching student profile',
        error: err.message
      });
    }
  };
  

const getTutorProfile = async (id, res) => {
    try {
        console.log("Fetching tutor for user ID:", id);
    
        const [tutor] = await sequelize.query(`
          SELECT * FROM tutor WHERE user_id = :userId LIMIT 1
        `, {
          replacements: { userId: id },
          type: sequelize.QueryTypes.SELECT
        });
    
        console.log(tutor)
        if (!tutor) {
          return res.status(404).send({ message: 'Tutor not found' });
        }
    
        return res.status(200).send(tutor);
    
      } catch (err) {
        console.error('Error fetching tutor profile:', err);
        return res.status(500).send({
          message: 'Error fetching tutor profile',
          error: err.message
        });
      }
};

const getStaffProfile = async (id, res) => {
  try {
    const staff = await Staff.findByPk(id, { include: User });
    if (!staff) return res.status(404).send({ message: 'Staff not found' });
    return res.status(200).send(staff);
  } catch (err) {
    return res.status(500).send({ message: 'Error fetching staff profile', error: err.message });
  }
};

const getAdminProfile = async (id, res) => {
  try {
    const admin = await Admin.findByPk(id, { include: User });
    if (!admin) return res.status(404).send({ message: 'Admin not found' });
    return res.status(200).send(admin);
  } catch (err) {
    return res.status(500).send({ message: 'Error fetching admin profile', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
  
    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).send({ message: 'User not found' });
  
      const { user_type } = user;
  console.log(updatedData)
      // Update base User table fields if needed
      await user.update({
        username: updatedData.username || user.username,
        email: updatedData.email || user.email,
        is_active: updatedData.is_active !== undefined ? updatedData.is_active : user.is_active,
      });
  
      switch (user_type) {
        case 'STUDENT':
          return await updateStudentProfile(id, updatedData, res);
        // case 'TUTOR':
        //   return await updateTutorProfile(id, updatedData, res);
        // case 'STAFF':
        //   return await updateStaffProfile(id, updatedData, res);
        // case 'ADMIN':
        //   return await updateAdminProfile(id, updatedData, res);
        default:
          return res.status(400).send({ message: 'Invalid user type' });
      }
  
    } catch (error) {
      return res.status(500).send({ message: 'Failed to update profile', error: error.message });
    }
  };

  const updateStudentProfile = async (id, updatedData, res) => {
    try {
      await sequelize.query(`
        UPDATE student SET 
          firstname = :firstname,
          lastname = :lastname,
          contact = :contact,
          grade = :grade,
          username = :username,
          email = :email,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = :userId
      `, {
        replacements: {
          firstname: updatedData.firstname,
          lastname: updatedData.lastname,
          contact: updatedData.contact,
          grade: updatedData.grade,
          email: updatedData.email,
          username: updatedData.username,
          userId: id
        },
        type: sequelize.QueryTypes.UPDATE
      });
  
      return res.status(200).send({ message: 'Student profile updated successfully' });
  
    } catch (err) {
      return res.status(500).send({ message: 'Error updating student profile', error: err.message });
    }
  };
  