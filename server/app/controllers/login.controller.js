const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helpers = require('../helpers/validations');
const logger = require('../lib/logger');
const auditLog = require('../services/auditLog');
require('dotenv').config();

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!helpers.isValidObject(req.body) || !(email && password)) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const { Op } = require('sequelize');
    const user = await User.findOne({ 
      where: { 
        email: { [Op.iLike]: email } 
      } 
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { user_id: user.id, username: user.username, email: user.email, user_type: user.user_type },
      process.env.SECRET_KEY,
      { expiresIn: '8h' }
    );

    // Never return the password hash — destructure it out
    const { password: _pw, ...safeUser } = user.toJSON();

    // Audit: LOGIN
    await auditLog.log({
      req, action: 'LOGIN', entity: 'user', entity_id: user.id,
      details: `User ${user.username} (${user.email}) logged in [${user.user_type}]`,
      user: { user_id: user.id, username: user.username, email: user.email, user_type: user.user_type },
    });

    logger.info(`User logged in: ${email} [${user.user_type}]`);
    res.status(200).json({ message: 'Login successful.', token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  if (!helpers.isValidObject(req.body)) {
    return res.status(400).json({ message: 'Input is invalid. Some fields are null or empty.' });
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  try {
    const existingUser = await User.findOne({ where: { email: req.body.email } });

    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      user_type: req.body.user_type ?? 'NA',
    });

    const token = jwt.sign(
      { user_id: user.id, username: user.username, email: user.email, user_type: user.user_type },
      process.env.SECRET_KEY,
      { expiresIn: '8h' }
    );

    const { password: _pw, ...safeUser } = user.toJSON();

    // Audit: SIGNUP
    await auditLog.log({
      req, action: 'CREATE', entity: 'user', entity_id: user.id,
      details: `New user signed up: ${user.username} (${user.email}) [${user.user_type}]`,
      user: { user_id: user.id, username: user.username, email: user.email, user_type: user.user_type },
    });

    logger.info(`New user signed up: ${user.email} [${user.user_type}]`);
    res.status(201).json({ message: 'Successfully signed up.', token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const { Op } = require('sequelize');
    const user = await User.findOne({ 
      where: { 
        email: { [Op.iLike]: email } 
      } 
    });
    if (!user || !user.is_active) {
      return res.status(404).json({ message: 'No active user found with this email.' });
    }

    const crypto = require('crypto');
    const newPassword = crypto.randomBytes(6).toString('hex'); // 12 char random password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    const { sendPasswordResetEmail } = require('../services/email.service');
    const emailSent = await sendPasswordResetEmail(user.email, user.username, newPassword);

    if (emailSent) {
      // Audit: PASSWORD_RESET
      await auditLog.log({
        req, action: 'UPDATE', entity: 'user', entity_id: user.id,
        details: `Password reset requested for: ${user.username} (${user.email})`,
        user: { user_id: user.id, username: user.username, email: user.email, user_type: user.user_type },
      });
      res.status(200).json({ message: 'Password reset successfully. Please check your email.' });
    } else {
      res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
    }
  } catch (err) {
    next(err);
  }
};