import frenchCollectivities from './french-collectivities.json'

export default (_filters, _entries) => {
  // Deep clone inputs
  const entries = JSON.parse(JSON.stringify(_entries))
  const filters = JSON.parse(JSON.stringify(_filters))

  // For each filter, list all possible option found in entries
  // and generate a displayable option according to filter.type
  filters.forEach(filter => {
    const { splitter: spl, column_name: col } = filter

    // If a splitter is specified, for each entry in the corresponding column,
    // split the value, trim each element.
    // No matter if a splitter is specified or not, the value is returned
    // as an array of values
    const values = []
    entries.forEach(entry => {
      entry[col] = spl
        ? entry[col].split(spl).map(v => ({ value: v.trim() }))
        : [entry[col]].map(v => ({ value: v.trim() }))
      values.push(...entry[col].map(option => option.value))
    })

    // Give filter an unduplicated list of options
    filter.options = [...new Set(values)].map(v => ({ value: v }))

    // Given the filter type, assiciate to each option.value a label inside each filter and entry
    switch (filter.type) {
      case 'text':
        filter.options.forEach(opt => { opt.label = opt.value })
        entries.forEach(entry => { entry[col].forEach(opt => { opt.label = opt.value }) })
        break
      case 'gender':
        filter.options.forEach(opt => { opt.label = opt.value === 'M' ? 'Homme' : 'Femme' })
        entries.forEach(entry => {
          entry[col].forEach(opt => {
            if (!opt.value.match(/[M|F]/)) console.error(`Invalid gender option value '${opt.value}'`, entry)
            opt.label = opt.value === 'M' ? 'Homme' : 'Femme'
          })
        })
        break
      case 'integer':
      case 'integer-range':
        filter.options.forEach(opt => {
          opt.label = opt.value 
          opt.value = parseInt(opt.value, 10)
        })
        entries.forEach(entry => {
          entry[col].forEach(opt => {
            if (!Number.isInteger(parseFloat(opt.value))) console.error(`Invalid integer option value '${opt.value}'`, entry)
            opt.label = opt.value
            opt.value = parseInt(opt.value, 10)
          })
        })
        break
      case 'french-departments':
        filter.options.forEach(opt => {
          const department = frenchCollectivities.departments.find(dept => dept.code === opt.value)
          opt.label = department.name
          opt.rank = parseInt(department.code, 10)
        })
        entries.forEach(entry => {
          entry[col].forEach(opt => {
            const department = frenchCollectivities.departments.find(dept => dept.code === opt.value)
            if (!department) console.error(`Invalid french-department option value ${opt.value}`, entry)
            opt.label = department.name
          })
        })
        break
        default:
    }
  })
  return { filters, entries }
}
