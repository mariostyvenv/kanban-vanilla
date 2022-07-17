import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { firebaseConfig } from "./config/firebase-config.js";
import { LoginModel } from "./models/LoginModel.js";
import { HomeModel } from "./models/HomeModel.js";
import { Sortable } from "./libs/Sortable.js";
import { homeState } from "./state/homeState.js";

//new Sortable(document.getElementById('col-pendientes'), {
//	group: 'shared',
//	animation: 150,
//    emptyInsertThreshold: 10,
//    onMove: function (event) {
//		console.log(event)
//	},
//});
 

function main() {

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const loginModel = new LoginModel({
        auth,
        provider,
        homeState
    });

    loginModel.eventAuth(function(user){
        const homeModel = new HomeModel({loginModel, app, user, homeState});
        homeModel.hiddenLoadingScreen();
        homeModel.build();
    });

}

main();