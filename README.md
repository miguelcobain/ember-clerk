ember-simple-auth-clerk
==============================================================================

This addon provides a basic integration between Clerk and ember-simple-auth.
Only email/password authentication has been tested for now.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

Start by installing the addon:

```
ember install ember-simple-auth-clerk
```

Then, add your Clerk frontend api to your `config/environment.js` like:
```js
ENV.clerk = {
  frontendApi: 'your-clerk-frontend-api-url',
};
```

Usage
------------------------------------------------------------------------------

You just need to use ember-simple-auth as usual by using the new provided `clerk` authenticator:

```js
await this.session.authenticate('authenticator:clerk', {
  identifier: this.email,
  password: this.password,
});
```

This addon also provides a `clerk` services that is very basic at the moment.
You can access the underlying [clerk object](https://docs.clerk.dev/reference/clerkjs/clerk) like:

```js
@service clerk;

@action
someAction() {
  // this.clerk.clerk contains the window.Clerk refered in Clerk docs
  // you can also use this.clerk.session which is essentially an alias to this.clerk.clerk.session
}
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
