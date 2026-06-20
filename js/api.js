/**
 * js/api.js — API 封装
 */
const API = {
  get(url) { return fetch(url).then(r => r.ok ? r.json() : Promise.reject('GET ' + url + ': ' + r.status)); },

  post(url, data) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(r => r.ok ? r.json() : Promise.reject('POST ' + url + ': ' + r.status));
  },

  put(url, data) {
    return fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(r => r.ok ? r.json() : Promise.reject('PUT ' + url + ': ' + r.status));
  },

  del(url) {
    return fetch(url, { method: 'DELETE' })
      .then(r => r.ok ? r.json() : Promise.reject('DELETE ' + url + ': ' + r.status));
  },
};
