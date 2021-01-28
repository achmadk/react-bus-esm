# react-bus-esm

[![npm](https://badgen.net/npm/v/react-bus-esm)](https://npmjs.com/package/react-bus-esm)
[![bundlephobia](https://badgen.net/bundlephobia/minzip/react-bus-esm)](https://bundlephobia.com/result?p=react-bus-esm)

A global [event emitter](https://github.com/developit/mitt) for React apps which has support ES Modules and typescript.
Useful if you need some user interaction in one place trigger an action in another place on the page, such as scrolling a logging element when pressing PageUp/PageDown in an input element (without having to store scroll position in state).

## Usage

react-bus-esm contains a `<Provider />` component and a `useBus` hook.

`<Provider />` creates an event emitter and places it on the context.
`useBus()` returns the event emitter from context.

```js
import { Provider, useBus } from 'react-bus-esm'
// Use `bus` in <Component />.
function ConnectedComponent () {
  const bus = useBus()
}

<Provider>
  <ConnectedComponent />
</Provider>
```

For example, to communicate "horizontally" between otherwise unrelated components:

```js
import { Provider as BusProvider, useBus, useListener } from 'react-bus-esm'
const App = () => (
  <BusProvider>
    <ScrollBox />
    <Input />
  </BusProvider>
)

function ScrollBox () {
  const el = React.useRef(null)
  const onscroll = React.useCallback(function (top) {
    el.current.scrollTop += top
  }, [])

  useListener('scroll', onscroll)

  return <div ref={el}></div>
}

// Scroll the ScrollBox when pageup/pagedown are pressed.
function Input () {
  const bus = useBus()
  return <input onKeyDown={onkeydown} />

  function onkeydown (event) {
    if (event.key === 'PageUp') bus.emit('scroll', -200)
    if (event.key === 'PageDown') bus.emit('scroll', +200)
  }
}
```

This may be easier to implement and understand than lifting the scroll state up into a global store.

## Installing

You need to install `react-bus-esm` with `react` (`@types/react` for typescript users) and `mitt` as peer dependencies. 

```sh
npm install react-bus-esm react mitt # add `@types/react` for typescript users
```

## API

### `<Provider />`

Create an event emitter that will be available to all deeply nested child elements using the `useBus()` hook.

You can also set `mittOptions` props to initialize global bus events with javascipt `Map`. e.g.:

```jsx
import { Provider, useBus, EventHandlerMap } from 'react-bus-esm';

const options: EventHandlerMap = new Map()
options.set('test', [
  (payload) => { console.log(payload) },
  (...args: any[]) => { console.log(args) }
]) 

const ChildComponent = () => {
  const mittEventBus = useBus()
  const handleClick = () => {
    mittEventBus.emit('test', 'hello')
  }
  return (
    <button onClick={handleClick}>Submit</button>
  )
} 

const App = () => {
  const mittOptions = React.useRef(options)
  return (
    <React.StrictMode>
      <Provider mittOptions={mittOptions.current}>
        <ChildComponent />
      </Provider>
    </React.StrictMode>
  );
};
```

### `BusContext`
In `react-bus-esm`, we share react context `BusContext` which beneficial for users which using this library in react class component. For typescript users, you need to import `Emitter` too. e.g.:

```jsx
import { BusContext, Emitter } from 'react-bus-esm';

interface ClassComponentState {
  testPayloads: string[]
}

class ClassComponent extends React.PureComponent<{}, ClassComponentState> {
  declare context: Emitter
  // or context!: Emitter
  
  static contextType = BusContext

  state = {
    testPayloads: []
  }

  componentDidMount() {
    this.context.on<string>('test', (payload) => {
      this.setState(({ testPayloads }) => ({
        testPayloads: [
          ...testPayloads,
          payload as string
        ]
      }))
    })
  }

  render() {
    const { testPayloads } = this.state
    return testPayloads?.map((payload, index) => (
      <pre key={`test-payload-${index}`}>{payload}</pre>
    )) ?? false
  }
}
```

### `Emitter`
return type of `BusContext`. Maybe, this interface will be deleted if `React.ContextType<typeof BusContext>` is `Emitter`, not `unknown`.

### `useBus()`

Return the event emitter which can be used in react functional component.

### `useListener(name, fn)`

Attach an event listener to the bus while this component is mounted. Adds the listener _after_ mount, and removes it before unmount.

## Inspiration
This library is inspired by [react-bus](https://github.com/goto-bus-stop/react-bus), but unfortunately it doesn't support typescript. I have sent issue [here](https://github.com/goto-bus-stop/react-bus/issues/7) but unfortunately no follow up after this.

It also has latest version of [mitt](https://github.com/developit/mitt), which has [support typescript too since version 2.1.0](https://github.com/developit/mitt/releases/tag/2.1.0). 

## License

[MIT](./LICENSE)
