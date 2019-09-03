import React, { Component } from 'react'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import Grid from 'libe-components/lib/layouts/Grid'
import Slot from 'libe-components/lib/layouts/Slot'
import PageTitle from 'libe-components/lib/text-levels/PageTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'

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
      loading_sheet: false,
      error_sheet: null,
      data_sheet: []
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    this.fetchCredentials()
    if (this.props.spreadsheet) this.fetchSheet()
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
      const parsedData = data // Parse sheet here
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
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    /* Display component */
    return <div className={classes.join(' ')}>
      <Grid width={12} gutterSize={[2, 1.5, 1]}>
        <Slot className={`${c}__header`} width={[4, 12, 12]}>
          <PageTitle>Ceux-là qui sont aux JO</PageTitle>
          <Paragraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at ultricies ligula. Aliquam in consectetur purus. Nullam euismod pulvinar neque, vel condimentum metus dignissim imperdiet. Praesent et maximus elit, congue rutrum odio. Vivamus a volutpat leo. Aliquam nulla eros, ullamcorper at lectus ut, aliquet scelerisque tellus. Ut hendrerit dictum ante, eget suscipit odio tempus eget. Donec nisl quam, interdum in accumsan sit amet, feugiat ac turpis. Sed ac dignissim dui, ut placerat diam.</Paragraph>
          <ArticleMeta inline publishedOn='02/09/2019 17:13' updatedOn='03/09/2019 10:36' authors={[
            { name: 'Jean-Sol Partre', role: '', link: 'www.liberation.fr' },
            { name: 'Méxémé', role: 'Production', link: 'lol.com' }
          ]} />  
        </Slot>
        <Slot className={`${c}__content`} width={[8, 12, 12]}>
          <div className={`${c}__filters`}><Paragraph>Filters | Search</Paragraph></div>
          <div className={`${c}__entries`}>{
            new Array(287).fill(0).map((e, i) => <div className={`${c}__entry`} key={i} />)
          }</div>
        </Slot>
      </Grid>
      <div className='lblb-default-apps-footer'>
        <ShareArticle short iconsOnly tweet={props.meta.tweet} url={props.meta.url} />
        <ArticleMeta publishedOn='02/09/2019 17:13' updatedOn='03/09/2019 10:36' authors={[
          { name: 'Jean-Sol Partre', role: '', link: 'www.liberation.fr' },
          { name: 'Méxémé', role: 'Production', link: 'lol.com' }
        ]} />
        <LibeLaboLogo target='blank' />
      </div>
    </div>
  }
}
