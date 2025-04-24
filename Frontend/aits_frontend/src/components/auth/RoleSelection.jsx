// src/components/auth/RoleSelection.js
import React from 'react';
import { Link } from 'react-router-dom';

const RoleSelection = () => {
  return (
    <div className="container">
      <div className="card mt-8 mx-auto" style={{ maxWidth: '500px' }}> 
        <div className="card-header">
          <h2 className="text-center">Choose Your Role</h2>
        </div>
        <div className="card-body"> 
          <div className="grid grid-cols-1 gap-4">
            <Link to="/register/student" className="btn btn-primary p-4 text-center"> 
              Register as Student
            </Link>
            <Link to="/register/lecturer" className="btn btn-primary p-4 text-center">
              Register as Lecturer 
            </Link>
            <Link to="/register/registrar" className="btn btn-primary p-4 text-center">
              Register as Academic Registrar 
            </Link>
          </div>
        </div>
        <div className="card-footer text-center">
          Already have an account? <Link to="/login">Login</Link>
        </div> 
      </div>
    </div>
  );
};

export default RoleSelection;