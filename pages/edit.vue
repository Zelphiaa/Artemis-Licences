<template>
  <div>
    <div class="container">
      <card class="text-center">
        <h1>User settings</h1>
        <div class="row">
          <div class="col-md-4"></div>
          <div class="col-md-4">
            <form @submit.prevent="changePass()">
              <base-input
                label="Actual password"
                v-model="actualPassword"
                type="password"
                placeholder="Actual password"
              ></base-input>
              <hr />
              <base-input
                label="New password"
                v-model="newPassword"
                type="password"
                placeholder="New password"
              ></base-input>
              <base-input
                label="Repeat the new password"
                v-model="repeatPassword"
                class="my-4"
                type="password"
                placeholder="Repeat the new password"
              ></base-input>
              <base-button
                class="animation-on-hover"
                type="primary"
                nativeType="submit"
                >Change</base-button
              >
            </form>
          </div>
          <div class="col-md-4"></div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
export default {
  middleware: ["authenticated"],
  data() {
    return {
      actualPassword: "",
      newPassword: "",
      repeatPassword: "",
    };
  },
  methods: {
    changePass() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      if (this.newPassword == this.repeatPassword) {
        const toSend = {
          actPassword: this.actualPassword,
          newPassword: this.newPassword,
        };
        this.$axios
          .put("http://localhost:3001/api/new-pass", toSend, config)
          .then((res) => {
            console.log(res);
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! You has changed the password",
            });
            this.actualPassword = "";
            this.newPassword = "";
            this.repeatPassword = "";
          })
          .catch((err) => {
            if (err.response.data.message == "The password does not exist") {
              this.$notify({
                type: "danger",
                icon: "tim-icons icon-alert-circle-exc",
                message: "The password does not exist",
              });
              this.actualPassword = "";
              this.newPassword = "";
              this.repeatPassword = "";
              return;
            }
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Was ocurred an error...",
            });
            this.actualPassword = "";
            this.newPassword = "";
            this.repeatPassword = "";
          });
        return;
      }
      this.$notify({
        type: "danger",
        icon: "tim-icons icon-alert-circle-exc",
        message: "The password aren't equals",
      });
    },
  },
};
</script>

<style>
</style>
