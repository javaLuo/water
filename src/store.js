import Vue from "vue";
import Vuex from "vuex";

import ModuleApp from "./modules/app.module";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app: ModuleApp,
  }
});
