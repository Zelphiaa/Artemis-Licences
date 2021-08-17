<template>
  
</template>

<script>
export default {
    middleware:"authenticated",

    mounted(){
        if (this.$store.state.auth.userData.rol == "ADMIN") {
            $nuxt.$router.push('/admin/dashboard')
            return
        }else{
            $nuxt.$router.push('/dashboard')
        }
    }
}
</script>

<style>

</style>