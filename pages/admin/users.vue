<template>
  <div>
    <card>
      <div class="row">
        <el-table :data="users">
          <el-table-column min-width="150" label="Name" prop="name">
          </el-table-column>
          <el-table-column min-width="150" label="Rol" prop="rol">
          </el-table-column>
          <el-table-column
            min-width="150"
            label="E-mail"
            prop="email"
          ></el-table-column>
          <el-table-column min-width="150" label="Actions" header-align="right">
            <div slot-scope="{ row }" class="text-right">
              <el-tooltip content="Edit" :open-delay="300" placement="top">
                <base-button
                  type="success"
                  size="sm"
                  icon
                  @click="onEditUser(row._id)"
                >
                  <i class="tim-icons icon-settings"></i>
                </base-button>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </div>
    </card>
    <modal
      :show.sync="edit"
      body-classes="p-0"
      modal-classes="modal-dialog-centered modal-sm"
    >
      <card
        type="secondary"
        header-classes="bg-white pb-5"
        body-classes="px-lg-5 py-lg-5"
        class="border-0 mb-0"
      >
        <template>
          <form role="form">
            <base-input
              alternative
              class="mb-3"
              placeholder="name"
              v-model="editUser.name"
              disabled
              addon-left-icon="fas fa-signature"
            >
            </base-input>
            <base-input
              alternative
              class="mb-3"
              placeholder="Email"
              v-model="editUser.email"
              disabled
              addon-left-icon="fas fa-envelope"
            >
            </base-input>
            <el-select
              v-model="editUser.rol"
              placeholder="SELECT RANK"
              class="select-success"
              style="width: 100%"
            >
              <el-option
                class="text-dark"
                label="USER"
                value="USER"
              ></el-option>
              <el-option
                class="text-dark"
                label="ADMIN"
                value="ADMIN"
              ></el-option>
            </el-select>

            <div class="text-center">
              <base-button
                type="warning"
                block
                class="my-4"
                @click="editUserOff(editUser._id, editUser.rol)"
                >Edit</base-button
              >
            </div>
          </form>
        </template>
      </card>
    </modal>
  </div>
</template>


<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      edit: false,
      users: [],
      editUser: {},
    };
  },
  mounted() {
    this.getUsers();
        if (this.$store.state.auth.userData.rol === "SUB-ADMIN") {
      return $nuxt.$router.push('http:localhost:3001/api/admin/license')
    }
  },
  methods: {
    getUsers() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .get("http://localhost:3001/api/users", config)
        .then((res) => {
          res.data.data.forEach((user,index,object) => {
              if(user.email == "admin@admin.com"){
                  object.splice(index,1)
              }
          })
          this.users = res.data.data
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    onEditUser(userId) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          _id: userId,
        },
      };
      setTimeout(() => {
        this.edit = true;
      }, 500);
      this.$axios
        .get("http://localhost:3001/api/user", config)
        .then((res) => {
          this.editUser = res.data.data;
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    editUserOff(userId, rol) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          userId: userId,
        },
      };
      const toSend = {
        rol: rol,
      };
      this.$axios
        .put("http://localhost:3001/api/user-rol", toSend, config)
        .then((res) => {
          if (res.data.status === "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Rol changed!",
            });
            this.edit = false
            this.getUsers()
          }
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
  },
};
</script>
