import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'

/*
 *   Filters and search component
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *   
 *
 *   PROPS
 *   rootClass
 *
 */

export default class FiltersAndSearch extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor (props) {
    super()
    this.c = `${props.rootClass}-filters-and-search-block`
    this.state = {
      status: 'closed',
      display_filter: null
    }
    this.openFilters = this.openFilters.bind(this)
    this.openSearch = this.openSearch.bind(this)
    this.close = this.close.bind(this)
    this.displayFilter = this.displayFilter.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * OPEN FILTERS, OPEN SEARCH AND CLOSE
   *
   * * * * * * * * * * * * * * * * */
  openFilters () {
    if (this.state.status === 'filters') return
    this.setState({
      status: 'filters',
      display_filter: null
    })
  }
  openSearch () {
    if (this.state.status === 'search') return
    this.setState({
      status: 'search',
      display_filter: null
    })
  }
  close () {
    if (this.state.status === 'closed') return
    this.setState({
      status: 'closed',
      display_filter: null
    })
  }

  displayFilter (name) {
    if (this.state.display_filter === name) return
    this.setState({
      display_filter: name
    })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    console.log(state)
    
    /* Assign classes */
    const classes = [c]
    classes.push(`${c}_${state.status}`)

    /* Display component */
    return <div className={classes.join(' ')}>
      <div className={`${c}__closed-header`}>
        <div className={`${c}__filters`}>
          <div className={`${c}__filters-button`}><button onClick={this.openFilters}><Paragraph>Filtrer</Paragraph></button></div>
          <div className={`${c}__filters-reset`}><button><Paragraph>Annuler les filtres</Paragraph></button></div>
        </div>
        <div className={`${c}__search`}><button onClick={this.openSearch}><Paragraph>Search</Paragraph></button></div>
      </div>
      <div className={`${c}__filters-block`}>
        <div className={`${c}__fliters-block-header`}><Paragraph>FILTERS</Paragraph><button onClick={this.close}>X</button></div>
        <div className={`${c}__filters-category-block`}><Paragraph>{props.filters.map((filter, i) => {
          return <button key={i} onClick={() => this.displayFilter(filter.column_name)}>
            <Paragraph>{filter.name}</Paragraph>
          </button>
        })}</Paragraph></div>
        <div className={`${c}__filters-controls-block`}>{
          props.filters
            .filter(filter => filter.column_name === state.display_filter)
            .map((filter, i) => {
              return <div key={i} className={`${c}__filter-control-panel`}>
                {filter.name} PANEL
              </div>
          })
        }</div>
      </div>
      <div className={`${c}__search-block`}>
        <Paragraph huge>SEARCH BLOCK 🧐</Paragraph>
      </div>
    </div>
  }
}

/* * * * * Prop types * * * * */
FiltersAndSearch.propTypes = {
  prop: PropTypes.string
}

FiltersAndSearch.defaultProps = {
  prop: null
}

