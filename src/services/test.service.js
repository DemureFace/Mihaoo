import api from "./api";

export const testService = {
  async checkBackend() {
    const { data } = await api.get("/users");
    return data;
  },
};
