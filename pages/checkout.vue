<template>
  <div>
    <div class="container">
      <div v-if="!paidFor">
        <card>
          <div class="row">
            <div class="col-md-7">
              <div class="text-center my-3">
                <h1>Total to Pay</h1>
                <h2>${{ plugin.totalPrice }}</h2>
              </div>
              <div style="padding-top: 200px" ref="paypal"></div>
            </div>
            <div class="col-md-1">
              <div
                style="
                  color: white;
                  border-left: 1px solid white;
                  height: 500px;
                "
              ></div>
            </div>
            <div class="col-md-4">
              <img
                slot="image"
                class="card-img-top mx-5"
                style="max-width: 70%"
                :src="`../../../${plugin.pluginPhoto}`"
                alt="Card image cap"
              />
              <hr />
              <br />
              <div>
                <h1 class="text-center">{{ plugin.pluginName }}</h1>
              </div>
              <br />
              <b style="color: whitesmoke">Quantity:</b>
              <span style="color: whitesmoke">{{ plugin.quantity }}</span
              ><br />
              <b style="color: whitesmoke">Price unit:</b>
              <span style="color: whitesmoke">{{ plugin.unitPrice }}</span
              ><br />
              <b style="color: whitesmoke">Total Price:</b>
              <span style="color: whitesmoke">{{ plugin.quantity }}</span>
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
  middleware: ["authenticated"],
  layout: "auth",
  data() {
    return {
      loaded: false,
      paidFor: false,
      plugin: {},
      seconds: 5
    };
  },
  mounted() {
    const script = document.createElement("script");
    script.src =
      `https://www.paypal.com/sdk/js?client-id=${process.env.client_id}`;
    script.addEventListener("load", this.setLoaded);
    document.body.appendChild(script);
    this.getPlugin();

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
    setLoaded() {
      this.loaded = true;
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            console.log(data);
            return actions.order.create({
              purchase_units: [
                {
                  description: this.plugin.pluginName,
                  amount: {
                    currency_code: "USD",
                    value: this.plugin.totalPrice,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            this.paidFor = true;
            this.countDown()
            this.createKey()
            console.log(order);
          },
          onError: (err) => {
            console.log(err);
          },
        })
        .render(this.$refs.paypal);
    },
    getPlugin() {
      let data = JSON.parse(sessionStorage.getItem("Paynow"));
      this.plugin = data;
      console.log(this.plugin);
    },
    createKey(){
        let config = {
            headers: {
                token: this.$store.state.auth.token,
            }
        }
        this.$axios.post('http://localhost:3001/api/buykey', {quantity: this.plugin.quantity, pluginName: this.plugin.pluginName, totalPrice: this.plugin.totalPrice, pluginId: this.plugin.pluginId}, config)
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
            console.log(err.response);
        })
    }
  },
};
</script>

<style>
*,
html {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
figure {
  margin: 0px;
}
img {
  max-width: 100%;
}
/* ================== Badge Products CSS ========================*/

.products {
  max-width: 100%;
  margin: 0 auto;
}

.products ul {
  margin: 0px;
  text-align: center;
}

.products ul li {
  width: 320px;
  height: 213px;
  background: #f8f8f8;
  display: inline-block;
  position: relative;
  margin: 15px;
  padding: 0px;
  box-sizing: border-box;
}

/* ================== Badge Overlay CSS ========================*/
.badge-overlay {
  position: absolute;
  left: 0%;
  top: 0px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 100;
  -webkit-transition: width 1s ease, height 1s ease;
  -moz-transition: width 1s ease, height 1s ease;
  -o-transition: width 1s ease, height 1s ease;
  transition: width 0.4s ease, height 0.4s ease;
}

/* ================== Badge CSS ========================*/
.badge {
  margin: 0;
  padding: 0;
  color: white;
  padding: 10px 10px;
  font-size: 15px;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  line-height: normal;
  text-transform: uppercase;
  background: #ed1b24;
}

.badge::before,
.badge::after {
  content: "";
  position: absolute;
  top: 0;
  margin: 0 -1px;
  width: 100%;
  height: 100%;
  background: inherit;
  min-width: 55px;
}

.badge::before {
  right: 100%;
}

.badge::after {
  left: 100%;
}

/* ================== Badge Position CSS ========================*/
.top-left {
  position: absolute;
  top: 0;
  left: 0;
  -ms-transform: translateX(-30%) translateY(0%) rotate(-45deg);
  -webkit-transform: translateX(-30%) translateY(0%) rotate(-45deg);
  transform: translateX(-30%) translateY(0%) rotate(-45deg);
  -ms-transform-origin: top right;
  -webkit-transform-origin: top right;
  transform-origin: top right;
}

.top-right {
  position: absolute;
  top: 0;
  right: 0;
  -ms-transform: translateX(30%) translateY(0%) rotate(45deg);
  -webkit-transform: translateX(30%) translateY(0%) rotate(45deg);
  transform: translateX(30%) translateY(0%) rotate(45deg);
  -ms-transform-origin: top left;
  -webkit-transform-origin: top left;
  transform-origin: top left;
}

.bottom-left {
  position: absolute;
  bottom: 0;
  left: 0;
  -ms-transform: translateX(-30%) translateY(0%) rotate(45deg);
  -webkit-transform: translateX(-30%) translateY(0%) rotate(45deg);
  transform: translateX(-30%) translateY(0%) rotate(45deg);
  -ms-transform-origin: bottom right;
  -webkit-transform-origin: bottom right;
  transform-origin: bottom right;
}

.bottom-right {
  position: absolute;
  bottom: 0;
  right: 0;
  -ms-transform: translateX(30%) translateY(0%) rotate(-45deg);
  -webkit-transform: translateX(30%) translateY(0%) rotate(-45deg);
  transform: translateX(30%) translateY(0%) rotate(-45deg);
  -ms-transform-origin: bottom left;
  -webkit-transform-origin: bottom left;
  transform-origin: bottom left;
}

.top-full {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
}

.middle-full {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  text-align: center;
  -ms-transform: translateX(0%) translateY(-50%) rotate(0deg);
  -webkit-transform: translateX(0%) translateY(-50%) rotate(0deg);
  transform: translateX(0%) translateY(-50%) rotate(0deg);
}

.bottom-full {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
}

/* ================== Badge color CSS ========================*/
.badge.red {
  background: #ed1b24;
}

.badge.orange {
  background: #fa7901;
}

.badge.pink {
  background: #ee2b8b;
}

.badge.blue {
  background: #00adee;
}

.badge.green {
  background: #b4bd00;
}
</style>
