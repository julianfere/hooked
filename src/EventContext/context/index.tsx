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
  const EventContext = createContext<IEventContext<GenericEvents> | null>(null);
  let nextId = 0;

  const createEventProvider = () => {
    return ({ children }: PropsWithChildren) => {
      const subscriberRef = useRef<ISubscriptions<GenericEvents>[]>([]);

      const unsubscribe = useCallback((id: number) => {
        subscriberRef.current = subscriberRef.current.filter(
          (sub) => sub.id !== id
        );
      }, []);

      const subscribe: SubscriptionHandler<GenericEvents> = useCallback(
        (eventName, callback) => {
          const id = nextId++;
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

      return <EventContext value={value}>{children}</EventContext>;
    };
  };

  const createEventHook = () => {
    return () => {
      const ctx = useContext(EventContext);
      if (ctx === null) {
        throw new Error("The event hook must be used within its EventProvider");
      }
      return ctx;
    };
  };

  return { createEventProvider, createEventHook };
};

export { createFactories };
