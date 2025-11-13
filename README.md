# 📄➡📁 gdocs-table-downloader (_GTD_)

Download your translations from Google Spreadsheet. Very popular library to support a workflow
when you store your translations in Google Spreadsheets. <abbr title="gdocs-table-downloader">GTD</abbr>
downloads translations for you, considering **your** file structure.

In other words, having a [spreadsheet](/docs/spreadsheet-window.png) like this:

![Source table](/docs/spreadsheet-window-thumb.png)

You can get the [result file](/docs/result-file-esm-example.png) like this:

![Result file](/docs/result-file-esm-example.png)

Please, take a look at the [example Google Spreadsheet](https://docs.google.com/spreadsheets/d/1oFig-VwfFKP3BLsW4ZgLiw5ftAfcD4jpcUwmXBdhCPU)
file. [GTD CI (Github Actions)](https://github.com/theghostbel/gdocs-table-downloader/actions) use this file not only
to ensure that the unit tests are passing but also to ensure that integration with Google Sheets API is in a shape.

## 📛 Our badges

[![E2E Integration](https://github.com/theghostbel/gdocs-table-downloader/actions/workflows/e2e.yml/badge.svg)](https://github.com/theghostbel/gdocs-table-downloader/actions)
[![npm version](https://badge.fury.io/js/gdocs-table-downloader.svg)](https://www.npmjs.com/package/gdocs-table-downloader)
<!-- [![dependencies](https://david-dm.org/theghostbel/gdocs-table-downloader.svg)](https://github.com/theghostbel/gdocs-table-downloader/blob/master/package.json) -->
[![CodeFactor](https://www.codefactor.io/repository/github/theghostbel/gdocs-table-downloader/badge)](https://www.codefactor.io/repository/github/theghostbel/gdocs-table-downloader)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/theghostbel/gdocs-table-downloader)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/theghostbel/gdocs-table-downloader/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/theghostbel/gdocs-table-downloader/tree/master)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftheghostbel%2Fgdocs-table-downloader.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftheghostbel%2Fgdocs-table-downloader?ref=badge_shield)

## 🆘 How to use?

1. Install the package
    ```
    npm i gdocs-table-downloader -g
    ```
2. Set your Google Secrets to `options.js` (see `customOptions.default.js` for example)
3. Prepare your Google Spreadsheet:
    1. create a service account in Google Console
    ![Service accounts](/docs/gdocs-service-account-list.png)
    2. add it to the list of granted users (it's enough to allow only read access)
    ![Share popup](/docs/gdocs-share.png)
4. Run it:
    ```
    gdocs-table-downloader --token XXX --sheets one,two --customOptions ./options.js --moduleType ESM --target ./out/{sheet}.{locale}.js
    ```

The token can be taken from the URL. The example spreadsheet `https://docs.google.com/spreadsheets/d/1oFig-VwfFKP3BLsW4ZgLiw5ftAfcD4jpcUwmXBdhCPU/edit#gid=0` has token `1oFig-VwfFKP3BLsW4ZgLiw5ftAfcD4jpcUwmXBdhCPU`

If your Google Spreadsheet had sheets `one` and `two`, each having, for example,
`en` and `de` locales, you should get the next file structure:
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
forgot to mention some required options, you would get a description of
what you've missed.

## 📦 What is `moduleType`?

Currently, `gdocs-table-downloader` supports several types of modules in generated files: AMD, ESM, JSON.
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

### JSON

```js
{
  "row1": "cellValue"
}
```

## 🙊 How to provide credentials to access Google Spreadsheets API?

Google Sheets API requires authentication since v4.
`gdocs-table-downloader` is limited to the "service account" type.
You should create such account in Google Console, and then you have several options:

1. Put `private_key` and `client_email` directly to a file specified by `--customOptions` param. See `customOptions.default.js` for example.
2. Put `private_key` and `client_email` to ENV and read them from `process.env`
3. Provide `--auth ./path-to-auth.json` to enable authentication. This file can be obtained from Google Console. See `auth-example.json` for example.
   Only `private_key` and `client_email` fields are required.

Frankly, you're not restricted to only these methods. You can invent any
type of "secrets storing", just ensure that `getGoogleAuthCredentials()` returns
an object with two properties: `private_key` and `client_email`.

P.S. Read an [article on how to store multiline secrets in Circle CI](https://medium.com/@nemiga/multiline-env-secrets-in-circle-ci-ac234c075911)

## 🛃 Custom value mappings

If you need to perform some custom mapping for cell values before they are downloaded,
you can specify `getValueMapper(rawCellValue)` function in `--customOptions` file.

Every cell value goes through this function and the returned value is stored in a result file.

If you don't specify `getValueMapper`, the default function from `customOptions.default.js`
would be used: it changes "undefined" values to empty strings.

## How to release

1. Run locally version update:
   - `SERVICE_ACCOUNT_PRIVATE_KEY=$(cat pem.txt) SERVICE_ACCOUNT_CLIENT_EMAIL='xxx@email.com' npm run update-patch`
   - `pem.txt` is a private key frorm Google Console
2. Push new commit "Update to version x.x.x" together with tags: `git push --follow-tags`
3. Create release in GitHub
4. Wait actions to finish

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftheghostbel%2Fgdocs-table-downloader.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftheghostbel%2Fgdocs-table-downloader?ref=badge_large)
