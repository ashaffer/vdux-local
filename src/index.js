/**
 * Imports
 */

import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'

/**
 * Types
 */

const SET_STATE = 'SET_LOCAL_STATE'

/**
 * Vdux local
 */

function localize (component) {
  if (typeof component === 'function') {
    component = {render: compoonent}
  }

  return {
    ...component,
    render: props => component.render(props, setState(props)),
    beforeMount: compose(beforeMount(component.initialState), component.beforeMount),
    beforeUnmount: compose(beforeUnmount, component.beforeUnmount)
  }
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

function beforeMount (initialState = () => {}) {
  return props => {
    if (!props.key) {
      throw new Error('You cannot create a local component without a props.key')
    }

    return createEphemeral(props.key, reducer, initialState(props))
  }
}

function beforeUnmount (props) {
  if (!props.key) {
    throw new Error('You cannot create a local component without a props.key')
  }

  return destroyEphemeral(props.key)
}

/**
 * Action creator composition utility
 */

function compose (a, b) {
  return props =>
    b
      ? [].concat(b(props), a(props)).filter(Boolean)
      : a(props)
}

/**
 * Exports
 */

export default localize
