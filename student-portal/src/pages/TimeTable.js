import React from 'react';
import './TimeTable.css';

function TimeTable() {
  // Mock time slots & schedule
  const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Mock schedule: time → day → subject
  const schedule = {
    '8:00 AM': {
      Monday: 'Math',
      Tuesday: 'English',
      Wednesday: 'Science',
      Thursday: '',
      Friday: 'History',
    },
    '9:00 AM': {
      Monday: '',
      Tuesday: 'Math',
      Wednesday: 'English',
      Thursday: 'ICT',
      Friday: '',
    },
    '10:00 AM': {
      Monday: 'Science',
      Tuesday: '',
      Wednesday: 'History',
      Thursday: 'English',
      Friday: 'Geography',
    },
    '11:00 AM': {
      Monday: 'Art',
      Tuesday: 'PE',
      Wednesday: '',
      Thursday: 'Math',
      Friday: '',
    },
    '1:00 PM': {
      Monday: 'ICT',
      Tuesday: '',
      Wednesday: 'Math',
      Thursday: 'Science',
      Friday: 'English',
    },
    '2:00 PM': {
      Monday: '',
      Tuesday: 'History',
      Wednesday: 'ICT',
      Thursday: '',
      Friday: '',
    },
  };

  return (
    <div className="timetable-container">
      <h2>📚 Weekly Time Table</h2>
      <div className="timetable-scroll">
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Time</th>
              {days.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td>{time}</td>
                {days.map((day) => (
                  <td key={day}>
                    {schedule[time][day] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TimeTable;
