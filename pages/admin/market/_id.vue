<template>
  <div>
    <div>
      <card>
        <template>
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
              <div class="row">
                <h1 class="col-md-6">{{ plugin.title }}</h1>
                <div class="pull-right col-md-6"></div>
              </div>
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
                </el-select>
              </div>

              <el-tooltip
                content="Edit plugin data"
                :open-delay="300"
                placement="top"
              >
                <div style="padding-top: 50px">
                  <nuxt-link
                    :to="`/admin/plugin/${id}`"
                    class="btn btn-block btn-warning mb-5 mx-2"
                    >Change plugin data</nuxt-link
                  >
                </div>
              </el-tooltip>
              <el-tooltip
                content="Edit plugin data"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  @click="editPlugin = true"
                  class="btn btn-block btn-success mb-5 mx-2"
                  >Change plugin file</base-button
                >
              </el-tooltip>
              <modal :show.sync="editPlugin">
                <template slot="header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    Plugin file
                  </h5>
                </template>
                <div class="container text-center">
                  <div
                    class="d-flex justify-content-center"
                  >
                    <div class="btn btn-mdb-color btn-rounded float-left">
                      <span>Insert plugin</span>
                      <input
                        type="file"
                        ref="plugin"
                        v-on:change="handleFilePlugin()"
                      />
                    </div>
                  </div>
                </div>
                <template slot="footer">
                  <base-button type="secondary" @click="editPlugin = false"
                    >Close</base-button
                  >
                  <base-button type="primary" @click="onChangePlugin()">Save changes</base-button>
                </template>
              </modal>
            </div>
          </div>
        </template>
      </card>
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
              <div v-for="(review,index) in reviews" :key="index">
                <h4>{{review.headline}}</h4>
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
                <span>by: {{review.userName}}</span>
                <div style="color: white" v-html="review.body"></div>
                <div  style="padding-left: 500px">{{myDate(review.time)}}</div>
                <hr>
              </div>
            </div>
        </div>
      </div>
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
    StarRating
  },
  data() {
    return {
      id: this.$route.params.id,
      plugin: {},
      pluginFile: "",
      editPlugin: {},
      editPlugin: false,
      reviews: []
    };
  },
  created() {
    this.getPlugin();
    this.getReviewsPlugin()
  },
  methods: {
    getPlugin() {
      this.$axios.get(`http://localhost:3001/api/plugin/${this.id}`).then((res) => {
        const data = res.data.data;
        this.plugin = data;
        console.log(this.plugin);
      });
    },
    handleFilePlugin(){
      this.pluginFile = this.$refs.plugin.files[0]
      console.log(this.pluginFile);
    },
    onChangePlugin(){
      let config = {
        headers: {
          token: this.$store.state.auth.token
        },
         params: {
           pluginId: this.plugin._id
         }
      }
      let data = new FormData()
      data.append('pluginFile', this.pluginFile)
      this.$axios.put('http://localhost:3001/api/pluginFile',data,config)
      .then(res => {
        console.log(res.data);
         this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "You has changed plugin file!!",
          });
      })
      .catch(err => {
        console.log(err.response);
      })
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
          console.log(res.data);
          this.reviews = res.data.data;
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    myDate(s){
            var d = new Date(parseInt(s)),// Conver the passed timestamp to milliseconds
      yyyy = d.getFullYear(),
      mm = ('0' + (d.getMonth() + 1)).slice(-2),//Months are zero based. Add leading 0
      dd = ('0' + d.getDate()).slice(-2), //Add leading 0
      time


      time = dd + '/' + mm + '/' + yyyy
      return time
    }
  },
};
</script>

<style>
#image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  height: auto;
}
</style>
