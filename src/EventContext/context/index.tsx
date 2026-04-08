import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import {
  ISubscriptions,
  SubscriptionHandler,
  Publisher,
  IEventContext,
} from "./types";

const createFactories = <GenericEvents extends Record<string, any>>() => {
  const context = createContext<IEventContext<GenericEvents> | null>(null);

  const createEventProvider = () => {
    return ({ children }: PropsWithChildren) => {
      const subscriberRef = useRef<ISubscriptions<GenericEvents>[]>([]);

      const unsubscribe = useCallback((id: string) => {
        subscriberRef.current = subscriberRef.current.filter(
          (sub) => sub.id !== id
        );
      }, []);

      const subscribe: SubscriptionHandler<GenericEvents> = useCallback(
        (eventName, callback) => {
          const id = crypto.randomUUID();
          subscriberRef.current.push({ id, eventName, callback });
          return () => unsubscribe(id);
        },
        [unsubscribe]
      );

      const publish: Publisher<GenericEvents> = useCallback(
        (eventName, data) => {
          subscriberRef.current.forEach((sub) => {
            if (sub.eventName === eventName) {
              sub.callback(data);
            }
          });
        },
        []
      );

      const value = useMemo(() => ({ subscribe, publish }), [subscribe, publish]);

      return <context.Provider value={value}>{children}</context.Provider>;
    };
  };

  const createEventHook = () => {
    return () => {
      const ctx = useContext(context);
      if (ctx === null) {
        throw new Error("useEvents must be used within a EventProvider");
      }
      return ctx;
    };
  };

  return { createEventProvider, createEventHook };
};

export { createFactories };
