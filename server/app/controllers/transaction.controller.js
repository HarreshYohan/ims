
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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
  
      const { count, rows } = await Transaction.findAndCountAll({
        limit,
        offset,
        order: [
            ['createdAt', 'DESC'],
        ]
      });
  
      const totalPages = Math.ceil(count / limit);
  
      res.json({
        data: rows,
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

// Update a transaction by ID
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

// Delete a transaction by ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    await transaction.destroy();
    res.status(204).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

exports.downloadAll = async (req, res) => {
  try {
    const { transaction_type, columns } = req.query;

    // Convert columns string to array if provided
    const selectedColumns = columns ? columns.split(',') : ['id', 'transaction_type', 'amount', 'description', 'user_id', 'participant_id', 'createdAt', 'updatedAt'];

    // Build filters based on query parameters
    const filters = {};
    if (transaction_type) {
      filters.transaction_type = transaction_type;
    }

    // Fetch transactions with filters
    const transactions = await Transaction.findAll({
      where: filters,
      order: [['createdAt', 'DESC']]
    });

    // Generate CSV fields based on selected columns
    const json2csvParser = new Parser({ fields: selectedColumns });
    const csv = json2csvParser.parse(transactions);

    // Write CSV to file
    const filePath = path.join(__dirname, 'transactions.csv');
    fs.writeFileSync(filePath, csv);

    // Send CSV file for download
    res.download(filePath, 'transactions.csv', (err) => {
      if (err) {
        res.status(500).json({ message: 'Error downloading file', error: err.message });
      }
      fs.unlinkSync(filePath); // delete the file after download
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating CSV', error: error.message });
  }
};