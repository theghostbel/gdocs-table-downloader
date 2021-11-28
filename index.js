const { performance } = require('perf_hooks')
const startTime = performance.now()

const fs = require('fs')
const mkdirp = require('mkdirp')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const path = require('path')

const { token, target, sheets, moduleType, customOptions, fixEmptyKeyCell, logLevel } = require('./options')

;(async() => {
  const allSheetsWithTranslations = await loadTranslations(customOptions)
  saveTranslationsToFiles(allSheetsWithTranslations)

  log([
    `Done downloading translations from sheets: ${sheets.join(', ')} `,
    `in ${Math.floor(performance.now() - startTime)}ms\n`
  ].join(''))
})()

async function loadTranslations({ getGoogleAuthCredentials, getValueMapper }) {
  const doc = new GoogleSpreadsheet(token)
  const googleAuthCredentials = getGoogleAuthCredentials()

  if (!googleAuthCredentials || Object.values(googleAuthCredentials).join('').length === 0) {
    throw Error(
      'Google Auth Credentials are empty, function getGoogleAuthCredentials() from --customOptions file '
      + 'should return object with "private_key" and "client_email".'
      + `Instead, received: ${JSON.stringify(googleAuthCredentials, null, 2)}`
    )
  }

  await doc.useServiceAccountAuth(getGoogleAuthCredentials())
  await doc.loadInfo()

  const sortedSheets = Object.values(doc.sheetsById)
    .filter(sheet => sheets.includes(sheet.title))
    .sort((a, b) => sheets.indexOf(a.title) - sheets.indexOf(b.title))

  const allSheetsWithTranslations = {}
  for (let sheet of sortedSheets) {
    allSheetsWithTranslations[sheet.title] = await getSheetTranslations(sheet)
  }

  return allSheetsWithTranslations

  async function getSheetTranslations(sheet) {
    await sheet.loadCells()
    const rows = await sheet.getRows()

    const [, ...locales] = sheet.headerValues

    return locales.reduce((acc, locale) => ({
      ...acc,
      [locale]: rowsToTranslations(sheet, rows, locale)
    }), {})
  }

  function rowsToTranslations(sheet, rows, locale) {
    return rows
      .reduce((acc, row) => {
        const key = sheet.getCellByA1(`A${row.rowNumber}`).value

        if (!key) return acc

        return ({
          ...acc,
          [key]: getValueMapper(row[locale])
        })
      }, {})
  }
}

function saveTranslationsToFiles(allSheetsWithTranslations) {
  Object.entries(allSheetsWithTranslations)
    .forEach(([sheetTitle, sheetTranslations]) => {
      Object.entries(sheetTranslations)
        .forEach(([locale, localeTranslations]) => {
          const localeModuleSource = [
            eslintQuotes(),
            beginModule(),
            JSON.stringify(localeTranslations, null, 2),
            endModule(),
            '\n'
          ].join('')

          const dir = target
            .replace(/{locale}/, locale)
            .replace(/{sheet}/, sheetTitle)

          mkdirp.sync(path.dirname(dir))

          const translationsCount = Object.keys(localeTranslations).length
          const emptyWarning = translationsCount === 0 ? '☢ ' : ''
          process.stdout.write(`${emptyWarning}Writing ${dir}, ${translationsCount} translations...`)

          fs.writeFileSync(path.normalize(dir), localeModuleSource, 'utf-8', err => {
            if (err) console.error(err)
          })

          log(' Done!')
        })
    })

  function eslintQuotes() {
    switch (moduleType) {
      case 'AMD':
      case 'ESM':
        return '/* eslint quotes: 0 */\n'
      case 'JSON':
        return ''
    }
  }

  function beginModule() {
    switch (moduleType) {
      case 'AMD': return 'define('
      case 'ESM': return 'export default '
      case 'JSON': return ''
    }
  }

  function endModule() {
    switch (moduleType) {
      case 'AMD':
        return ')'
      case 'ESM':
      case 'JSON':
        return ''
    }
  }
}

function log() {
  console.log.apply(console.log, arguments)
}
