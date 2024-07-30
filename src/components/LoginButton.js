// React component for login button
import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/login'; // Redirect to your server's /login route
  };
  

  return (
    <button className=" font-sans font-semibold rounded-full bg-blue-600 w-40 h-10 text-white mt-96" onClick={handleLogin}>Login with Spotify</button>
  );
};

export default LoginButton;
