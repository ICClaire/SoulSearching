// React component for login button
import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/login'; // Redirect to your server's /login route
  };
  

  return (
    <button onClick={handleLogin}>Login with Spotify</button>
  );
};

export default LoginButton;
