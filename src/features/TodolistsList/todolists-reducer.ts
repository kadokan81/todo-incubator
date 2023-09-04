
import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC,} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import { AppThunk } from '../../app/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addTaskAC } from './tasks-reducer';

const initialState: Array<TodolistDomainType> = []

export const todoListSlice = createSlice({
    name:'todo-slice',
    initialState:initialState,
    reducers:{
        removeTodoListAC:(state,action:PayloadAction<{id: string}>)=>{
            return state.filter(tl => tl.id != action.payload.id)
        },
        addTodoListAC:(state,action:PayloadAction<{todoList: TodolistType}>)=>{
            //immer
            state.unshift({...action.payload.todoList, filter: 'all', entityStatus: 'idle'})
            //redux
            // return [{...action.payload.todoList, filter: 'all', entityStatus: 'idle'}, ...state]
        },
        changeTodoListTitleAC :(state,action:PayloadAction<{id: string, title: string}>)=>{
               //immer
            // const index = state.findIndex(tl => tl.id === action.payload.id)
            // if(index > -1){
            //     state.splice(index, 1)
            // }
         return  state.map(tl => tl.id === action.payload.id ? {...tl, title: action.payload.title} : tl)
        },
        changeTodoListFilterAC :(state,action:PayloadAction<{id: string, filter: FilterValuesType}>)=>{
            return state.map(tl => tl.id === action.payload.id ? {...tl, filter: action.payload.filter} : tl)
        },
        changeTodoListEntityStatusAC:(state,action:PayloadAction<{id: string, status: RequestStatusType}>)=>{
            return state.map(tl => tl.id === action.payload.id ? {...tl, entityStatus: action.payload.status} : tl)
        },
        setTodoListsAC:(state,action:PayloadAction<{todoLists: Array<TodolistType>}>)=>{
            return action.payload.todoLists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        },
    },

})

export const todolistsReducer = todoListSlice.reducer
export const {  
    removeTodoListAC,addTodoListAC,
     changeTodoListTitleAC,changeTodoListEntityStatusAC,
     setTodoListsAC,changeTodoListFilterAC } = todoListSlice.actions

// export const todolistsReducerOld = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
//     switch (action.type) {
//         case 'REMOVE-TODOLIST':
//             return state.filter(tl => tl.id != action.id)
//         case 'ADD-TODOLIST':
//             return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]

//         case 'CHANGE-TODOLIST-TITLE':
//             return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
//         case 'CHANGE-TODOLIST-FILTER':
//             return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
//         case 'CHANGE-TODOLIST-ENTITY-STATUS':
//             return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
//         case 'SET-TODOLISTS':
//             return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
//         default:
//             return state
//     }
// }

// action    type: 'CHANGE-TODOLIST-TITLE',

// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        dispatch(setAppStatusAC({status:'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodoListsAC({todoLists:res.data}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(setAppStatusAC({status:'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(changeTodoListEntityStatusAC({id:todolistId, status:'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodoListAC({id:todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status:'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodoListAC({todoList:res.data.data.item}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodoListTitleAC({id:id,title: title}))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodoListAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodoListAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodoListsAC>;
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodoListTitleAC>
    | ReturnType<typeof changeTodoListFilterAC>
    | SetTodolistsActionType
    | ReturnType<typeof changeTodoListEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
type ThunkDispatch = Dispatch<ActionsType >
