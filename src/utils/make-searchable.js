export default (entries, fields) => {
  return entries.map(entry => {
    const searchStr = []
    fields.forEach(field => {
      const entryField = JSON.stringify(entry[field])
        .normalize('NFD')
        .replace(/[\W|\u0300-\u036f]/g, ' ')
        .toLowerCase()
        .split(' ')
        .filter(e => e)
        .join('')
      searchStr.push(entryField)
    })
    return {
      ...entry,
      search: searchStr.join('')
    }
  })
}
