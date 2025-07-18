const { SubjectTutor, Tutor, Subject, Grade, StudentSubject, TutorPayment } = require('../models');
const { Op } = require('sequelize');


exports.createPayment = async (req, res) => {
  try {
    const { tutorid, month, year, totalpayment, received, receiveddate } = req.body;
    const payment = await TutorPayment.create({
      tutorid,
      month,
      year,
      totalpayment,
      received,
      receiveddate,
    });
    res.status(201).json(payment);
  } catch (err) {
    console.error('Create Payment Error:', err);
    res.status(500).json({ message: 'Failed to create payment record' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await TutorPayment.findAll({
      include: [{ model: Tutor, as: 'tutor' }],
      order: [['year', 'DESC'], ['month', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    console.error('Fetch Payments Error:', err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// exports.updatePaymentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const payment = await TutorPayment.findByPk(id);
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment record not found' });
//     }
//     payment.received = true;
//     payment.receiveddate = new Date();
//     await payment.save();
//     res.json(payment);
//   } catch (err) {
//     console.error('Update Payment Error:', err);
//     res.status(500).json({ message: 'Failed to update payment' });
//   }
// };

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await TutorPayment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }
    await payment.destroy();
    res.json({ message: 'Payment record deleted' });
  } catch (err) {
    console.error('Delete Payment Error:', err);
    res.status(500).json({ message: 'Failed to delete payment' });
  }
};

exports.calculateAndSaveTutorPayment = async (req, res) => {
  try {
    const { tutorid, month, year } = req.body;
    if (!tutorid || !month || !year) {
      return res.status(400).json({ message: 'tutorid, month, and year are required' });
    }

    // Fetch all subject assignments for the tutor
    const subjects = await SubjectTutor.findAll({
      where: { tutorid },
      attributes: ['id', 'fees']
    });

    let totalPayment = 0;

    for (const subject of subjects) {
      const studentCount = await StudentSubject.count({
        where: { subjecttutorid: subject.id }
      });

      totalPayment += studentCount * subject.fees;
    }

    // Check if payment record exists for this month/year
    let payment = await TutorPayment.findOne({
      where: {
        tutorid,
        month,
        year,
      },
    });

    if (payment) {
      payment.totalpayment = totalPayment;
      await payment.save();
    } else {
      payment = await TutorPayment.create({
        tutorid,
        month,
        year,
        totalpayment: totalPayment,
        received: false,
        receiveddate: null,
      });
    }

    res.json({ message: 'Tutor payment calculated and saved', payment });

  } catch (err) {
    console.error('Calculate & Save Tutor Payment Error:', err);
    res.status(500).json({ message: 'Failed to calculate and save tutor payment' });
  }
};


exports.getTutorPaymentSummary = async (req, res) => {
  try {
    const subjectTutors = await SubjectTutor.findAll({
      include: [
        { model: Tutor, as: 'tutor', attributes: ['id', 'firstname', 'lastname'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
        { model: Grade, as: 'grade', attributes: ['id', 'name'] },
      ],
    });
    const result = [];

    for (const st of subjectTutors) {
      const studentCount = await StudentSubject.count({
        where: { subjecttutorid: st.id, is_active: true },
      });
      result.push({
        tutorid: st.tutor.id,
        firstname: st.tutor.firstname,
        lastname: st.tutor.lastname,
        subject: st.subject.name,
        grade: st.grade.name,
        studentCount: studentCount,
        totalPayment: studentCount * st.fees,
      });
    }

    res.status(200).json({ data: result });
  } catch (err) {
    console.error('Fetch Tutor Payment Summary Error:', err);
    res.status(500).json({ message: 'Failed to fetch tutor payment summary' });
  }
};



exports.updatePayment = async (req, res) => {
  try {
    const { tutorid, amount, month, year, totalPayment } = req.body;

    if (!tutorid || month == null || year == null) {
      return res.status(400).json({ message: 'tutorid, month, and year are required' });
    }

    if (amount == null || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    let payment = await TutorPayment.findOne({
      where: { tutorid:tutorid, month:month, year:year },
    });

    if (!payment) {
      payment = await TutorPayment.create({
        tutorid,
        month,
        year,
        totalpayment: totalPayment,
        received: amount,
        receiveddate: amount > 0 ? new Date() : null,
      });
    } else {
      payment.received = amount;
      payment.receiveddate = amount > 0 ? new Date() : null;
      await payment.save();
    }

    res.status(200).json({ message: 'Payment updated successfully', payment });
  } catch (err) {
    console.error('Update Payment Status Error:', err);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};
