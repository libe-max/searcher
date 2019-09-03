module.exports = {
  meta: {
    author: 'Maxime Fabas',
    title: 'Un moteur de recherche',
    url: '',
    description: '',
    image: '',
    xiti_id: 'searcher',
    tweet: 'Some tweet text'
  },
  tracking: {
    active: false,
    format: 'searcher',
    article: 'searcher'
  },
  show_header: true,
  statics_url: process.env.NODE_ENV === 'production'
    ? 'https://www.liberation.fr/apps/static'
    : 'http://10.14.40.57:3003',
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo-2.site/api'
    : 'http://10.14.40.57:3004/api',
  stylesheet: 'searcher.css', // The name of the css file hosted at ${statics_url}/styles/apps/
  spreadsheet: undefined // The spreadsheet providing data to the app
}
