import React, { Component } from 'react'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import Grid from 'libe-components/lib/layouts/Grid'
import Slot from 'libe-components/lib/layouts/Slot'
import Slug from 'libe-components/lib/text-levels/Slug'
import PageTitle from 'libe-components/lib/text-levels/PageTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import AnnotationTitle from 'libe-components/lib/text-levels/AnnotationTitle'
import Svg from 'libe-components/lib/primitives/Svg'
import getClosestDomParent from 'libe-utils/get-closest-dom-parent'
import FiltersAndSearch from './FiltersAndSearch'
import FranceMap from './FranceMap'
import Medals from './Medals'
import AgeGauge from './AgeGauge'
import parseTsv from './parse-tsv'
import setupFiltersAndEntries from './setup-filters-and-entries'
import makeSearchable from './make-searchable'

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
    window.setTimeout(() => {
      this.getElementsSizes()
      this.handleScroll()
    }, 500)
    window.setTimeout(() => {
      this.getElementsSizes()
      this.handleScroll()
    }, 2000)
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
    this.setState(newState)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * CANCELL ALL FILTERS
   *
   * * * * * * * * * * * * * * * * */
  cancelAllFilters () {
    if (Object.keys(this.state.active_filters).length) {
      this.setState({ active_filters: {} })
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * SET SEARCH
   *
   * * * * * * * * * * * * * * * * */
  setSearch (val) {
    this.setState({ search_value: val })
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
    const filteredEntries = entries.filter(entry => {
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
        <Slot className={`${c}__header`} width={[8, 24, 24]}>
          <Slug huge>{page.slug}</Slug>
          <PageTitle small>{page.big_title}</PageTitle>
          <Paragraph>{page.paragraph}</Paragraph>
          <ArticleMeta inline publishedOn={page.published_on} updatedOn={page.updated_on} authors={signatures} />
          <ShareArticle short iconsOnly tweet={page.tweet} url={props.meta.url} />
          <LibeLaboLogo target='blank' />
        </Slot>
        <Slot className={`${c}__content`} width={[15, 24, 24]} offset={[1, 0, 0]}>
          <div className={`${c}__filters-and-search ${c}__filters-and-search_${state.sticky_nav_position}`}
            style={{ top: state.navHeight, width: state.contentWidth }}>
            <FiltersAndSearch rootClass={this.c}
              filters={filters}
              activeFilters={activeFilters}
              setFilter={this.setFilter}
              setSearch={this.setSearch}
              cancelAllFilters={this.cancelAllFilters} />
          </div>
          <div className={`${c}__entries`}
            style={{ marginTop: state.sticky_nav_position === 'fixed' ? `${state.filtersHeight}px` : 0 }}>{
            searchedEntries.length
              ? searchedEntries.map((entry, i) => {
                const dataAttributes = {}
                Object.keys(entry).map(key => {
                  const value = Array.isArray(entry[key])
                    && entry[key].every(f => f.label !== undefined && f.value !== undefined)
                    ? entry[key].map(pair => pair.label).join(',')
                    : entry[key]
                  dataAttributes[`data-${key.trim()}`] = value
                  return value
                })
                const classes = [`${c}__entry`]
                if (entry.id === state.opened_entry) classes.push(`${c}__entry_open`)
                if (entry.tyme === 'equipe') classes.push(`${c}__entry_team`)
                if (!entry.participation_2008) classes.push(`${c}__entry_no-08`)
                if (!entry.participation_2012) classes.push(`${c}__entry_no-12`)
                if (!entry.participation_2016) classes.push(`${c}__entry_no-16`)
                return <div className={classes.join(' ')}
                  key={i}
                  onClick={e => this.handleEntryClick(e, entry.id)}
                  {...dataAttributes}>
                  <div className={`${c}__entry-icon`}>{
                    (() => {
                      const iconName = entry.sport[0].label.normalize('NFD').replace(/[\W|\u0300-\u036f]/g, ' ').toLowerCase().split(' ').filter(e => e).join('')
                      const iconUrl = `./assets/sports-icons/${iconName}.svg`
                      return <Svg src={iconUrl} />
                    })()
                  }</div>
                  <div className={`${c}__entry-name`}>
                    <AnnotationTitle big>{entry.name}</AnnotationTitle>
                  </div>
                  <div className={`${c}__entry-image`}
                    style={{ backgroundImage: `url(${entry.image_url || './assets/no-picture.jpg'}` }} />
                  <div className={`${c}__entry-detail`} style={{ top: headerHeight }}>
                    <div className={`${c}__entry-detail-outer`}
                      onClick={this.closeEntry} />
                    <div className={`${c}__entry-detail-inner`}>
                      <div className={`${c}__entry-detail-close`}
                        onClick={this.closeEntry}>
                        <Svg src={`${assetsUrl}/tilted-cross-icon_24.svg`} />
                      </div>
                      <div className={`${c}__entry-detail-inner-scrollable`}>
                        <div className={`${c}__entry-detail-id`}>
                          <div className={`${c}__entry-detail-icon`}>{
                            (() => {
                              const iconName = entry.sport[0].label.normalize('NFD').replace(/[\W|\u0300-\u036f]/g, ' ').toLowerCase().split(' ').filter(e => e).join('')
                              const iconUrl = `./assets/sports-icons/${iconName}.svg`
                              return <Svg src={iconUrl} />
                            })()
                          }</div>
                          <div className={`${c}__entry-detail-name`}><AnnotationTitle small>{entry.name}</AnnotationTitle></div>
                          <div className={`${c}__entry-detail-image`}
                            style={{ backgroundImage: `url(${entry.image_url || './assets/no-picture.jpg'}` }} />
                        </div>
                        <div className={`${c}__entry-detail-title ${c}__entry-detail-title_sm`}><AnnotationTitle huge>{entry.sport[0].label}</AnnotationTitle></div>
                        <div className={`${c}__entry-detail-data`}>
                          <div className={`${c}__entry-detail-title ${c}__entry-detail-title_lg`}><AnnotationTitle huge>{entry.sport[0].label}</AnnotationTitle></div>
                          <div className={`${c}__entry-detail-left-col`}>{
                            entry.club[0].value === '-'
                                ? ''
                                : <div className={`${c}__entry-detail-club`}>
                                  <div className={`${c}__entry-detail-club-label`}><Paragraph small>Club</Paragraph></div>
                                  <div className={`${c}__entry-detail-club-value`}><AnnotationTitle>{entry.club[0].label}</AnnotationTitle></div>
                                </div>
                            }{
                            entry.department[0].value === '-'
                              ? ''
                              : <div className={`${c}__entry-detail-map`}>
                                <FranceMap rootClass={this.c}
                                  department={entry.department[0].value} />
                              </div>
                            }{
                            entry.age[0].value === '-'
                              ? ''
                              : <div className={`${c}__entry-detail-age`}>
                              <div className={`${c}__entry-detail-age-label`}><Paragraph small>Age</Paragraph></div>
                              <div className={`${c}__entry-detail-age-value`}><AnnotationTitle>{entry.age[0].label} ans</AnnotationTitle></div>
                              <div className={`${c}__entry-detail-age-gauge`}><AgeGauge rootClass={this.c} min={minAge} max={maxAge} age={parseInt(entry.age[0].value, 10)} /></div>
                            </div>
                          }</div>
                          <div className={`${c}__entry-detail-right-col`}>
                            <div className={`${c}__entry-detail-participations`}><Paragraph>{entry.participations[0].label} participations</Paragraph></div>
                            <div className={`${c}__entry-detail-results`}>
                              <div className={`${c}__entry-detail-results-row ${c}__entry-detail-results-row_head`}>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2008`}><AnnotationTitle>2008</AnnotationTitle></div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2012`}><AnnotationTitle>2012</AnnotationTitle></div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2016`}><AnnotationTitle>2016</AnnotationTitle></div>
                              </div>
                              <div className={`${c}__entry-detail-results-row`}>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2008 ${c}__entry-detail-result_gold`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.gold08, 10)} />
                                </div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2012 ${c}__entry-detail-result_gold`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.gold12, 10)} />
                                </div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2016 ${c}__entry-detail-result_gold`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.gold16, 10)} />
                                </div>
                              </div>
                              <div className={`${c}__entry-detail-results-row`}>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2008 ${c}__entry-detail-result_silver`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.silver08, 10)} />
                                </div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2012 ${c}__entry-detail-result_silver`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.silver12, 10)} />
                                </div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2016 ${c}__entry-detail-result_silver`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.silver16, 10)} />
                                </div>
                              </div>
                              <div className={`${c}__entry-detail-results-row`}>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2008 ${c}__entry-detail-result_bronze`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.bronze08, 10)} />
                                </div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2012 ${c}__entry-detail-result_bronze`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.bronze12, 10)} />
                                </div>
                                <div className={`${c}__entry-detail-result ${c}__entry-detail-result_2016 ${c}__entry-detail-result_bronze`}>
                                  <Medals rootClass={this.c} value={parseInt(entry.bronze16, 10)} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`${c}__entry-detail-text`}><Paragraph>{entry.text}</Paragraph></div>
                        <div className={`${c}__entry-detail-teammates`}>teammates</div>
                      </div>
                    </div>
                  </div>
                </div>
              })
              : <Paragraph>Aucun résultat ne correspond à votre recherche</Paragraph>
          }</div>
        </Slot>
      </Grid>
      <div className='lblb-default-apps-footer'>
        <ShareArticle short iconsOnly tweet={page.tweet} url={props.meta.url} />
        <ArticleMeta publishedOn={page.published_on} updatedOn={page.updated_on} authors={signatures} />
        <LibeLaboLogo target='blank' />
        <Paragraph>Photos: AFP.Reuters.DR</Paragraph>
      </div>
    </div>
  }
}
