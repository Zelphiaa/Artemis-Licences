<template>
  <card>
    <form>
      <div class="form-row">
        <base-input
          class="col-md-6"
          v-model="plugin.title"
          type="text"
          label="Title"
          placeholder="Ex. tCoins"
        />
        <div class="col-6">
          <slot name="label">
            <label> Category </label>
          </slot>

          <el-select
            v-model="plugin.categoryId"
            placeholder="Select Category"
            class="select-primary"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in categories"
              :key="index"
              class="text-dark"
              :value="item._id"
              :label="item.type"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="form-floating my-3">
        <label for="floatingTextarea2">Description</label>
        <Editor
          :content="plugin.description"
          v-model="plugin.description"
        ></Editor>
      </div>
      <div>
        <div class="row">
          <base-input
            class="col-md-12"
            type="number"
            label="Price"
            placeholder="Ex. 500"
            v-model="plugin.price"
          />
        </div>
        <div class="row my-3">
          <div class="mb-3 col-md-6" >
            <h2>Insert Plugin image</h2>
            <div class="file-field">
              <div class="z-depth-1-half mb-4">
                <img
                  v-if="previewImage == ''"
                  src="http://mdbootstrap.com/img/Photos/Others/placeholder.jpg"
                  class="img-fluid"
                  id="image"
                  alt="example placeholder"
                />
                <img
                  v-else
                  :src="previewImage"
                  class="img-fluid"
                  id="image"
                  alt="example placeholder"
                />
              </div>
              <div class="d-flex justify-content-center">
                <div class="btn btn-mdb-color btn-rounded float-left">
                  <span>Choose file</span>
                  <input
                    type="file"
                    ref="file"
                    v-on:change="handleFileUpload()"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6" >
              <h2>Insert Plugin file</h2>
            <div class="d-flex justify-content-center" style="padding-top:125px">
                <div class="btn btn-mdb-color btn-rounded float-left" >
                  <span>Insert plugin</span>
                  <input
                    type="file"
                    ref="plugin"
                    v-on:change="handleFilePlugin()"
                  />
                </div>
              </div>
          </div>
        </div>
      </div>
      <base-button
        block
        type="primary"
        @click.prevent="onCreatePlugin()"
        class="my-5"
        native-type="Submit"
        >Create</base-button
      >
    </form>
  </card>
</template>

<script>
import { Select, Option } from "element-ui";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      plugin: {
        file: "",
        title: "",
        categoryId: null,
        description: "",
        price: null,
        pluginFile: ""
      },

      previewImage: "",
      categories: [],
    };
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    handleFileUpload() {
      // Reference to the DOM input element
      var input = event.target;
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        var reader = new FileReader();
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = (e) => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.previewImage = e.target.result;
          this.plugin.file = this.$refs.file.files[0];
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    handleFilePlugin(){
      this.plugin.pluginFile = this.$refs.plugin.files[0]
      console.log(this.plugin.pluginFile);
    },
    onCreatePlugin() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
          "Content-Type": "multipart/form-data",
        },
      };
      let data = new FormData();
      data.append("title", this.plugin.title);
      data.append("description", this.plugin.description);
      data.append("price", this.plugin.price);
      data.append("category", this.plugin.categoryId);
      data.append("file", this.plugin.file);
      data.append('pluginFile', this.plugin.pluginFile)
      console.log(data);
      this.$axios
        .post("http://localhost:3001/api/plugin", data, config)
        .then((res) => {
          console.log(res);
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "You has created a new plugin!",
          });
          this.plugin.title = "";
          this.plugin.description = "";
          this.plugin.price = null;
          this.plugin.categoryId = null;
          this.plugin.file = "";
          this.plugin.pluginFile =  ""
          this.previewImage = "";
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    getCategories() {
      this.$axios
        .get("http://localhost:3001/api/categories")
        .then((res) => {
          this.categories = res.data.data;
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
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
