const { where } = require('sequelize');
const { StudentFees, StudentSubject, SubjectTutor  } = require('../models');


exports.create = async (req, res) => {
  try {
    const studentFee = await StudentFees.create(req.body);
    res.status(201).json(studentFee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.findAll = async (req, res) => {
  try {
    const studentFees = await StudentFees.findAll();
    res.status(200).json(studentFees);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.findOne = async (req, res) => {
  try {
    const studentFee = await StudentFees.findAll({
      where:{studentid : req.params.id}
    });
    if (studentFee) {
      res.status(200).json(studentFee);
    } else {
      res.status(404).json({ error: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    const [updated] = await StudentFees.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedStudentFee = await StudentFees.findByPk(req.params.id);
      res.status(200).json(updatedStudentFee);
    } else {
      res.status(404).json({ error: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      res.status(404).json({ error: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      const amount = parseFloat(record.totalamount) || 0;
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
    res.status(400).json({ error: error.message });
  }
};

exports.getNextPaymentDate = async (req, res) => {
  const { id } = req.params;
  const nextPayment = await StudentFees.findOne({
    where: { studentid: id, status :'PAID' },
    order: [['createdAt', 'DESC']],
  });
  console.log(nextPayment)
  res.json({ nextPaymentDate: nextPayment ? nextPayment.createdAt : null });
};