import api from "../lib/api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const token = res.data.token;

  localStorage.setItem("token", token);

  return res.data.user;
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/admin/login";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
