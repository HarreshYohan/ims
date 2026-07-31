const { ClassScheduleRequest, SubjectTutor, Classroom, Subject, Grade, Tutor, Timetable } = require('../models');
const { TimetableData } = require('../helpers/helpers');

// Fetch pending requests for a specific tutor
exports.findForTutor = async (req, res) => {
  try {
    const tutorId = req.user.user_id; // user_id in token, not tutor id directly
    const tutor = await Tutor.findOne({ where: { user_id: tutorId } });
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    const requests = await ClassScheduleRequest.findAll({
      include: [
        {
          model: SubjectTutor,
          as: 'subjectTutor',
          where: { tutorid: tutor.id },
          include: [{ model: Subject, as: 'subject' }, { model: Grade, as: 'grade' }]
        },
        { model: Classroom, as: 'classroom' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching schedule requests' });
  }
};

// Fetch all requests for Admin
exports.findAllAdmin = async (req, res) => {
  try {
    const requests = await ClassScheduleRequest.findAll({
      include: [
        {
          model: SubjectTutor,
          as: 'subjectTutor',
          include: [{ model: Subject, as: 'subject' }, { model: Grade, as: 'grade' }, { model: Tutor, as: 'tutor' }]
        },
        { model: Classroom, as: 'classroom' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching schedule requests' });
  }
};

// Tutor approves or rejects/proposes new
exports.tutorAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, preferred_day, preferred_timeslotid } = req.body;

    const request = await ClassScheduleRequest.findByPk(id, { include: ['subjectTutor'] });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'APPROVE') {
      request.status = 'APPROVED';
      await request.save();

      // Actually update the timetable
      await applyToTimetable(request.classroomid, request.timeslotid, request.day_of_week, request.subject_tutor_id);
      
      return res.json({ message: 'Approved successfully', data: request });
    } else if (action === 'REJECT') {
      request.status = 'PENDING_ADMIN';
      request.tutor_preferred_day = preferred_day;
      request.tutor_preferred_timeslotid = preferred_timeslotid;
      await request.save();
      return res.json({ message: 'Proposed new time sent to Admin', data: request });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing action' });
  }
};

// Admin approves tutor's proposed time
exports.adminAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const request = await ClassScheduleRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'APPROVE') {
      request.status = 'APPROVED';
      await request.save();

      // Apply the proposed new time to timetable
      await applyToTimetable(request.classroomid, request.tutor_preferred_timeslotid, request.tutor_preferred_day, request.subject_tutor_id);
      
      return res.json({ message: 'Approved tutor proposed time successfully', data: request });
    } else if (action === 'REJECT') {
      request.status = 'REJECTED_BY_ADMIN';
      await request.save();
      return res.json({ message: 'Rejected proposed time', data: request });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing action' });
  }
};

async function applyToTimetable(classroomid, timeslotid, day, subject_tutor_id) {
  const timeslot = TimetableData.find(slot => slot.id == timeslotid)?.timeslot;
  let timetable = await Timetable.findOne({ where: { classroomid, timeslotid } });
  
  if (timetable) {
    timetable[day] = subject_tutor_id;
    await timetable.save();
  } else {
    await Timetable.create({
      timeslotid,
      timeslot,
      classroomid,
      [day]: subject_tutor_id
    });
  }
}
