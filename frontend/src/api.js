const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleUnauthorized = (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const api = {
  async get(url) {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      handleUnauthorized(res);
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '요청 처리에 실패했습니다.');
    }
    return res.json();
  },
  async post(url, body) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      handleUnauthorized(res);
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '요청 처리에 실패했습니다.');
    }
    return res.json();
  },
  async patch(url, body) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      handleUnauthorized(res);
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '요청 처리에 실패했습니다.');
    }
    return res.json();
  },
  async delete(url) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      handleUnauthorized(res);
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '요청 처리에 실패했습니다.');
    }
    return res.json();
  }
};
