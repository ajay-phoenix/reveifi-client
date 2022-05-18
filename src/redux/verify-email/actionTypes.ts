export const VERIFY_USER_EMAIL_START = 'VERIFY_USER_EMAIL_START';
export const VERIFY_USER_EMAIL_SUCCESS = 'VERIFY_USER_EMAIL_SUCCESS';
export const VERIFY_USER_EMAIL_FAILURE = 'VERIFY_USER_EMAIL_FAILURE';

export interface VerifyUserEmailStart {
  type: typeof VERIFY_USER_EMAIL_START;
}
export interface VerifyUserEmailSuccess {
  type: typeof VERIFY_USER_EMAIL_SUCCESS;
  payload: ResponseType
}
export interface VerifyUserEmailSuccessFailure {
  type: typeof VERIFY_USER_EMAIL_FAILURE;
}

export const verifyUserEmailStart = (): VerifyUserEmailStart => {
  return { type: 'VERIFY_USER_EMAIL_START' };
};
export const verifyUserEmailSuccess = (payload:ResponseType): VerifyUserEmailSuccess => {
  return { type: 'VERIFY_USER_EMAIL_SUCCESS',payload };
};

export const verifyUserEmailFailure = (): VerifyUserEmailSuccessFailure => {
  return { type: 'VERIFY_USER_EMAIL_FAILURE' };
};

export type VerifyEmailActionTypes =
  | VerifyUserEmailStart
  | VerifyUserEmailSuccess
  | VerifyUserEmailSuccessFailure;
