const { StaffLeaveRequest, Staff, User } = require('../models');

exports.create = async (req, res) => {
  try {
    const staff = await Staff.findOne({ where: { user_id: req.user.user_id } });
    if (!staff) return res.status(403).json({ message: 'Not authorized as staff' });

    const leaveRequest = await StaffLeaveRequest.create({
      staff_id: staff.id,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      reason: req.body.reason,
      status: 'PENDING'
    });
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Leave Request Error:', error);
    res.status(500).json({ message: 'Failed to create leave request' });
  }
};

exports.findAll = async (req, res) => {
  try {
    const userRole = req.user.role; // Assuming role is available in token payload or fetched middleware
    let whereClause = {};

    if (userRole === 'STAFF') {
      const staff = await Staff.findOne({ where: { user_id: req.user.user_id } });
      if (staff) {
        whereClause.staff_id = staff.id;
      }
    }

    const leaveRequests = await StaffLeaveRequest.findAll({
      where: whereClause,
      include: [{
        model: Staff,
        as: 'staff',
        include: [{ model: User, as: 'user', attributes: ['firstname', 'lastname', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Leave Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    // Only ADMIN should approve/reject
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can approve leave' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const leaveRequest = await StaffLeaveRequest.findByPk(id);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });

    leaveRequest.status = status;
    await leaveRequest.save();

    res.json(leaveRequest);
  } catch (error) {
    console.error('Leave Update Error:', error);
    res.status(500).json({ message: 'Failed to update leave request' });
  }
};
