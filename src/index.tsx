import React, { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react'
import mitt, { Emitter, EventHandlerMap, WildcardHandler } from 'mitt'

export { EventHandlerMap, Emitter } from 'mitt'

export const BusContext = createContext<Emitter | null>(null)

const { Provider: BusContextProvider } = BusContext

/**
 * Return the event emitter.
 *
 * @export
 * @return {*} 
 */
export function useBus(): Emitter {
  return useContext(BusContext) as Emitter
}

/**
 * Attach an event listener to the bus while this component is mounted. Adds the listener after mount, and removes it before unmount.
 *
 * @export
 * @param {string} name
 * @param {WildcardHandler} fn
 */
export function useListener(name: string, fn: WildcardHandler) {
  const bus = useBus()
  const castedName = name as '*'
  useEffect(() => {
    bus.on(castedName, fn)
    return () => {
      bus.off(castedName, fn)
    }
  }, [bus, castedName, fn])
}

export interface ProviderProps {
  children?: ReactNode
  mittOptions?: EventHandlerMap
}

/**
 * Create an event emitter that will be available to all deeply nested child elements using the useBus() hook.
 *
 * @export
 * @param {ProviderProps} { children, mittOptions }
 * @return {*} 
 */
export const Provider: FC<ProviderProps> = ({ children, mittOptions }) => {
  const [bus] = useState(() => mitt(mittOptions))
  return <BusContextProvider value={bus}>{children}</BusContextProvider>
}
