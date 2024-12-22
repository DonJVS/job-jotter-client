import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Your API service for back-end communication

function OAuth2Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleOAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const response = await api.get(`/google/auth/callback?code=${code}`);
          const { access_token, refresh_token } = response.data;

          // Save tokens to localStorage
          localStorage.setItem('google_access_token', access_token);
          localStorage.setItem('google_refresh_token', refresh_token);

          // Redirect to a relevant page
          navigate('/');
        } catch (err) {
          console.error('Error handling OAuth2 callback:', err);
          navigate('/login'); // Redirect back to login on error
        }
      }
    }

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="text-center">
      <p>Processing Google OAuth2 callback...</p>
    </div>
  );
}

export default OAuth2Callback;
