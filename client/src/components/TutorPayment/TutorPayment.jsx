import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { jwtDecode } from 'jwt-decode';
import './TutorPayment.css';

export const TutorPayment = () => {
  const [groupedData, setGroupedData] = useState({});
  const [paymentsData, setPaymentsData] = useState([]); // store payment records for tutors by month/year
  const [loading, setLoading] = useState(true);

  const [editingTutorId, setEditingTutorId] = useState(null);
  const [paymentType, setPaymentType] = useState('PAID');
  const [amount, setAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      jwtDecode(token);
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch summary breakdown (subjects + students + fees)
      const summaryResponse = await api.get('/api/tutor-payment/summary');
      if (summaryResponse.status === 200) {
        const rawData = summaryResponse.data.data;
        const grouped = {};
        rawData.forEach((item) => {
          const tutorKey = `${item.tutorid}-${item.firstname}-${item.lastname}`;
          if (!grouped[tutorKey]) {
            grouped[tutorKey] = {
              tutorid: item.tutorid,
              firstname: item.firstname,
              lastname: item.lastname,
              totalPayment: 0,
              breakdown: [],
            };
          }
          grouped[tutorKey].breakdown.push({
            subject: item.subject,
            grade: item.grade,
            studentCount: item.studentCount,
            payment: item.totalPayment,
          });
          grouped[tutorKey].totalPayment += item.totalPayment;
        });
        setGroupedData(grouped);
      }

      // Fetch all tutor payment records (received amounts) — you need an endpoint for this
      const paymentsResponse = await api.get('/api/tutor-payment'); // Make sure this route exists and returns TutorPayment data with tutorid, month, year, received, totalpayment
      if (paymentsResponse.status === 200) {
        setPaymentsData(paymentsResponse.data); // Array of payment records
      }
    } catch (err) {
      console.error('Error fetching tutor payment summary or payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get total received for a tutor (all months combined)
  const getTotalReceived = (tutorid) => {
    return paymentsData
      .filter((p) => p.tutorid === tutorid)
      .reduce((sum, p) => sum + Number(p.received || 0), 0);
  };

  // Helper to get payment record for current editing tutor/month/year
  const getCurrentPaymentRecord = (tutorid, month, year) => {
    return paymentsData.find(
      (p) => p.tutorid === tutorid && p.month === month && p.year === year
    );
  };

  const startEditing = (tutorId) => {
    setEditingTutorId(tutorId);
    setPaymentType('PAID');
    setAmount('');
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());

    const paymentRecord = getCurrentPaymentRecord(tutorId, new Date().getMonth() + 1, new Date().getFullYear());
    if (paymentRecord) {
      setAmount(paymentRecord.received ? paymentRecord.received.toString() : '');
      if (paymentRecord.received === 0 || paymentRecord.received === null) {
        setPaymentType('PENDING');
      } else if (paymentRecord.received < groupedData && groupedData[`${tutorId}-${paymentRecord.tutor.firstname}-${paymentRecord.tutor.lastname}`]?.totalPayment) {
        const total = groupedData[`${tutorId}-${paymentRecord.tutor.firstname}-${paymentRecord.tutor.lastname}`]?.totalPayment || 0;
        if (paymentRecord.received < total) {
          setPaymentType('PARTIAL');
        } else {
          setPaymentType('PAID');
        }
      } else {
        setPaymentType('PAID');
      }
    } else {
      setAmount('');
      setPaymentType('PAID');
    }
  };

  const cancelEditing = () => {
    setEditingTutorId(null);
    setAmount('');
    setPaymentType('PAID');
  };

  const savePayment = async () => {
    if (paymentType !== 'PENDING' && (amount === '' || isNaN(amount))) {
      alert('Please enter a valid amount');
      return;
    }

    // Get totalPayment for the tutor currently editing
    const tutorKey = Object.keys(groupedData).find(
      (key) => groupedData[key].tutorid === editingTutorId
    );
    const totalPayment = tutorKey ? groupedData[tutorKey].totalPayment : 0;

    try {
      await api.post('/api/tutor-payment/update-status', {
        tutorid: editingTutorId,
        paymentType,
        amount: paymentType === 'PENDING' ? 0 : Number(amount),
        totalPayment,
        month: selectedMonth,
        year: selectedYear,
      });
      alert('Payment status updated');
      cancelEditing();
      fetchData();
    } catch (err) {
      console.error('Payment update failed:', err);
      alert('Failed to update payment');
    }
  };

  // Prepare years options: current year and two previous years
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Month options 1-12
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  return (
    <div>
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Tutor Payment Summary" is_create={false} />

      <div className="main">
        {loading ? (
          <p>Loading...</p>
        ) : Object.keys(groupedData).length === 0 ? (
          <p>No records found.</p>
        ) : (
          Object.values(groupedData).map((tutor, index) => {
            const totalReceived = getTotalReceived(tutor.tutorid);
            const pending = tutor.totalPayment - totalReceived;

            return (
              <div key={index} className="tutor-summary">
                <h3>
                  👨‍🏫 {tutor.firstname} {tutor.lastname} | {tutor.tutorid}
                </h3>
                <p>
                  <strong>Total Payment:</strong> {tutor.totalPayment.toFixed(2)}
                </p>
                <p>
                  <strong>Total Received:</strong> {totalReceived.toFixed(2)}
                </p>
                <p>
                  <strong>Pending:</strong> {pending.toFixed(2)}
                </p>

                {editingTutorId === tutor.tutorid ? (
                  <div className="payment-edit">
                    {/* Month select */}
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    {/* Year select */}
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>

                    {/* Payment type */}
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                    >
                      <option value="PAID">Paid in Full</option>
                      <option value="PARTIAL">Partial Paid</option>
                      <option value="PENDING">Pending</option>
                    </select>

                    {/* Amount input if not pending */}
                    {paymentType !== 'PENDING' && (
                      <input
                        type="number"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    )}

                    <button onClick={savePayment}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => startEditing(tutor.tutorid)}>Update Payment</button>
                )}

                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Grade</th>
                      <th>Student Count</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutor.breakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.subject}</td>
                        <td>{item.grade}</td>
                        <td>{item.studentCount}</td>
                        <td>{item.payment.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <hr />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
