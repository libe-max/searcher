import React, { Component } from 'react'
import PropTypes from 'prop-types'

/*
 *   Medals component
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *
 *   PROPS
 *   - none -
 *
 */

export default class Medals extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor (props) {
    super()
    this.c = `${props.rootClass}__medals`
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, props } = this
    
    /* Assign classes */
    const classes = [c]

    /* Display component */
    return Number.isInteger(props.value)
      ? <div className={classes.join(' ')}>{
        new Array(props.value).fill(null)
          .map((e, i) => {
            return <div key={i}
              className={`${props.rootClass}__medal`} />
          })
      }</div>
      : <div />
  }
}

/* * * * * Prop types * * * * */
Medals.propTypes = {
  prop: PropTypes.string
}

Medals.defaultProps = {
  prop: null
}

