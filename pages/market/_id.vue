<template>
  <div>
    <div>
      <card>
        <div class="row">
          <div class="col-md-5">
            <img
              slot="image"
              class="card-img-top"
              :src="`../../${plugin.photo}`"
              alt="Card image cap"
            />
          </div>
          <div class="col-md-7">
            <h1>{{ plugin.title }}</h1>
            <hr />
            <div v-html="plugin.description"></div>
            <br /><br /><br />
            <hr />
            <div class="row">
              <h2 class="text-on-back col-md-6">${{ plugin.price }}</h2>
              <el-select
                placeholder="Select Quantitiy"
                class="select-primary col-md-6"
                v-model="quantity"
                style="width: 100%"
              >
                <el-option class="text-dark" value="1" label="1"> </el-option>
                <el-option class="text-dark" value="2" label="2"> </el-option>
                <el-option class="text-dark" value="3" label="3"> </el-option>
                <el-option class="text-dark" value="4" label="4"> </el-option>
                <el-option class="text-dark" value="5" label="5"> </el-option>
                <el-option class="text-dark" value="6" label="6"> </el-option>
                <el-option class="text-dark" value="7" label="7"> </el-option>
                <el-option class="text-dark" value="8" label="8"> </el-option>
                <el-option class="text-dark" value="9" label="9"> </el-option>
                <el-option class="text-dark" value="10" label="10"> </el-option>
              </el-select>
            </div>
            <div v-if="quantity === 0">
              <el-tooltip
                content="Please add quantity"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  disabled
                  type="success"
                  size="lg"
                  class="mb-3"
                  block
                >
                  Buy Now!
                </base-button>
              </el-tooltip>
            </div>
            <div v-else>
              <base-button
                @click="payNow()"
                type="success"
                size="lg"
                class="mb-3"
                block
              >
                Buy Now!
              </base-button>
              <!-- <base-button
                @click.prevent="
                  addToCart();
                  $nuxt.$emit('update-cart');
                "
                type="warning"
                size="lg"
                class="mb-3"
                block
              >
                Add to cart
              </base-button> -->
            </div>
          </div>
        </div>
      </card>
      <card>
        <div class="row">
          <div class="col-md-4">
            <h3>Reviews...</h3>
            <div style="display: flex">
              <star-rating
                :rating="plugin.averageRating"
                :show-rating="false"
                :glow="1"
                :border-width="1"
                :rounded-corners="true"
                :read-only="true"
                :star-size="18"
              ></star-rating>
              <p class="my-2 mx-2">({{ reviews.length }})</p>
            </div>
          </div>
          <div class="col-md-1"></div>
          <div class="col-md-7">
            <div style="padding-top: 70px">
              <div v-for="(review, index) in reviews" :key="index">
                <h4>{{ review.headline }}</h4>
                <star-rating
                  class="my-2"
                  :rating="review.rating"
                  :show-rating="false"
                  :glow="1"
                  :border-width="1"
                  :rounded-corners="true"
                  :read-only="true"
                  :star-size="18"
                ></star-rating>
                <span>by: {{ review.userName }}</span>
                <div style="color: white" v-html="review.body"></div>
                <div class="row">
                  <div v-if="mobile" class="col-sm-12" style="padding-left: 200px">
                    {{ myDate(review.time) }}
                  </div>
                  <div v-else class="col-sm-12" style="padding-left: 500px">
                    {{ myDate(review.time) }}
                  </div>
                </div>
                <hr />
              </div>
            </div>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import StarRating from "vue-star-rating";
import { Select, Option } from "element-ui";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
    StarRating,
  },
  data() {
    return {
      id: this.$route.params.id,
      plugin: {},
      quantity: 0,
      reviews: [],
      mobile: false
    };
  },
  mounted() {
    this.getPlugin();
    this.getReviewsPlugin();
    if(screen.width <= 480){
      console.log('mobile');
      this.mobile = true
    }
  },
  methods: {
    getPlugin() {
      this.$axios.get(`http://localhost:3001/api/plugin/${this.id}`).then((res) => {
        this.plugin = res.data.data;
      });
    },
    // addToCart() {
    //   let config = {
    //     headers: {
    //       token: this.$store.state.auth.token,
    //     },
    //   };
    //   const IPs = Number(this.quantity);

    //   const pluginName = this.plugin.title;
    //   const pluginId = this.plugin._id;
    //   const toCreate = {
    //     IPs: IPs,
    //     pluginName: pluginName,
    //     pluginId: pluginId,
    //     userId: this.$store.state.auth.userData._id,
    //     totalPrice: this.plugin.price * this.quantity,
    //     price: this.plugin.price,
    //     pluginImage: this.plugin.photo,
    //   };
    //   console.log(config);
    //   this.$axios
    //     .post("http://localhost:3001/api/new-cart", toCreate, config)
    //     .then((res) => {
    //       $nuxt.$emit("update-cart");
    //       this.quantity = 0;
    //       this.$notify({
    //         type: "success",
    //         icon: "tim-icons icon-check-2",
    //         message: "Plugin added to cart",
    //       });
    //     })
    //     .catch((err) => {
    //       console.log(err.data);
    //     });
    // },
    payNow() {
      if (this.$store.state.auth !== null) {
        let toPay = {
          pluginName: this.plugin.title,
          pluginId: this.plugin._id,
          quantity: this.quantity,
          unitPrice: this.plugin.price,
          totalPrice: this.plugin.price * this.quantity,
          pluginPhoto: this.plugin.photo,
          userId: this.$store.state.auth.userData._id,
        };
        sessionStorage.setItem("Paynow", JSON.stringify(toPay));
        $nuxt.$router.push("/checkout");
        return;
      }
    },
    getReviewsPlugin() {
      let config = {
        params: {
          pluginId: this.id,
        },
      };
      this.$axios
        .get("http://localhost:3001/api/reviews", config)
        .then((res) => {
          this.reviews = res.data.data;
        })
        .catch((err) => {});
    },
    myDate(s) {
      var d = new Date(parseInt(s)), // Conver the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ("0" + (d.getMonth() + 1)).slice(-2), //Months are zero based. Add leading 0
        dd = ("0" + d.getDate()).slice(-2), //Add leading 0
        time;

      time = dd + "/" + mm + "/" + yyyy;
      return time;
    },
  },
};
</script>

<style>
</style>
