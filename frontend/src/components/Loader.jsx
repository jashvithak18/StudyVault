import React from 'react';
const Loader = ({ message = 'Loading StudyVault...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
};

export default Loader;
