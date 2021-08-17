//if the user have a token we send to index
export default function({store,redirect}){
    store.dispatch('readToken')
}