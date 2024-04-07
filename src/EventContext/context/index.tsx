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

const createFactories = <GenericEvents extends Record<string, any>>() => {
  const createEventContext = <
    EventType extends IEventContext<GenericEvents>
  >() => {
    return createContext<EventType>({} as EventType);
  };

  const createEventProvider = (
    context: Context<IEventContext<GenericEvents>>
  ) => {
    return ({ children }: PropsWithChildren) => {
      const [subscriber, setSubscriber] = useState<ISubscriptions[]>([]);

      const unsubscribe = (id: string) => {
        setSubscriber((prev) => prev.filter((sub) => sub.id !== id));
      };

      const subscribe: SubscriptionHandler<GenericEvents> = (
        eventName,
        callback
      ) => {
        const id = Math.random().toString(36);
        setSubscriber((prev) => [...prev, { id, eventName, callback }]);

        return () => unsubscribe(id);
      };

      const publish: Publisher<GenericEvents> = (eventName, data) => {
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

  const createEventHook = (context: Context<IEventContext<GenericEvents>>) => {
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
