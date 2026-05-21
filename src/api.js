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
  list: (search = "") => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`${BASE}${params}`);
  },
  get: (id) => request(`${BASE}/${id}`),
  create: (data) =>
    request(BASE, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`${BASE}/${id}`, { method: "DELETE" }),
};
