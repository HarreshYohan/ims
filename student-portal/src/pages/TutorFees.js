import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import './Fees.css';

function TutorFees() {
  const [summary, setSummary] = useState(null);
  const [paymentRecords, setPaymentRecords] = useState([]);

  useEffect(() => {
    const fetchTutorPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const tutorId = decoded.user_id;

        // Get summary of subject-wise payment breakdown
        const summaryRes = await api.get('/tutor-payment/summary');
        const summaryData = summaryRes.data.data.filter((item) => item.tutorid === tutorId);

        // Get payment records (monthly received records)
        const paymentsRes = await api.get('/tutor-payment');
        const tutorPayments = paymentsRes.data.filter((p) => p.tutorid === tutorId);

        // Calculate totals
        const totalPayment = summaryData.reduce((sum, item) => sum + item.totalPayment, 0);
        const totalReceived = tutorPayments.reduce((sum, item) => sum + Number(item.received || 0), 0);
        const pending = totalPayment - totalReceived;

        setSummary({
          totalPayment,
          totalReceived,
          pending,
        });

        setPaymentRecords(tutorPayments);
      } catch (error) {
        console.error('Error fetching tutor payments:', error);
      }
    };

    fetchTutorPayments();
  }, []);

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
  };

  return (
    <div className="fees-container">
      <h2>📊 Tutor Payment Summary</h2>

      {summary ? (
        <>
          <div className="fees-summary-cards">
            <div className="fee-card total">
              <h4>Total Earnings</h4>
              <p>Rs. {summary.totalPayment.toFixed(2)}</p>
            </div>
            <div className="fee-card paid">
              <h4>Total Received</h4>
              <p>Rs. {summary.totalReceived.toFixed(2)}</p>
            </div>
            <div className="fee-card pending">
              <h4>Pending</h4>
              <p>Rs. {summary.pending.toFixed(2)}</p>
            </div>
          </div>

          <div className="fees-table-wrapper">
            <table className="fees-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Total Payment</th>
                  <th>Received</th>
                  <th>Received Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.length > 0 ? (
                  paymentRecords.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.month}</td>
                      <td>{payment.year}</td>
                      <td>Rs. {payment.totalpayment}</td>
                      <td>Rs. {payment.received}</td>
                      <td>{formatDate(payment.receiveddate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Loading payment summary...</p>
      )}
    </div>
  );
}

export default TutorFees;
