export interface IResetPasswordByCode {
  email: string;
  code: string;
  newPassword: string;
}
