<template>
  <div>
    <template v-if="!error">
      <div class="container text-center">
        <h1>Error</h1>
        <br />
        <h5>Error to verified email</h5>
      </div>
    </template>
    <template v-else>
      <div class="container text-center">
        <h1>Success</h1>
        <br />
        <h5>
          You has verified your email, Now you can login. Redirect to Login in 5
          seconds
        </h5>
      </div>
    </template>
  </div>
</template>


<script>
export default {
  layout: "auth",
  data() {
    return {
      secretToken:this.$route.params.id,
      error: false,
    };
  },
  mounted() {
    this.verifyAccount()
  },
  methods: {
    verifyAccount() {
      this.$axios
        .post("http://localhost:3001/api/verify-email", { secretToken: this.secretToken })
        .then((res) => {
          console.log(res);
          if (res.data.status == "success") {
            this.error = true;
            setTimeout(() =>{
              window.location.href="/login"

            }, 5000)
            return
          }
        })
        .catch((err) => {});
    },
  },
};
</script>
