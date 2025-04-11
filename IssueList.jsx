"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { Search, Filter, Plus, AlertCircle, Clock, Check, X } from 'lucide-react'

const IssueList = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get('/issues/');
        setIssues(response.data);
        setFilteredIssues(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setError('Failed to load issues. Please try again.');
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = issues;
    
    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(issue => issue.status === filters.status);
    }
    
    // Filter by priority
    if (filters.priority !== 'all') {
      result = result.filter(issue => issue.priority === filters.priority);
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm) || 
        issue.description.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredIssues(result);
  }, [filters, issues]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'resolved': return <Check size={16} />;
      case 'closed': return <X size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="loading-container">Loading issues...</div>;
  }

  return (
    <div className="issue-list-container">
      <div className="issue-list-header">
        <h1>Issues</h1>
        {user.role === 'student' && (
          <Link to="/issues/create" className="btn btn-primary">
            <Plus size={16} /> Create New Issue
          </Link>
        )}
      </div>
      
      <div className="filters-container">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search issues..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="status-filter">
              <Filter size={16} /> Status:
            </label>
            <select
              id="status-filter"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="priority-filter">Priority:</label>
            <select
              id="priority-filter"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      {filteredIssues.length === 0 ? (
        <div className="empty-state">
          <p>No issues found matching your criteria.</p>
          {user.role === 'student' && (
            <Link to="/issues/create" className="btn btn-primary">
              Create New Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="issue-list">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="issue-card">
              <div className="issue-header">
                <h3>
                  <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                </h3>
                <span className={`status-badge ${getStatusClass(issue.status)}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <p className="issue-description">{issue.description.substring(0, 100)}...</p>
              <div className="issue-footer">
                <span>Created by: {issue.created_by_name}</span>
                <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                <span>Priority: {issue.priority}</span>
                <span>Assigned to: {issue.assigned_to_name || 'Unassigned'}</span>
              </div>
              <div className="issue-actions">
                <Link to={`/issues/${issue.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueList;