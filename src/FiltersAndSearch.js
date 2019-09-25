import React, { Component } from 'react'
import config from './config'
import PropTypes from 'prop-types'
import Svg from 'libe-components/lib/primitives/Svg'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'

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
   * TOGGLE OPEN
   *
   * * * * * * * * * * * * * * * * */
  close () {
    this.setState({ status: 'closed' })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE CLEAR FILTER
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
    return window.setTimeout(
      () => this.decideIfUpdateSearch(val),
      200
    )
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
    
    /* Assign classes */
    const classes = [c]
    if (state.status === 'open-filters') classes.push(`${c}_open-filters`)
    else if (state.status === 'open-search') classes.push(`${c}_open-search`)

    /* Display component */
    return <div className={classes.join(' ')}>
      <div className={`${c}__search-block`}>
        <div className={`${c}__search-title`}>
          <BlockTitle>Rechercher</BlockTitle>
        </div>
        <div className={`${c}__search-icon`}>
          <Svg src={`${config.statics_url}/assets/magnifying-glass-icon_40.svg`} />
        </div>
        <div className={`${c}__search-field`}>
          <input type='text'
            placeholder='Some placeholder'
            ref={n => this.searchField = n}
            onChange={this.handleSearchInput} />
        </div>
        <div className={`${c}__search-close`}
          onClick={this.clearSearch}>
          <Svg src={`${config.statics_url}/assets/tilted-cross-icon_24.svg`} />
        </div>
      </div>
      <div className={`${c}__filters-block`}>
        <div className={`${c}__filters-title`}
          onClick={this.toggleOpenFilters}>
          <BlockTitle>Filtrer</BlockTitle>
        </div>
        <div className={`${c}__filters-close`}
          onClick={this.close}>
          <Svg src={`${config.statics_url}/assets/up-arrow-head-icon_24.svg`} />
        </div>
        <div className={`${c}__filters-dropdowns`}>{
          props.filters.map(filter => <div className={`${c}__filter-dropdown`}
            key={filter.column_name}>
              <select defaultValue='unset'>
                
              </select>
              <input ref={n => n ? this.dropdowns.push(n) : undefined} />
            </div>


            // return <div className={`${c}__filters-category-select`} key={i}>
            //   <Paragraph>{filter.name}</Paragraph>
            //   <select defaultValue='unset'
            //     onChange={e => this.handleFilterChange(filter.column_name, e)}
            //     ref={n => { if (n) this.dropdowns.push(n) }}>
            //     <option value='unset' disabled>
            //       Filtrer par {filter.name.toLowerCase()}
            //     </option>
            //     {filter.options.map((opt, j) => {
            //       return <option key={j}
            //         value={opt.value}>
            //         {opt.label}
            //       </option>
            //     })}
            //   </select>
            // </div>
          )
        }</div>
      </div>
      <div className={`${c}__summary-block`}>
        <div className={`${c}__summary-title`}>TITLE</div>
        <div className={`${c}__summary-list`}>LIST</div>
        <div className={`${c}__summary-cancel`}>CANCEL</div>
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

