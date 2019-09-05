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
import parseTsv from './parse-tsv'

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
      data_sheet: {}
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.setUpFiltersAndEntries = this.setUpFiltersAndEntries.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    this.fetchCredentials()
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
      const [[page], signatures, _filters, _entries] = parseTsv(data, [8, 3, 4, 27])
      const { filters, entries } = this.setUpFiltersAndEntries(_filters, _entries)
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
   * SET UP FILTERS AND ENTRIES
   *
   * * * * * * * * * * * * * * * * */
  setUpFiltersAndEntries (_filters, _entries) {
    const entries = _entries.map(_entry => ({ ..._entry }))
    const filters = _filters.map(_filter => ({ ..._filter }))
    filters.forEach(filter => {
      const { splitter, column_name: col } = filter
      if (splitter) entries.forEach(entry => entry[col] = entry[col].split(splitter).map(e => e.trim()))
      else entries.forEach(entry => entry[col] = [entry[col]])
      let options = []
      entries.forEach(entry => options.push(...entry[col]))
      options = [...new Set(options)]

      // [WIP] inside each entry, duplicate and prefix with '_display_' the corresponding filter prop (entry.gender => entry._display_gender)
      // and transform the raw value into a displayable value eg '91' => 'Essonne (91)'
      
      filter.options = options
    })
    return { filters, entries }
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
          <div className={`${c}__filters`}><Paragraph>Filters | Search</Paragraph></div>
          <div className={`${c}__entries`}>{
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
