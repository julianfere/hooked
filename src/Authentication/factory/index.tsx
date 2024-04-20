import {
  Context,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import {
  IAuthEntity,
  IAuthenticationContext,
  IAuthenticationContextProps,
} from "../context/types";
import { initialContext } from "../context/initials";
import { useAsync } from "../..";
import { MissingHandler } from "../context/Errors";

const factory = <CurrentUser extends IAuthEntity>() => {
  const createAuthContext = () => {
    return createContext<IAuthenticationContext<CurrentUser>>(initialContext);
  };

  const createAuthProvider =
    (context: Context<IAuthenticationContext<CurrentUser>>) =>
    ({
      children,
      ...props
    }: PropsWithChildren<IAuthenticationContextProps<CurrentUser>>) => {
      const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
        props.getCurrentUser()
      );

      const { run: executeLogin } = useAsync(props.loginHandler!, {
        onSuccess: (data) => {
          setCurrentUser(data);
          props.loginSuccessHandler?.(data);
        },
        onError: (error) => {
          props.loginFailureHandler?.(error);
        },
        manual: true,
        cancelable: false,
      });

      const { run: executeRegister } = useAsync(props.registerHandler!, {
        onSuccess: (data) => {
          props.registerSuccessHandler?.(data);
        },
        onError: (error) => {
          props.registerFailureHandler?.(error);
        },
        manual: true,
        cancelable: false,
      });

      const { run: executeResetPassword } = useAsync(
        props.resetPasswordHandler!,
        {
          onSuccess: (data) => {
            props.resetPasswordSuccessHandler?.(data);
          },
          onError: (error) => {
            props.resetPasswordFailureHandler?.(error);
          },
          manual: true,
          cancelable: false,
        }
      );

      const login = (email: string, password: string) => {
        if (!props.loginHandler) {
          throw new MissingHandler('"login"');
        }

        return executeLogin(email, password);
      };

      const logout = () => {
        setCurrentUser(null);
        props.logoutHandler?.();
      };

      const register = (payload: CurrentUser) => {
        if (!props.registerHandler) {
          throw new MissingHandler('"register"');
        }

        return executeRegister(payload);
      };

      const resetPassword = (email: string) => {
        if (!props.resetPasswordHandler) {
          throw new MissingHandler('"resetPassword"');
        }

        return executeResetPassword(email);
      };

      const getCurrentUser = () => currentUser;

      const value: IAuthenticationContext<CurrentUser> = {
        login,
        logout,
        register,
        resetPassword,
        getCurrentUser,
      };

      return <context.Provider value={value}>{children}</context.Provider>;
    };

  const context = createAuthContext();
  const provider = createAuthProvider(context);

  const useCurrentUser = () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error(
        "useCurrentUser must be used within an AuthenticationProvider"
      );
    }

    return ctx.getCurrentUser?.() ?? null;
  };

  const useLogin = () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error("useLogin must be used within an AuthenticationProvider");
    }
    return { login: ctx.login, logout: ctx.logout };
  };

  const useRegister = () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error(
        "useRegister must be used within an AuthenticationProvider"
      );
    }
    return { register: ctx.register };
  };

  const useResetPassword = () => {
    const ctx = useContext(context);

    if (!ctx) {
      throw new Error(
        "useResetPassword must be used within an AuthenticationProvider"
      );
    }
    return { resetPassword: ctx.resetPassword };
  };

  return {
    AuthProvider: provider,
    useCurrentUser,
    useLogin,
    useRegister,
    useResetPassword,
  };
};

export default factory;
