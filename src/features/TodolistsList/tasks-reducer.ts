
import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistsActionType, addTodoListAC, removeTodoListAC, setTodoListsAC} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, TodolistType, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppDispatch, AppRootStateType} from '../../app/store'
import {setAppErrorAC, setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'



const initialState: TasksStateType = {}

const taskSlice = createSlice({
    name:'tasksSlice',
    initialState:initialState,
    reducers:{ 
        removeTaskAC:(state,action:PayloadAction<{taskId: string, todoListId: string}>)=>{
            return {...state, [action.payload.todoListId]: state[action.payload.todoListId].filter(t => t.id != action.payload.taskId)}
        },
        addTaskAC:(state, action:PayloadAction<{task: TaskType}>) => {
            return {...state, [action.payload.task.todoListId]: [action.payload.task, ...state[action.payload.task.todoListId]]}
        },
        updateTaskAC:(state, action:PayloadAction<{taskId: string, model: UpdateDomainTaskModelType, todoListId: string}>) => {
            return {
                ...state,
                [action.payload.todoListId]: state[action.payload.todoListId]
                    .map(t => t.id === action.payload.taskId ? {...t, ...action.payload.model} : t)
            }
        },
        setTasksAC :(state, action:PayloadAction<{tasks: Array<TaskType>, todoListId: string}>) => {
            return {...state, [action.payload.todoListId]: action.payload.tasks}
            },
        
        
        
    },
extraReducers:(builder)=>{
    builder.addCase(addTodoListAC,(state,action:PayloadAction<{todoList: TodolistType}>)=>{
        state[action.payload.todoList.id] = []
    });
    builder.addCase(removeTodoListAC, (state,action:PayloadAction<{id: string}>)=>{
        delete state[action.payload.id]
    });
    builder.addCase(setTodoListsAC, (state,action:PayloadAction<{todoLists: Array<TodolistType>}>)=>{
       action.payload.todoLists.forEach((tl:any)=>{
        state[tl.id] =[]
       })
    })


  
}
       
})
export const tasksReducer = taskSlice.reducer

export const {removeTaskAC,addTaskAC,updateTaskAC,setTasksAC }=taskSlice.actions

// export const tasksReducerOld = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//     switch (action.type) {
//         case 'REMOVE-TASK':
//             return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
//         case 'ADD-TASK':
//             return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
//         case 'UPDATE-TASK':
//             return {
//                 ...state,
//                 [action.todolistId]: state[action.todolistId]
//                     .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
//             }
        // case 'ADD-TODOLIST':
        //     return {...state, [action.todolist.id]: []}
        // case 'REMOVE-TODOLIST':
        //     const copyState = {...state}
        //     delete copyState[action.id]
        //     return copyState
        // case 'SET-TODOLISTS': {
        //     const copyState = {...state}
        //     action.todolists.forEach(tl => {
        //         copyState[tl.id] = []
        //     })
        //     return copyState
        // }
        // case 'SET-TASKS':
        //     return {...state, [action.todolistId]: action.tasks}
//         default:
//             return state
//     }
// }

// actions
export const removeTaskACOld = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskACold = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskACold = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksACold = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: AppDispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({ tasks:tasks,todoListId: todolistId}))
            dispatch(setAppStatusAC({status:'succeeded'}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId:taskId,todoListId: todolistId})
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch:AppDispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC({task:task})
                dispatch(action)
                dispatch(setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId:taskId,model: domainModel,todoListId: todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>
type ThunkDispatch = Dispatch<ActionsType>
