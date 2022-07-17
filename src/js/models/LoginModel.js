import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";

class LoginModel {

    constructor({ auth, provider, buttonLogin }) {
        this.auth = auth;
        this.provider = provider;
        this.buttonLogin = buttonLogin;
    }

    eventAuth(callback = null){
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                if(window.location.pathname === "/index.html" || window.location.pathname === "/"){
                    window.location.replace("home.html")
                }
                if(callback){
                    callback(user)
                }
            }else{
                if(window.location.pathname === "/home.html"){
                    window.location.replace("/")
                }
            }
        });
    }

    register() {
        this.buttonLogin.addEventListener("click", async (event) => {
            await this.signIn();
        })
    }

    async signIn() {
        const result = await signInWithPopup(this.auth, this.provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
    }

    signOut(){
        this.auth.signOut();
    }
}

export { LoginModel }