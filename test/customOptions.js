module.exports = {
  getValueMapper: (value) => {
    if (typeof value === 'undefined') return ''

    return value.replace('{value}', '_replaced_')
  },
}
