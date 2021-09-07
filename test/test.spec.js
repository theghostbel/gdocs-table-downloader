const fs = require('fs')

test('creates same files as expected using AMD (Asynchronous Module Definition)', () => {
  const actual = {
    firstSheetEn:  fs.readFileSync('test/actual/amd/en.sheet_first.js', 'utf8'),
    firstSheetRu:  fs.readFileSync('test/actual/amd/ru.sheet_first.js', 'utf8'),
    secondSheetEn: fs.readFileSync('test/actual/amd/en.SECOND_SHEET.js', 'utf8'),
    secondSheetUa: fs.readFileSync('test/actual/amd/ua.SECOND_SHEET.js', 'utf8'),
  }
  const expected = {
    firstSheetEn:  fs.readFileSync('test/expected/amd/en.sheet_first.js', 'utf8'),
    firstSheetRu:  fs.readFileSync('test/expected/amd/ru.sheet_first.js', 'utf8'),
    secondSheetEn: fs.readFileSync('test/expected/amd/en.SECOND_SHEET.js', 'utf8'),
    secondSheetUa: fs.readFileSync('test/expected/amd/ua.SECOND_SHEET.js', 'utf8'),
  }
  expect(actual).toStrictEqual(expected)
}, 10000)

test('creates same files as expected using ESM (ECMAScript module syntax)', () => {
  const actual = {
    firstSheetEn:  fs.readFileSync('test/actual/esm/sheet_first.en.js', 'utf8'),
    firstSheetRu:  fs.readFileSync('test/actual/esm/sheet_first.ru.js', 'utf8'),
    secondSheetEn: fs.readFileSync('test/actual/esm/SECOND_SHEET.en.js', 'utf8'),
    secondSheetUa: fs.readFileSync('test/actual/esm/SECOND_SHEET.ua.js', 'utf8'),
  }
  const expected = {
    firstSheetEn:  fs.readFileSync('test/expected/esm/sheet_first.en.js', 'utf8'),
    firstSheetRu:  fs.readFileSync('test/expected/esm/sheet_first.ru.js', 'utf8'),
    secondSheetEn: fs.readFileSync('test/expected/esm/SECOND_SHEET.en.js', 'utf8'),
    secondSheetUa: fs.readFileSync('test/expected/esm/SECOND_SHEET.ua.js', 'utf8'),
  }
  expect(actual).toStrictEqual(expected)
}, 10000)
