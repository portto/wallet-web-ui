# CLI Dev tool

## Usage
#### Step 1: get auth code from wallet UI.
In `local` environments, when confirming login, the code will be print in console
#### Step 2: set env code in CLI.
```
  $ export WALLET_DEV_CODE="your auth code"
```
#### Step 3 (Optional): set dev server url.
The default value is "http://localhost:3000"

```
  $ export WALLET_DEV_URL="your dev server"
```
#### Step 4: generate tx or sign request.
Take ethereum for example:
```
  $ dev-tool ethereum transfer "0xaaaa" 1
```
After executing the command the page will be opened in your browser.

## Get help message
run the following command:
```
  $ dev-tool help
```