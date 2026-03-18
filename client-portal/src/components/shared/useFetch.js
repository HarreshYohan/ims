import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * Universal data fetching hook with integrated pagination, filtering, 
 * loading states, and automatic 401 token expiry handling.
 * 
 * Supports varied API responses:
 * 1. { data: [], total: 100, limit: 10 }
 * 2. { data: [], totalPages: 5 }
 * 3. [ ... ] (Flat array)
 */
export const useFetch = (endpoint, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(initialParams.limit || 20);

  const navigate = useNavigate();

  const initialParamsString = JSON.stringify(initialParams);
  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoint, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          ...JSON.parse(initialParamsString),
          ...params
        }
      });
      
      const resData = response.data;
      
      // Flexible handling of different API response formats
      if (resData && resData.data && Array.isArray(resData.data)) {
        setData(resData.data);
        if (resData.total !== undefined) {
          setTotalPages(Math.ceil(resData.total / (resData.limit || itemsPerPage)));
        } else if (resData.totalPages !== undefined) {
          setTotalPages(resData.totalPages);
        } else {
          setTotalPages(1);
        }
      } else if (Array.isArray(resData)) {
        // Flat array fallback
        setData(resData);
        setTotalPages(1);
      } else if (resData && typeof resData === 'object') {
        // Handle cases where some controllers might return the object directly
        // but it has a different structure. We err on the side of empty array.
        setData([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error(`Fetch error at ${endpoint}:`, err);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentPage, itemsPerPage, navigate, initialParamsString]);

  // Initial Fetch on Mount or Parameter Change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export a robust pagination object that satisfies different component needs
  const pagination = {
    // Standard names (for GenericTable)
    current: currentPage,
    total: totalPages,
    onPageChange: setCurrentPage,
    
    // Legacy/Alternative names (for internal table implementations)
    currentPage: currentPage,
    totalPages: totalPages,
    handlePageChange: setCurrentPage
  };

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchData
  };
};
