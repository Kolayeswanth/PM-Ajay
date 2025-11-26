const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
