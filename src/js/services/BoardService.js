import { 
    collection, 
    doc, 
    getFirestore, 
    getDocs, 
    onSnapshot,
    updateDoc,
    deleteDoc,
    setDoc, 
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';


class BoardService {

    constructor({ app, user }) {
        this.nameCollection = "boards";
        this.db = getFirestore(app);
        this.user = user;
        this.eventColumns = null;
    }

    async create({ name }) {
        const messageRef = doc(this.db, "users", this.user.uid, this.nameCollection, uuidv4());
        await setDoc(messageRef, {
            timestamp: serverTimestamp(),
            name,
        });
    }

    async setTask({board, column}, { id = null, title, description }){

        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board,
            "columns", column
        );

        await updateDoc(messageRef, {
            tasks: arrayUnion({
                id: id ? id : uuidv4(),
                title,
                description,
            }),
        });
    }

    async deleteTask({board, column}, { id, title, description }){

        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board,
            "columns", column
        );

        await updateDoc(messageRef, {
            tasks: arrayRemove({
                id,
                title,
                description
            }),
        });
    }

    async updateTask({board, column, state}, { id, title, description }){
        
        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board,
            "columns", column
        );

        const tasksColumn = state.find(item => item.id === column);
        const tasks = tasksColumn.data.tasks.map((item)=>{
            if(item.id === id){
                return {
                    id,
                    title,
                    description
                }
            }
            return item;
        });

        await updateDoc(messageRef, {
            tasks: tasks
        });
    }

    async updateColumn({board, column}, {name}){

        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board,
            "columns", column
        );

        await updateDoc(messageRef, {
            name
        });
    }

    async updateBoard({board}, {name}){
        
        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board
        );

        await updateDoc(messageRef, {
            name
        });
    }

    async deleteColumn({board, column}){
        
        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board,
            "columns", column
        );

        await deleteDoc(messageRef);
    }

    async deleteBoard({board}){
        
        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, board,
        );

        await deleteDoc(messageRef);
    }

    async createColumn({name, columns, column}){
        const messageRef = doc(
            this.db, "users", this.user.uid, 
            this.nameCollection, column,
            "columns", uuidv4()
        );

        await setDoc(messageRef, {
            name,
            columns,
            timestamp: serverTimestamp(),
        });
    }

    async getAll() {
        let boards = [];
        const querySnapshot = await getDocs(collection(this.db, this.nameCollection));
        querySnapshot.forEach((doc) => {
            boards.push({
                id: doc.id,
                data: doc.data()
            });
        });
        return boards;
    }

    getAllEvent(callback) {
        onSnapshot(collection(this.db, `/users/${this.user.uid}/boards`), (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({
                    id:doc.id,
                    data: doc.data()
                });
            });
            callback(data)
        });
    }

    destroyEventColumns(){
        if(this.eventColumns) this.eventColumns();
    }

    getAllColumns({board, callback}) {

        const collectionCol = collection(
            this.db, 
            `/users/${this.user.uid}/boards/${board}/columns`
        );

        const q = query(collectionCol, orderBy("timestamp", "asc"))

        this.eventColumns = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({
                    id:doc.id,
                    data: doc.data()
                });
            });
            callback(data)
        });
    }

}

export { BoardService }