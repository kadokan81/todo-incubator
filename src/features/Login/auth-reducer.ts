
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { authAPI, LoginParamsType } from '../../api/todolists-api';
import { AppDispatch } from '../../app/store';
import { setAppStatusAC } from '../../app/app-reducer';
import { handleServerAppError, handleServerNetworkError } from '../../utils/error-utils';

// slice - редьюсеры создаем с помощью функции createSlice
const authSlice = createSlice({
   // важно чтобы не дублировалось, будет в качетве приставки согласно соглашению redux ducks
   name: 'auth',
   initialState: {
       isLoggedIn: false
   },
   // состоит из подредьюсеров, каждый из которых эквивалентен одному оператору case в switch, как мы делали раньше (обычный redux)
   reducers: {
       // Объект payload. Типизация через PayloadAction
       setIsLoggedInAC: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
           // логику в подредьюсерах пишем мутабельным образом,
           // т.к. иммутабельность достигается благодаря immer.js
           state.isLoggedIn = action.payload.isLoggedIn
       }
   }
})


export const authReducer = authSlice.reducer;

export const {setIsLoggedInAC}  = authSlice.actions
// либо вот так. ❗Делаем так, в дальнейшем пригодиться 
export const authActions = authSlice.actions


// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: AppDispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({isLoggedIn:true}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = () => (dispatch: AppDispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({isLoggedIn:false}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

// types




