import { authService } from "@/services/auth.service";
import {
  LOGIN_ACTION,
  SIGNUP_ACTION,
  SET_USER_MUTATION,
  LOGOUT_ACTION,
} from "@/store/storeconstants";

export default {
  namespaced: true,

  state() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
      accessToken: localStorage.getItem("accessToken") || null,
      refreshToken: localStorage.getItem("refreshToken") || null,
    };
  },

  getters: {
    isAuthenticated(state) {
      return Boolean(state.accessToken);
    },

    user(state) {
      return state.user;
    },

    isAdmin(state) {
      return state.user?.role === "ADMIN";
    },
  },

  mutations: {
    [SET_USER_MUTATION](state, payload) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },

    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },

  actions: {
    async [LOGIN_ACTION]({ commit }, payload) {
      const data = await authService.login(payload);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      commit(SET_USER_MUTATION, {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data;
    },

    async [SIGNUP_ACTION]({ commit }, payload) {
      const data = await authService.register(payload);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      commit(SET_USER_MUTATION, {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data;
    },

    async [LOGOUT_ACTION]({ commit }) {
      try {
        await authService.logout();
      } catch (e) {
        console.warn("Logout request failed, cleaning local auth anyway");
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      commit("clearAuth");
    },
  },
};
