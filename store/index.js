export const state = () => ({
  auth: null,
  keys: [],
  cartLength: 0,
  selectedPlugin: {},
  cart: [],
  totalCart: 0,
  pluginDownload: ""
});

export const mutations = {
  setAuth(state, auth) {
    state.auth = auth;
  },
  setPlugins(state, plugin) {
    state.keys = plugin;
  },
  setSelectedPlugin(state, plugin) {
    state.selectedPlugin = plugin;
  },
  setCartData(state, cart) {
    state.cart = cart;
  },
  incrementQuantityCart(state) {
    state.cartLength = 0;
    state.cartLength = state.cart.plugins.length;
  },
  setTotalCart(state, total) {
    state.totalCart = total;
  },
  setPluginDownload(state, plugin) {
    state.pluginDownload = plugin;
  }
};

export const actions = {
  readToken() {
    let auth = null;
    try {
      auth = JSON.parse(localStorage.getItem("auth"));
    } catch (error) {
      console.log(error);
    }
    this.commit("setAuth", auth);
  },
  getKeys() {
    let config = {
      headers: {
        token: this.state.auth.token
      }
    };
    this.$axios
      .get("http:localhost:3001/api/key", config)
      .then(res => {
        let keys = res.data.data;
        console.log(keys);
        if (keys.length > 0) {
          console.log('selected',this.state.selectedPlugin);
          res.data.data.forEach((key, index) => {
            if (key.selected) {
              $nuxt.$emit("selectedPlugin", index);
              this.commit("setSelectedPlugin", key);
            }
          });
          if (keys.length > 0) {
            this.commit("setPlugins", keys);
          }
        }
        return;
      })
      .catch(err => {
        console.log(err);
      });
  },
  getCartData() {
    let config = {
      headers: {
        token: this.state.auth.token
      }
    };
    this.$axios
      .get("http:localhost:3001/api/cart", config)
      .then(res => {
        console.log(res.data.data);
        if (res.data.data !== null) {
          this.commit("setCartData", res.data.data);
          this.commit("incrementQuantityCart");

          const sum = [];
          res.data.data.plugins.forEach(element => {
            console.log(element);
            sum.push(element.totalPrice);
          });
          var myTotal = sum.reduce(function(a, b) {
            return a + b;
          }, 0);
          this.commit("setTotalCart", myTotal);
        }
        return;
      })
      .catch(err => {
        console.log(err.response);
      });
  },
  getPlugin() {
    let config = {
      headers: {
        token: this.state.auth.token
      },
      params: {
        pluginName: this.state.selectedPlugin.pluginName
      }
    };
    console.log(config);
    this.$axios
      .get("http:localhost:3001/api/plugin-download", config)
      .then(res => {
        this.commit("setPluginDownload", res.data.data);
      })
      .catch(err => {
        console.log(err.response);
      });
  }
};
