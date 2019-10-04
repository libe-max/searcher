module.exports = {
  meta: {
    author: 'Clara Dealberto, Maxime Fabas, Benjamen Monnet',
    title: 'Qui sont les Françaises et Français qualifiés pour les JO de Tokyo ?',
    url: 'https://www.liberation.fr/apps/2019/10/qualifies-francais-jo-2020',
    description: 'Jusqu’au début des Jeux olympiques de Tokyo, suivez la constitution de l’équipe de France olympique, au fur et à mesure de la qualification des athlètes dans les différents sports grâce à notre moteur de recherche.',
    image: 'https://www.liberation.fr/apps/2019/10/qualifies-francais-jo-2020/social.jpg',
    xiti_id: 'qualifies-france-jo-2020',
    tweet: ''
  },
  tracking: {
    active: false,
    format: 'searcher',
    article: 'qualifies-francais-jo-2020'
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
