import api from "./api";

export const authService = {
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  async me() {
    const { data } = await api.get("/users/me");
    return data;
  },

  async logout() {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};
