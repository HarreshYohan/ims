import React, { useState } from 'react';
import './TutorPayment.css'; 

export const PaymentModal = ({ tutorId, onClose, onSave }) => {
  const [paymentType, setPaymentType] = useState('PAID'); // PAID | PARTIAL | PENDING
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (paymentType !== 'PENDING' && (!amount || isNaN(amount))) {
      alert('Enter valid amount');
      return;
    }
    onSave({ tutorId, paymentType, amount });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Update Payment for Tutor ID: {tutorId}</h3>

        <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <option value="PAID">Paid in Full</option>
          <option value="PARTIAL">Partial Paid</option>
          <option value="PENDING">Pending</option>
        </select>

        {paymentType !== 'PENDING' && (
          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
