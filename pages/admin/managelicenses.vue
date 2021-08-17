<template>
  <div>
    <div>
      <card>
        <div class="row">
          <div class="col"></div>
          <div class="input-group col">
            <base-input
              v-if="edit == false"
              addon-left-icon="fas fa-search"
              label="Search User..."
              type="text"
              placeholder="User"
            ></base-input>
          </div>
          <div class="col"></div>
        </div>
        <template v-if="edit == false">
          <el-table :data="users">
            <el-table-column min-width="50" type="index"></el-table-column>
            <el-table-column min-width="150" prop="name" label="Name">
            </el-table-column>
            <el-table-column
              min-width="200"
              prop="keys.length"
              label="Pucharsed plugins"
            >
            </el-table-column>
            <el-table-column
              min-width="150"
              header-align="right"
              label="Actions"
            >
              <div slot-scope="{ row, $index }" class="text-right ">
                <el-tooltip content="Edit" :open-delay="300" placement="top">
                  <base-button

                    type="warning"
                    size="sm"
                    icon
                    @click="onEdit(row._id)"
                  >
                    <i class="tim-icons icon-settings"></i>
                  </base-button>
                </el-tooltip>
              </div>
            </el-table-column>
          </el-table>
        </template>
        <template v-else>
          <h3>Editing... {{ editUser.name }}</h3>
          <template v-if="editUser.keys.length > 0">
            <div v-for="(item, index) in editUser.keys" :key="index">
              <form>
                <div class="form-row">
                  <base-input
                    class="col-md-6"
                    type="text"
                    label="KEY"
                    v-model="item.key"
                    placeholder="KEY"
                  />
                  <base-input
                    class="col-md-6"
                    type="number"
                    label="IPS"
                    placeholder="IPS"
                    v-model="item.IPs"
                  />
                </div>
                <div class="form-row">
                  <base-input
                    class="col-md-6"
                    type="text"
                    label="User:"
                    disabled
                    placeholder="Username"
                    v-model="editUser.name"
                  />
                  <base-input
                    v-if="item.pluginName"
                    class="col-md-6"
                    type="text"
                    disabled
                    label="Plugin name:"
                    placeholder="plugin name"
                    v-model="item.pluginName"
                  />
                  <base-input
                    v-else
                    class="col-md-6"
                    type="text"
                    label="Plugin name:"
                    placeholder="plugin name"
                  />
                </div>
                <base-button
                  native-type="submit"
                  type="success"
                  class="mb-3"
                  size="lg"
                  block
                  @click.prevent="editKey(item._id, item)"
                >
                  Edit
                </base-button>
                <base-button
                  native-type="submit"
                  type="danger"
                  class="mb-3"
                  size="lg"
                  block
                  @click.prevent="deleteKey(item._id, editUser._id)"
                >
                  Delete key
                </base-button>
              </form>
            </div>
          </template>
          <template v-else>
            <h2>This user don't have a keys</h2>
          </template>
          <hr />
          <base-button
            native-type="submit"
            type="warning"
            content="Cancel Edit"
            class="mb-3 my-5"
            size="lg"
            @click="edit = false"
            block
          >
            Cancel edit
          </base-button>
        </template>
      </card>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
export default {
  middleware: ["authenticated","authenticatedADM"],
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  data() {
    return {
      users: [],
      modals: {
        modal3: false,
      },
      edit: false,
      editUser: {},
    };
  },
  mounted() {
    this.onGetUsers();
  },
  methods: {
    onEdit(id) {
      setTimeout(() => {
        this.edit = true;
      }, 200);
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          _id: id,
        },
      };

      this.$axios
        .get("http://localhost:3001/api/user", config)
        .then((res) => {
          console.log(res.data);
          this.editUser = res.data.data;
          console.log(this.editUser.keys.length);
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    deleteKey(keyId, userId) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          keyId: keyId,
          userId: userId,
        },
      };
      this.$axios
        .delete("http://localhost:3001/api/admin/key", config)
        .then((res) => {
          console.log(res.data);
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "You has delete the key!",
            });
            this.onEdit(userId)
            this.onGetUsers()
            return;
          }
        })
        .catch((err) => {
          console.log(err.response);
        });
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
            user.edit = false;
          });
          this.users = res.data.data;
          console.log(this.users);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    editKey(id, body) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          id: id,
        },
      };
      this.$axios
        .put("http://localhost:3001/api/admin/key", body, config)
        .then((res) => {
          console.log(res.data);
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "You has edit the key!",
            });
            return;
          }
        })
        .catch((err) => {
          console.log(err.response);
          this.$notify({
            type: "warning",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Cannot edit a key",
          });
          return;
        });
    },
  },
};
</script>

<style>
</style>
