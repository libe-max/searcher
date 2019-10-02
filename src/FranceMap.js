import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Svg from 'libe-components/lib/primitives/Svg'

/*
 *   FranceMap component
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *
 *   PROPS
 *   rootClass, department
 *
 */

export default class FranceMap extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor (props) {
    super()
    this.c = `${props.rootClass}__france-map`
    this.activateDepartment = this.activateDepartment.bind(this)
  }

  componentDidMount () {
    this.activateDepartment()
  }

  activateDepartment (err, svg) {
    if (err || !svg) return
    const departmentShape = this.map.querySelector(`svg #FR-${this.props.department}`)
    if (!departmentShape) return
    departmentShape.classList.add('active')
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
    return <div className={classes.join(' ')} ref={n => this.map = n}>
      <Svg src='./assets/france.svg' afterInjection={this.activateDepartment}/>
    </div>
  }
}

/* * * * * Prop types * * * * */
FranceMap.propTypes = {
  prop: PropTypes.string
}

FranceMap.defaultProps = {
  prop: null
}

