<template>
  <div>
    <template>
      <div class="container text-center">
        <div class="row">
          <div class="col-md-4"></div>
          <card class="col-md-4">
            <h3>User Founded</h3>
            <base-input
              name="passowrd"
              style="color: black"
              placeholder="Password"
              type="password"
              v-model="password"
              addon-left-icon="fas fa-envelope"
            >
            </base-input>
            <base-button
              type="success"
              @click="changePassword()"
              block
              class="mb-3 my-4"
              >Change password!</base-button
            >
          </card>
          <div class="col-md-4"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  layout: "auth",
  data() {
    return {
      tokenPassword: this.$route.params.id,
      password: "",
    };
  },
  mounted() {
    console.log(this.tokenPassword);
  },
  methods: {
    changePassword() {
      let config = {
        params: {
          tokenPassword: this.tokenPassword,
        },
      };
      this.$axios
        .put("http://localhost:3001/api/password-recover", { password: this.password }, config)
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Password changed, closing window",
            });
            setTimeout(() =>{
              window.close();
            }, 2000)
            return;
          }
        })
        .catch(err => {
            console.log(err);
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error to change password",
            });
            return
        })
    },
  },
};
</script>
