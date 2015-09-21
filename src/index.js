/**
 * Imports
 */

import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'

/**
 * Vars
 */

const setStateReceivers = [
  'beforeMount',
  'beforeUpdate',
  'render',
  'afterUpdate',
  'beforeUnmount'
]

/**
 * Types
 */

const SET_STATE = 'SET_LOCAL_STATE'

/**
 * Vdux local
 */

function localize (component) {
  if (typeof component === 'function') {
    component = {render: component}
  }

  return bindSetState({
    ...component,
    beforeMount: composeActions(beforeMount(component.initialState, component.reducer), component.beforeMount),
    beforeUnmount: composeActions(beforeUnmount, component.beforeUnmount)
  })
}

/**
 * Pass a curried setState to all the hooks and render
 */

function bindSetState (component) {
  return setStateReceivers.reduce((acc, key) => {
    const fn = acc[key]
    if (!fn) return acc

    acc[key] = (...args) => args.length === 1
      ? fn(args[0], setState(args[0]))
      : fn(...args, setState(args[1]))

    return acc
  }, component)
}

/**
 * Local action-creator creator
 */

function localAction (type) {
  return (key, payload, meta) => updateEphemeral(key, {
    type,
    payload,
    meta
  })
}

/**
 * setState action creator
 */

function setState (props) {
  return newState => updateEphemeral(props.key, {
    type: SET_STATE,
    payload: newState
  })
}

/**
 * Reducer
 */

function reducer (state, action) {
  switch (action.type) {
    case SET_STATE:
      return {
        ...state,
        ...action.payload
      }
  }

  return state
}

/**
 * Hooks
 */

function beforeMount (initialState = () => {}, componentReducer = state => state) {
  return props => {
    if (!props.key) {
      throw new Error('You cannot create a local component without a props.key')
    }

    return createEphemeral(props.key, composeReducers(reducer, componentReducer), initialState(props))
  }
}

function beforeUnmount (props) {
  if (!props.key) {
    throw new Error('You cannot create a local component without a props.key')
  }

  return destroyEphemeral(props.key)
}

/**
 * Compose two reducers together
 */

function composeReducers (a, b) {
  return (state, action) => a(b(state, action), action)
}

/**
 * Action creator composition utility
 */

function composeActions (a, b) {
  return props =>
    b
      ? [].concat(b(props), a(props)).filter(Boolean)
      : a(props)
}

/**
 * Exports
 */

export default localize
export {
  localAction
}
