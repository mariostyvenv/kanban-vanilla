import { BoardService } from "../services/BoardService.js";

class HomeModel {
    constructor({ loginModel, app, user, homeState }) {
        this.userProfile = document.getElementById("user-profile");
        this.loadingScreen = document.getElementById("loading-screen");
        this.createBoard = document.getElementById("create-board");
        this.cancelCreateBoard = document.getElementById("cancel-create-board");
        this.createBoardScreen = document.getElementById("create-board-screen");
        this.saveCreateBoard = document.getElementById("save-create-board");
        this.inputAddBoard = document.getElementById("input-add-board");
        this.listBoards = document.getElementById("list-boards");
        this.newList = document.getElementById("new-list");
        this.dashboardList = document.getElementById("dashboard-list");
        this.titleBoard = document.getElementById("title-board");
        this.colsKanban = document.getElementById("cols-kanban");
        this.deleteBoard = document.getElementById("delete-board");
        this.loginModel = loginModel;
        this.user = user;
        this.boardSevice = new BoardService({ app, user:this.user });
        this.homeState = homeState;
    }

    hiddenLoadingScreen() {
        this.loadingScreen.classList.add("hidden");
    }

    postRender() {
        this.buttonPowerOff = document.getElementById("power-off");
    }

    populateUser() {
        this.userProfile.innerHTML = `
        <div class="flex items-center truncate pr-1">
            <img class="inline-block h-10 w-10 rounded-full"
                src="${this.user.photoURL}" alt="" />
            <div class="pl-2 truncate">
                <p id="name-user" class="text-sm font-semibold leading-none truncate">${this.user.displayName}</p>
                <p id="email-user" class="text-sm font-light text-gray-500 truncate">${this.user.email}</p>
            </div>
        </div>
        <button id="power-off" class="flex items-center bg-red-300 rounded px-2 hover:bg-red-400">
            <i class="text-lg material-icons">power_settings_new</i>
        </button>
        `;
    }

    removeBoardItems() {
        const boxes = document.querySelectorAll('.board-item');
        boxes.forEach(box => {
            box.remove();
        });
    }

    drawBoard({boardSevice, homeState, dashboardList, titleBoard, event = null}){
        let id = "";
        if(event){
            id = event.currentTarget.dataset.key;
        }else{
            id = homeState.boards[0].id;
        }
        homeState.board = homeState.boards.find(item => item.id === id);
        dashboardList.classList.remove("hidden");
        titleBoard.innerHTML = homeState.board.data.name;
        boardSevice.destroyEventColumns();
        boardSevice.getAllColumns({board:id, callback: (data)=>{
            this.colsKanban.innerHTML = '';
            for (const col of data) {
                this.colsKanban.insertAdjacentHTML('beforeend', `
                    <div class="w-64 bg-slate-100 mt-8 p-4 rounded-3xl mr-4 max-h-full">
                        <div class="flex items-center justify-between">
                            <div class="flex truncate">
                                <p class="text-base font-bold truncate pr-4">${col.data.name}</p>
                                <p class="text-base font-bold text-gray-400 pr-2">2</p>
                            </div>
                            <div class="flex">
                                <i class="mr-1 cursor-pointer text-lg material-icons font-bold text-black">delete</i>
                                <i class="mr-1 cursor-pointer text-lg material-icons font-bold text-black">edit</i>
                                <i class="mr-1 cursor-pointer text-lg material-icons font-bold text-black">add</i>
                            </div>
                        </div>
                        <div id="col-pendientes" class="flex flex-col mt-4 max-h-96 overflow-auto">
                            <div class="w-full bg-white rounded-xl p-3 mt-2 drop-shadow-md">
                                <p class="text-base font-bold">Tarea 1</p>
                                <p class="pt-2 text-sm leading-none">Esta es una descripción larga de las cosas
                                    pendientes por hacer.</p>
                            </div>
                        </div>
                    </div>
                `);
            }

        }});
    }

    addEventButtonBoard({board}){
        const item = document.getElementById(`board-${board.id}`);
        item.addEventListener("click", (event) =>{
            this.drawBoard({
                homeState: this.homeState,
                dashboardList: this.dashboardList,
                titleBoard: this.titleBoard,
                boardSevice: this.boardSevice,
                event
            });
        });
    }

    drawBoards(data) {
        this.removeBoardItems();
        for (const board of data) {
            this.listBoards.insertAdjacentHTML('beforeend', `
            <li id="board-${board.id}" data-key="${board.id}" data-name="${board.data.name}" class="board-item cursor-pointer font-medium flex justify-between text-gray-500 hover:bg-green-300 hover:text-green-900 hover:font-black p-2 rounded">
                <div class="flex items-center">
                    <i class="text-lg material-icons pr-2">view_kanban</i>
                    <p class="text-sm">${board.data.name}</p>
                </div>
                <i class="material-icons pr-2">chevron_right</i>
            </li>
            `);
            this.addEventButtonBoard({board})
        }
    }

    async populateBoards() {
        const data = await this.boardSevice.getAll();
        this.drawBoards(data);
    }

    hiddenCreateBoard() {
        this.createBoardScreen.classList.add("hidden");
    }

    registerEvents() {

        this.newList.addEventListener("click", async (event) =>{
            await this.boardSevice.createColumn({
                column: this.homeState.board.id,
                name:"Pendiente",
                columns:[]
            })
        });

        this.buttonPowerOff.addEventListener("click", (event) => {
            this.loginModel.signOut();
        });

        this.createBoard.addEventListener("click", (event) => {
            this.createBoardScreen.classList.remove("hidden");
        });

        this.cancelCreateBoard.addEventListener("click", (event) => {
            this.hiddenCreateBoard();
        });

        this.saveCreateBoard.addEventListener("click", async (event) => {
            const text = this.inputAddBoard.value;
            if (text.length > 0) {
                this.inputAddBoard.classList.remove("border-2");
                this.inputAddBoard.classList.remove("border-rose-500");
                this.saveCreateBoard.innerHTML = `<i class="text-lg material-icons animate-spin ">refresh</i>`;
                this.saveCreateBoard.disabled = true;
                await this.boardSevice.create({ name: text });
                this.inputAddBoard.value = "";
                this.hiddenCreateBoard();
                this.saveCreateBoard.disabled = false;
                this.saveCreateBoard.innerHTML = `<i class="text-lg material-icons ">done</i>`;
            } else {
                this.inputAddBoard.classList.add("border-2")
                this.inputAddBoard.classList.add("border-rose-500")
            }
        });

        this.deleteBoard.addEventListener("click", async (event) => {
            
        });
    }

    build() {
        this.populateUser();
        this.boardSevice.getAllEvent((data) => {
            this.homeState.boards = data;
            this.drawBoards(data);
            this.drawBoard({
                homeState: this.homeState,
                dashboardList: this.dashboardList,
                titleBoard: this.titleBoard,
                boardSevice: this.boardSevice
            });
        });
        this.postRender();
        this.registerEvents();
    }
}

export { HomeModel }