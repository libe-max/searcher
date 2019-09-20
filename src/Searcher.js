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
import FiltersAndSearch from './FiltersAndSearch'
import parseTsv from './parse-tsv'
import setupFiltersAndEntries from './setup-filters-and-entries'

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
      filtersHeight: 0
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.getElementsSizes = this.getElementsSizes.bind(this)
    window.setTimeout(() => {
      this.getElementsSizes()
      this.handleScroll()
    }, 500)
    window.setInterval(() => {
      this.getElementsSizes()
      this.handleScroll()
    }, 1000)
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
      const [[page], signatures, _filters, _entries] = parseTsv(data, [8, 3, 4, 25])
      const { filters, entries } = setupFiltersAndEntries(_filters, _entries)
      const parsedData = { page, signatures, filters, entries }
      this.setState({ loading_sheet: false, error_sheet: null, data_sheet: parsedData })
      return data
    } catch (error) {
      if (error.status) {
        const text = `${error.status} error while fetching : ${sheet}`
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(text, error)
        return Error(text)
      } else {
        this.setState({ loading_sheet: false, error_sheet: error })
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
  handleScroll () {
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
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    const { page, signatures, filters, entries } = state.data_sheet

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    /* Display component */
    return <div className={classes.join(' ')}>
      <Grid width={24} gutterSize={[2, 1.5, 1]}>
        <Slot className={`${c}__header`} width={[8, 24, 24]}>
          <Slug huge>{page.slug}</Slug>
          <PageTitle>{page.big_title}</PageTitle>
          <Paragraph>{page.paragraph}</Paragraph>
          <ArticleMeta inline publishedOn={page.published_on} updatedOn={page.updated_on} authors={signatures} />
          <ShareArticle short iconsOnly tweet={page.tweet} url={props.meta.url} />
          <LibeLaboLogo target='blank' />
        </Slot>
        <Slot className={`${c}__content`} width={[15, 24, 24]} offset={[1, 0, 0]}>
          <div className={`${c}__filters-and-search ${c}__filters-and-search_${state.sticky_nav_position}`}
            style={{ top: state.navHeight, width: state.contentWidth }}>
            <FiltersAndSearch rootClass={this.c} filters={filters} />
          </div>
          <div className={`${c}__entries`}
            style={{ marginTop: state.sticky_nav_position === 'fixed' ? `${state.filtersHeight}px` : 0 }}>{
            entries.map((entry, i) => <div className={`${c}__entry`} key={i} />)
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
