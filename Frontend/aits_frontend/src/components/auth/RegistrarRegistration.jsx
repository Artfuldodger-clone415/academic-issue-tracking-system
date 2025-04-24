import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegistrarRegistration = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({ 
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '', 
    college: '',
    password: '',
    password2: '',
    role: 'academic_registrar'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/colleges/')
      .then(response => {
        setColleges(response.data);
      })
      .catch(error => {
        console.error('Error fetching colleges:', error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await axios.post('/api/register/', formData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred during registration.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card mt-8 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <h2 className="text-center">Academic Registrar Registration</h2>
        </div>
        <div className="card-body">
          {errors.general && (
            <div className="alert alert-error">{errors.general}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                {errors.first_name && <p className="text-red-600 text-sm">{errors.first_name}</p>}
              </div>
              <div>
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
                {errors.last_name && <p className="text-red-600 text-sm">{errors.last_name}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
            </div>

            <div className="mt-4">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            <div className="mt-4">
              <label htmlFor="phone_number">Contact Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
              {errors.phone_number && <p className="text-red-600 text-sm">{errors.phone_number}</p>}
            </div>

            <div className="mt-4">
              <label htmlFor="college">College</label>
              <select
                id="college"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
              >
                <option value="">Select College</option>
                {colleges.map((college, index) => (
                  <option key={index} value={college}>{college}</option>
                ))}
              </select>
              {errors.college && <p className="text-red-600 text-sm">{errors.college}</p>}
            </div>

            <div className="mt-4">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>

            <div className="mt-4">
              <label htmlFor="password2">Confirm Password</label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                minLength="8"
              />
              {errors.password2 && <p className="text-red-600 text-sm">{errors.password2}</p>}
            </div>

            <div className="mt-6">
              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrarRegistration;