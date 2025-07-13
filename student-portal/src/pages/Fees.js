import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Fees.css';

function Fees() {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    api.get('/fees').then((res) => setFees(res.data));
  }, []);

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
  };

  return (
    <div className="fees-container">
      <h2>💸 Student Fee Status</h2>
      <p className="fees-note">⚠️ Pay monthly fees before the <strong>5th of each month</strong> to avoid penalty.</p>

      <div className="fees-table-wrapper">
        <table className="fees-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid Date</th>
            </tr>
          </thead>
          <tbody>
            {fees.length > 0 ? (
              fees.map((fee, i) => (
                <tr key={i}>
                  <td>{fee.subject}</td>
                  <td>{fee.month}</td>
                  <td>Rs. {fee.amount}</td>
                  <td>
                    <span className={`status-badge ${fee.status.toLowerCase().replace(' ', '-')}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td>{formatDate(fee.paidDate)}</td>
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
    </div>
  );
}

export default Fees;
