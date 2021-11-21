const fs = require('fs')
const path = require('path')
const yargs = require('yargs')

const TRIGGER_DEFAULT_VALUE_FOR_CUSTOM_OPTIONS = 'non-existing-value-just-to-trigger-loading-of-default-custom-options'

module.exports = yargs
  .example('$0 --token XYZ --target src/l10n/{sheet}/{locale}.js --moduleType AMD --sheets my_sheet,other_sheet',
    'download sheets "my_sheet" and "other_sheet" from document with token "XYZ" using AMD module system. ' +
    'If your sheets "my_sheet" contained "en" translations, you should see your files in src/l10n/my_sheet/en.js')
  .option('token', {
    demandOption: true,
    describe:     'Document token (can be found in the URL)',
    type:         'string'
  })
  .option('sheets', {
    demandOption: true,
    describe:     'Coma-separated list of sheets to download',
    type:         'string',
    coerce:       arg => arg.split(',')
  })
  .option('target', {
    demandOption: true,
    describe:     'Path where to store downloaded table sheets, use {locale} and {sheet} variables',
    type:         'string'
  })
  .option('moduleType', {
    demandOption: true,
    describe:     'Type of module system used in downloaded table sheets',
    choices:      ['AMD', 'ESM', 'JSON'],
    type:         'string'
  })
  .option('customOptions', {
    default:      TRIGGER_DEFAULT_VALUE_FOR_CUSTOM_OPTIONS,
    demandOption: false,
    describe:     'Path to module with custom options',
    type:         'string',
    coerce:        pathToCustomOptions => {
      const defaultCustomOptions = require(path.join(__dirname, 'customOptions.default.js'))
      const userCustomFnPath = path.join(process.cwd(), pathToCustomOptions)
      try {
        fs.accessSync(userCustomFnPath, fs.constants.R_OK)
        return {
          ...defaultCustomOptions,
          ...require(userCustomFnPath)
        }
      } catch (_) {
        if (pathToCustomOptions !== TRIGGER_DEFAULT_VALUE_FOR_CUSTOM_OPTIONS) {
          console.log(`Error! Custom options file "${userCustomFnPath}" is not readable, using default options.`)
        }
        return defaultCustomOptions
      }
    }
  })
  .help()
  .argv
