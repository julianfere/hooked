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

export interface ISubscriptions<GenericEvents extends Record<string, any>> {
  id: number;
  eventName: keyof GenericEvents;
  callback: (payload: any) => void;
}
