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

## Notes

The codebase is horrible, but slowly improving. It also doesn't yet give you a 'saga'. No reason, just haven't gotten there yet.

Things to do:

Finish the parser in the tools file and write tests

Consider more use cases - what else do you use Redux for? Managing on and off states, getting and setting values... Lots more than just 'ajax' to consider.

Abstract out the long functions in ajax/index to their own functions to make them more testable.