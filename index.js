const { performance } = require('perf_hooks')
const startTime = performance.now()

const fs = require('fs')
const mkdirp = require('mkdirp')
const { getSheets } = require('./googleapis-client')
const path = require('path')

const { token, target, sheets, moduleType, muteEslintQuotes, customOptions, auth } = require('./options')

;(async() => {
  const allSheetsWithTranslations = await loadTranslations(customOptions, auth)
  saveTranslationsToFiles(allSheetsWithTranslations)

  log([
    `Done downloading translations from sheets: ${sheets.join(', ')} `,
    `in ${Math.floor(performance.now() - startTime)}ms\n`
  ].join(''))
})()

async function loadTranslations({ getGoogleAuthCredentials, getValueMapper }, auth) {
  let googleAuthCredentials = getGoogleAuthCredentials()

  // using auth from customOptions.getGoogleAuthCredentials()
  if (!auth && (!googleAuthCredentials || Object.values(googleAuthCredentials).join('').length === 0)) {
    throw Error(
      'Google Auth Credentials are empty, function getGoogleAuthCredentials() from --customOptions file '
      + 'should return object with "private_key" and "client_email".'
      + `Instead, received: ${JSON.stringify(googleAuthCredentials, null, 2)}`
    )
  }

  // using auth from auth.json
  if (auth) {
    if (!auth.private_key ||!auth.client_email) {
      throw Error(
        'Google Auth Credentials are empty, auth option '
        + 'should be an object with "private_key" and "client_email".'
        + `Instead, received: ${JSON.stringify(auth, null, 2)}`
      )
    }

    googleAuthCredentials = {
      client_email: auth.client_email,
      private_key: auth.private_key
    }
  }

  const sheetsAsJson = await getSheets({
    credentials: googleAuthCredentials,
    spreadsheetId: token,
    sheetsNames: sheets
  })

  const allSheetsWithTranslations = {}
  for (let sheet of sheetsAsJson) {
    allSheetsWithTranslations[sheet.title] = convertSheetJsonToTranslation(sheet)
  }

  return allSheetsWithTranslations

  function convertSheetJsonToTranslation(sheet) {
    const [, ...locales] = sheet.header

    return locales.reduce((acc, locale) => ({
      ...acc,
      [locale]: rowsToTranslations(sheet.rows, sheet.header.indexOf(locale))
    }), {})
  }

  function rowsToTranslations(rows, index) {
    return rows
      .reduce((acc, row) => {
        const key = row[0]

        if (!key) return acc

        return ({
          ...acc,
          [key]: getValueMapper(row[index])
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
            !muteEslintQuotes && eslintQuotes(),
            beginModule(),
            JSON.stringify(localeTranslations, null, 2),
            endModule(),
            '\n'
          ].join('')

          const dir = target
            .replace(/{locale}/, locale)
            .replace(/{sheet}/, sheetTitle)

          mkdirp.sync(path.dirname(dir))

          // TODO Might be obsolete: empty sheets were removed before
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
