/**
 * Imports
 */

import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
import compose from 'compose-function'

/**
 * Vdux local
 */

function localize (component) {
  if (typeof component === 'function') {
    component = {render: component}
  }

  const {beforeUpdate = noop, afterUpdate = noop} = component

  return {
    ...component,
    transformProps: compose(transformProps(component.initialState), component.transformProps || identity),
    beforeMount: composeActions(beforeMount(component.reducer), component.beforeMount),
    beforeUnmount: composeActions(beforeUnmount, component.beforeUnmount),
    render: props => component.render(props, childState(props.key, props.state)),
    beforeUpdate: (prevProps, nextProps) => beforeUpdate(prevProps, nextProps, prevProps.state, nextProps.state),
    afterUpdate: (prevProps, nextProps) => afterUpdate(prevProps, nextProps, prevProps.state, nextProps.state)
  }
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
 * Child state helper
 */

function childState (key, parentState) {
  return (...path) => ({
    state: getPath(parentState, path),
    key: key + '.' + path.join('.')
  })
}

/**
 * Hooks
 */

function transformProps (initialState = () => ({})) {
  return props => {
    props.state = props.state || initialState(props)
    return props
  }
}

function beforeMount (reducer = state => state) {
  return (props) => {
    if (!props.key) {
      throw new Error('You cannot create a local component without a props.key')
    }

    return createEphemeral(props.key, reducer, props.state)
  }
}

function beforeUnmount (props) {
  return destroyEphemeral(props.key)
}

/**
 * Action creator composition utility
 */

function composeActions (a, b) {
  return (...args) => b
    ? [].concat(b(...args), a(...args)).filter(Boolean)
    : a(...args)
}

/**
 * Get a property path from an object
 */

function getPath (obj, path) {
  let p = obj

  for (let i = 0; p && i < path.length; i++) {
    p = p[path[i]]
  }

  return p
}

function noop () {}
function identity (a) { return a }


/**
 * Exports
 */

export default localize
export {
  localAction
}
