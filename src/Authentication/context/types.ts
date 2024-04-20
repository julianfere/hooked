export interface IAuthEntity extends Record<string, any> {}

export interface IAuthenticationContext<TAuthEntity extends IAuthEntity> {
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (payload: TAuthEntity) => void;
  resetPassword: (email: string) => void;
  getCurrentUser: () => TAuthEntity | null;
}

export interface IAuthenticationContextProps<IAthUser extends IAuthEntity> {
  //currentUser
  getCurrentUser: (...args: any[]) => IAthUser | null;
  // Login
  loginHandler?: (...args: any[]) => Promise<IAthUser>;
  loginSuccessHandler?: (...args: any[]) => void;
  loginFailureHandler?: (...args: any[]) => void;
  // Register
  registerHandler?: (...args: any[]) => Promise<any>;
  registerSuccessHandler?: (...args: any[]) => void;
  registerFailureHandler?: (...args: any[]) => void;
  // Reset password
  resetPasswordHandler?: (...args: any[]) => Promise<any>;
  resetPasswordSuccessHandler?: (...args: any[]) => void;
  resetPasswordFailureHandler?: (...args: any[]) => void;

  // Logout
  logoutHandler?: (...args: any[]) => void;
}

export type ArrayToUnion<T extends string[] | undefined> = T extends string[]
  ? T[number]
  : never;
