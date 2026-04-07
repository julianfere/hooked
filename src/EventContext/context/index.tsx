import {
  Context,
  PropsWithChildren,
  createContext,
  useContext,
  useRef,
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
      const subscriberRef = useRef<ISubscriptions[]>([]);

      const unsubscribe = (id: string) => {
        subscriberRef.current = subscriberRef.current.filter(
          (sub) => sub.id !== id
        );
      };

      const subscribe: SubscriptionHandler<GenericEvents> = (
        eventName,
        callback
      ) => {
        const id = crypto.randomUUID();
        subscriberRef.current = [
          ...subscriberRef.current,
          { id, eventName, callback },
        ];

        return () => unsubscribe(id);
      };

      const publish: Publisher<GenericEvents> = (eventName, data) => {
        subscriberRef.current.forEach((sub) => {
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
