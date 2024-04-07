import {
  Context,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import {
  ISubscriptions,
  SubscriptionHandler,
  Publisher,
  IEventContext,
} from "./types";

// La funcion createFactories "crea" los factory functions que se van a utilizar en el contexto con el tipado correspondiente
// Ejemplo:
// type MyEvents = {
//   event1: string;
//   event2: number;
// };
// const { createEventContext, createEventProvider, createEventHook } = createFactories<MyEvents>();
// const EventContext = createEventContext();
// const EventProvider = createEventProvider(EventContext);
// const useEvents = createEventHook(EventContext);
// Y ya queda listo el contexto con los eventos que se necesiten
const createFactories = <T extends Record<string, any>>() => {
  const createEventContext = <EventType extends IEventContext<T>>() => {
    return createContext<EventType>({} as EventType);
  };

  const createEventProvider = (context: Context<IEventContext<T>>) => {
    return ({ children }: PropsWithChildren) => {
      const [subscriber, setSubscriber] = useState<ISubscriptions[]>([]);

      const unsubscribe = (id: string) => {
        setSubscriber((prev) => prev.filter((sub) => sub.id !== id));
      };

      const subscribe: SubscriptionHandler<T> = (eventName, callback) => {
        const id = Math.random().toString(36);
        setSubscriber((prev) => [...prev, { id, eventName, callback }]);

        return () => unsubscribe(id);
      };

      const publish: Publisher<T> = (eventName, data) => {
        subscriber.forEach((sub) => {
          if (sub.eventName === eventName) {
            sub.callback(data);
          }
        });
      };

      const value = {
        subscribe,
        publish,
      };

      return <context.Provider value={value}>{children}</context.Provider>;
    };
  };

  const createEventHook = (context: Context<IEventContext<T>>) => {
    return () => {
      if (!context) {
        throw new Error("useEvents must be used within a EventProvider");
      }

      const ctx = useContext(context);
      if (!ctx) {
        throw new Error("useEvents must be used within a EventProvider");
      }

      return ctx;
    };
  };

  return { createEventContext, createEventProvider, createEventHook };
};

export { createFactories };
