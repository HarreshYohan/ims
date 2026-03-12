const { Transaction } = require('../models');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

exports.create = async (req, res) => {
  try {
    const { transaction_type, amount, description, user_id, participant_id } = req.body;
    const newTransaction = await Transaction.create({
      transaction_type,
      amount,
      description,
      user_id,
      participant_id
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { page, limit, transaction_type, search } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { Op } = require('sequelize');
    const where = {};
    if (transaction_type) {
      where.transaction_type = transaction_type;
    }

    if (search) {
      where.description = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transaction', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_type, amount, description, user_id, participant_id } = req.body;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    transaction.transaction_type = transaction_type;
    transaction.amount = amount;
    transaction.description = description;
    transaction.user_id = user_id;
    transaction.participant_id = participant_id;
    await transaction.save();
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    await transaction.destroy();
    res.status(244).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

exports.downloadAll = async (req, res) => {
  try {
    const { transaction_type, columns } = req.query;
    const selectedColumns = columns ? columns.split(',') : ['id', 'transaction_type', 'amount', 'description', 'user_id', 'participant_id', 'createdAt', 'updatedAt'];

    const filters = {};
    if (transaction_type) {
      filters.transaction_type = transaction_type;
    }

    const transactions = await Transaction.findAll({
      where: filters,
      order: [['createdAt', 'DESC']]
    });

    const json2csvParser = new Parser({ fields: selectedColumns });
    const csv = json2csvParser.parse(transactions);

    const filePath = path.join(__dirname, 'transactions.csv');
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'transactions.csv', (err) => {
      if (err) {
        res.status(500).json({ message: 'Error downloading file', error: err.message });
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating CSV', error: error.message });
  }
};