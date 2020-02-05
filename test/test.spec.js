const fs = require('fs')

test('creates same files as expected', () => {
  const actual = {
    firstSheetEn:  fs.readFileSync('test/actual/sheet_first/en.js', 'utf8'),
    firstSheetRu:  fs.readFileSync('test/actual/sheet_first/ru.js', 'utf8'),
    secondSheetEn: fs.readFileSync('test/actual/SECOND_SHEET/en.js', 'utf8'),
    secondSheetUa: fs.readFileSync('test/actual/SECOND_SHEET/ua.js', 'utf8'),
  }
  const expected = {
    firstSheetEn:  fs.readFileSync('test/expected/sheet_first/en.js', 'utf8'),
    firstSheetRu:  fs.readFileSync('test/expected/sheet_first/ru.js', 'utf8'),
    secondSheetEn: fs.readFileSync('test/expected/SECOND_SHEET/en.js', 'utf8'),
    secondSheetUa: fs.readFileSync('test/expected/SECOND_SHEET/ua.js', 'utf8'),
  }
  expect(actual).toStrictEqual(expected)
}, 15000);