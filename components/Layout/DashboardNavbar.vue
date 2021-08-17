<template>
  <base-nav
    v-model="showMenu"
    class="navbar-absolute top-navbar"
    type="white"
    :transparent="true"
  >
    <div slot="brand" class="navbar-wrapper">
      <div
        class="navbar-toggle d-inline"
        :class="{ toggled: $sidebar.showSidebar }"
      >
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand ml-xl-3 ml-5" href="/">Kour Development</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
      <template v-if="$store.state.keys">
        <el-select
          class="select-success mx-4"
          @change="onSelectPlugin()"
          placeholder="Select Plugin"
          v-model="selectPlugin"
        >
          <el-option
            v-for="(item, index) in $store.state.keys"
            :key="index"
            :value="index"
            :label="item.pluginName"
          ></el-option>
        </el-select>
      </template>
      <template v-else>
        <el-select
          class="select-success mx-4"
          placeholder="You don't have a plugins"
        />
        
      </template>
      <!-- <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        title-classes="nav-link"
        class="nav-item"
      >
        <template slot="title">
          <div
            @update-cart="updateCart"
            v-if="this.$store.state.cartLength > 0"
            class="notification d-none d-lg-block d-xl-block"
          ></div>
          <i class="tim-icons icon-cart"></i>
        </template>
        <div v-if="$store.state.cart.plugins">
          <li
            class="nav-link"
            v-for="(cart, index) in $store.state.cart.plugins"
            :key="index"
          >
            <a href="/cart" class="nav-item dropdown-item">
              <b style="color: orangered"
                ><img
                  :src="`../${cart.pluginImage}`"
                  alt="Avatar"
                  class="avatar"
                  style="float: left; margin: -5px 10px 15px -15px"
                />
                Plugin:
              </b>
              <strong>{{ cart.pluginName }}</strong>
              <div style="margin-left: 70px">
                <b>IPs: </b> {{ cart.IPs }} <br />
                <b>Price: </b> {{ cart.price }} <br /><br />
                <b style="color: green">Pay now</b>
              </div>
            </a>
            <div class="dropdown-divider"></div>
          </li>
          <b style="color: black" class="mx-2">Total:</b>$
          {{ $store.state.totalCart }}<br />
        </div>
        <div v-else>
          <li class="nav-link">
            <a href="#">
              <b>You dont' have nothing in the cart</b>
            </a>
          </li>
        </div>
      </base-dropdown> -->
      <base-dropdown
        tag="li"
        :menu-on-right="!$rtl.isRTL"
        title-tag="a"
        class="nav-item"
        title-classes="nav-link"
        menu-classes="dropdown-navbar"
      >
        <template slot="title">
          <div class="photo">
            <img :src="this.$store.state.auth.userData.image" />
          </div>
          <b class="caret d-none d-lg-block d-xl-block"></b>
          <p class="d-lg-none" @click="onLogOut()">Log out</p>
        </template>
        <li class="nav-link">
          <nuxt-link to="/edit" class="nav-item dropdown-item"
            >Settings</nuxt-link
          >
        </li>
        <div class="dropdown-divider"></div>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item" @click="onLogOut()"
            >Log out</a
          >
        </li>
      </base-dropdown>
    </ul>
  </base-nav>
</template>
<script>
import { CollapseTransition } from "vue2-transitions";
import { BaseNav, Modal } from "@/components";
import { Select, Option } from "element-ui";
import { mapActions } from "vuex";

export default {
  components: {
    CollapseTransition,
    BaseNav,
    Modal,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  computed: {
    routeName() {
      const { path } = this.$route;
      let parts = path.split("/");
      if (parts == ",") {
        return "Dashboard";
      }
      return parts.map((p) => this.capitalizeFirstLetter(p)).join(" ");
    },
    isRTL() {
      return this.$rtl.isRTL;
    },
  },
  data() {
    return {
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: "",
      pluginsBought: [],
      selectPlugin: null,
    };
  },
  mounted() {
    this.$nuxt.$on("selectedPlugin", this.updateSelectedDeviceIndex);
    this.$nuxt.$on("update-cart", () => {
      this.getCartData();
    });
    this.getKeys()
    this.$store.dispatch("getCartData");
  },
  methods: {
    updateSelectedDeviceIndex(index) {
      this.selectPlugin = index;
    },

    onSelectPlugin() {
      const plugin = this.$store.state.keys[this.selectPlugin];

      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      const toSend = {
        keyId: plugin._id,
      };
      this.$axios
        .put("/selectplugin", toSend, config)
        .then((res) => {
          console.log(res.data);
          setTimeout(() => {
            this.$nuxt.$emit('getChartKeyUse')
          }, 200)
          this.$store.dispatch("getKeys");
        })
        .catch((err) => {
          console.log(err.response);
        });
    },

    capitalizeFirstLetter(string) {
      if (!string || typeof string !== "string") {
        return "";
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    onLogOut() {
      localStorage.removeItem("auth");
      const auth = {};
      this.$store.commit("setAuth", auth);
      this.$notify({
        type: "success",
        icon: "tim-icons icon-check-2",
        message: "Good bye! :)",
      });
      window.location.href = "/login";
    },
    updateCart() {
      this.getCartData();
    },
    ...mapActions(["getCartData", "getKeys"]),
  },
};
</script>
<style scoped>
.top-navbar {
  top: 0px;
}
.avatar {
  vertical-align: middle;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
