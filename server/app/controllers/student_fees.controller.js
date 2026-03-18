const { where } = require('sequelize');
const { StudentFees, StudentSubject, SubjectTutor  } = require('../models');


exports.create = async (req, res) => {
  const { studentid, month, year, amount } = req.body;

  if (amount && parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive value greater than zero.' });
  }

  try {
    const existing = await StudentFees.findOne({ where: { studentid, month, year } });
    if (existing) {
      return res.status(409).json({ message: 'A fee record already exists for this student in this month and year.' });
    }

    const studentFee = await StudentFees.create(req.body);
    res.status(201).json(studentFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.findAll = async (req, res) => {
  try {
    const studentFees = await StudentFees.findAll();
    res.status(200).json(studentFees);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.findOne = async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).json({ message: 'Invalid student ID format.' });
  }

  try {
    const studentFee = await StudentFees.findAll({
      where: { studentid: studentId }
    });
    res.status(200).json(studentFee || []);
  } catch (error) {
    console.error('Error in studentFees.findOne:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.update = async (req, res) => {
  if (req.body.amount && parseFloat(req.body.amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive value greater than zero.' });
  }
  
  try {
    const [updated] = await StudentFees.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedStudentFee = await StudentFees.findByPk(req.params.id);
      res.status(200).json(updatedStudentFee);
    } else {
      res.status(404).json({ message: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.delete = async (req, res) => {
  try {
    const deleted = await StudentFees.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStudentFeesSummary = async (req, res) => {
  const studentId = req.params.id;

  try {
    const studentFeeRecords = await StudentFees.findAll({
      where: { studentid: studentId }
    });

    let totalPaid = 0;
    let totalPending = 0;

    studentFeeRecords.forEach((record) => {
      const amount = parseFloat(record.amount) || 0;
      if (record.status === 'PAID') {
        totalPaid += amount;
      } else if (record.status === 'PENDING') {
        totalPending += amount;
      }
    })
    //const totalPaid = studentFeeRecords.reduce((sum, sf) => sum + parseFloat(sf.amount), 0);

    res.status(200).json({
      studentid: studentId,
      total_fees: studentFeeRecords,
      pending_fees: totalPending,
      paid_fees: totalPaid
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.getNextPaymentDate = async (req, res) => {
  const { id } = req.params;
  const nextPayment = await StudentFees.findOne({
    where: { studentid: id, status :'PAID' },
    order: [['createdAt', 'DESC']],
  });
  res.json({ nextPaymentDate: nextPayment ? nextPayment.createdAt : null });
};