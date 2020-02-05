const yargs = require('yargs')

module.exports = yargs
    .example('$0 --token XYZ --targetDir src/l10n/ --moduleType AMD --sheets first second' ,
        'download sheets "first" and "second" from document with token "XYZ" using AMD module system')
    .option('token', {
      demandOption: true,
      describe:     'document token (can be found in url)',
      type:         'string'
    })
    .option('sheets', {
      demandOption: true,
      describe:     'coma-separated list of sheets to download',
      type:         'string'
    })
    .option('target', {
      demandOption: true,
      describe:     'path to directory to store downloaded table sheets',
      type:         'string'
    })
    .option('moduleType', {
      demandOption: true,
      describe:     'Type of module system used in downloaded table sheets',
      choices:      ['AMD', 'ESM'],
      type:         'string'
    })
    .help()
    .argv