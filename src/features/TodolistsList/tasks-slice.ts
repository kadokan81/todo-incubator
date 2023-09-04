import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { TaskType } from "../../api/todolists-api"



const initialState: TasksStateType = {}

const tasksSlice= createSlice({
    name:'tasks-slice',
    initialState:initialState,
    reducers:{
        removeTaskAC:(state, action: PayloadAction<{todoListId:string}>)=>{
            // state[action.payload.todoListId]: state[action.payload.todoListId].filter((el)=> el.id !==action.payload.todoListId)
        },
        addTaskAC:(state, action: PayloadAction<any>)=>{},
        updateTaskAC:(state, action: PayloadAction<any>) => {},
        setTasksAC:(state, action: PayloadAction<any>)=>{}


    }
})




export type TasksStateType = {
    [key: string]: Array<TaskType>
}