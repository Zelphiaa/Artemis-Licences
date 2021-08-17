<template>
  <div>
    <div>
      <base-input
        addon-left-icon="fas fa-search"
        label="Search Product..."
        type="text"
        placeholder="User"
      ></base-input>
      <hr />
      <div class="row">
        <card
          style="width: 20rem"
          v-for="(item, index) in plugins"
          :key="index"
          class="mx-4"
        >
        <figure style="margin:0px" v-if="item.price < item.oldPrice">
          <img
            slot="image"
            class="card-img-top"
            :src="`../${item.photo}`"
            alt="Card image cap"
            width="300px"
            height="300"
          />
          <div class="badge-overlay">
                <!-- Change Badge Position, Color, Text here-->
                <span class="top-left badge orange">Sale {{Math.ceil((item.price * 100) / item.oldPrice)}}% Off</span>
            </div>
        </figure>
        <figure style="margin:0px" v-else>
          <img
            slot="image"
            class="card-img-top"
            :src="`../${item.photo}`"
            alt="Card image cap"
            width="300px"
            height="300"
          />
        </figure>
          <div class="my-3">
            <h3 class="card-title" style="display: inline">${{ item.price }}</h3>
            <br>
            <star-rating
            :rating="item.averageRating"
            :show-rating="false"
            :glow="1"
            :border-width="1"
            :rounded-corners="true"
            :read-only="true"
            :star-size="18"
          ></star-rating>
          </div>
          <p class="card-text">
            {{ item.title }}
          </p>
          <div class="row">
            <nuxt-link
              :to="`/admin/market/${item._id}`"
              class="btn btn-primary col-md-5 mx-2"
              >See more</nuxt-link
            >
            <a
              @click.prevent="deletePlugin(item._id)"
              style="color: white"
              class="btn btn-danger col-md-5 mx-2"
              >Delete</a
            >
          </div>
        </card>
      </div>
      <div class="row">
        <div class="col-4"></div>
        <div class="col-4 py-5">
          <nav aria-label="Page navigation example">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: actPage === 1 }">
                <router-link
                  class="page-link"
                  :to="{ query: { pagina: actPage - 1 } }"
                  >Anterior</router-link
                >
              </li>
              <li
                class="page-item"
                :class="{ active: actPage === index + 1 }"
                v-for="(item, index) in cantidadPaginas"
                :key="index"
              >
                <router-link
                  :to="{ query: { pagina: index + 1 } }"
                  class="page-link"
                  >{{ index + 1 }}</router-link
                >
              </li>
              <li
                class="page-item"
                :class="{ disabled: actPage === cantidadPaginas }"
              >
                <router-link
                  class="page-link"
                  :to="{ query: { pagina: actPage + 1 } }"
                  >Siguiente</router-link
                >
              </li>
            </ul>
          </nav>
        </div>
        <div class="col-4"></div>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from "vue-star-rating"
export default {
  middleware: ["authenticated", "authenticatedADM"],
  components: {
    StarRating
  },
  data() {
    return {
      plugins: [],
      pluginsTotal: 0,
      limit: 8,
      actPage: 1,
      defaultPagination: 1,
    };
  },
  watch: {
    "$route.query.pagina": {
      immediate: true,
      handler(pagina) {
        pagina = parseInt(pagina) || 1;
        console.log("pagina", pagina);
        this.getPlugins(pagina);
        this.actPage = pagina;
      },
    },
  },
  mounted() {
    this.getPlugins();
    setTimeout(() => {
      console.log(this.plugins[0].photo);
    }, 1000);
  },
  computed: {
    cantidadPaginas() {
      return Math.ceil(this.pluginsTotal / this.limit);
    },
  },
  methods: {
    getPlugins(pagina) {
      let skip = (pagina - 1) * this.limit;
      this.$axios
        .get(`http://localhost:3001/api/plugins-pagination?skip=${skip}&limit=${this.limit}`)
        .then((res) => {
          console.log(res.data);
          this.plugins = res.data.plugins;
          this.pluginsTotal = res.data.pluginsTotal;
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
    deletePlugin(pluginId) {
      let config = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          id: pluginId,
        },
      };
      this.$axios
        .delete("http://localhost:3001/api/plugin", config)
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "You has deleted a plugin",
            });
            this.getPlugins();
            return;
          }
        })
        .catch((err) => {
          console.log(err.response);
        });
    },
  },
};
</script>


