import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import './Fees.css';

function Fees() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const studentId = decoded.user_id;

        const res = await api.get(`/student-fees/summary/${studentId}`);
        setSummary(res.data);
      } catch (error) {
        console.error('Error fetching fees summary:', error);
      }
    };

    fetchFees();
  }, []);

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
  };

  return (
    <div className="fees-container">
      <h2>💸 Student Fee Summary</h2>
      <p className="fees-note">⚠️ Pay monthly fees before the <strong>5th of each month</strong> to avoid penalty.</p>

      {summary ? (
        <>
          <div className="fees-summary-cards">
            <div className="fee-card total">
              <h4>Total Fees</h4>
              <p>Rs. {summary.paid_fees + summary.pending_fees}</p>
            </div>
            <div className="fee-card paid">
              <h4>Total Paid</h4>
              <p>Rs. {summary.paid_fees}</p>
            </div>
            <div className="fee-card pending">
              <h4>Pending Fees</h4>
              <p>Rs. {summary.pending_fees}</p>
            </div>
          </div>

          <div className="fees-table-wrapper">
            <table className="fees-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {summary.total_fees.length > 0 ? (
                  summary.total_fees.map((fee) => (
                    <tr key={fee.id}>
                      <td>{fee.month}</td>
                      <td>{fee.year}</td>
                      <td>Rs. {fee.totalamount}</td>
                      <td>
                        <span className={`status-badge ${fee.status.toLowerCase()}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td>{formatDate(fee.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No fee records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Loading summary...</p>
      )}
    </div>
  );
}

export default Fees;
