import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import Axios from 'axios';
import { verifyAPI } from 'api/apiConstants';
import {
  verifyUserEmailStart,
  verifyUserEmailSuccess,
  verifyUserEmailFailure,
} from './actionTypes';

type FetchResponse = any;

export const verifyUserEmail = (
  verifyToken: any
): ThunkAction<void, {}, {}, AnyAction> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      dispatch(verifyUserEmailStart());
      const verifyUserEmailResponse: FetchResponse = await Axios.post(
        `${verifyAPI}`,{verify_token: verifyToken}
      );
      dispatch(verifyUserEmailSuccess(verifyUserEmailResponse.data.message));
    } catch (error) {
      dispatch(verifyUserEmailFailure());
    }
  };
};
