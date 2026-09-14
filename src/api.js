const BASE = "/products";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(err.error || "Request failed");
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  list: (search = "", category = "", sort = "") => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return request(`${BASE}${qs ? '?' + qs : ''}`);
  },
  get: (id) => request(`${BASE}/${id}`),
  create: (data) =>
    request(BASE, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`${BASE}/${id}`, { method: "DELETE" }),
  uploadImage: (id, formData) =>
    fetch(`${BASE}/${id}/image`, { method: "POST", body: formData }).then(
      (res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      },
    ),
};
