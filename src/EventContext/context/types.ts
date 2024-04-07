export type SubscriptionHandler<T> = <EventKey extends keyof T>(
  eventKey: EventKey,
  callback: (payload: T[EventKey]) => void
) => () => void;

export type Publisher<T> = <EventKey extends keyof T>(
  eventName: EventKey,
  data: T[EventKey]
) => void;

export interface IEventContext<GenericEvent extends Record<string, any>> {
  subscribe: SubscriptionHandler<GenericEvent>;
  publish: Publisher<GenericEvent>;
}

export interface ISubscriptions {
  id: string;
  eventName: any;
  callback: (payload: any) => void;
}
