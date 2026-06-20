/**
 * js/api.js — API 请求封装（带暗号认证）
 */
const API = {
  _token: null,

  setToken(token) {
    this._token = token;
  },

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  },

  async get(url) {
    const res = await fetch(url, { headers: this._headers() });
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  },

  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
    return res.json();
  },

  async put(url, data) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: this._headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
    return res.json();
  },

  async del(url) {
    const res = await fetch(url, { method: 'DELETE', headers: this._headers() });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
    return res.json();
  },
};
