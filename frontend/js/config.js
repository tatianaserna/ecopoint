const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://ecopoint-backend.vercel.app/api';

const AUTH_TOKEN_KEY = 'ecopoint_token';
