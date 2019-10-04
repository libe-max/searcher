import React, { Component } from 'react'
import { Parser } from 'html-to-react'
import moment from 'moment'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import Grid from 'libe-components/lib/layouts/Grid'
import Slot from 'libe-components/lib/layouts/Slot'
import Slug from 'libe-components/lib/text-levels/Slug'
import InterTitle from 'libe-components/lib/text-levels/InterTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import getClosestDomParent from 'libe-utils/get-closest-dom-parent'
import FiltersAndSearch from './components/FiltersAndSearch'
import Entry from './components/Entry'
import parseTsv from './utils/parse-tsv'
import setupFiltersAndEntries from './utils/setup-filters-and-entries'
import makeSearchable from './utils/make-searchable'

export default class Searcher extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'lblb-searcher'
    this.state = {
      loading_sheet: true,
      error_sheet: null,
      data_sheet: {},
      sticky_nav_position: 'relative',
      contentOffset: 0,
      contentWidth: 0,
      contentHeight: 0,
      navHeight: 0,
      filtersHeight: 0,
      active_filters: {},
      search_value: '',
      opened_entry: null
    }
    this.h2r = new Parser()
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.getElementsSizes = this.getElementsSizes.bind(this)
    this.setFilter = this.setFilter.bind(this)
    this.cancelAllFilters = this.cancelAllFilters.bind(this)
    this.setSearch = this.setSearch.bind(this)
    this.handleEntryClick = this.handleEntryClick.bind(this)
    this.openEntry = this.openEntry.bind(this)
    this.closeEntry = this.closeEntry.bind(this)
    this.findNameFromId = this.findNameFromId.bind(this)
    this.resetEntriesScroll = this.resetEntriesScroll.bind(this)
    this.cancelFiltersAndSearch = this.cancelFiltersAndSearch.bind(this)
    window.setTimeout(() => { this.getElementsSizes(); this.handleScroll() }, 500)
    window.setTimeout(() => { this.getElementsSizes(); this.handleScroll() }, 2000)
    window.setTimeout(() => { this.getElementsSizes(); this.handleScroll() }, 5000)
    window.setTimeout(() => { this.getElementsSizes(); this.handleScroll() }, 12000)
    window.addEventListener('resize', this.getElementsSizes)
    window.addEventListener('resize', this.handleScroll)
    document.addEventListener('scroll', this.handleScroll)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    this.fetchCredentials()
    this.getElementsSizes()
    this.handleScroll()
    if (this.props.spreadsheet) return this.fetchSheet()
    return this.setState({ loading_sheet: false })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH CREDENTIALS
   *
   * * * * * * * * * * * * * * * * */
  async fetchCredentials () {
    const { api_url } = this.props
    const { format, article } = this.props.tracking
    const api = `${api_url}/${format}/${article}/load`
    try {
      const reach = await window.fetch(api, { method: 'POST' })
      const response = await reach.json()
      const { lblb_tracking, lblb_posting } = response._credentials
      window.lblb_tracking = lblb_tracking
      window.lblb_posting = lblb_posting
      return { lblb_tracking, lblb_posting }
    } catch (error) {
      console.error(`Unable to fetch credentials:`)
      console.error(error)
      return Error(error)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH SHEET
   *
   * * * * * * * * * * * * * * * * */
  async fetchSheet () {
    this.setState({ loading_sheet: true, error_sheet: null })
    const sheet = this.props.spreadsheet
    try {
      const reach = await window.fetch(this.props.spreadsheet)
      if (!reach.ok) throw reach
      const data = await reach.text()
      const [[page], signatures, _filters, _entries] = parseTsv(data, [8, 3, 4, 32])
      const { filters, entries } = setupFiltersAndEntries(_filters, _entries)
      const searchableEntries = makeSearchable(entries, ['name', 'text', 'birthdate', ...filters.map(f => f.column_name)])
      const parsedData = { page, signatures, filters, entries: searchableEntries }
      this.setState({ loading_sheet: false, error_sheet: null, data_sheet: parsedData })
      return data
    } catch (error) {
      if (error.status) {
        const text = `${error.status} error while fetching : ${sheet}`
        this.setState({ loading_sheet: false, error_sheet: error }, this.handleScroll)
        console.error(text, error)
        return Error(text)
      } else {
        this.setState({ loading_sheet: false, error_sheet: error }, this.handleScroll)
        console.error(error)
        return Error(error)
      }
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE SCROLL
   *
   * * * * * * * * * * * * * * * * */
  handleScroll (e) {
    if (this.state.opened_entry) {
      const scrollDiff = window.scrollY - this.pScroll
      const newScrollX = window.scrollX
      const newScrollY = window.scrollY - scrollDiff
      window.scrollTo(newScrollX, newScrollY)
    }
    this.pScroll = window.scrollY
    const { contentOffset, contentHeight, filtersHeight } = this.state
    const scroll = window.pageYOffset || document.documentElement.scrollTop
    const shouldBeFixed = scroll >= contentOffset && scroll <= contentOffset + contentHeight - filtersHeight
    const navPosition = this.state.sticky_nav_position
    if (shouldBeFixed && navPosition === 'relative') return this.setState({ sticky_nav_position: 'fixed' })
    else if (!shouldBeFixed && navPosition === 'fixed') return this.setState({ sticky_nav_position: 'relative' })
    else return
  }

  /* * * * * * * * * * * * * * * * *
   *
   * GET ELEMENTS SIZES
   *
   * * * * * * * * * * * * * * * * */
  getElementsSizes (e) {
    const $ = sel => document.querySelector(sel)
    // Nav height
    const $nav = $('nav.main-nav')
    if (!$nav) return
    const navHeight = $nav.offsetHeight
    // Content offset, width and height
    const $content = $(`.${this.c}__content > .lblb-slot__inner`)
    if (!$content) return
    const scroll = window.pageYOffset || document.documentElement.scrollTop
    const contentClientPositionY = $content.getBoundingClientRect().y
    const contentOffset = scroll + contentClientPositionY - navHeight
    const contentWidth = $content.offsetWidth
    const contentHeight = $content.offsetHeight
    // Filters height
    const $filters = $(`.${this.c}__filters-and-search`)
    if (!$filters) return
    const filtersHeight = $filters.offsetHeight
    // Decide if setState is necessary or not
    const newState = {}
    if (this.state.contentOffset !== contentOffset) newState.contentOffset = contentOffset
    if (this.state.contentWidth !== contentWidth) newState.contentWidth = contentWidth
    if (this.state.contentHeight !== contentHeight) newState.contentHeight = contentHeight
    if (this.state.navHeight !== navHeight) newState.navHeight = navHeight
    if (this.state.filtersHeight !== filtersHeight) newState.filtersHeight = filtersHeight
    if (Object.keys(newState).length) this.setState(newState)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * SET FILTER
   *
   * * * * * * * * * * * * * * * * */
  setFilter (filter, value) {
    const newState = {
      active_filters: {
        ...this.state.active_filters,
        [filter]: value
      }
    }
    if (value === '') {
      delete newState.active_filters[filter]
    }
    this.setState(newState, () => {
      this.resetEntriesScroll()
      this.getElementsSizes()
      this.handleScroll()
    })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * CANCELL ALL FILTERS
   *
   * * * * * * * * * * * * * * * * */
  cancelAllFilters () {
    if (Object.keys(this.state.active_filters).length) {
      this.setState({ active_filters: {} }, () => {
        this.getElementsSizes()
        this.handleScroll()
      })
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * SET SEARCH
   *
   * * * * * * * * * * * * * * * * */
  setSearch (val) {
    this.setState(
      { search_value: val },
      () => {
        this.resetEntriesScroll()
        this.getElementsSizes()
        this.handleScroll()
      }
    )
  }

  /* * * * * * * * * * * * * * * * *
   *
   * CANCELL FILTERS AND SEARCH
   *
   * * * * * * * * * * * * * * * * */
  cancelFiltersAndSearch () {
    this.filtersBlock.handleClearFilters()
    this.filtersBlock.clearSearch()
    return
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE ENTRY CLICK
   *
   * * * * * * * * * * * * * * * * */
  handleEntryClick (e, id) {
    const clickInDetail = getClosestDomParent(e.target, `.${this.c}__entry-detail`)
    if (!clickInDetail) this.openEntry(id)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * OPEN ENTRY
   *
   * * * * * * * * * * * * * * * * */
  openEntry (id) {
    this.setState({ opened_entry: id })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * CLOSE ENTRY
   *
   * * * * * * * * * * * * * * * * */
  closeEntry () {
    this.setState({ opened_entry: '' })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FIND NAME FROM ID
   *
   * * * * * * * * * * * * * * * * */
  findNameFromId (id) {
    const foundEntry = this.state.data_sheet.entries.find(entry => {
      return entry.id === id
    })
    if (!foundEntry) return
    return foundEntry.name
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RESET ENTRIES SCROLL
   *
   * * * * * * * * * * * * * * * * */
  resetEntriesScroll () {
    const scrollValue = window.scrollY
    const distanceToEntriesTop = document.querySelector(`.${this.c}__entries`).getBoundingClientRect().y
    const newScrollY = scrollValue + distanceToEntriesTop - 100
    return window.scrollTo(window.scrollX, newScrollY)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    const { active_filters: activeFilters, search_value: searchValue } = state
    const { page, signatures, filters, entries } = state.data_sheet
    const assetsUrl = `${props.statics_url}/assets`

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    /* Inner logic */
    const activeCategories = Object.keys(activeFilters)
    const sortedEntries = entries.sort((a, b) => {
      const aDate = moment(a.qualified_on, 'DD/MM/YYYY')
      const bDate = moment(b.qualified_on, 'DD/MM/YYYY')
      return bDate - aDate
    })
    const filteredEntries = sortedEntries.filter(entry => {
      return activeCategories.every(category => {
        const expectedValue = activeFilters[category]
        const found = entry[category].some(pair => pair.value === expectedValue)
        return found
      })
    })
    const searchedEntries = filteredEntries.filter(entry => {
      if (!searchValue) return true
      const searchTerms = searchValue.split(' ').filter(e => e).map(term => {
        return term.normalize('NFD')
          .replace(/[\W|\u0300-\u036f]/g, ' ')
          .toLowerCase()
          .split(' ')
          .filter(e => e)
          .join('')
      })
      return searchTerms.every(term => entry.search.match(term))
    })
    const headerHeight = document.querySelector('.header-fix-nav')
      ? document.querySelector('.header-fix-nav').offsetHeight
      : 0
    const maxAge = Math.max(
      ...entries.filter(entry => entry.age[0].value !== '-')
        .map(entry => parseInt(entry.age[0].value, 10))
    )
    const minAge = Math.min(
      ...entries.filter(entry => entry.age[0].value !== '-')
        .map(entry => parseInt(entry.age[0].value, 10))
    )

    /* Display component */
    return <div className={classes.join(' ')}>
      <Grid width={24} gutterSize={[2, 1.5, 1]}>
        <Slot className={`${c}__header`} width={[7, 24, 24]}>
          <Slug big>{page.slug}</Slug>
          <InterTitle level={1} small>{page.big_title}</InterTitle>
          <Paragraph>{this.h2r.parse(page.paragraph)}</Paragraph>
          <ArticleMeta inline publishedOn={page.published_on} updatedOn={page.updated_on} authors={signatures} />
          <ShareArticle short iconsOnly tweet={page.tweet} url={props.meta.url} />
          <LibeLaboLogo target='blank' />
        </Slot>
        <Slot className={`${c}__content`} width={[16, 24, 24]} offset={[1, 0, 0]}>
          <div className={`${c}__filters-and-search ${c}__filters-and-search_${state.sticky_nav_position}`}
            style={{ top: state.navHeight, width: state.contentWidth }}>
            <FiltersAndSearch
              ref={n => this.filtersBlock = n}
              rootClass={this.c}
              filters={filters}
              activeFilters={activeFilters}
              setFilter={this.setFilter}
              setSearch={this.setSearch}
              cancelAllFilters={this.cancelAllFilters} />
          </div>
          <div className={`${c}__entries`}
            style={{
              marginTop: state.sticky_nav_position === 'fixed'
                ? `${state.filtersHeight}px`
                : 0
            }}>{
            searchedEntries.length
              ? searchedEntries.map(entry => {
                return <Entry key={entry.id}
                  openEntry={this.openEntry}
                  closeEntry={this.closeEntry}
                  cancelFiltersAndSearch={this.cancelFiltersAndSearch}
                  findNameFromId={this.findNameFromId}
                  isOpened={entry.id === state.opened_entry}
                  rootClass={this.c}
                  assetsUrl={assetsUrl}
                  headerHeight={headerHeight}
                  maxAge={maxAge}
                  minAge={minAge}
                  data={entry} />
              })
              : <Paragraph>
                Aucun résultat ne correspond à votre recherche
              </Paragraph>
          }</div>
        </Slot>
      </Grid>
      <div className='lblb-default-apps-footer'>
        <ShareArticle short iconsOnly tweet={page.tweet} url={props.meta.url} />
        <ArticleMeta publishedOn={page.published_on} updatedOn={page.updated_on} authors={signatures} />
        <LibeLaboLogo target='blank' />
      </div>
    </div>
  }
}
