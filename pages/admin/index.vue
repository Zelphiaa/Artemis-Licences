<template>

</template>
<script>
export default {
    middleware: ["authenticated","authenticatedADM"],
  mounted(){

    $nuxt.$router.push('/admin/dashboard')
  }
}
</script>
