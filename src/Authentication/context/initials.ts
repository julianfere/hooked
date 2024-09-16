import { IAuthenticationContext } from "./types";

export const initialContext: IAuthenticationContext<any> = {
  login: async () => {},
  logout: () => {},
  register: async () => {},
  resetPassword: async () => {},
  getCurrentUser: () => null,
};
