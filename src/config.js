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
    : 'http://localhost:3003',
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo-2.site/api'
    : 'http://localhost:3004/api',
  stylesheet: 'searcher.css', // The name of the css file hosted at ${statics_url}/styles/apps/
  spreadsheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSi6Qe-h663Rgxb_eZfU6rKQbpYizapdCXo3OlrwS0nBhL8KgLXQJhksNjT98qb7HNNiXFqJ1wnfOxC/pub?gid=339818112&single=true&output=tsv'
}
