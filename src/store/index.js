import { createStore } from "vuex";

export default createStore({
  state: {
    errors: [],
  },
  mutations: {
    addError(state, payload) {
      state.errors = [...state.errors, payload];
    },

    removeAllErrors(state) {
      state.errors = [];
    },
  },
  actions: {},
});
