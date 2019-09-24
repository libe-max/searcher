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
    this.state = { status: 'closed' }
    this.dropdowns = []
    this.openFilters = this.openFilters.bind(this)
    this.openSearch = this.openSearch.bind(this)
    this.close = this.close.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleClearFilters = this.handleClearFilters.bind(this)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.decideIfUpdateSearch = this.decideIfUpdateSearch.bind(this)
    this.clearSearch = this.clearSearch.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * OPEN FILTERS, OPEN SEARCH AND CLOSE
   *
   * * * * * * * * * * * * * * * * */
  openFilters () {
    return this.state.status === 'filters'
      ? undefined
      : this.setState({ status: 'filters' })
  }
  openSearch () {
    return this.state.status === 'search'
      ? undefined
      : this.setState({ status: 'search' })
  }
  close () {
    return this.state.status === 'closed'
      ? undefined
      : this.setState({ status: 'closed' })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE FILTER CHANGE
   *
   * * * * * * * * * * * * * * * * */
  handleFilterChange (filter, e) {
    const newVal = e.target.value
    this.close()
    return this.props.setFilter(filter, newVal)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE CLEAR FILTER CHANGE
   *
   * * * * * * * * * * * * * * * * */
  handleClearFilters () {
    this.dropdowns.forEach(dropdown => { dropdown.value = 'unset' })
    this.props.cancelAllFilters()
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE SEARCH INPUT
   *
   * * * * * * * * * * * * * * * * */
  handleSearchInput (e) {
    this.handleClearFilters()
    const val = e.target.value
    window.setTimeout(() => this.decideIfUpdateSearch(val), 500)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DECIDE IF UPDATE SEARCH
   *
   * * * * * * * * * * * * * * * * */
  decideIfUpdateSearch (val) {
    if (val === this.searchField.value) {
      this.props.setSearch(val)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * CLEAR SEARCH
   *
   * * * * * * * * * * * * * * * * */
  clearSearch () {
    this.searchField.value = ''
    this.props.setSearch('')
    this.close()
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    const hasActiveFilters = Object.keys(props.activeFilters).length
    
    /* Assign classes */
    const classes = [c]
    classes.push(`${c}_${state.status}`)
    if (hasActiveFilters) classes.push(`${c}_with-active-filters`)

    /* Display component */
    this.dropdowns = []
    return <div className={classes.join(' ')}>
      <div className={`${c}__closed-header`}>
        <div className={`${c}__filters`}>
          <div className={`${c}__filters-button`}><button onClick={this.openFilters}><Paragraph>Filtrer</Paragraph></button></div>
          <div className={`${c}__filters-reset`}><button onClick={this.handleClearFilters}><Paragraph>Annuler les filtres</Paragraph></button></div>
        </div>
        <div className={`${c}__search`}><button onClick={this.openSearch}><Paragraph>Search</Paragraph></button></div>
      </div>
      <div className={`${c}__filters-block`}>
        <div className={`${c}__fliters-block-header`}><Paragraph>FILTERS</Paragraph><button onClick={this.close}>X</button></div>
        <div className={`${c}__filters-category-block`}>{props.filters.map((filter, i) => {
          return <div className={`${c}__filters-category-select`} key={i}>
            <Paragraph>{filter.name}</Paragraph>
            <select defaultValue='unset'
              onChange={e => this.handleFilterChange(filter.column_name, e)}
              ref={n => { if (n) this.dropdowns.push(n) }}>
              <option value='unset' disabled>
                Filtrer par {filter.name.toLowerCase()}
              </option>
              {filter.options.map((opt, j) => {
                return <option key={j}
                  value={opt.value}>
                  {opt.label}
                </option>
              })}
            </select>
          </div>
        })}</div>
      </div>
      <div className={`${c}__search-block`}>
        <input type='text'
          ref={n => this.searchField = n}
          onChange={this.handleSearchInput} />
        <button onClick={this.clearSearch}>x</button>
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

