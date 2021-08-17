<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img src="img//card-primary.png" alt="" />
          <h1 class="card-title">Register</h1>
        </template>

        <div>
          <base-input
            name="name"
            v-model="user.name"
            placeholder="Name"
            addon-left-icon="tim-icons icon-badge"
          >
          </base-input>

          <base-input
            name="email"
            v-model="user.email"
            placeholder="Email"
            addon-left-icon="tim-icons icon-email-85"
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
          <base-input
            name="password"
            v-model="verif.password"
            type="password"
            placeholder="Repeat your Password"
            addon-left-icon="tim-icons icon-lock-circle"
          >
          </base-input>
        </div>

        <div slot="footer">
          <base-button
            native-type="submit"
            type="success"
            class="mb-3"
            size="lg"
            @click="onRegister()"
            block
          >
            Register
          </base-button>

          <div class="pull-left">
            <h6 style="color: black">
                You have an accout?
              <nuxt-link style="color:#00f2c3" class="link footer-link" to="/login">
                Login
              </nuxt-link>
              now!
            </h6>
          </div>

          <div class="pull-right">
          </div>
        </div>
      </card>
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
        name: "",
        email: "",
        password: ""
      },
      verif:{
          password: "",
      }
    };
  },
  methods: {
    onRegister(){
      if (this.user.password !== this.verif.password) {
        this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "The password aren't equals"
          })
        this.user.password = ''
        this.verif.password = ''
        return
      }
      this.$axios.post('http://localhost:3001/api/register',this.user)
      .then(res => {
        console.log(res);
        if (res.data.status === 'success') {
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "Success! Now you can login..."
          })

          this.user.name = ''
          this.user.email = ''
          this.user.password = ''
          this.verif.password = ''

          setTimeout(() =>{

            $nuxt.$router.push('/login')
          }, 1000)
          return
        }
      })
      .catch(err => {
        if (this.user.name === '') {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Name is required"
          })
          return
        }
        if (this.user.email === '') {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Email is required"
          })
          return
        }
        if (this.user.password === '') {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Password is required"
          })
          return
        }
        if (err.response.data.error.errors.email) {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Email already exists"
          })
          this.user.email = ''
          return
        }
        if (err.response.data.error.errors.name) {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Name already exists"
          })
          this.user.name = ''
          return
        }
      })
    }
  }
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
