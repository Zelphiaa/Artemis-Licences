<template>
  <div>
    <div class="container text-center" v-if="$store.state.cartLength > 0">
      <h1>Cart</h1>
      <card v-for="(item, index) in $store.state.cart.plugins" :key="index">
        <div class="row">
          <div class="col-md-3">
            <img :src="`../${item.pluginImage}`" alt="" />
          </div>
          <div class="col-md-2">
            <h2>{{ item.pluginName }}</h2>
            <span
              ><b style="color: white">Price unit:</b
              ><strong style="color: green"> ${{ item.price }}</strong></span
            >
          </div>
          <div class="col-md-3">
            <div class="btn-group my-5" role="group" aria-label="Basic example">
              <button
                type="button"
                @click="lessQuantity(item._id)"
                class="btn btn-danger btn-sm"
              >
                -
              </button>
              <button
                type="button"
                @click="addQuantity(item._id)"
                class="btn btn-success btn-sm"
              >
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
          <div class="col-md-2">
            <h4 class="my-3">Quantity</h4>
            <b class="my-5">{{ item.IPs }}</b>
          </div>
          <div class="col-md-2">
            <h4 class="my-3">Total</h4>
            <h5>${{ numeroFormateo(item.totalPrice) }}</h5>
          </div>
        </div>
      </card>
      <hr class="my-3" />
      <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-4"></div>
        <div class="col-md-4">
          <h3>
            Total to buy:
            <h3 style="color: green">
              ${{ numeroFormateo($store.state.totalCart) }}
            </h3>
          </h3>
          <base-button
            @click="payNow()"
            type="success"
            size="lg"
            class="mb-3"
            block
          >
            Buy Now!
          </base-button>
        </div>
      </div>
    </div>
    <div v-else>You don't have products in the cart</div>
  </div>
</template>

<script>
import { Select, Option } from "element-ui";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  component: {
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      cart: [],
    };
  },
  mounted() {},
  methods: {
    lessQuantity(pluginId) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          pluginId: pluginId,
        },
      };
      let number = -1;
      const toSend = {
        number: number,
      };
      this.$axios
        .put("http://localhost:3001/api/cart", toSend, config)
        .then((res) => {
          this.$store.dispatch("getCartData");
          if (res.data.message === "deleted") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Plugin deleted from cart",
            });
          }
        })
    },
    addQuantity(pluginId) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          pluginId: pluginId,
        },
      };
      let number = 1;
      const toSend = {
        number: number,
      };
      this.$axios
        .put("http://localhost:3001/api/cart", toSend, config)
        .then((res) => {
          console.log(res.data);
          this.$store.dispatch("getCartData");
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    numeroFormateo(num) {
      return new Intl.NumberFormat("de-DE").format(num);
    },
    payNow() {
      $nuxt.$router.push('/checkoutcart');
    },
  },
};
</script>

<style>
</style>
