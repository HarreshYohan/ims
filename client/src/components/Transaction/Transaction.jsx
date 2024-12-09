import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Transaction.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';

export const Transaction = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    transaction_type: '',
  });
  const [transactionTypes, setTransactionTypes] = useState([]);
  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [localToken, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/transaction/all?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.status === 200) {
          const { data, totalPages } = response.data;
          setData(data);
          setFilteredData(data); 
          setTotalPages(totalPages);

          const uniqueTransactionTypes = [...new Set(data.map(item => item.transaction_type))];
          setTransactionTypes(uniqueTransactionTypes);
        } else {
          setData([]);
          console.error('Failed to fetch data');
        }
      } catch (error) {
        setError('Error during data fetch');
        console.error('Error during data fetch:', error);
        localStorage.removeItem('authToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, navigate, localToken]);

  const applyFilters = useCallback(() => {
    const { transaction_type } = filters;
    const newFilteredData = data.filter(item =>
      (transaction_type ? item.transaction_type === transaction_type : true)
    );
    setFilteredData(newFilteredData);
    setTotalPages(Math.ceil(newFilteredData.length / itemsPerPage));
    setCurrentPage(1); 
  }, [filters, data, itemsPerPage]);

  const debouncedApplyFilters = useCallback(debounce(() => {
    applyFilters();
  }, 300), [applyFilters]);

  useEffect(() => {
    debouncedApplyFilters();
  }, [filters, debouncedApplyFilters]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleEdit = (id) => {
    console.log(`Edit transaction with ID: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete transaction with ID: ${id}`);
    // Implement your delete logic here
  };

  const handleDownload = async () => {
    try {
      // Construct query string from filters
      const query = new URLSearchParams(filters).toString();

      // Make API request to download filtered data
      const response = await api.get(`/api/transaction/download/all?${query}`, {
        headers: {
          Authorization: `Bearer ${localToken}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
    } catch (error) {
      console.error('Error downloading transactions:', error);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MM/dd/yyyy hh:mm a');
  };

  const Table = ({ data, currentPage, totalPages }) => (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Transaction Type
            <select
              name="transaction_type"
              value={filters.transaction_type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Types</option>
              {transactionTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </th>
          <th>Amount</th>
          <th>Description</th>
          <th>User ID</th>
          <th>Participant ID</th>
          <th>Created At</th>
          <th>Actions 
            <button className="download-all-btn" onClick={handleDownload}>Download</button>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.transaction_type}</td>
            <td>{item.amount}</td>
            <td>{item.description}</td>
            <td>{item.user_id}</td>
            <td>{item.participant_id}</td>
            <td>{formatDate(item.createdAt)}</td>
            <td>
              <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>
              <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan="8" className='pagination'>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button >
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <button
                key={pageNumber + 1}
                onClick={() => handlePageChange(pageNumber + 1)}
                className={currentPage === pageNumber + 1 ? 'active' : ''}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Transactions'} is_create={true} is_download={true}/>
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={filteredData} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
