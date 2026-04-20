import { PropsWithChildren } from "react";
import { IAuthenticationContextProps } from "../context/types";
import factory from "../factory";

export interface ICurrentUser {
  email: string;
  name: string;
}

const {
  AuthProvider,
  useCurrentUser,
  useLogin,
  useRegister,
  useResetPassword,
} = factory<ICurrentUser>();

export { useCurrentUser, useLogin, useRegister, useResetPassword };

export const buildWrapper =
  ({ ...rest }: IAuthenticationContextProps<ICurrentUser>) =>
  ({ children }: PropsWithChildren) =>
    <AuthProvider {...rest}>{children}</AuthProvider>;
