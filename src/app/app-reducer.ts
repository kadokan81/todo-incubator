import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import { authAPI } from "../api/todolists-api";
import { setIsLoggedInAC } from "../features/Login/auth-reducer";

export type initType={
    status: string;
    error: null | string;
    isInitialized: boolean;
}

const initialState:initType = {
    status: 'idle',
    error: null ,
    isInitialized: false
}

const appSlice = createSlice({
    name:'app',
    initialState:initialState,
    reducers:{
        setAppErrorAC:(state, action:PayloadAction<{error:null | string}>)=>{
             state.error = action.payload.error
        },
        setAppStatusAC: (state, action:PayloadAction<{status:RequestStatusType}>) => {
          state.status = action.payload.status
        },
        setAppInitializedAC:(state, action:PayloadAction<{isInitialized:boolean}>)=>{
            state.isInitialized = action.payload.isInitialized
        }
    }
})

export const initializeAppTC = () => (dispatch: AppDispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({isLoggedIn:true}));
            dispatch(setAppInitializedAC({isInitialized:true}))
        } else {

        }

        dispatch(setAppInitializedAC({isInitialized:true}))
    })
}


export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null
    // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
    isInitialized: boolean
}


export const appReducer = appSlice.reducer;
export const { setAppErrorAC, setAppStatusAC, setAppInitializedAC}= appSlice.actions

