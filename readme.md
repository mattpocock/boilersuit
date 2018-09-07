<div style="text-align: center"><img src="https://raw.githubusercontent.com/mattpocock/boilersuit/master/logo.png" height="240px" alt="boilerplate logo"/></div>

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
        "payload": true,
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
          "hasSucceeded": true,
          "data": "payload"
        }
      }
    }
  }
}
```

## Suit Files

### initialState

This is an object which defines the initial data structure of the reducer's state.

### actions

#### set

`type: object`

Defines how you want the data to be changed after the action is run.

#### payload

`type: bool`

Whether or not you want the action to carry a payload.

#### passAsProp

`type: bool`

Whether or not you want to pass this action to the container component as a dispatch.