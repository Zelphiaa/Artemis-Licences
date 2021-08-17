<template>
  <card>
    <form @submit.prevent="editPluginFunc(editPlugin)">
      <div class="form-row">
        <base-input
          class="col-md-12"
          v-model="editPlugin.title"
          type="text"
          label="Title"
          placeholder="Ex. tCoins"
        />
      </div>
      <div class="form-row">
        <base-input
          class="col-md-6"
          v-model="editPlugin.price"
          type="text"
          label="Price"
          placeholder="Ex. tCoins"
        />
        <base-input
          disabled
          class="col-md-6"
          v-model="oldPrice"
          type="text"
          label="Old price"
          placeholder="Ex. tCoins"
        />
      </div>
      <div class="form-floating my-3 row">
        <div class="col-12">
          <label for="floatingTextarea2">Description</label>
          <Editor :content="editPlugin.description" v-model="editPlugin.description"></Editor>
        </div>
      </div>
          <hr>
      <div>
        <div class="row my-3">
        <div class="mb-3 col-md-12">
          <h2>Plugin Image</h2>
          <div class="file-field">
            <div class="z-depth-1-half mb-4">
              <img
                v-if="file == ''"
                :src="`../../${editPlugin.photo}`"
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
        </div>
      </div>
      <base-button
        block
        type="primary"
        nativeType="submit"
        class="my-5"
        native-type="Submit"
        >Edit</base-button
      >
    </form>
    <nuxt-link
      :to="`/admin/market/${this.$route.params.id}`"
      class="btn btn-danger btn-block mb-5 mx-2"
      >Cancel Edit</nuxt-link
    >
  </card>
</template>


<script>
export default {
  middleware: ["authenticated", "authenticatedADM"],
  data() {
    return {
      editPlugin: {},
      file: "",
      pluginFile: "",
      previewImage: "",
      oldPrice: null,
    };
  },
  mounted() {
    this.getPlugin(this.$route.params.id);
  },
  beforeDestroy() {
    this.quill = null;
    delete this.quill;
  },
  methods: {
    getPlugin(id) {
      this.$axios.get(`http://localhost:3001/api/plugin/${id}`).then((res) => {
        console.log(res.data.data);
        this.editPlugin = res.data.data;
        this.oldPrice = this.editPlugin.price;
      });
    },
    editPluginFunc(body) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
          "Content-Type": "multipart/form-data",
        },
      };
      const toSend = {
        title: body.title,
        price: body.price,
        oldPrice: this.oldPrice,
        photo: this.file,
      };
      let data = new FormData();
      data.append("title", body.title);
      data.append("description", body.description);
      data.append("price", body.price);
      data.append("oldPrice", this.oldPrice);
      data.append("file", this.file);
      data.append("photo", this.editPlugin.photo);
      data.append('pluginFile', this.pluginFile)

      this.$axios
        .put(`http://localhost:3001/api/plugin/${this.$route.params.id}`, data, config)
        .then((res) => {
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "You has Edited the plugin!. Redirect to page",
          });
          setTimeout(() => {
            $nuxt.$router.push(`/admin/market/${this.$route.params.id}`);
          }, 1500);
          return;
        })
        .catch((err) => {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error to edit the plugin",
          });
          return;
        });
    },
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
          this.file = this.$refs.file.files[0];
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    handleFilePlugin(){
      this.pluginFile = this.$refs.plugin.files[0]
      console.log(this.pluginFile);
    },
  },
};
</script>

<style>
.textarea {
  width: 1000px;
}
#image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 600px;
  height: auto;
}
</style>
