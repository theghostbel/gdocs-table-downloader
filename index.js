const { performance } = require('perf_hooks')
const startTime = performance.now()

const _ = require('underscore')
const fs = require('fs')
const mkdirp = require('mkdirp')
const GoogleSpreadsheet = require('google-spreadsheet')
const path = require('path')

const { token, target, sheets, moduleType } = require('./options')

const worksheetNames = sheets.split(',')
worksheetNames
    .forEach(worksheetName => createTranslationsPerLocale(token, worksheetName, path.join(target, worksheetName)))

function createTranslationsPerLocale(spreadsheetToken, worksheetName, dirForTranslations) {
  const sheet = new GoogleSpreadsheet(spreadsheetToken)
  const processCells = (err, cells) => {
    if (err) throw err

    const rowProp = 'row'
    const colProp = 'col'

    const rows = cells.reduce((rows, cell) => {
      const rowIndex = cell[rowProp] - 1
      if (_.isUndefined(rows[rowIndex])) rows[rowIndex] = []
      rows[rowIndex].push(cell)
      return rows
    }, [])

    rows.forEach((col) => {
      col.sort((cell1, cell2) => cell1[colProp] - cell2[colProp])
    })

    const finalList = []
    const properties = rows[0].reduce((properties, cell) => {
      if (cell.value === '') return properties

      properties[cell[colProp]] = cell.value
          .toLowerCase()
          .replace(/[- ]/ig, ' ')
          .split(' ')
          .map((val, index) => index ? val.charAt(0).toUpperCase() + val.slice(1) : val)
          .join('')

      return properties
    }, {})

    rows.splice(0, 1)
    rows.forEach(col => {
      const newObject = {}
      let hasValues = false

      col.forEach(cell => {
        let val
        if (typeof cell.numericValue !== 'undefined') {
          val = parseFloat(cell.numericValue)
          hasValues = true
        } else if (cell.value === 'TRUE') {
          val = true
          hasValues = true
        } else if (cell.value === 'FALSE') {
          val = false
          hasValues = true
        } else if (cell.value !== '') {
          val = cell.value
          hasValues = true
        }

        const colNumber = cell[colProp]
        newObject[properties[colNumber]] = val
      })

      if (hasValues) finalList.push(newObject)
    })

    const allLocalesFromSheet = _.chain(finalList)
        .reduce((memo, el) => {
          const rowLocales = _.chain(el).keys().without('key').value()
          return memo.concat(rowLocales)
        }, [])
        .uniq()
        .filter(locale => locale !== 'undefined')
        .value()

    const translationsPerLocale = {}
    allLocalesFromSheet.forEach(locale => {
      translationsPerLocale[locale] = _.reduce(finalList, (memo, translation) => {
        if (!translation.key) return memo
        memo[translation.key] = translation[locale] || ''
        return memo
      }, {})
    })

    mkdirp.sync(dirForTranslations)

    _.each(translationsPerLocale, (translations, locale) => {
      const localeModuleSource = '/* eslint quotes: 0 */' + '\n' + 'export default ' + JSON.stringify(translations, null, 2) + '\n'
      process.stdout.write(`Writing ${locale}.js, ${Object.keys(translations).length} translations...`)

      fs.writeFileSync(path.join(dirForTranslations, `${locale}.js`), localeModuleSource, 'utf-8', err => {
        if (err) console.error(err)
      })

      log(' Done!')
    })

    log(`Done downloading translations to ${dirForTranslations} in ${Math.floor(performance.now() - startTime)}ms\n`)
  }

  const getInfoCallback = (err, spreadsheet) => {
    if (err) throw err
    spreadsheet.worksheets.find(({ title }) => title === worksheetName).getCells(processCells)
  }

  sheet.getInfo(getInfoCallback)
}

function log() {
  console.log.apply(console.log, arguments)
}
