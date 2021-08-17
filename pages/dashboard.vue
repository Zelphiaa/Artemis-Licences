 <template>
  <div>
    <template v-if="this.$store.state.keys.length == 0">
      You don't have plugins
    </template>
    <template v-else>
      <div class="row">
        <div class="col-md-6">
          <Rtnumberchart :config="ncConfig" />
          <card>
            <h2>
              <h2 class="text-center">
                {{ $store.state.selectedPlugin.pluginName }}
              </h2>
              <div class="row">
                <div class="col-md-6">
                  <span
                    >IPs:
                    <strong class="mx-4"
                      >{{ $store.state.selectedPlugin.useIPs }}/{{
                        $store.state.selectedPlugin.IPs
                      }}</strong
                    ></span
                  ><br />
                  <br />
                  <span
                    >Active?:
                    <strong
                      v-if="$store.state.selectedPlugin.active === true"
                      style="color: green"
                      >Yes</strong
                    >
                    <strong v-else style="color: red">No</strong>
                  </span>
                  <hr />
                  <span
                    >Key:
                    <base-button @click.prevent="changeView()" icon>
                      <i v-if="hide == true" class="fas fa-eye-slash"></i>
                      <i v-if="hide == false" class="fas fa-eye"></i>
                    </base-button>
                  </span>
                  <br />
                  <p v-if="hide" class="my-5">****-****-****-****</p>
                  <p v-else class="my-5">
                    {{ $store.state.selectedPlugin.key }}
                  </p>
                </div>
                <div class="col-md-6">
                  <div class="text-center" style="padding-top: 100px">
                    <a
                      :href="`../${$store.state.pluginDownload}`"
                      :download="`${pluginName}.jar`"
                    >
                      <button id="button-download" class="btn btn-success">
                        <i class="fas fa-download mx-2"></i> Download plugin
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </h2>
          </card>
        </div>
            </div>
          </form>
        </template>
      </card>
    </modal>
  </div>
</template>


<style>
#button-download:hover {
  color: black;
}
</style>
