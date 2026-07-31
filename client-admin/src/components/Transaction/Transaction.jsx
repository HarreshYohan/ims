import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { jwtDecode } from 'jwt-decode';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { format } from 'date-fns';
import { PlusCircle, Wallet, ArrowUpCircle, ArrowDownCircle, Download, Search } from 'lucide-react';

export const Transaction = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const token = localStorage.getItem('token');
  let currentUserId = '';
  if (token) {
    try { currentUserId = jwtDecode(token).user_id; } catch(e) {}
  }

  const [newTransaction, setNewTransaction] = useState({
    transaction_type: '',
    amount: '',
    description: '',
    user_id: '',
    participant_id: currentUserId,
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const typeFilter = selectedType ? `&transaction_type=${selectedType}` : '';
      const searchFilter = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const response = await api.get(`/transactions/all?page=${page}&limit=${pagination.limit}${typeFilter}${searchFilter}&_t=${new Date().getTime()}`);
      setData(response.data.data);
      setPagination(prev => ({ ...prev, total: response.data.total, page }));
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [selectedType, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async () => {
    try {
      const query = selectedType ? `?transaction_type=${selectedType}` : '';
      const response = await api.get(`/transactions/download/all${query}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleCreateSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/transactions', newTransaction);
      setShowCreateModal(false);
      setNewTransaction({ 
        transaction_type: '', 
        amount: '', 
        description: '', 
        user_id: '', 
        participant_id: currentUserId,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      toast.success('Transaction saved successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { 
      label: 'Type', 
      accessor: 'transaction_type', 
      render: (val) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${
          val === 'INCOME' || val === 'FEES' ? 'bg-secondary/10 text-secondary' : 'bg-danger/10 text-danger'
        }`}>
          {val === 'INCOME' || val === 'FEES' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
          {val}
        </span>
      )
    },
    { label: 'Amount', accessor: 'amount', render: (val) => <span className="font-bold text-slate-200">LKR {Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> },
    { label: 'Description', accessor: 'description' },
    { label: 'Participant', accessor: 'participant_id', render: (val) => <span className="text-textMuted text-xs">{val || 'N/A'}</span> },
    { label: 'Date', accessor: 'createdAt', render: (val) => <span className="text-textMuted">{format(new Date(val), 'MMM dd, yyyy')}</span> },
  ];

  const TableActions = (
    <div className="flex items-center gap-3">
       <button onClick={handleDownload} className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-textMuted hover:text-slate-200 transition-all">
          <Download size={20} />
       </button>
       <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <PlusCircle size={18} /> New Transaction
       </button>
    </div>
  );

  return (
    <Layout title="Transactions">
        
        {/* Quick Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm mb-6">
           <div className="flex flex-1 items-center gap-4 w-full">
              <div className="w-full md:w-64">
                <FormInput 
                  placeholder="Search description..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!mb-0"
                  icon={<Search size={18} className="text-textMuted" />}
                />
              </div>
              <div className="w-full md:w-48">
                <FormSelect 
                  name="type" 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  options={[
                    { label: 'All Types', value: '' },
                    { label: 'Income', value: 'INCOME' },
                    { label: 'Fees', value: 'FEES' },
                    { label: 'Salary', value: 'SALARY' },
                    { label: 'Expense', value: 'EXPENSE' }
                  ]}
                  className="!mb-0"
                />
              </div>
           </div>
        </div>

        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl">{error}</div>}

        <Card title="Financial Logs" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading}
            pagination={{
              total: pagination.total,
              page: pagination.page,
              limit: pagination.limit,
              onPageChange: (p) => fetchData(p)
            }}
          />
        </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Transaction">
        <form onSubmit={handleCreateSave}>
          <div className="space-y-4">
            <FormSelect 
              label="Transaction Type" 
              name="transaction_type" 
              value={newTransaction.transaction_type} 
              onChange={(e) => setNewTransaction({...newTransaction, transaction_type: e.target.value})}
              required
              options={[
                { label: 'Select Type', value: '' },
                { label: 'Salary', value: 'SALARY' },
                { label: 'Fees', value: 'FEES' },
                { label: 'Income', value: 'INCOME' },
                { label: 'Expense', value: 'EXPENSE' },
                { label: 'Other', value: 'OTHER' }
              ]}
            />
            <FormInput label="Amount" name="amount" type="number" step="0.01" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} required min={1} />
            <FormInput label="Description" name="description" value={newTransaction.description} onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
               <FormInput label="User ID" name="user_id" value={newTransaction.user_id} onChange={(e) => setNewTransaction({...newTransaction, user_id: e.target.value})} />
               <FormInput label="Participant ID" name="participant_id" value={newTransaction.participant_id} onChange={(e) => setNewTransaction({...newTransaction, participant_id: e.target.value})} disabled={true} />
            </div>
            <FormInput 
              label="Transaction Date" 
              name="date" 
              type="date" 
              value={newTransaction.date} 
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})} 
              required 
            />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Processing...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
