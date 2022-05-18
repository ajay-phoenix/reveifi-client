import {
    VerifyEmailActionTypes,
    VERIFY_USER_EMAIL_FAILURE,
    VERIFY_USER_EMAIL_SUCCESS,
  } from './actionTypes'
  
  export interface State {
    verifyResponse: any
  }
  
  export const initialState: State = {
    verifyResponse: null,
  }
  
  export const verifyEmailReducer = (state: State = initialState, action: VerifyEmailActionTypes) => {
    switch (action.type) {
    case VERIFY_USER_EMAIL_SUCCESS:
      return {
        ...state,
        verifyResponse: action.payload
      }
    case VERIFY_USER_EMAIL_FAILURE:
      return {
        ...state,
        
      }
  
    default:
      return state
    }
  }
  