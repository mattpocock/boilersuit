<div style="text-align: center"><img src="https://raw.githubusercontent.com/mattpocock/boilersuit/master/logo.png" height="240px" alt="boilerplate logo"/></div>

## How To Install

Clone this repository to your machine

Enter the repository

Run `npm i -g`

## How To Run It

Once it's installed, go into the folder of a container and add a `suit.json` file.

`suit.json` files always belong in the FOLDER OF THE CONTAINER YOU WANT TO SUIT UP - alongside index.js, reducers.js, actions.js etc.

This file acts as the manifest for boilersuit to make changes. Copy the one below if you fancy it.

Once it's set up, run `suit up` in the root directory of your project. It will watch for changes in any suit.json file and reflect those changes in the surrounding container.

```json
// suit.json

{
  "getFields": {
    "initialState": {
      "isLoading": false,
      "hasSucceeded": true,
      "data": null,
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

## Commands

### Up

Run this command in the root directory of your project. This will recursively check for changes in any directory below it.

Usage: `suit up`

### Ajax

Either generates or adds an ajax call to a suit.json.

Usage: `suit ajax <folder> <name>`

Example: `suit ajax app/containers/HomePage getPosts`

## Suit Files

### initialState

This is an object which defines the initial data structure of the reducer's state.

```json
{
  "initialState": {
    "isLoading": false,
    "hasSucceeded": true,
    "data": null,
    "errorMessage": "",
    "hasError": false
  }
}
```

### actions

#### set

`type: object`

Defines how you want the data to be changed after the action is run.

```json
{
  "actions": {
    "getFieldsStarted": {
      "set": { "isLoading": true }
    }
  }
}
```

#### payload

`type: bool`

Whether or not you want the action to carry a payload.

```json
{
  "actions": {
    "getFieldsStarted": {
      "payload": true,
      "set": { "isLoading": true }
    }
  }
}
```

#### passAsProp

`type: bool`

Whether or not you want to pass this action to the container component as a dispatch.

```json
{
  "actions": {
    "getFieldsStarted": {
      "passAsProp": true,
      "set": { "isLoading": true }
    }
  }
}
```