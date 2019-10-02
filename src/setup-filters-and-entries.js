import frenchCollectivities from './french-collectivities.json'

export default (_filters, _entries) => {
  // Deep clone inputs
  const filters = JSON.parse(JSON.stringify(_filters))
  const entries = JSON.parse(JSON.stringify(_entries)).filter(e => e.display === '1')

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
    filter.options = [...new Set(values)].sort().map(v => ({ value: v }))

    // Given the filter type, assiciate to each option.value a label inside each filter and entry
    switch (filter.type) {
      case 'text':
        filter.options.forEach(opt => { opt.label = opt.value })
        entries.forEach(entry => { entry[col].forEach(opt => { opt.label = opt.value }) })
        break
      case 'gender':
        filter.options.forEach(opt => {
          if (!opt.value.match(/[M|H|F|2]/)) return
          if (opt.value === 'H' || opt.value === 'M') opt.label = 'Homme'
          else if (opt.value === 'F') opt.label = 'Femme'
          else if (opt.value === '2') opt.label = 'Mixte'
        })
        entries.forEach(entry => {
          entry[col].forEach(opt => {
            if (!opt.value.match(/[M|H|F|2]/)) {
              console.error(`Invalid gender option value in column ${col} '${opt.value}'`, entry)
              return
            }
            if (opt.value === 'H' || opt.value === 'M') opt.label = 'Homme'
            else if (opt.value === 'F') opt.label = 'Femme'
            else if (opt.value === '2') opt.label = 'Mixte'
          })
        })
        break
      case 'integer':
        filter.options.forEach(opt => {
          if (!Number.isInteger(parseFloat(opt.value))) return
          opt.label = opt.value 
          opt.value = parseInt(opt.value, 10).toString()
        })
        entries.forEach(entry => {
          entry[col].forEach(opt => {
            if (!Number.isInteger(parseFloat(opt.value))) {
              console.error(`Invalid integer option value in column ${col} '${opt.value}'`, entry)
              return
            }
            opt.label = opt.value
            opt.value = parseInt(opt.value, 10).toString()
          })
        })
        break
      case 'french-departments':
        filter.options.forEach(opt => {
          const department = frenchCollectivities.departments.find(dept => dept.code === opt.value)
          if (!department) return
          opt.label = `${department.code} - ${department.name}`
          opt.rank = parseInt(department.code, 10).toString()
        })
        entries.forEach(entry => {
          entry[col].forEach(opt => {
            const department = frenchCollectivities.departments.find(dept => dept.code === opt.value)
            if (!department) {
              console.error(`Invalid french-department option value in column ${col} ${opt.value}`, entry)
              return
            }
            opt.label = department.name
          })
        })
        break
        default:
    }
  })

  return {
    entries,
    filters: filters.map(category => ({
      ...category,
      options: category.options.filter(option => option.label)
    }))
  }
}
