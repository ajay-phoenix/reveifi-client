import { combineReducers } from 'redux'
import * as verifyEmail from './verify-email/verifyEmailReducer'
import { verifyEmailReducer } from './verify-email/verifyEmailReducer'

export interface CombinedState {
   verifyEmail: verifyEmail.State

}
const rootReducer = combineReducers({
   verifyEmail: verifyEmailReducer,

})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
