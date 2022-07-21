import { BoardService } from "../services/BoardService.js";
import { Sortable } from "../libs/Sortable.js";

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
        this.boardSevice = new BoardService({ app, user: this.user });
        this.homeState = homeState;
        this.columnsState = [];
        this.isDragging = false;
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

    drawBoard({ boardSevice, homeState, dashboardList, titleBoard, event = null }) {
        
        if(homeState.boards.length === 0){
            dashboardList.classList.add("hidden");
            return;
        }
        let id = "";

        if (event) {
            id = event.currentTarget.dataset.key;
        } else {
            id = homeState.boards[0].id;
        }


        homeState.board = homeState.boards.find(item => item.id === id);
        dashboardList.classList.remove("hidden");
        titleBoard.value = homeState.board.data.name;
        boardSevice.destroyEventColumns();

        boardSevice.getAllColumns({
            board: id, callback: (data) => {
                this.columnsState = data;
                this.colsKanban.innerHTML = '';
                for (const col of data) {

                    let taskColumns = "";
                    let countTask = 0;

                    if (col.data.tasks) {
                        countTask = col.data.tasks.length;

                        for (const tk of col.data.tasks) {
                            taskColumns += `
                            <div class="flex flex-col cursor-grabbing" data-board="${id}" data-column="${col.id}" data-task="${tk.id}">
                                <div class="w-60 bg-white rounded-xl p-3 mt-2 drop-shadow-md" id="task-${tk.id}" tabindex="0" data-board="${id}" data-column="${col.id}" data-task="${tk.id}" >
                                    <p class="text-base font-bold">${tk.title}</p>
                                    <p class="pt-2 text-sm leading-none">${tk.description}</p>
                                </div>
                                <div id="task-form-${tk.id}" class="hidden w-full bg-white mt-4 rounded-xl p-3 mt-2 drop-shadow-md">
                                    <form class="flex flex-col">
                                        <input id="title-form-task-${tk.id}" type="text" class="text-base font-bold p-1 bg-white" placeholder="Título..." value="${tk.title}">
                                        <textarea id="desc-form-task-${tk.id}" class="text-sm leading-none p-1" placeholder="Descripción..." rows="3">${tk.description}</textarea>
                                        <div class="flex mt-2">
                                            <button type="button" id="update-task-${tk.id}" data-board="${id}" data-column="${col.id}" data-task="${tk.id}" class="w-full p-1 mr-1 rounded bg-green-300 hover:bg-green-400">
                                                <i class="text-lg material-icons ">done</i>
                                            </button>
                                            <button type="button" id="delete-task-${tk.id}" data-board="${id}" data-column="${col.id}" data-task="${tk.id}" class="p-1 mr-1 rounded bg-red-300 hover:bg-red-400">
                                            <i class="text-lg material-icons">delete</i>
                                            </button>
                                            <button type="button" id="close-task-${tk.id}" data-board="${id}" data-column="${col.id}" data-task="${tk.id}" class="p-1 rounded bg-red-300 hover:bg-red-400">
                                                <i class="text-lg material-icons">close</i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        `;
                        }
                    }

                    this.colsKanban.insertAdjacentHTML('beforeend', `
                    <div class="bg-slate-100 mt-8 p-4 rounded-3xl mr-4 max-h-full">
                        <div class=" w-60 flex items-center justify-between min-w-fit">
                            <div class="flex truncate">
                                <input id="column-title-${col.id}" data-column="${col.id}" class="w-3/5 bg-slate-100 text-base font-bold truncate" value="${col.data.name}">
                                
                            </div>
                            <div class="flex items-center">
                                <p class="text-base font-bold text-gray-400 pr-2">${countTask}</p>
                                <i id="button-delete-column-${col.id}" data-column="${col.id}" data-board="${col.id}" class="mr-1 cursor-pointer text-lg material-icons font-bold text-black">delete</i>
                                <i id="button-add-task-${col.id}" data-column="${col.id}" class="mr-1 cursor-pointer text-lg material-icons font-bold text-black">add</i>
                            </div>
                        </div>
                        <div id="col-drag-${col.id}" data-column="${col.id}" class="flex flex-col mt-4 max-h-96 overflow-auto">
                            ${taskColumns}
                            <div class="hidden w-full bg-white mt-4 rounded-xl p-3 mt-2 drop-shadow-md" id="component-add-task-${col.id}">
                                <form class="flex flex-col" data-board="${id}" data-column="${col.id}" id="form-add-task-${col.id}">
                                    <input name="title" type="text" class="text-base font-bold p-1 bg-white" placeholder="Título...">
                                    <textarea name="description" class="text-sm leading-none p-1" placeholder="Descripción..." rows="2"></textarea>
                                    <div class="flex mt-2">
                                        <button type="submit" class="w-full p-1 mr-1 rounded bg-green-300 hover:bg-green-400">
                                            <i class="text-lg material-icons ">done</i>
                                        </button>
                                        <button id="button-close-task-${col.id}" data-column="${col.id}" class="p-1 rounded bg-red-300 hover:bg-red-400">
                                            <i class="text-lg material-icons">close</i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    `);

                    new Sortable(document.getElementById(`col-drag-${col.id}`), {
                        group: 'shared',
                        animation: 150,
                        direction: 'horizontal',
                        onUnchoose: async (event) => {

                            const taskCol = event.item.dataset.task;
                            const colFrom = event.from.dataset.column;
                            const colTo = event.to.dataset.column;
                            const colSelect = this.columnsState.find(item => item.id === colFrom);
                            const task = colSelect.data.tasks.find(item => item.id === taskCol);

                            if(colFrom === colTo) return;
                            try {
                                let allPromises = [];

                                allPromises.push(this.boardSevice.setTask({board:this.homeState.board.id, column:colTo}, {
                                    title:task.title, 
                                    description:task.description
                                }));
                                
                                allPromises.push(this.boardSevice.deleteTask({board:this.homeState.board.id, column:colFrom}, {
                                    id:taskCol,
                                    title: task.title,
                                    description:task.description
                                }));

                                await Promise.all(allPromises);
 
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    });

                    if (col.data.tasks) {
                        for (const tk of col.data.tasks) {

                            document.getElementById(`task-${tk.id}`).addEventListener("click", (event) => {
                                const task = event.currentTarget.dataset.task;
                                document.getElementById(`task-${task}`).classList.toggle("hidden");
                                document.getElementById(`task-form-${task}`).classList.toggle("hidden");
                            });

                            document.getElementById(`close-task-${tk.id}`).addEventListener("click", (event) => {
                                const task = event.currentTarget.dataset.task;
                                document.getElementById(`task-${task}`).classList.toggle("hidden");
                                document.getElementById(`task-form-${task}`).classList.toggle("hidden");
                            });

                            document.getElementById(`delete-task-${tk.id}`).addEventListener("click", (event) => {
                                const board = event.currentTarget.dataset.board;
                                const column = event.currentTarget.dataset.column;
                                const task = event.currentTarget.dataset.task;
                                const title = document.getElementById(`title-form-task-${task}`).value;
                                const description = document.getElementById(`desc-form-task-${task}`).value;
                                this.boardSevice.deleteTask({ board, column }, { id: task, title, description });
                            });

                            document.getElementById(`update-task-${tk.id}`).addEventListener("click", (event) => {
                                const board = this.homeState.board.id;
                                const column = event.currentTarget.dataset.column;
                                const task = event.currentTarget.dataset.task;
                                const title = document.getElementById(`title-form-task-${task}`).value;
                                const description = document.getElementById(`desc-form-task-${task}`).value;
                                this.boardSevice.updateTask({ board, column, state: this.columnsState }, { id: task, title, description });
                            });
                        }
                    }

                    const eventForm = document.getElementById(`form-add-task-${col.id}`);
                    const eventButtonAdd = document.getElementById(`button-add-task-${col.id}`);
                    const eventButtonClose = document.getElementById(`button-close-task-${col.id}`);
                    const eventInputColumn = document.getElementById(`column-title-${col.id}`);
                    const eventDeleteColumn = document.getElementById(`button-delete-column-${col.id}`);

                    eventForm.addEventListener("submit", (event) => {
                        event.preventDefault();
                        const board = event.currentTarget.dataset.board;
                        const column = event.currentTarget.dataset.column;
                        const title = event.target[0].value;
                        const description = event.target[1].value;

                        this.boardSevice.setTask({ board, column }, {
                            title,
                            description
                        });
                    });

                    eventButtonAdd.addEventListener("click", (event) => {
                        const column = event.currentTarget.dataset.column;
                        const element = document.getElementById(`component-add-task-${column}`);
                        element.classList.remove("hidden");
                    });

                    eventButtonClose.addEventListener("click", (event) => {
                        event.preventDefault();
                        const column = event.currentTarget.dataset.column;
                        const element = document.getElementById(`component-add-task-${column}`);
                        element.classList.add("hidden");
                    });

                    eventInputColumn.addEventListener("change", (event) => {
                        const board = this.homeState.board.id;
                        const column = event.currentTarget.dataset.column;
                        const textValue = event.target.value;
                        this.boardSevice.updateColumn({ board, column }, { name: textValue });
                    });

                    eventDeleteColumn.addEventListener("click", async (event) => {
                        const board = this.homeState.board.id;
                        const column = event.currentTarget.dataset.column;
                        await this.boardSevice.deleteColumn({ board, column })
                    });
                }

            }
        });
    }

    addEventButtonBoard({ board }) {
        const item = document.getElementById(`board-${board.id}`);
        item.addEventListener("click", (event) => {
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
                <div class="flex items-center truncate">
                    <i class="text-lg material-icons pr-2">view_kanban</i>
                    <p class="text-sm truncate">${board.data.name}</p>
                </div>
                <i class="material-icons pr-2">chevron_right</i>
            </li>
            `);
            this.addEventButtonBoard({ board })
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

        this.newList.addEventListener("click", async (event) => {
            await this.boardSevice.createColumn({
                column: this.homeState.board.id,
                name: "To Do...",
                columns: []
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
            for (const iterator of this.columnsState) {
                console.log(iterator)
                this.boardSevice.deleteColumn({board:this.homeState.board.id, column: iterator.id});
            }
            this.boardSevice.deleteBoard({board: this.homeState.board.id});
        });

        this.titleBoard.addEventListener("change", async (event) => {
            const title = event.target.value;
            const board = this.homeState.board.id;
            await this.boardSevice.updateBoard({ board }, { name: title });
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