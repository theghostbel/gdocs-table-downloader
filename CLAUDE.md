# gdocs-table-downloader

A Node.js CLI tool that downloads translations from Google Spreadsheets and generates locale files in various module formats (AMD, ESM, JSON).

## Project Overview

This tool helps teams maintain translations in Google Spreadsheets and automatically sync them to their codebase. It connects to Google Sheets API v4, fetches translation data, and generates properly formatted module files based on your project's needs.

## Architecture

### Core Files

- **`index.js`** - Main entry point that orchestrates the download process
  - Loads translations from Google Sheets via `googleapis-client.js`
  - Saves translations to files using configured module format
  - Handles performance tracking and logging

- **`googleapis-client.js`** - Google Sheets API integration
  - Authenticates using service account credentials
  - Fetches spreadsheet data with specified sheet names
  - Converts raw sheet data into structured translation objects
  - Filters empty rows and handles header detection

- **`options.js`** - CLI configuration using yargs
  - Defines all command-line options
  - Handles coercion for auth files and custom options
  - Validates required parameters

- **`customOptions.default.js`** - Default configuration template
  - `getGoogleAuthCredentials()` - Returns auth credentials (client_email, private_key)
  - `getValueMapper()` - Maps cell values (default converts "undefined" to empty strings)

### Data Flow

1. CLI arguments parsed → `options.js`
2. Auth credentials loaded → `customOptions.js` or `auth.json`
3. Google Sheets API called → `googleapis-client.js`
4. Raw sheet data transformed → translation objects (key-value pairs per locale)
5. Files generated → using module type wrapper (AMD/ESM/JSON)
6. Files saved → target path with `{locale}` and `{sheet}` placeholders

### Module Types

The tool supports three output formats:

- **AMD**: `define({ "key": "value" })`
- **ESM**: `export default { "key": "value" }`
- **JSON**: `{ "key": "value" }`

### Authentication

Google Sheets API v4 requires service account authentication. Two methods are supported:

1. **Custom Options File** - Put credentials in `customOptions.js`:
   ```javascript
   getGoogleAuthCredentials: () => ({
     client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
     private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
   })
   ```

2. **Auth JSON File** - Use `--auth ./auth.json`:
   ```json
   {
     "private_key": "...",
     "client_email": "..."
   }
   ```

## Testing

- **Test Framework**: Jest
- **Test Files**: `test/test.spec.js`
- **Expected Outputs**: `test/expected/{amd,esm,json}/`
- **Actual Outputs**: `test/actual/{amd,esm,json}/`

Tests download from a live Google Spreadsheet (token: `1oFig-VwfFKP3BLsW4ZgLiw5ftAfcD4jpcUwmXBdhCPU`) and compare outputs.

### Running Tests

```bash
npm test  # Runs download-example-all then jest
```

## Usage Example

```bash
gdocs-table-downloader \
  --token 1oFig-VwfFKP3BLsW4ZgLiw5ftAfcD4jpcUwmXBdhCPU \
  --sheets sheet_first,SECOND_SHEET \
  --customOptions ./customOptions.js \
  --moduleType ESM \
  --target ./out/{sheet}.{locale}.js
```

## Key Concepts

- **Token**: Spreadsheet ID from Google Sheets URL
- **Sheets**: Comma-separated list of sheet names to download
- **Target**: Output path template with `{locale}` and `{sheet}` placeholders
- **Value Mapper**: Custom function to transform cell values before saving

## Dependencies

- `googleapis` (109.0.1) - Google Sheets API client
- `mkdirp` (1.0.3) - Directory creation
- `yargs` (17.6.2) - CLI argument parsing
- `jest` (29.3.1) - Testing framework

## Release Process

1. Set env vars: `SERVICE_ACCOUNT_PRIVATE_KEY` and `SERVICE_ACCOUNT_CLIENT_EMAIL`
2. Run: `npm run update-patch` (runs tests, bumps version)
3. Push with tags: `git push --follow-tags`
4. Create GitHub release
5. CI automatically publishes to npm

## Common Tasks

- **Add new module type**: Update `beginModule()`, `endModule()`, and `eslintQuotes()` in `index.js`
- **Change auth method**: Modify `loadTranslations()` in `index.js`
- **Add custom value mapping**: Implement `getValueMapper()` in custom options file
- **Debug API calls**: Check `googleapis-client.js` and the `fields` parameter in `getSheetsData()`
