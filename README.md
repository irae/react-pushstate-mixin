Mixin for [React][1] to support the History API. It saves the state of
the Component that uses the mixin and the Components' children that
have an id attribute.

By default replaceState is called for every state change, while
pushState has to be called manually.

Note: Only tested in Chrome so far. No IE8 + IE9 support for now.
Needs some cleaning up and additional testing.

[1]: https://facebook.github.io/react/