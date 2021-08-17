//if the user have a token we send to index
export default function({store,redirect}){
    store.dispatch('readToken')
    if (store.state.auth) {
        if (store.state.auth.userData.rol === "ADMIN") {
            redirect('/admin')
            return
        }
        redirect('/')
    }
}