import { useState, useCallback, useEffect, useRef } from 'react';
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

  // Keep all mutable values in refs so the fetch function never goes stale
  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;
  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;
  const paramsRef = useRef(initialParams);
  paramsRef.current = initialParams;

  // Core fetch function — reads everything from refs so it never goes stale
  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpointRef.current, {
        params: {
          page: pageRef.current,
          limit: itemsPerPage,
          ...paramsRef.current,
          _t: new Date().getTime() // Aggressive cache busting
        }
      });
      
      const resData = response.data;
      
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
        setData(resData);
        setTotalPages(1);
      } else if (resData && typeof resData === 'object') {
        setData([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error(`Fetch error at ${endpointRef.current}:`, err);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage, navigate]);

  // Auto-fetch on mount AND when endpoint, page, or params change
  const initialParamsString = JSON.stringify(initialParams);
  useEffect(() => {
    doFetch();
  }, [doFetch, endpoint, currentPage, initialParamsString]);

  // Export a robust pagination object that satisfies different component needs
  const pagination = {
    current: currentPage,
    total: totalPages,
    onPageChange: setCurrentPage,
    currentPage: currentPage,
    totalPages: totalPages,
    handlePageChange: setCurrentPage
  };

  return {
    data,
    loading,
    error,
    pagination,
    refetch: doFetch   // Directly call the stable fetch function
  };
};
