const fs = require('fs')
const path = require('path')
const yargs = require('yargs')

const TRIGGER_DEFAULT_VALUE_FOR_PATH_OPTION = 'non-existing-value-to-know-that-path-was-not-given'

module.exports = yargs
  .example('$0 --token XYZ --target src/l10n/{sheet}/{locale}.js --moduleType AMD --sheets my_sheet,other_sheet',
    'download sheets "my_sheet" and "other_sheet" from document with token "XYZ" using AMD module system. ' +
    'If your sheet "my_sheet" contained "en" translations, you should see them in src/l10n/my_sheet/en.js')
  .option('token', {
    demandOption: true,
    describe:     'Document token (can be found in the URL)',
    type:         'string'
  })
  .option('sheets', {
    demandOption: true,
    describe:     'Coma-separated list of sheets to download',
    type:         'string',
    coerce:       arg => arg ? arg.split(',') : arg
  })
  .option('target', {
    demandOption: true,
    describe:     'Path where to store downloaded table sheets, use {locale} and {sheet} variables',
    type:         'string'
  })
  .option('muteEslintQuotes', {
    demandOption: false,
    describe:     'Whether to remove "eslint quotes: 0" from the top of generated files',
    type:         'boolean'
  })
  .option('moduleType', {
    demandOption: true,
    describe:     'Type of module system used in downloaded table sheets',
    choices:      ['AMD', 'ESM', 'JSON'],
    type:         'string'
  })
  .option('auth', {
    default:      TRIGGER_DEFAULT_VALUE_FOR_PATH_OPTION,
    demandOption: false,
    describe:     'Path to auth.json file that has "private_key" and "client_email" fields. This file can be downloaded from Google Console (see docs).',
    type:         'string',
    coerce:        value => {
      const authPath = path.join(process.cwd(), value)
      try {
        fs.accessSync(authPath, fs.constants.R_OK)
        return require(authPath)
      } catch (_) {
        if (value !== TRIGGER_DEFAULT_VALUE_FOR_PATH_OPTION) {
          console.log(`Error! File "${value}" is not readable.`)
        }
      }
    }
  })
  .option('customOptions', {
    default:      TRIGGER_DEFAULT_VALUE_FOR_PATH_OPTION,
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
        if (pathToCustomOptions !== TRIGGER_DEFAULT_VALUE_FOR_PATH_OPTION) {
          console.log(`Error! Custom options file "${userCustomFnPath}" is not readable, using default options.`)
        }
        return defaultCustomOptions
      }
    }
  })
  .option('logLevel', {
    default:      'info',
    describe:     'Choose the log level.',
    choices:      ['info', 'debug', 'none (not supported yet)'],
    type:         'string'
  })
  .help()
  .argv
