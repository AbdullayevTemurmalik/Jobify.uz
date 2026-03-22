import axios from "axios";

const API_URL = "https://jobify-backend-production-6a97.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
});

// --- INTERCEPTORS ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- TALENT API ---
export const talentApi = {
  registerTalent: (formData) => {
    return api.post("/talent/register", formData);
  },
  sendVerifyCode: (email) => api.post("/talent/send-verify-code", { email }),
  checkVerifyCode: (email, code) =>
    api.post("/talent/check-verify-code", { email, code }),
  confirmVerifyEmail: (data) => api.post("/talent/confirm-verify-email", data),
  sendResetCode: (email) => api.post("/talent/send-reset-code", { email }),
  checkResetCode: (email, code) => {
    return api.post("/talent/check-reset-code", {
      email: email.trim(),
      code: String(code),
    });
  },
  confirmResetPassword: (email, code, newPassword) =>
    api.post("/talent/confirm-reset-password", { email, code, newPassword }),
  login: (data) => api.post("/talent/login", data),
  getAll: () => api.get("/talent"),
  getById: (id) => api.get(`/talent/${id}`),
  search: (query) => api.get(`/talent/search?query=${query}`),
  update: (id, formData) => api.put(`/talent/${id}`, formData),
  delete: (id) => api.delete(`/talent/${id}`),
};

export const companyApi = {
  registerCompany: (formData) =>
    api.post("/company/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  verifyCode: async (email, code) => {
    try {
      const response = await api.post("/company/check-verify-code", {
        email: email.trim().toLowerCase(),
        code: String(code).trim(),
      });
      return response.data;
    } catch (error) {
      console.error("Xatolik tafsiloti:", error.response);
      const msg = error.response?.data?.message || "Kod noto‘g‘ri";
      throw new Error(msg);
    }
  },

  resendCode: async (email) => {
    try {
      const response = await api.post("/company/resend-code", {
        email: email.trim().toLowerCase(),
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  },

  login: (data) => api.post("/company/login", data),
  // getProfile: () => api.get("/company/profile"),
  getAll: () => api.get("/company"),
  getById: (id) => api.get(`/company/${id}`),
  search: (query) => api.get(`/company/search?query=${query}`),
  update: (id, data) => api.put(`/company/${id}`, data),
  delete: (id) => api.delete(`/company/${id}`),
};

// --- JOBS API ---
export const jobApi = {
  create: (data) => api.post("/jobs", data),
  getAll: () => api.get("/jobs"),
  getById: (id) => api.get(`/jobs/${id}`),
  getByCompany: (companyId) => api.get(`/jobs/company/${companyId}`),
  search: (query) => api.get("/jobs/search", { params: { query } }),
  getMatchingJobs: (companyId = "") =>
    api.get(`/jobs/my-skills${companyId ? `?company_id=${companyId}` : ""}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// --- APPLICATIONS API ---
export const applicationApi = {
  apply: (formData) =>
    api.post("/job-applications", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => api.get("/job-applications"),
  getById: (id) => api.get(`/job-applications/${id}`),
  updateStatus: (id, data) => api.put(`/job-applications/${id}`, data),
  delete: (id) => api.delete(`/job-applications/${id}`),
};

// --- CONTACT API ---
export const contactApi = {
  sendMessage: (data) => api.post("/contacts", data),
  getAll: () => api.get("/contacts"),
  getById: (id) => api.get(`/contacts/${id}`),
};

// --- KONSTANTALAR ---
export const COUNTRIES = [
  "Uzbekistan",
  "USA",
  "Turkey",
  "Kazakhstan",
  "Russia",
];
export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Other",
];
export const UZBEK_REGIONS = [
  "Andijon viloyati",
  "Buxoro viloyati",
  "Farg'ona viloyati",
  "Jizzax viloyati",
  "Xorazm viloyati",
  "Namangan viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Toshkent viloyati",
  "Toshkent shahri",
];

// --- RESET PASSWORD FUNKSIYALARI ---

export const sendResetCode = async (email) => {
  const response = await api.post("/company/send-reset-code", {
    email: email.trim().toLowerCase()
  });
  return response.data;
};

export const checkResetCode = async (email, code) => {
  const response = await api.post("/company/check-reset-code", {
    email: email.trim().toLowerCase(),
    code: String(code).trim() // Kodni string ko'rinishida yuborish
  });
  return response.data;
};

export const confirmResetPassword = async (email, code, newPassword) => {
  // 500 xatosini oldini olish uchun backend kutayotgan aniq format:
  return await api.post("/company/confirm-reset-password", {
    email: email.trim(),
    code: String(code).trim(), // Ba'zi backendlar string kutadi
    newPassword: newPassword,   // Agar new_password bo'lmasa, buni ishlating
    // new_password: newPassword // Agar backendda snake_case bo'lsa, buni oching
  });
};

export default api;
