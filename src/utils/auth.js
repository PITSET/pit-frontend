import api from "../lib/api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user } = res.data;

  // store token
  localStorage.setItem("token", token);

  return { token, user };
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
