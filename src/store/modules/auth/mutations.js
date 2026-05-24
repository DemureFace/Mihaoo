import {
  SET_USER_MUTATION,
  CLEAR_AUTH_MUTATION,
} from "@/store/storeconstants";

export default {
  [SET_USER_MUTATION](state, payload) {
    state.user = payload.user;
    state.accessToken = payload.accessToken;
    state.refreshToken = payload.refreshToken;
  },

  [CLEAR_AUTH_MUTATION](state) {
    state.user = null;
    state.accessToken = null;
    state.refreshToken = null;
  },
};