<style>
*, html {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}
figure { margin:0px;}
img {max-width:100%;}
/* ================== Badge Products CSS ========================*/

.products {
    max-width: 100%;
    margin: 0 auto;
}

.products ul {
    margin: 0px;
    text-align: center;
}

.products ul li {
    width: 320px;
    height: 213px;
    background: #f8f8f8;
    display: inline-block;
    position: relative;
    margin: 15px;
    padding: 0px;
    box-sizing: border-box;
}

/* ================== Badge Overlay CSS ========================*/
.badge-overlay {
    position: absolute;
    left: 0%;
    top: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 100;
    -webkit-transition: width 1s ease, height 1s ease;
    -moz-transition: width 1s ease, height 1s ease;
    -o-transition: width 1s ease, height 1s ease;
    transition: width 0.4s ease, height 0.4s ease
}

/* ================== Badge CSS ========================*/
.badge {
    margin: 0;
    padding: 0;
    color: white;
    padding: 10px 10px;
    font-size: 15px;
    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
    line-height: normal;
    text-transform: uppercase;
    background: #ed1b24;
}

.badge::before, .badge::after {
    content: '';
    position: absolute;
    top: 0;
    margin: 0 -1px;
    width: 100%;
    height: 100%;
    background: inherit;
    min-width: 55px
}

.badge::before {
    right: 100%
}

.badge::after {
    left: 100%
}

/* ================== Badge Position CSS ========================*/
.top-left {
    position: absolute;
    top: 0;
    left: 0;
    -ms-transform: translateX(-30%) translateY(0%) rotate(-45deg);
    -webkit-transform: translateX(-30%) translateY(0%) rotate(-45deg);
    transform: translateX(-30%) translateY(0%) rotate(-45deg);
    -ms-transform-origin: top right;
    -webkit-transform-origin: top right;
    transform-origin: top right;
}

.top-right {
    position: absolute;
    top: 0;
    right: 0;
    -ms-transform: translateX(30%) translateY(0%) rotate(45deg);
    -webkit-transform: translateX(30%) translateY(0%) rotate(45deg);
    transform: translateX(30%) translateY(0%) rotate(45deg);
    -ms-transform-origin: top left;
    -webkit-transform-origin: top left;
    transform-origin: top left;
}

.bottom-left {
    position: absolute;
    bottom: 0;
    left: 0;
    -ms-transform: translateX(-30%) translateY(0%) rotate(45deg);
    -webkit-transform: translateX(-30%) translateY(0%) rotate(45deg);
    transform: translateX(-30%) translateY(0%) rotate(45deg);
    -ms-transform-origin: bottom right;
    -webkit-transform-origin: bottom right;
    transform-origin: bottom right;
}

.bottom-right {
    position: absolute;
    bottom: 0;
    right: 0;
    -ms-transform: translateX(30%) translateY(0%) rotate(-45deg);
    -webkit-transform: translateX(30%) translateY(0%) rotate(-45deg);
    transform: translateX(30%) translateY(0%) rotate(-45deg);
    -ms-transform-origin: bottom left;
    -webkit-transform-origin: bottom left;
    transform-origin: bottom left;
}

.top-full {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
}

.middle-full {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    -ms-transform: translateX(0%) translateY(-50%) rotate(0deg);
    -webkit-transform: translateX(0%) translateY(-50%) rotate(0deg);
    transform: translateX(0%) translateY(-50%) rotate(0deg);
}

.bottom-full {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
}

/* ================== Badge color CSS ========================*/
.badge.red {
    background: #ed1b24;
}

.badge.orange {
    background: #fa7901;
}

.badge.pink {
    background: #ee2b8b;
}

.badge.blue {
    background: #00adee;
}

.badge.green {
    background: #b4bd00;
}


</style>
