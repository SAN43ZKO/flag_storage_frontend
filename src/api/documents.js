const BASE = "/api/documents";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers:
      options.body instanceof FormData
        ? {} // FormData сама ставит правильный Content-Type
        : { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let errMsg = response.statusText;
    try {
      const err = await response.json();
      errMsg = err.error || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const isDownload = response.headers
    .get("content-disposition")
    ?.includes("attachment");
  if (
    isDownload ||
    contentType.includes("application/pdf") ||
    contentType.includes("application/msword") ||
    contentType.includes("application/vnd.openxmlformats-officedocument")
  ) {
    return response.blob();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Response is not JSON:", text);
    return null;
  }
}

export const documentsApi = {
  list: (search = "") => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`${BASE}${params}`);
  },
  upload: (formData) =>
    request(`${BASE}/upload`, { method: "POST", body: formData }),
  download: (id) => request(`${BASE}/${id}/download`),
  preview: (id) => request(`${BASE}/${id}/preview`),
  getEditorConfig: (id) => request(`${BASE}/${id}/edit`),
  delete: (id) => request(`${BASE}/${id}`, { method: "DELETE" }),
};
