<template>
  <div>
    <div class="row">
      <div class="col-sm-6">
        <Rtnumberchart :config="ncConfig" />
      </div>
      <div class="col-sm-6">
        <Rtnumberchart :config="moneyConfig" />
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <card type="nav-tabs" class="text-center">
          <h4 class="card-title float-left">Last Customer IPs created</h4>
          <br />
          <el-table :data="sells">
            <el-table-column
              min-width="150"
              prop="userId.name"
              label="Name"
            ></el-table-column>
            <el-table-column
              min-width="150"
              prop="time"
              label="Added"
            ></el-table-column>
            <el-table-column
              min-width="150"
              prop="keyId.IPs"
              label="IPs"
            ></el-table-column>
            <el-table-column
              min-width="150"
              prop="keyId.pluginName"
              label="Name"
            ></el-table-column>
          </el-table>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import LineChart from "@/components/Charts/LineChart";
import BarChart from "@/components/Charts/BarChart";
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    LineChart,
    BarChart,
  },
  data() {
    return {
      sells: [],
      dateNow: Date.now(),
      requestTestPlugin: [],
      requestTestPluginBoolean: true,
      keyRejected: [],
      keyRejectedBoolean: false,
      keyAproved: [],
      keyAprovedBolean: false,
      ncConfig: {
        userId: "sampleuserid",
        variableFullName: "Plugins selled",
        variable: "varname",
        variableType: "input",
        variableSendFreq: "30",
        unit: "IPs",
        class: "primary",
        column: "col-12",
        decimalPlaces: 0,
        widget: "numberchart",
        icon: "fa-user-alt",
        chartTimeAgo: 60,
        demo: false,
      },
      moneyConfig: {
        userId: "sampleuserid",
        variableFullName: "Plugins selled",
        variable: "moneyRecauded",
        variableType: "input",
        variableSendFreq: "30",
        unit: "IPs",
        class: "success",
        column: "col-12",
        decimalPlaces: 0,
        widget: "numberchart",
        icon: "fas fa-dollar-sign",
        chartTimeAgo: 60,
        demo: false,
      },
    };
  },
  methods: {
    getTimeAgo(seconds) {
      if (seconds < 0) {
        seconds = 0;
      }
      if (seconds < 59) {
        return seconds.toFixed() + " secs";
      }
      if (seconds > 59 && seconds <= 3600) {
        seconds = seconds / 60;
        return seconds.toFixed() + " min";
      }
      if (seconds > 3600 && seconds <= 86400) {
        seconds = seconds / 3600;
        return seconds.toFixed() + " hour";
      }
      if (seconds > 86400) {
        seconds = seconds / 86400;
        return seconds.toFixed() + " day";
      }
    },
    getNow() {
      this.dateNow = Date.now();
      setTimeout(() => {
        this.getNow();
      }, 1000);
    },
    getSells() {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .get("http://localhost:3001/api/admin/sells", config)
        .then((res) => {
          res.data.data.forEach((user, index, object) => {
            user.time =
              this.getTimeAgo((this.dateNow - user.time) / 1000) + " ago";
          });
          this.sells = res.data.data.reverse();
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
  },
  created() {
    this.getSells();
    this.getNow();
    this.$nuxt.$on("getSells", () => {
      console.log("gay");
      this.getSells();
    });
  },
  beforeDestroy() {
    this.$nuxt.$off("getSells");
  },
};
</script>

<style>
</style>
