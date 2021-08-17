<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img src="img//card-primary.png" alt="" />
          <h1 class="card-title">Log In</h1>
        </template>

        <div>
          <base-input
            name="email"
            v-model="user.email"
            style="color: black"
            placeholder="Email"
            addon-left-icon="fas fa-envelope"
          >
          </base-input>

          <base-input
            name="password"
            v-model="user.password"
            type="password"
            placeholder="Password"
            addon-left-icon="tim-icons icon-lock-circle"
          >
          </base-input>
        </div>

        <div slot="footer">
          <base-button
            native-type="submit"
            type="primary"
            class="mb-3"
            size="lg"
            @click="onLogin()"
            block
          >
            Login
          </base-button>
          You don't have an accout?
          <nuxt-link
            style="color: #e14eca"
            class="link footer-link"
            to="/register"
          >
            Create now
          </nuxt-link>
          <hr />
          <div class="pull-left">
            Forgot your password?
            <a @click="recoverAccountModal = true" style="color: #e14eca"
              >Click here</a
            >
          </div>

          <div class="pull-right"></div>
        </div>
      </card>
      <modal :show.sync="recoverAccountModal" body-classes="p-0">
        <card
          type="secondary"
          header-classes="bg-white pb-5"
          body-classes="px-lg-5 py-lg-5"
          class="border-0 mb-0"
        >
          <template>
            <form role="form">
              <h3>Find user</h3>
              <base-input
                alternative
                label="Enter email"
                v-model="email"
                class="mb-3"
                placeholder="Email"
                addon-left-icon="fas fa-envelope"
              >
              </base-input>
              <div class="text-center">
                <base-button type="success" @click="recoverAccount" class="my-4"
                  >Recover account</base-button
                >
                <br />
                <base-button
                  type="danger"
                  class="my-4"
                  @click="recoverAccountModal = false"
                  >Cancel</base-button
                >
              </div>
            </form>
          </template>
        </card>
      </modal>
    </div>
  </div>
</template>

<script>
export default {
  layout: "auth",
  middleware: "notAuthenticated",
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
      email: "",
      recoverAccountModal: false,
      success: "Success",
      class_input: "success",
    };
  },
  methods: {
    onLogin() {
      this.$axios
        .post("http://localhost:3001/api/login", this.user)
        .then((res) => {
          console.log(res);
          if (res.data.status === "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Welcome " + res.data.userData.name,
            });

            const auth = {
              token: res.data.token,
              userData: res.data.userData,
            };

            //token to Store
            this.$store.commit("setAuth", auth);

            //set auth object in localstorage
            localStorage.setItem("auth", JSON.stringify(auth));
            if (auth.userData.rol == "ADMIN") {
              $nuxt.$router.push("/admin/");
              return;
            }
            $nuxt.$router.push("/");
            return;
          }
        })
        .catch((err) => {
          console.log(err.response);
          if (err.response.data.message == "Please verify your email") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "First, verify your email",
            });
            return;
          }
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Email or password incorrect",
          });
          return;
        });
    },
    recoverAccount() {
      this.$axios
        .post("http://localhost:3001/api/recover-account", { email: this.email })
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Email sended to " + this.email,
            });
            this.recoverAccountModal = false;
          }
        })
        .catch((err) => {
          if (err.response.data.message == "Mail not found") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Email not found",
            });
            this.email = "";
            return
          }
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error to recover account",
          });
          return
        });
    },
  },
};
</script>

<style>
</style>
