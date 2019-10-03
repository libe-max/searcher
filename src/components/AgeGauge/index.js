import React, { Component } from 'react'
import PropTypes from 'prop-types'

/*
 *   AgeGauge component
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *
 *   PROPS
 *   rootClass, min, max, age
 *
 */

export default class AgeGauge extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor (props) {
    super()
    this.c = `${props.rootClass}__age-gauge`
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

    /* Inner logic */
    const ageRange = props.max - props.min + .5
    const ageDiff = props.age - props.min + .25
    const ageRatio = ageDiff / ageRange
    const style = { left: `${ageRatio * 100}%` }

    /* Display component */
    return <div className={classes.join(' ')}
      style={{ backgroundImage: 'url("./assets/age-gauge-bg.png")' }}>
      <div className={`${props.rootClass}__age-gauge-cursor`}
        style={style} />
    </div>
  }
}

/* * * * * Prop types * * * * */
AgeGauge.propTypes = {
  prop: PropTypes.string
}

AgeGauge.defaultProps = {
  prop: null
}

