import React, { Component } from 'react'
import config from './config'
import PropTypes from 'prop-types'
import Svg from 'libe-components/lib/primitives/Svg'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import AnnotationTitle from 'libe-components/lib/text-levels/AnnotationTitle'

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
    this.c = `${props.rootClass}-filters-wrapper`
    this.state = { status: 'closed' }
    this.dropdowns = []
    this.toggleOpenFilters = this.toggleOpenFilters.bind(this)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.toggleOpenSearch = this.toggleOpenSearch.bind(this)
    this.handleSearchIconClick = this.handleSearchIconClick.bind(this)
    this.handleClearFilters = this.handleClearFilters.bind(this)
    this.clearSearch = this.clearSearch.bind(this)
    this.close = this.close.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * TOGGLE OPEN FILTERS
   *
   * * * * * * * * * * * * * * * * */
  toggleOpenFilters () {
    const filtersOpen = this.state.status === 'open-filters'
    return this.setState({ status: filtersOpen ? 'closed' : 'open-filters' })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * CLOSE
   *
   * * * * * * * * * * * * * * * * */
  close () {
    this.setState({ status: 'closed' })
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
   * HANDLE CLEAR FILTER
   *
   * * * * * * * * * * * * * * * * */
  handleClearFilters () {
    this.dropdowns.forEach(dropdown => { dropdown.value = '' })
    this.props.cancelAllFilters()
    if (this.state.status === 'open-filters') this.close()
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE SEARCH INPUT
   *
   * * * * * * * * * * * * * * * * */
  handleSearchInput (e) {
    this.handleClearFilters()
    const val = e.target.value
    return window.setTimeout(
      () => this.decideIfUpdateSearch(val),
      200
    )
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE SEARCH ICON CLICK
   *
   * * * * * * * * * * * * * * * * */
  handleSearchIconClick (e) {
    const searchOpen = this.state.status === 'open-search'
    if (!searchOpen) this.setState({ status: 'open-search' })
    console.log('then...')
  }

  /* * * * * * * * * * * * * * * * *
   *
   * TOGGLE OPEN SEARCH
   *
   * * * * * * * * * * * * * * * * */
  toggleOpenSearch () {
    const searchOpen = this.state.status === 'open-search'
    return this.setState({ status: searchOpen ? 'closed' : 'open-search' })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DECIDE IF UPDATE SEARCH
   *
   * * * * * * * * * * * * * * * * */
  decideIfUpdateSearch (val) {
    return val === this.searchField.value
      ? this.props.setSearch(val)
      : undefined
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
    const assetsUrl = `${config.statics_url}/assets`
    const hasActiveFilters = Object.keys(props.activeFilters).length
    
    /* Assign classes */
    const classes = [c]
    if (hasActiveFilters) classes.push(`${c}_has-active-filters`)
    if (state.status === 'open-filters') classes.push(`${c}_open-filters`)
    else if (state.status === 'open-search') classes.push(`${c}_open-search`)

    /* Display component */
    return <div className={classes.join(' ')}>
      <div className={`${c}__search-block`}>
        <div className={`${c}__search-title`}
          onClick={this.toggleOpenSearch}>
          <AnnotationTitle big>Rechercher</AnnotationTitle>
        </div>
        <div className={`${c}__search-icon`}
          onClick={this.handleSearchIconClick}>
          <Svg src={`${assetsUrl}/magnifying-glass-icon_40.svg`} />
        </div>
        <input type='text'
          className={`${c}__search-field`}
          placeholder='Some placeholder'
          ref={n => this.searchField = n}
          onChange={this.handleSearchInput} />
        <div className={`${c}__search-close`}
          onClick={this.clearSearch}>
          <Svg src={`${assetsUrl}/tilted-cross-icon_24.svg`} />
        </div>
      </div>
      <div className={`${c}__filters-block`}>
        <div className={`${c}__filters-title`}
          onClick={this.toggleOpenFilters}>
          <AnnotationTitle big>Filtrer</AnnotationTitle>
        </div>
        <div className={`${c}__filters-close`}
          onClick={this.close}>
          <Svg src={`${assetsUrl}/up-arrow-head-icon_24.svg`} />
        </div>
        <div className={`${c}__filters-open`}
          onClick={this.toggleOpenFilters}>
          <Svg src={`${assetsUrl}/down-arrow-head-icon_24.svg`} />
        </div>
        <div className={`${c}__filters-dropdowns`}>{
          props.filters.map(filter => {
            const options = filter.options.map(opt => {
              return <option key={opt.value}
                value={opt.value}>
                {opt.label}
              </option>
            })
            const isFilled = Object.keys(props.activeFilters).indexOf(filter.column_name) > -1
            const classes = [`${c}__filter-dropdown`]
            if (isFilled) classes.push(`${c}__filter-dropdown_filled`)
            return <select className={classes.join(' ')}
              onChange={e => this.handleFilterChange(filter.column_name, e)}
              ref={n => n ? this.dropdowns.push(n) : undefined}
              key={filter.column_name}>
              <option value=''>Par {filter.name.toLowerCase()}</option>
              {options}
            </select>
          })}
          <button className={`${c}__filters-clear`}
            onClick={this.handleClearFilters}>
            Réinitialiser
          </button>
        </div>
      </div>
      <div className={`${c}__summary-block`}>
        <span className={`${c}__summary-title`}><Paragraph small>Filtres </Paragraph></span>
        <span className={`${c}__summary-list`}>{
          Object.keys(props.activeFilters).map((key, i) => {
            const nbOfFilters = Object.keys(props.activeFilters).length
            const filterName = props.filters.find(filter => filter.column_name === key).name
            const value = props.activeFilters[key]
            const valueLabel = props.filters
              .find(filter => filter.column_name === key).options
              .find(opt => opt.value === value).label
            const text = i !== nbOfFilters - 1
              ? `${filterName.toLowerCase()} : ${valueLabel}, `
              : `${filterName.toLowerCase()} : ${valueLabel}`
            return <Paragraph small key={key}>{text}</Paragraph>
          })
        }</span>
        <span className={`${c}__summary-clear`}
          onClick={this.handleClearFilters}>
          <Paragraph small>réinitialiser</Paragraph>
        </span>
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

