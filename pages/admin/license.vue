<template>
  <div>
    <div class="container">
      <card>
        <form v-if="existParams == false">
          <base-input
            addon-left-icon="fas fa-key"
            label="License:"
            icon
            type="text"
            placeholder="License key"
            v-model="key.keyRandom"
            disabled
          ></base-input>
          <base-input
            addon-left-icon="fas fa-braille"
            label="Quantity IPs"
            type="number"
            placeholder="Quantity IPs"
            v-model="key.IPs"
          />
          <base-input
            addon-left-icon="fas fa-file-signature"
            label="Plugin ID"
            type="text"
            placeholder="Ex. 1"
            v-model="key.pluginId"
          ></base-input>
          <base-input
            addon-left-icon="fas fa-file-signature"
            label="Plugin name"
            type="text"
            placeholder="Ex. Tcoins"
            v-model="key.pluginName"
          ></base-input>
          <div>
            <slot name="label">
              <label><i class="fas fa-user"></i> User</label>
            </slot>
            <el-select
              v-model="key.userId"
              placeholder="Select User"
              class="select-success"
              style="width: 100%"
            >
              <el-option
                v-for="(user, index) in users"
                :key="index"
                class="text-dark"
                :label="user.name"
                :value="user._id"
              ></el-option>
            </el-select>
          </div>
          <base-button
            @click="
              onCreateKey();
              $nuxt.$emit('getSells');
            "
            class="my-5"
            block
            type="success"
            >Create</base-button
          >
        </form>
        <form v-else>
          <base-input
            addon-left-icon="fas fa-key"
            label="Custom License key"
            icon
            type="text"
            placeholder="License key"
            v-model="key.keyRandom"
            disabled
          ></base-input>
          <p>
            IP: <strong>{{ key.keyRandom }}</strong>
          </p>
          <base-input
            addon-left-icon="fas fa-braille"
            label="Quantity IPs"
            type="number"
            placeholder="Quantity IPs"
            v-model="key.IPs"
          />
          <base-input
            addon-left-icon="fas fa-file-signature"
            label="Plugin name [optional]"
            type="text"
            disabled
            placeholder="Ex. Tcoins"
            v-model="key.pluginName"
          ></base-input>
          <div>
            <slot name="label">
              <label><i class="fas fa-user"></i> User</label>
            </slot>
            <el-select
              disabled
              v-model="key.userId"
              placeholder="Select User"
              class="select-success"
              style="width: 100%"
            >
              <el-option
                disabled
                class="text-dark"
                :label="key.userName"
                :value="key.userId"
              ></el-option>
            </el-select>
          </div>
          <base-button
            @click="
              onCreateKey();
              $nuxt.$emit('getSells');
            "
            class="my-5"
            block
            type="success"
            >Create</base-button
          >
        </form>
      </card>
    </div>
  </div>
</template>

<script>
import { Select, Option } from "element-ui";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      key: {
        keyRandom: "",
        pluginName: "",
        IPs: null,
        userId: "",
        userName: "",
      },
      existParams: false,
      users: [],
    };
  },
  mounted() {
    this.generateLicence();
    this.onGetUsers();
    this.searchParams();
  },

  methods: {
    generateLicence() {
      let r =
        Math.random().toString(36).substr(3, 4) +
        "-" +
        Math.random().toString(36).substr(3, 4) +
        "-" +
        Math.random().toString(36).substr(3, 4) +
        "-" +
        Math.random().toString(36).substr(3, 4);

      this.key.keyRandom = r.toUpperCase();
    },
    onGetUsers() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .get("http://localhost:3001/api/users", config)
        .then((res) => {
          res.data.data.forEach((user, index, object) => {
            if (user.rol === "ADMIN") {
              object.splice(index, 1);
            }
          });
          this.users = res.data.data;
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    onCreateKey() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .post("http://localhost:3001/api/buykey", this.key, config)
        .then((res) => {
          console.log(res.data);
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "You has created a new key!",
          });
          this.key.userId = null;
          this.key.IPs = null;
          this.key.pluginName = "";
          this.$nuxt.$emit("getSells");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        })
        .catch((err) => {
          if (this.key.IPs === null) {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message: "IPs is required",
            });
            return;
          }
          if (this.key.userId == "") {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message: "User is required",
            });
            return;
          }
        });
    },
    searchParams() {
      const params = new URLSearchParams(location.search);
      this.key.totalPrice = params.get("totalPrice")
      this.key.userId = params.get("userId");
      this.key.userName = params.get("userName");
      this.key.pluginName = params.get("pluginName");
      const queryString = window.location.search;
      if (queryString !== '') {
        this.existParams = true
      }
    },
  },
};
</script>

<style>
</style>
