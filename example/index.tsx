import 'react-app-polyfill/ie11';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, useBus, BusContext, EventHandlerMap, Emitter } from '../.';

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

interface ClassComponentState {
  testPayloads: string[]
}

class ClassComponent extends React.PureComponent<{}, ClassComponentState> {
  declare context: Emitter
  
  static contextType = BusContext

  state = {
    testPayloads: []
  }

  componentDidMount() {
    this.context.on('test', (payload) => {
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

const App = () => {
  const mittOptions = React.useRef(options)
  return (
    <React.StrictMode>
      <Provider mittOptions={mittOptions.current}>
        <ClassComponent />
        <ChildComponent />
      </Provider>
    </React.StrictMode>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
