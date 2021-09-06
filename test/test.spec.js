const fs = require('fs')

const TIMEOUT = 10000

describe('using AMD (Asynchronous Module Definition)', () => {
  const files = [
    'en.sheet_first.js',
    'ru.sheet_first.js',
    'en.SECOND_SHEET.js',
    'ua.SECOND_SHEET.js',
    'en.corrupted_sheet.js',
    'ua.corrupted_sheet.js'
  ]

  assertActualAndExpectedTranslationsAreEqual('amd', files, TIMEOUT)
})

describe('using ESM (ECMAScript module syntax)', () => {
  const files = [
    'sheet_first.en.js',
    'sheet_first.ru.js',
    'SECOND_SHEET.en.js',
    'SECOND_SHEET.ua.js',
    'corrupted_sheet.en.js',
    'corrupted_sheet.ua.js'
  ]

  assertActualAndExpectedTranslationsAreEqual('esm', files, TIMEOUT)
})

function assertActualAndExpectedTranslationsAreEqual(subfolder, files, timeout) {
  it.each(files.map(file => ({
    file
  })))(`creates the same file $file as expected`, ({ file}) => {
    const actual = fs.readFileSync(`test/actual/${subfolder}/${file}`, 'utf8')
    const expected = fs.readFileSync(`test/expected/${subfolder}/${file}`, 'utf8')
    expect(actual).toStrictEqual(expected)
  }, timeout)
}
