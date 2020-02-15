

# 🖹👉📁 gdocs-table-downloader

Download your translations from Google Spreadsheet.

## 📛 Our badges
[![Node.js CI](https://github.com/theghostbel/gdocs-table-downloader/workflows/Node.js%20CI/badge.svg)](https://github.com/theghostbel/gdocs-table-downloader/actions)
[![npm version](https://badge.fury.io/js/gdocs-table-downloader.svg)](https://www.npmjs.com/package/gdocs-table-downloader)
[![dependencies](https://david-dm.org/theghostbel/gdocs-table-downloader.svg)](https://github.com/theghostbel/gdocs-table-downloader/blob/master/package.json)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/theghostbel/gdocs-table-downloader)

## 🆘 How to use?

1. Install the package
```
npm i gdocs-table-downloader -g
```
2. Set your Google Secrets to `options.js` (see `customOptions.default.js` for example)
3. Run it
```
gdocs-table-downloader --token XXX --sheets one,two --customOptions ./options.js --moduleType ESM --target ./out/{sheet}.{locale}.js
```

If your Google Spreadsheet had sheets `one` and `two`, each having, for example,
`en` and `de` locales, you should get next file structure:
```
folder-where-you-ran-this-script/
└─ out/
   ├─ one.de.js
   ├─ one.en.js
   ├─ two.de.js
   └─ two.en.js
```

# ⚙️ Options

See `options.js`, it's `yargs` config. Also, if you run this script and
forgetting to mention some required options, you would get a description of
what you've missed.

## 📦 What is `moduleType`?

Currently, `gdocs-table-downloader` supports two types of modules in generated files: AMD and ESM.
You can observe examples in `test/expected`.

### AMD (Asynchronous Module Definition)

```js
/* eslint quotes: 0 */
define({
  "row1": "cellValue"
})
```

### ESM (ECMAScript module)

```js
/* eslint quotes: 0 */
export default {
  "row1": "cellValue"
}
```

## 🙊 What about secrets?

Google Sheets API requires any kind of authentication since v4.
`gdocs-table-downloader` is limited to the "service account" type.
You should create such account in Google Console and then you have two options:

1. Put `private_key` and `client_email` directly to a file specified by `--customOptions` param. See `customOptions.default.js` for example.
2. Put `private_key` and `client_email` to ENV and read them from `process.env`

Frankly, you're not restricted to only these two methods. You can invent any
type of "secrets storing", just ensure that `getGoogleAuthCredentials()` returns
an object with two properties: `private_key` and `client_email`.

## 🛃 Custom value mappings

If you need to perform some custom mapping to values in cells before they are downloaded,
you can specify `getValueMapper(rawCellValue)` function in `--customOptions` file.

Every cell value goes through this function and the return value is stored to a result file.

If you don't specify `getValueMapper`, the default function from `customOptions.default.js`
would be used: it changes "undefined" values to empty strings.
