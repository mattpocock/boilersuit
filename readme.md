<div style="text-align: center"><img src="https://raw.githubusercontent.com/mattpocock/boilersuit/master/logo.png" height="240px" alt="boilerplate logo"/></div>

## How To Install

### Globally

`npm i -g boilersuit`

### Per project

`npm i boilersuit`

Add `"suit": "suit up"` to the `"scripts"` object in your package.json.

Then, you can run `npm run suit` instead of `suit up` below.

## How To Run It

Once it's installed, go into the folder of a container and add a `suit.json` file.

`suit.json` files always belong in the **FOLDER OF THE CONTAINER YOU WANT TO SUIT UP** - alongside index.js, reducers.js, actions.js etc.

```
actions.js
constants.js
index.js
reducer.js
saga.js
selectors.js
suit.json
```

This file acts as the manifest for boilersuit to make changes. Copy the one below if you fancy it.

Once it's set up, run `suit up` in the root directory of your project. It will watch for changes in any suit.json file and reflect those changes in the surrounding container.

```json
// suit.json
{
  "submitTodo": {
    "describe": "Makes a Submit Todo API call",
    "initialState": {
      "isLoading": false,
      "hasSucceeded": false,
      "hasError": false,
      "errorMessage": "",
      "data": null
    },
    "actions": {
      "submitTodoStarted": {
        "describe": "Begins the Submit Todo API Call. Passes the todo as the payload to the saga.",
        "saga": true,
        "passAsProp": true,
        "payload": true,
        "set": {
          "isLoading": true,
          "hasSucceeded": false,
          "hasError": false,
          "errorMessage": "",
          "data": null
        }
      },
      "submitTodoSucceeded": {
        "describe": "Called when the Submit Todo API call completes, passing info to data as a payload.",
        "set": {
          "isLoading": false,
          "hasSucceeded": true,
          "data": "payload"
        }
      },
      "submitTodoFailed": {
        "describe": "Called when the Submit Todo API Call fails, delivering a standard error message.",
        "set": {
          "isLoading": false,
          "errorMessage": "Submit Todo has failed",
          "hasError": true
        }
      }
    }
  }
}
```

## How Boilersuit works

Boilersuit acts as a declarative syntax for quickly writing and editing reducers. It cuts down development time, prevents silly errors, and makes documentation easy.

Boilersuit takes control of parts of your application, using a few little 'tags'. Boilersuit completely controls the code between these tags, which means **any changes you make to boilersuit-controlled code will not persist**.

```javascript
// @suit-start
const codeBetweenTheseTags = 'Is entirely controlled by boilersuit.';
// @suit-end

const codeBeforeThisTag = 'Is entirely controlled by boilersuit.'; // @suit-line
```

## Commands

### Up

Run this command in the root directory of your project. This will recursively check for changes in any directory below it.

Usage: `suit up`

### Ajax

Either generates or adds an ajax call to a suit.json.

Usage: `suit ajax <folder> <name>`

Example: `suit ajax app/containers/HomePage getPosts`

## Suit Files API

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

#### saga

`type: bool`

Whether or not you want to generate a saga that is fired from this action.

Sagas are interesting in boilersuit - because they are so complex, and can be used in so many divergent ways, we don't control them in the same way that we do with other files. Specifying `"saga": true` on an action will generate some boilerplate in the sagas file which you will then have to customise and manage.

```json
{
  "actions": {
    "getFieldsStarted": {
      "saga": true,
      "set": { "isLoading": true }
    }
  }
}
```

#### describe

`type: string`

Allows you to add a description which is added as comments to the code

```json
{
  "actions": {
    "getFieldsStarted": {
      "describe": "Why do I exist? Do I pass a payload? What do I do?"
    }
  }
}
```

#### extends

`type: string`

Allows you to take a shortcut to writing out a whole suit file.

Setting extends to "ajax" will generate an ajax call for you in the suit file. This is currently the only case we support.

```json
{
  "getTweets": {
    "extends": "ajax"
  }
}
```