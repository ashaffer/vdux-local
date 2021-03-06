
# vdux-local

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Bind a vdux component to local state using redux-ephemeral

## Installation

    $ npm install vdux-local

## Usage

Just compose it around your [virtual-component](https://github.com/ashaffer/virtual-component) definition.  E.g.

```javascript
import localize, {localAction} from 'vdux-local'

const updateText = localAction('UPDATE_TEXT')

function render (props) {
  return (
    <input type='text' ev-change={e => updateText(e.currentTarget.value)} />
  )
}

function reducer (state, action) {
  switch (action.type) {
    case 'UPDATE_TEXT':
      return {
        ...state,
        text: action.payload
      }
  }

  return state
}

export localize({
  render,
  reducer
})
```

In your parent component, you must specify a key and pass down the state:

```javascript
import TextInput from './text-input'

function render ({key, state}) {
  return (
    <div>
      <TextInput key={key + '.input'} state={state.input} />
    </div>
  )
}
```

But this is kind of verbose, so there is a curried `childState` helper passed as the second argument to render that will generate a `key/state` tuple for you:

```javascript
function render (props, childState) {
  return (
    <div>
      <TextInput {...childState('input')} />
    </div>
  )
}
```

You can also pass multiple arguments for a dotted path:

```javascript
function render (props, childState) {
  return (
    <div>
      {todos.map((todo, i) => <Todo {...childState('todos', i)})}
    </div>
  )
}
```


### Local actions

vdux-local also exports a `localAction` function that creates local action creators that you may export from your component.  It has an API similar to `createAction` from [redux-actions](https://github.com/acdlite/redux-actions), but the resulting action creator takes one extra argument: `key`.  For example:

```javascript
import {localAction} from 'vdux-local'

const TOGGLE = 'TOGGLE_DROPDOWN'
const toggleDropdown = localAction(TOGGLE)

// ...

function render ({key}) {
  return (
    <button ev-click={e => toggleDropdown(key + '.dropdown')}>
      Open dropdown
    </button>
  )
}
```

Your key should be a sub-property of your parent's key, so that the container component will receive its child's state, so that it can pass it along.

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
