const BASE_URL = 'https://kufi-backend-new1.vercel.app/api';

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  let data;
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};
