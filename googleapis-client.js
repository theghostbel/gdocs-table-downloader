const { google } = require('googleapis')
// const { auth, JWT } = require('google-auth-library')
const util = require('util')

async function getSheets({ credentials, spreadsheetId, sheetsNames = [] }) {
  // const keys = require('./auth.json');
  // const client = new JWT({
  //   email: keys.client_email,
  //   key: keys.private_key,
  //   scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  // });

  const auth = new google.auth.GoogleAuth({
    // keyFile: "auth.json", // TODO add possibility to use key file for auth
    // credentials: { // This works
    //   client_email: keys.client_email,
    //   private_key: keys.private_key
    // },
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const googleSheetsApiV4 = google.sheets('v4')
  const sheetsApiClient = util.promisify(googleSheetsApiV4.spreadsheets.get.bind(googleSheetsApiV4))

  let ranges
  if (sheetsNames.length > 0) {
    ranges = (await getAllSheetsRanges(sheetsApiClient, auth, spreadsheetId))
      .filter(({ title }) => sheetsNames.includes(title))
      .map(({ range }) => range)
  }

  return await getSheetsData(sheetsApiClient, auth, spreadsheetId, ranges)
}

// TODO: Used for local development and testing
// getSheets({
//   spreadsheetId: '1oFig-VwfFKP3BLsW4ZgLiw5ftAfcD4jpcUwmXBdhCPU',
//   sheets: ['corrupted_sheet']
// }).catch(console.error);

async function getSheetsData(sheetsApiClient, auth, spreadsheetId, ranges) {
  const result = await sheetsApiClient({
    auth,
    spreadsheetId,
    includeGridData: true,
    ranges,
    alt: 'json',
    prettyPrint: true,
    fields: 'sheets.properties.title,sheets.data.rowData.values.formattedValue',
  })

  return result.data.sheets
    .filter((sheet) => Object.keys(sheet.data[0]).length)
    .map((sheet) => {
      const { header, rows } = splitRowDataIntoHeaderAndRows(sheet.data[0].rowData)

      return {
        title: sheet.properties.title,
        header,
        rows,
      }
    })
}

function convertSheetRowToArray(row) {
  return row.values.map(({ formattedValue }) => formattedValue)
}

function splitRowDataIntoHeaderAndRows(rowData) {
  const rowHasCells = (row) => Object.keys(row).length > 0
  const rowHasKeyCell = (row) => Object.keys(row.values[0]).length > 0

  let [header, ...rows] = rowData

  if (!rowHasKeyCell(rowData[0])) {
    header.values[0] = { formattedValue: 'key' }
  }

  return {
    header: convertSheetRowToArray(header),
    rows: rows.filter(rowHasCells).filter(rowHasKeyCell).map(convertSheetRowToArray),
  }
}

async function getAllSheetsRanges(sheetsApiClient, auth, spreadsheetId) {
  const result = await sheetsApiClient({
    auth,
    spreadsheetId,
    includeGridData: false,
    alt: 'json',
    prettyPrint: true,
    fields: 'sheets.properties.title,sheets.properties.gridProperties',
  })

  return result.data.sheets
    .map((sheet) => ({
      title: sheet.properties.title,
      rowCount: sheet.properties.gridProperties.rowCount,
      columnCount: sheet.properties.gridProperties.columnCount,
    }))
    .map((sheet) => ({
      ...sheet,
      range: `${sheet.title}!A1:${columnToLetter(sheet.columnCount)}${sheet.rowCount}`,
    }))
}

function columnToLetter(column) {
  let temp
  let letter = ''
  let col = column
  while (col > 0) {
    temp = (col - 1) % 26
    letter = String.fromCharCode(temp + 65) + letter
    col = (col - temp - 1) / 26
  }
  return letter
}

module.exports = {
  getSheets,
}
