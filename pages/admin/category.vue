<template>
  <div>
    <card>
      <form>
        <h1>Create Category</h1>
        <div class="row">
          <div class="col-12">
            <base-input
              type="text"
              placeholder="Ex. Plugin"
              label="Category"
              v-model="category"
            />
            <base-button
              block
              type="primary"
              @click.prevent="createCategory()"
              class="my-5"
              native-type="Submit"
              >Create</base-button
            >
          </div>
        </div>
      </form>
    </card>
    <card>
      <h3>Categories:</h3>
      <el-table :data="categories">
        <el-table-column
          min-width="150"
          prop="type"
          label="Name"
        ></el-table-column>
        <el-table-column min-width="150" header-align="right" label="Actions">
          <div slot-scope="{ row, $index }" class="text-right">
            <el-tooltip content="Delete" :open-delay="300" placement="top">
              <base-button
                @click="deleteCategory(row._id)"
                type="danger"
                size="sm"
                icon
              >
                <i class="tim-icons icon-simple-remove"></i>
              </base-button>
            </el-tooltip>
          </div>
        </el-table-column>
      </el-table>
    </card>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  data() {
    return {
      categories: [],
      category: "",
    };
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    createCategory() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      console.log(this.category);
      this.$axios
        .post("http://localhost:3001/api/category", { category: this.category }, config)
        .then((res) => {
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "You has created a new category!",
          });
          this.getCategories();
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    getCategories() {
      this.$axios
        .get("http://localhost:3001/api/categories")
        .then((res) => {
          this.categories = res.data.data;
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    deleteCategory(categoryId) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          categoryId: categoryId,
        },
      };
      this.$axios
        .delete("http://localhost:3001/api/category", config)
        .then((res) => {
          if (res.data.error === "Category in use. Please delete the plugins") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Category in use. Please delete the plugins",
            });
            return;
          }

          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: "You has deleted the category",
          });
          this.getCategories()
          return
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
  },
};
</script>

<style>
</style>
