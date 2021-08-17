<template>
  <div>
    <card>
      <form @submit.prevent>
        <base-input
          label="Enter actual password"
          type="password"
          placeholder="*********"
        >
        </base-input>
        <hr>
        <base-input
          label="New Password"
          type="password"
          placeholder="*******"
        >
        </base-input>
        <base-input
          label="Repeat new password"
          type="password"
          placeholder="*******"
        >
        </base-input>
        <div class="row">
        <div class="col"></div>
        <base-button class="animation-on-hover col my-5" type="success">Change password</base-button>
        <div class="col"></div>
        </div>
      </form>
    </card>
  </div>
</template>

<script>
export default {
    middleware: ["authenticated","authenticatedADM"],
};
</script>

<style>
</style>