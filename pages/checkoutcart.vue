<template>
  <div>
    <div class="container">
      <div v-if="!paidFor">
        <card style="padding-right: 150px">
          <div class="row">
            <div class="col-md-12">
              <div class="my-3">
                <div v-for="(plugin, index) in plugins" :key="index">
                  <div class="row">
                    <img
                      slot="image"
                      class="card-img-top my-2 mx-5 col-md-3"
                      :src="plugin.pluginImage"
                      alt="Card image cap"
                    />
                    <div class="col-md-5">
                      <h1>{{ plugin.pluginName }}</h1>
                      <h4>Quantity IPs: {{ plugin.IPs }}</h4>
                      <h4>Price unit: {{ plugin.price }}</h4>
                      <h4 class="my-5">
                        Total to Pay: ${{ plugin.totalPrice }}
                      </h4>
                    </div>
                  </div>
                </div>
                <hr />
                <div>
                  <h3 class="text-center">
                    Total to pay: ${{ $store.state.totalCart }}
                  </h3>
                  <div
                    style="padding-top: 50px"
                    class="text-center"
                    ref="paypal"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </card>
      </div>
      <div v-else>
        <div>
          <h1 class="text-center">SUCCESS!</h1>
          <card>
            <h3 class="text-center">You has payed successfully the plugin</h3>
            <div class="text-center">
                <img
                border="0"
                style="max-width: 40%"
                src="success.png"
                alt="Card image cap"
              />
              <h3 class="my-5">Redirecting to dashboard in {{seconds}} seconds remaining</h3>
            </div>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
middleware: ["notAuthenticated"],
  layout: "auth",
  data() {
    return {
      plugins: {},
      loaded: false,
      paidFor: false,
            seconds: 5
    };
  },
  mounted() {
    this.$store.dispatch("getCartData");
    this.getCart();
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.client_id}`;
    script.addEventListener("load", this.setLoaded);
    document.body.appendChild(script);
  },
  methods: {
          countDown(){
          let downloadTimer = setInterval(() => {
              if (this.seconds <= 0) {
                  clearInterval(downloadTimer);
                  $nuxt.$router.push('/dashboard')
                  return
              }else{
                  this.seconds + " seconds remaining"
              }
              this.seconds -= 1
          },1000)
      },
    getCart() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .get("http://localhost:3001/api/cart", config)
        .then((res) => {
          this.plugins = res.data.data.plugins;
          console.log("plugins", this.plugins);
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    payNow(){
      let config = {
        headers: {
          token: this.$store.state.auth.token
        },
        params: {
          totalPrice: this.$store.state.totalCart
        }
      }
      var pluginData = []
      this.plugins.forEach(element => {
        var data = {}
          data.pluginName = element.pluginName
          data.IPs = element.IPs
          data.pluginId = element.pluginId
          pluginData.push(data)
      })
      this.$axios.post('http://localhost:3001/api/pay-cart',pluginData, config)
      .then(res => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.response);
      })
    },
    setLoaded() {
      this.loaded = true;
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: "Kour development plugins buyed",
                  amount: {
                    currency_code: "USD",
                    value: this.$store.state.totalCart,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            this.paidFor = true;
            this.payNow()
            this.countDown();
            console.log(order);
          },
          onError: (err) => {
            console.log(err);
          },
        })
        .render(this.$refs.paypal);
    },
  },
};
</script>
