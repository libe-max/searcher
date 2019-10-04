import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Parser } from 'html-to-react'
import AgeGauge from '../AgeGauge'
import FranceMap from '../FranceMap'
import Medals from '../Medals'
import Svg from 'libe-components/lib/primitives/Svg'
import AnnotationTitle from 'libe-components/lib/text-levels/AnnotationTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'

/*
 *   Entry component
 *   ------------------------------------------------------
 *
 *   DESCRIPTION
 *   Template file for making a lblb component
 *
 *   PROPS
 *   rootClass
 *
 */

export default class Entry extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor (props) {
    super()
    this.c = `${props.rootClass}__entry`
    this.h2r = new Parser()
    this.numberToPosition = this.numberToPosition.bind(this)
  }

  numberToPosition (number) {
    if (number <= 0) return
    else if (number === 1) return <span>{number}<sup>ère</sup></span>
    else return <span>{number}<sup>eme</sup></span>
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, props } = this
    const { data, isOpened } = props

    /* Inner logic */
    const dataAttributes = {}
    Object.keys(data).map(key => {
      const value = Array.isArray(data[key])
        && data[key].every(f => f.label !== undefined && f.value !== undefined)
        ? data[key].map(pair => pair.label).join(',')
        : data[key]
      dataAttributes[`data-${key.trim()}`] = value
      return value
    })
    const teammatesContent = <span>
      Voir aussi : {
        data.related_ids.split(',')
          .map(e => e.trim())
          .map(id => <span key={id}
            className={`${this.c}-teammate`}
            onClick={e => {
              props.cancelFiltersAndSearch()
              props.openEntry(id)
            }}>
            <a>{props.findNameFromId(id)}</a>
          </span>)
    }</span>
    
    /* Assign classes */
    const classes = [c]
    if (isOpened) classes.push(`${c}_open`)
    if (data.type === 'equipe') classes.push(`${c}_team`)
    if (!data.participation_2008) classes.push(`${c}_no-08`)
    if (!data.participation_2012) classes.push(`${c}_no-12`)
    if (!data.participation_2016) classes.push(`${c}_no-16`)

    /* Display component */
    return <div className={classes.join(' ')}
      {...dataAttributes}>
      <div className={`${c}-thumb`}
        onClick={e => props.openEntry(data.id)}>
        <div className={`${c}-thumb-image`} style={{ backgroundImage: `url(${data.image_url})` }} />
        <div className={`${c}-thumb-icon`}>{
          (() => {
            const iconName = data.sport[0].label.normalize('NFD').replace(/[\W|\u0300-\u036f]/g, ' ').toLowerCase().split(' ').filter(e => e).join('')
            const iconUrl = `./assets/sports-icons/${iconName}.svg`
            return <Svg src={iconUrl} />
          })()
        }</div>
        <div className={`${c}-thumb-name`}>
          <AnnotationTitle big>{data.name}</AnnotationTitle>
        </div>
      </div>
      { !isOpened ? '' : <div className={`${c}-detail`}>
        <div className={`${c}-detail-outer`} onClick={props.closeEntry} />
        <div className={`${c}-detail-inner`} style={{ marginTop: props.headerHeight }}>
          <div className={`${c}-detail-close`}
            onClick={props.closeEntry}>
            <Svg src={`${props.assetsUrl}/tilted-cross-icon_40.svg`} />
          </div>
          <div className={`${c}-detail-scrollable`}>
            <div className={`${c}-detail-id`}>
              <div className={`${c}-detail-image`} style={{ backgroundImage: `url(${data.image_url})` }} />
              <div className={`${c}-detail-icon`}>{
                (() => {
                  const iconName = data.sport[0].label.normalize('NFD').replace(/[\W|\u0300-\u036f]/g, ' ').toLowerCase().split(' ').filter(e => e).join('')
                  const iconUrl = `./assets/sports-icons/${iconName}.svg`
                  return <Svg src={iconUrl} />
                })()
              }</div>
              <div className={`${c}-detail-name`}>
                <AnnotationTitle huge>{data.name}</AnnotationTitle>
              </div>
            </div>
            <div className={`${c}-detail-data`}>
              <div className={`${c}-detail-sport`}><AnnotationTitle huge>{data.sport[0].label}</AnnotationTitle></div>
              <div className={`${c}-detail-events`}><Paragraph big>Épreuves : {data.events.map(e => e.label).join(', ')}</Paragraph></div>
              {data.club[0].value !== '-' ? <div className={`${c}-detail-club-label`}><Paragraph>Club</Paragraph></div> : ''}
              {data.club[0].value !== '-' ? <div className={`${c}-detail-club-name`}><AnnotationTitle big>{data.club[0].label}</AnnotationTitle></div> : ''}
              {data.department[0].value !== '-' ? <div className={`${c}-detail-map`}><FranceMap rootClass={props.rootClass} department={data.department[0].value} /></div> : ''}
              {data.age[0].value !== '-' ? <div className={`${c}-detail-age-label`}><Paragraph>Age</Paragraph></div> : ''}
              {data.age[0].value !== '-' ? <div className={`${c}-detail-age-name`}><AnnotationTitle big>{data.age[0].label} ans</AnnotationTitle></div> : ''}
              {data.age[0].value !== '-' ? <div className={`${c}-detail-gauge`}>
                <AgeGauge rootClass={props.rootClass}
                  min={props.minAge}
                  max={props.maxAge}
                  age={parseInt(data.age[0].value, 10)} />
              </div> : ''}
              <div className={`${c}-detail-participations`}>
                <AnnotationTitle big>{this.numberToPosition(parseInt(data.participations[0].label, 10) + 1)}</AnnotationTitle>
                <Paragraph>participation</Paragraph>
              </div>
              <div className={`${c}-detail-results`}>
                <div className={`${c}-detail-results-row ${c}-detail-results-row_head`}>
                  <div className={`${c}-detail-result ${c}-detail-result_2008`}><AnnotationTitle>2008</AnnotationTitle></div>
                  <div className={`${c}-detail-result ${c}-detail-result_2012`}><AnnotationTitle>2012</AnnotationTitle></div>
                  <div className={`${c}-detail-result ${c}-detail-result_2016`}><AnnotationTitle>2016</AnnotationTitle></div>
                </div>
                <div className={`${c}-detail-results-row`}>
                  <div className={`${c}-detail-result ${c}-detail-result_2008 ${c}-detail-result_gold`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.gold08, 10)} />
                  </div>
                  <div className={`${c}-detail-result ${c}-detail-result_2012 ${c}-detail-result_gold`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.gold12, 10)} />
                  </div>
                  <div className={`${c}-detail-result ${c}-detail-result_2016 ${c}-detail-result_gold`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.gold16, 10)} />
                  </div>
                </div>
                <div className={`${c}-detail-results-row`}>
                  <div className={`${c}-detail-result ${c}-detail-result_2008 ${c}-detail-result_silver`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.silver08, 10)} />
                  </div>
                  <div className={`${c}-detail-result ${c}-detail-result_2012 ${c}-detail-result_silver`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.silver12, 10)} />
                  </div>
                  <div className={`${c}-detail-result ${c}-detail-result_2016 ${c}-detail-result_silver`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.silver16, 10)} />
                  </div>
                </div>
                <div className={`${c}-detail-results-row`}>
                  <div className={`${c}-detail-result ${c}-detail-result_2008 ${c}-detail-result_bronze`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.bronze08, 10)} />
                  </div>
                  <div className={`${c}-detail-result ${c}-detail-result_2012 ${c}-detail-result_bronze`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.bronze12, 10)} />
                  </div>
                  <div className={`${c}-detail-result ${c}-detail-result_2016 ${c}-detail-result_bronze`}>
                    <Medals rootClass={props.rootClass}
                      value={parseInt(data.bronze16, 10)} />
                  </div>
                </div>
              </div>
              <div className={`${c}-detail-text`}><Paragraph>{this.h2r.parse(data.text)}</Paragraph></div>
              { data.related_ids ? <div className={`${c}-detail-teammates`}><Paragraph>{teammatesContent}</Paragraph></div> : '' }
            </div>
          </div>
        </div>
      </div> }
    </div>
  }
}

/* * * * * Prop types * * * * */
Entry.propTypes = {
  prop: PropTypes.string
}

Entry.defaultProps = {
  prop: null
}

