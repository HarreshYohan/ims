const { User, Student, Tutor, Staff, Admin } = require('../models');
const jwt = require('jsonwebtoken');

exports.getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { user_type } = user;
    let profileData = null;

    switch (user_type) {
      case 'STUDENT':
        profileData = await Student.findOne({ 
          where: { user_id: id },
          include: [{ model: User, as: 'user', attributes: ['username', 'email', 'user_type'] }]
        });
        break;
      case 'TUTOR':
        profileData = await Tutor.findOne({ 
          where: { user_id: id },
          include: [{ model: User, as: 'user', attributes: ['username', 'email', 'user_type'] }]
        });
        break;
      case 'STAFF':
        profileData = await Staff.findOne({ 
          where: { user_id: id },
          include: [{ model: User, as: 'user', attributes: ['username', 'email', 'user_type'] }]
        });
        break;
      case 'ADMIN':
        profileData = await Admin.findOne({ 
          where: { user_id: id },
          include: [{ model: User, as: 'user', attributes: ['username', 'email', 'user_type'] }]
        });
        // If no admin profile exists, return base user info
        if (!profileData) {
          profileData = { user: user, ...user.get(), firstname: '', lastname: '', contact: '' };
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!profileData) {
      return res.status(404).json({ message: `${user_type.charAt(0) + user_type.slice(1).toLowerCase()} profile not found` });
    }

    res.status(200).json(profileData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { user_type } = user;

    // Update base User table fields
    await user.update({
      username: updatedData.username || user.username,
      email: updatedData.email || user.email,
    });

    let profile = null;
    const updatePayload = {
      firstname: updatedData.firstname,
      lastname: updatedData.lastname,
      contact: updatedData.contact,
    };

    switch (user_type) {
      case 'STUDENT':
        profile = await Student.findOne({ where: { user_id: id } });
        if (profile) {
          await profile.update({
            ...updatePayload,
            grade: updatedData.grade || profile.grade
          });
        }
        break;
      case 'TUTOR':
        profile = await Tutor.findOne({ where: { user_id: id } });
        if (profile) {
          await profile.update({
            ...updatePayload,
            title: updatedData.title || profile.title
          });
        }
        break;
      case 'STAFF':
        profile = await Staff.findOne({ where: { user_id: id } });
        if (profile) {
            await profile.update({
                ...updatePayload,
                title: updatedData.title || profile.title,
                position: updatedData.position || profile.position
            });
        }
        break;
      case 'ADMIN':
        profile = await Admin.findOne({ where: { user_id: id } });
        if (profile) {
          await profile.update(updatePayload);
        } else {
          profile = await Admin.create({ user_id: id, ...updatePayload });
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};