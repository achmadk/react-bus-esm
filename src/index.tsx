import React, {
  ReactNode,
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useState,
  Context,
} from 'react';
import mitt, {
  Emitter as DefaultEmitter,
  EventHandlerMap as DefaultEventHandlerMap,
  Handler,
  EventType,
} from 'mitt';

export interface Emitter<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
> extends DefaultEmitter<Events> {}

export interface EventHandlerMap<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
> extends DefaultEventHandlerMap<Events> {}

/**
 *
 *
 * @export
 * @template Events
 * @param {EventHandlerMap<Events>} [options]
 * @return {*}
 */
export function createBusContext<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
>(options?: EventHandlerMap<Events>) {
  return createContext<Emitter<Events>>(mitt<Events>(options));
}

export const BusContext = createBusContext();

/**
 * Return the event emitter.
 *
 * @export
 * @template Events
 * @param {*} [busContext=BusContext]
 * @return {*}
 */
export function useBus<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
>(busContext = BusContext) {
  return useContext<Emitter<Events>>(busContext as Context<Emitter<Events>>);
}

/**
 * Attach an event listener to the bus while this component is mounted. Adds the listener after mount, and removes it before unmount.
 *
 * @export
 * @template Events
 * @param {string} name
 * @param {Handler<Events[keyof Events]>} fn
 * @param {*} [busContext=BusContext]
 */
export function useListener<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
>(name: string, fn: Handler<Events[keyof Events]>, busContext = BusContext) {
  const bus = useBus<Events>(busContext);
  useEffect(() => {
    bus.on(name, fn);
    return () => {
      bus.off(name, fn);
    };
  }, [bus, name, fn]);
}

/**
 *
 *
 * @export
 * @interface ProviderProps
 * @template Events
 */
export interface ProviderProps<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
> {
  children?: ReactNode;
  mittOptions?: EventHandlerMap<Events>;
  busContext?: Context<Emitter<Events>>;
}

/**
 * Create an event emitter that will be available to all deeply nested child elements using the useBus() hook.
 *
 * @export
 * @template Events
 * @param {ProviderProps<Events>} { children, mittOptions, busContext = BusContext }
 * @return {*}  {ReactElement<ProviderProps<Events>>}
 */
export function Provider<
  Events extends Record<EventType, unknown> = Record<EventType, unknown>
>({
  children,
  mittOptions,
  busContext = BusContext as Context<Emitter<Events>>,
}: ProviderProps<Events>): ReactElement<ProviderProps<Events>> {
  const { Provider: BusProvider } = busContext;
  const [bus] = useState(() => mitt<Events>(mittOptions));
  return <BusProvider value={bus}>{children}</BusProvider>;
}
