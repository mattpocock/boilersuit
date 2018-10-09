<div style="text-align: center; margin-bottom: 20px;"><img src="https://raw.githubusercontent.com/mattpocock/boilersuit/master/logo.png" max-height="240px" alt="boilerplate logo"/></div>

<img src="https://raw.githubusercontent.com/mattpocock/boilersuit/master/general.gif" />

## What Is Boilersuit?

Ever felt like you were writing too much boring, repetitive code just to get react-boilerplate working?

Ever wasted hours on a debug in a reducer caused by a typo?

Ever wished that you could edit just one file, instead of ten?

**Enter Boilersuit**, the blazingly-fast, bug-proof way of working with Redux in react-boilerplate.

**Don't write ten files, write one.** Define your state and actions in a JSON file and watch as your code writes itself.

**Instant updates.** Typing `suit up` in your root directory makes boilersuit watch your files for changes. Need to change the name of an action? Just change it in the `suit.json` file and watch it change across your file system.

**Automagical unit tests.** Working, comprehensive unit tests appear automatically as your JSON file changes.

**Prevent stupid mistakes.** Suit knows if you've done a silly. Trying to change a piece of state that doesn't exist? Boilersuit will catch it. Got an action that doesn't do anything? Boilersuit will catch it.

**Instant documentation.** Need to know how a reducer works? Just check the JSON file in the directory. Boilersuit can even be configured to request code comments, enforcing amazing documentation on large projects.

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
      "data": {}
    },
    "actions": {
      "submitTodoStarted": {
        "describe": "Begins the Submit Todo API Call. Passes the todo as the payload to the saga.",
        "saga": {
          "onFail": "submitTodoFailed",
          "onSuccess": "submitTodoSucceeded"
        },
        "passAsProp": true,
        "payload": true,
        "set": {
          "isLoading": true,
          "hasSucceeded": false,
          "hasError": false,
          "errorMessage": "",
          "data": {}
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

The exceptions are the `// @suit-name-only` tags, in which boilersuit only controls the names of functions and properties.

```javascript
// @suit-start
const codeBetweenTheseTags = 'Is deleted and re-written each time suit runs.';
// @suit-end

const codeBeforeThisTag = 'Is deleted and re-written each time suit runs.'; // @suit-line

// @suit-name-only-start
const codeBetweenNameOnlyTags = [
  'Will not be deleted and re-written between runs. Suit will run',
  'a find-and-replace with function or action names that have changed,',
  'but will keep all code you write inside these tags.',
  '',
  'Suit will never wholesale delete code between these tags, so you may',
  'need to do some manual deletion if suit cannot work out what to alter.',
  'But this means you can feel free to edit any code between these tags.',
];
// @suit-name-only-end
```

## Commands

### Up

Run this command in the root directory of your project. This will recursively check for changes in any directory below it.

Usage: `suit up`

#### --force

Add the `--force` modifier if you want suit to re-render everything within a directory.

#### --one <directory>

Run suit in only one directory. Suit will still recursively check for suit files down the project tree, but only within that directory.

Usage: `suit up --one app/containers/HomePage`

### Ajax

Either generates or adds an ajax call to a suit.json.

Usage: `suit ajax <folder> <name>`

Example: `suit ajax app/containers/HomePage getPosts`

## Suit Files API

### Reducers

Each `suit.json` file can have multiple reducers, which contain pieces of different state.

These are defined as keys on the main json object. For example, if you needed three API calls to get some config, some posts and some images:

```json
{
  "getConfig": {
    "initialState": {
      //...
    },
    "actions": {
      //...
    }
  },
  "getPosts": {
    "initialState": {
      //...
    },
    "actions": {
      //...
    }
  },
  "getImages": {
    "initialState": {
      //...
    },
    "actions": {
      //...
    }
  }
}
```

This will create three reducers: `getConfig`, `getPosts`, and `getImages`, and add them to `combineReducers` in the reducers file.

### initialState

This is an object which defines the initial data structure of the reducer's state.

Suit will create a selector for each of these fields on the initialState, and put them in `mapStateToProps` in your index file.

```json
{
  "getImages": {
    "initialState": {
      "isLoading": false,
      "hasSucceeded": true,
      "data": null,
      "errorMessage": "",
      "hasError": false
    },
    "actions": {
      //...
    }
  }
}
```

### mapToContainer

Sometimes, you don't want to actually pass your reducer to the container that it shares a file with. This is especially true when initialising some global functions that lots of subcontainers share, such as configurations.

When you don't want to pass the reducer to the container, just specify `"mapToContainer": false` on the reducer. This will stop index.js from being written at all by this reducer.

```json
{
  "getImages": {
    "mapToContainer": false,
    "initialState": {
      "isLoading": false,
      "hasSucceeded": true,
      "data": null,
      "errorMessage": "",
      "hasError": false
    },
    "actions": {
      //...
    }
  }
}
```

### actions

<img src="https://raw.githubusercontent.com/mattpocock/boilersuit/master/actions.gif" />

Every reducer has an `"actions": {}` attribute, which is required to make the reducer work.

A reducer can have as many actions as you like. Each action you add will get added to the `actions.js` file, get added to the reducer, get passed to `mapDispatchToProps`, and get a unique entry in the `constants.js` file to make sure it works.

#### Passing Payloads

Often, actions need to carry payloads - pieces of data that affect the state. Suit allows you to add payloads to your actions.

Let's imagine that we have a popup, with an `isVisible` property. This `isVisible` property gets passed down to our container component in `mapStateToProps`.

But having an `isVisible` property that never changes is pretty useless - we need to be able to change it.

```json
{
  "popup": {
    "initialState": {
      "isVisible": false
    },
    "actions": {
      "changeIsVisible": {
        "set": {
          "isVisible": "payload"
        }
      }
    }
  }
}
```

`"payload"` is treated as special by suit. It means that when you pass a payload to this action, it will get sent to the state.

If you want to pass an object as a payload, for instance to set the color of the popup as well as the visibility:

```json
{
  "popup": {
    "initialState": {
      "isVisible": false,
      "color": "#fff"
    },
    "actions": {
      "changePopup": {
        "set": {
          "isVisible": "payload.isVisible",
          "color": "payload.color"
        }
      }
    }
  }
}
```

Then you can call `submitChangePopUp({ isVisible: true, color: 'red' })`, and it'll work.

#### Payloads and Sagas

Sometimes, you'll need to pass a payload in an action that won't affect the state. For instance, when you need to pass a payload to a saga. For this case, use `"payload": true` on the action:

```json
{
  "getImages": {
    "initialState": {
      //...
    },
    "actions": {
      "getImagesStarted": {
        "payload": true,
        "set": { "isLoading": true }
      }
    }
  }
}
```

#### set

`type: object`

Defines how you want the data to be changed after the action is run.

```json
{
  "getImages": {
    "initialState": {
      //...
    },
    "actions": {
      "getImagesStarted": {
        "set": { "isLoading": true }
      }
    }
  }
}
```

#### passAsProp

`type: bool`

Whether or not you want to pass this action to the container component in `mapDispatchToProps`.

If passAsProp is not specified on any of your actions, boilersuit will pass **all your actions** to the index file. But adding `"passAsProp": true` to any of your actions will mean only that one gets put in `mapDispatchToProps`.

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

Sagas handle asynchronous calls in redux. In boilersuit, we support a very simple type of saga - one with a fail case and a success case.

You pass this as an object, as in the example below:

```json
{
  "actions": {
    "initialState": {
      //...
    },
    "getImagesStarted": {
      "saga": {
        "onFail": "getImagesFailed",
        "onSuccess": "getImagesSucceeded"
      },
      "set": {
        //...
      }
    },
    "getImagesFailed": {
      "set": {
        //...
      }
    },
    "getImagesSucceeded": {
      "set": {
        //...
      }
    }
  }
}
```

Also, you can only have one action that creates a saga file per reducer.

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

#### customFunction

`"customFunction": true`

Sometimes, you don't want to just `set` values in a reducer. You may want to manipulate them in more interesting ways, such as merging to objects, or concatenating two arrays.

Adding `"customFunction": true` to an action will give you a function extracted out from the reducer to manipulate the state however you want. It'll appear in your `reducer.js` file, like this:

```javascript
// @suit-name-only-start
const changeSomeValueCustomFunction = (state, payload) => {
  console.log('changeSomeValueCustomFunctionPayload', payload);
  return state;
};
// @suit-name-only-end
```

As with any `// @suit-name-only` tags, you can change anything inside the function, but suit will update the name of the function if the action name changes.

You'll need to add `"payload": true` if you want the action to carry a payload, and the `customFunction` to receive that payload.

One final note: `"customFunction"` cannot be combined with `"set"` - though this may change in the future if it seems useful.

### Compose

If you feel like your suit file is getting too big, you can split it up into smaller chunks with `compose`.

Imagine a file structure that looks like this:

- suits
  - getTweets.json
  - getTodos.json
- index.js
- reducer.js
- actions.js
- constants.js
- selectors.js
- suit.json

```json
// suit.json
{
  "compose": ["suits/getTweets", "suits/getTodos"]
}
```

```json
// suits/getTweets.json
{
  "getTweets": {
    //...
  }
}
```

```json
// suits/getTodos.json
{
  "getTodos": {
    //...
  }
}
```

`compose` breaks your suit file down into more manageable chunks to help keep things navigable and modular.

### Import

Sometimes, containers get jealous about bits of state held in other containers, and they want a piece of it. You can reference bits of state from a different container using the `import` syntax.

```json
// ../HomePage/suit.json
{
  "getNavBarConfig": {
    "initialState": {
      "isLoading": false,
      "data": {}
      //...
    },
    "actions": {
      "getNavBarConfigStarted": {
        //...
      }
    }
  }
}
```

```json
// suit.json
{
  "import": {
    "../HomePage": {
      "getNavBarConfig": {
        "selectors": ["isLoading", "data"],
        "actions": ["getNavBarConfigStarted"]
      }
    }
  }
}
```

This will import the selectors used for `isLoading` and `data` and put them in mapStateToProps. It will also pull in the action and pass it into mapDispatchToProps.

Bear in mind - this does not do anything clever, like initialize the other reducer or inject the right sagas. If you try to use a selector to a piece of state that has not been initialized yet, you will get errors.

This is most useful in referencing selectors and actions which you know have been initialized, such as those on the `<App />` reducer.

## Configuration

You can add a .suitrc (or .suitrc.json) file to the root of your folder to configure boilersuit. We're planning on making this a lot more extensible.

### showDescribeWarnings

You can configure suit to give you warnings if you don't specify a 'describe' key. Handy for keeping discipline on large codebases.

```json
{
  "showDescribeWarnings": true
}
```

### include

By default, suit looks in `app/containers` for suit files, but you can change this by adding this to the `.suitrc` config.

```json
{
  "include": ["app/containers"]
}
```
