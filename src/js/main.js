import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { firebaseConfig } from "./config/firebase-config.js";
import { LoginModel } from "./models/LoginModel.js";
 
function main() {

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    const loginModel = new LoginModel({
        auth,
        provider,
        buttonLogin: document.getElementById("button-login")
    });

    loginModel.register();
    loginModel.eventAuth();
}

main();