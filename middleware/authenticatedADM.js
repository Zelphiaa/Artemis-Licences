//if the user have a token we send to index
export default function({ store, redirect }) {
  store.dispatch("readToken");
  if (store.state.auth.userData.rol === "ADMIN" && store.state.auth.userData.rol === "SUB-ADMIN") {
    return;
  }else{
    return
  }
}
