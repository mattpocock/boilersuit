## How To Install

Clone this repository to your machine
Enter the repository
Run `npm i -g`

## How To Run It

Once it's installed, the syntax is:

`blrplt ajax path/to/folder "Do Action"`

For instance, this could be:

`blrplt ajax app/containers/HomePage "Get Tweets"`

And you'd get reducers/actions/constants/selectors for an ajax call for 'Get Tweets'.

Try it out! Though make sure you commit before you do.

## Commands

We now have four commands.

### Ajax

Creates all the fields necessary for an ajax call.

Usage: `blrplt ajax app/containers/HomePage "Get Tweets"`

### Single

Creates a single field, useful for controlling form inputs or a single piece of state.

Usage: `blrplt single app/containers/HomePage "Show Tooltip"`

### Domain

Creates a new reducer, which we're calling a 'domain' for now. Using this and the next command, you can create custom reducers with custom fields.

Usage: `blrplt domain app/containers/HomePage "Homepage Config"`

### Field

Creates a new field within a domain that's already been created. Links it to the container in mapStateToProps.

Usage: `blrplt field "Homepage Config" app/containers/HomePage "data"`

## Notes

Things to do:

Finish the parser in the tools file and write tests

Consider more use cases - what else do you use Redux for? Managing on and off states, getting and setting values... Lots more than just 'ajax' to consider.