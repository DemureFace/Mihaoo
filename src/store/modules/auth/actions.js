import { authService } from "@/services/auth.service";
import {
  LOGIN_ACTION,
  SIGNUP_ACTION,
  LOGOUT_ACTION,
  FETCH_USER_ACTION,
  SET_USER_MUTATION,
  CLEAR_AUTH_MUTATION,
} from "@/store/storeconstants";

export default {
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

  async [FETCH_USER_ACTION]({ commit }) {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken) {
      commit(CLEAR_AUTH_MUTATION);
      return null;
    }

    try {
      const user = await authService.me();

      localStorage.setItem("user", JSON.stringify(user));

      commit(SET_USER_MUTATION, {
        user,
        accessToken,
        refreshToken,
      });

      return user;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      commit(CLEAR_AUTH_MUTATION);

      return null;
    }
  },

  async [LOGOUT_ACTION]({ commit }) {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout request failed, local auth will be cleared anyway");
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    commit(CLEAR_AUTH_MUTATION);
  },
};
