import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {jwtDecode} from 'jwt-decode';
import './TimeTable.css';

const TIMETABLE_SLOTS = [
  { id: 1, timeslot: '7.00-9.00' },
  { id: 2, timeslot: '9.00-11.00' },
  { id: 3, timeslot: '11.00-13.00' },
  { id: 4, timeslot: '13.00-15.00' },
  { id: 5, timeslot: '15.00-17.00' },
  { id: 6, timeslot: '17.00-19.00' },
  { id: 7, timeslot: '19.00-21.00' },
];

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function TimeTable() {
  const [schedule, setSchedule] = useState({}); // { timeslot: { day: subject } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState();

  useEffect(() => {
    async function fetchTimetable() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('User not authenticated.');

        const decoded = jwtDecode(token);
        const studentId = decoded.user_id;
        var role;
        if (decoded.user_type === 'TUTOR') {
          role = 'tutor';
        } else {
          role = 'student';
        }

        const res = await api.get(`/timetable/${role}/${studentId}`);
        const rawData = res.data.data;
        const timetableMap = {};

        rawData.forEach(({ timeslot, day, subject }) => {
          const dayKey = day.toLowerCase();
          if (!timetableMap[timeslot]) timetableMap[timeslot] = {};
          timetableMap[timeslot][dayKey] = subject;
        });

        setSchedule(timetableMap);
      } catch (err) {
        setError(err.message || 'Failed to fetch timetable');
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  if (loading) {
    return <div className="timetable-container"><p>Loading timetable...</p></div>;
  }

  if (error) {
    return <div className="timetable-container"><p className="error">Error: {error}</p></div>;
  }

  return (
    <div className="timetable-container">
      <h2>📚 Weekly Time Table</h2>
      <div className="timetable-scroll">
        <table className="timetable-table" role="grid" aria-label="Weekly timetable">
          <thead>
            <tr>
              <th scope="col">Time</th>
              {DAYS_OF_WEEK.map(day => (
                <th scope="col" key={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE_SLOTS.map(({ id, timeslot }) => (
              <tr key={id}>
                <th scope="row">{timeslot}</th>
                {DAYS_OF_WEEK.map(day => (
                  <td key={day} aria-label={`${day} ${timeslot}`}>
                    {schedule[timeslot]?.[day] || '-'}
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
  