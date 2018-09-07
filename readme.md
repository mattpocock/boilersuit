## How To Install

Clone this repository to your machine

Enter the repository

Run `npm i -g`

## How To Run It

Once it's installed, go into the folder of a container and add a `suit.json` file.

This file acts as the manifest for boilersuit to make changes. Copy the one below if you fancy it.

Once it's set up, run `suit up` in the root directory of your project. It will watch for changes in any suit.json file and reflect those changes in the surrounding container.

```json
// suit.json

{
  "getFields": {
    "initialState": {
      "isLoading": false,
      "hasSucceeded": true,
      "data": [],
      "errorMessage": "",
      "hasError": false
    },
    "actions": {
      "getFieldsStarted": {
        "passAsProp": true,
        "set": { "isLoading": true }
      },
      "getFieldsFailed": {
        "set": {
          "isLoading": false,
          "errorMessage": "payload",
          "hasError": true
        }
      },
      "getFieldsSucceeded": {
        "set": {
          "isLoading": false,
          "hasError": false,
          "hasSucceded": true,
          "data": "payload"
        }
      }
    }
  }
}
```