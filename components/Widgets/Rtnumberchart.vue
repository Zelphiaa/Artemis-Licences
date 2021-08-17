<template>
  <card type="chart">
    <template slot="header">
      <h5 class="card-category pull-right">
        {{ getTimeAgo((nowTime - time) / 1000) }} ago
      </h5>

      <!-- <h5 class="card-category">{{ config.selectedDevice.name }} - {{ config.variableFullName }}</h5> -->

      <h3 class="card-title">
        <i
          class="fa"
          :class="[config.icon, getIconColorClass()]"
          aria-hidden="true"
          style="font-size: 30px"
        ></i>
        <span v-if="config.variable == 'useIPS'">{{useIPs}} / {{$store.state.selectedPlugin.IPs}}</span>
        <span v-if="config.variable == 'moneyRecauded'">{{totalMoney}}</span>
        <span v-else>{{ totalIPs }} {{ config.unit }}</span>

      </h3>
    </template>

    <div class="chart-area" style="height: 300px">
      <highchart
        style="height: 100%"
        v-if="isMounted"
        :options="chartOptions"
      />
    </div>
  </card>
</template>


<script>
export default {
  name: "rtnumberchart",
  props: ["config"],
  data() {
    return {
      receivedTime: 0,
      value: 0,
      useIPs: 0,
      totalMoney: 0,
      totalIPs: 0,
      time: Date.now(),
      nowTime: Date.now(),
      isMounted: false,
      class: "",
      topic: "",
      chartOptions: {
        credits: {
          enabled: false,
        },
        chart: {
          renderTo: "container",
          defaultSeriesType: "line",
          backgroundColor: "rgba(0,0,0,0)",
        },
        title: {
          text: "",
        },
        xAxis: {
          type: "datetime",
          labels: {
            style: {
              color: "#d4d2d2",
            },
          },
        },
        yAxis: {
          title: {
            text: "",
          },
          labels: {
            style: {
              color: "#d4d2d2",
              font: "11px Trebuchet MS, Verdana, sans-serif",
            },
          },
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false,
            },
            pointStart: 2010,
          },
        },
        series: [
          {
            name: "",
            data: [],
            useIps: null,
            color: "#e14eca",
          },
        ],
        legend: {
          itemStyle: {
            color: "#d4d2d2",
          },
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  layout: "horizontal",
                  align: "center",
                  verticalAlign: "bottom",
                },
              },
            },
          ],
        },
      },
    };
  },
  watch: {
    config: {
      immediate: true,
      deep: true,
      handler() {
        setTimeout(() => {
          // this.$nuxt.off(this.topic + "/sdata", this.procesReceivedData)
          // this.topic = this.config.userId + '/' + this.config.selectedDevice.dId + '/' + this.config.variable
          this.chartOptions.series[0].data = [];
          this.getChartData(this.$store.state.selectedPlugin._id);
          this.$nuxt.$on('getChartKeyUse', this.getChartData)
          this.chartOptions.series[0].name =
            this.config.variableFullName + " " + this.config.unit;
          this.updateColorClass();
          window.dispatchEvent(new Event("resize"));
        });
      },
    },
  },
  mounted() {
    this.getNow();
    this.updateColorClass();
  },
  methods: {
    updateColorClass() {
      var c = this.config.class;
      if (c == "success") {
        this.chartOptions.series[0].color = "#00f2c3";
      }
      if (c == "primary") {
        this.chartOptions.series[0].color = "#e14eca";
      }
      if (c == "warning") {
        this.chartOptions.series[0].color = "#ff8d72";
      }
      if (c == "danger") {
        this.chartOptions.series[0].color = "#fd5d93";
      }
      this.chartOptions.series[0].name =
        this.config.variableFullName + " " + this.config.unit;
    },
    getChartData() {
      if (this.config.demo) {
        this.chartOptions.series[0].data = [
          [1606659071668, 22],
          [1606659072668, 27],
          [1606659073668, 32],
          [1606659074668, 7],
        ];
        this.isMounted = true;
        return;
      }
      if (this.config.variable == "useIPS") {
        let config = {
          headers: {
            token: this.$store.state.auth.token,
          },
          params: {
            keyId: this.$store.state.selectedPlugin._id
          }
        }
        this.$axios.get("http:localhost:3001/api/get-use-keys",config)
        .then((res) => {
          this.chartOptions.series[0].data = [];
          this.totalIPs = 0
          res.data.data.forEach((element) => {
            var aux = []
            aux.push(element.time + new Date().getTimezoneOffset() * 60 * 1000 * -1)
            aux.push(element.useIPs)
            aux.push(element.totalIPs)
            this.chartOptions.series[0].data.push(aux)
          })
          this.useIPs = res.data.data.slice(-1).pop().useIPs
          this.totalIPs = res.data.data.slice(-1).pop().totalIPs
          this.isMounted = true;
          return;
        })
        .catch((err) => {
        })
        return
      }
      if (this.config.variable == "moneyRecauded") {
        let config = {
          headers: {
            token: this.$store.state.auth.token
          },
        }

        this.$axios.get("http:localhost:3001/api/get-money-recauded", config)
        .then(res => {
          res.data.data.forEach((element) => {
            var aux = []
            aux.push(element.time + new Date().getTimezoneOffset() * 60 * 1000 * -1)
            aux.push(element.money)
            this.chartOptions.series[0].data.push(aux)
          })
          let sum = []
          let myTotal = 0
          this.chartOptions.series[0].data.forEach((element) => {
            sum.push(element[1]);
          });
          for (var i = 0, len = sum.length; i < len; i++) {
            myTotal += sum[i]; // Iterate over your first array and then grab the second element add the values up
          }
          this.getTimeAgo(Date.now())
          this.totalMoney = myTotal;
          this.isMounted = true;
        })
        .catch(err => {
        })
        return
      }
      const axiosHeaders = {
        headers: {
          token: $nuxt.$store.state.auth.token,
        },
      };
      this.$axios
        .get("http:localhost:3001/api/get-small-charts-data", axiosHeaders)
        .then((res) => {
          this.chartOptions.series[0].data = [];
          const data = res.data.data;
          data.forEach((element) => {
            var aux = [];
            aux.push(
              element.time + new Date().getTimezoneOffset() * 60 * 1000 * -1
            );
            aux.push(element.IPs);
            this.chartOptions.series[0].data.push(aux);
          });
          let sum = [];
          let myTotal = 0;
          this.chartOptions.series[0].data.forEach((element) => {
            sum.push(element[1]);
          });
          for (var i = 0, len = sum.length; i < len; i++) {
            myTotal += sum[i]; // Iterate over your first array and then grab the second element add the values up
          }
          this.getTimeAgo(Date.now())
          this.totalIPs = myTotal;
          this.isMounted = true;
          return;
        })
        .catch((e) => {
          return;
        });
    },
    getIconColorClass() {
      if (this.config.class == "success") {
        return "text-success";
      }
      if (this.config.class == "primary") {
        return "text-primary";
      }
      if (this.config.class == "warning") {
        return "text-warning";
      }
      if (this.config.class == "danger") {
        return "text-danger";
      }
    },
    procesReceivedData(data) {
      this.time = Date.now();
      this.value = data.value;
      setTimeout(() => {
        if (data.save == 1) {
          this.getChartData();
        }
      });
    },
    getNow() {
      this.nowTime = Date.now();
      setTimeout(() => {
        this.getNow();
      }, 1000);
    },
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
  },
};
</script>
