ember-clerk
==============================================================================

This addon provides a basic integration between Clerk and ember.
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
ember install ember-clerk
```

Then, add your Clerk frontend api to your `config/environment.js` like:
```js
ENV.clerk = {
  frontendApi: 'your-clerk-frontend-api-url',
};
```

Usage
------------------------------------------------------------------------------

This addon provides a `clerk` service that allows you to interact with the ClerkJS client.
You might find that some APIs closely resemble [ember-simple-auth](https://ember-simple-auth.com/).
This addon wasn't implemented as an ember-simple-auth authenticator because ClerkJS offers so much of what
ember-simple-auth already offers.

Once the addon is installed, the clerk service can be injected wherever needed in the application. In order to display login/logout buttons depending on the current session state, inject the service into the respective controller or component and query its `isAuthenticated` property in the template:

```js
// app/controllers/application.js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service clerk;

  …
}
```

```hbs
{{!-- app/templates/application.hbs --}}
<div class="menu">
  …
  {{#if this.clerk.isAuthenticated}}
    <a {{on "click" this.signOut}}>Logout</a>
  {{else}}
    {{#link-to "login"}}Login{{/link-to}}
  {{/if}}
</div>

<div class="main">
  {{outlet}}
</div>
```

In the `signOut` action, call the clerk service's `signOut` method to invalidate the session and log the user out:

```js
// app/controllers/application.js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from "@ember/object";

export default class ApplicationController extends Controller {
  @service clerk;

  …

  @action
  async signOut() {
    this.clerk.signOut();
    // __This reloads the Ember.js application__ by
    // redirecting the browser to the specified route so that all in-memory data
    // (such as Ember Data stores etc.) gets cleared.
    window.location.replace('');
  }
}
```

For authenticating the session, the clerk service provides the `signIn` method that takes an object with the
authentication details. For example:

```hbs
{{!-- app/templates/login.hbs --}}
<form {{on "submit" this.signIn}}>
  <label for="identification">Login</label>
  <Input id="email" @type="email" placeholder="Enter Login" @value={{this.email}}/>

  <label for="password">Password</label>
  <Input id="email" @type="password" placeholder="Enter Password" @value={{this.password}}/>
  
  <button type="submit">Login</button>

  {{#if this.errors}}
    <ul>
      {{#each this.errors as |error|}}
        <li>{{error.longMessage}}</li>
      {{/each}}
    </ul>
  {{/if}}
</form>
```

```js
// app/controllers/login.js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class LoginController extends Controller {
  @service clerk;
  @service router;

  @tracked errors;
  @tracked email;
  @tracked password;

  @action
  async signIn(e) {
    e.preventDefault();

    try {
      await this.clerk.signIn({
        identifier: this.email,
        password: this.password,
      });

      // authentication succeeded. Probably you'll want to redirect
      // to an authenticated route
      this.router.transitionTo('authenticated-route');
    } catch(e) {
      this.errors = e.errors;
    }
  }
}
```

To make a route in the application accessible only when the session is authenticated, call the clerk service's `requireAuthentication` method in the respective route's `beforeModel` method:

```js
// app/routes/authenticated.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service clerk;

  beforeModel(transition) {
    this.clerk.requireAuthentication(transition, 'login');
  }
}
```

This will make the route (and all of its subroutes) transition to the `login` route if the session is not authenticated.
Add the `login` route in the router like this:

```js
// app/router.js
Router.map(function() {
  this.route('login');
});
```

It is recommended to nest all of an application's routes that require the session to be authenticated under a common parent route:

```js
// app/router.js
Router.map(function() {
  this.route('login');
  this.route('authenticated', { path: '' }, function() {
    // all routes that require the session to be authenticated
  });
});
```

To prevent a route from being accessed when the session is authenticated
(which makes sense for login and registration routes for example), call the clerk service's `prohibitAuthentication`
method in the respective route's `beforeModel` method:

```js
// app/routes/login.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginRoute extends Route {
  @service clerk;

  beforeModel(transition) {
    this.clerk.prohibitAuthentication('index');
  }
}
```

To add authorization information to requests, you can use the clerk service to check if the session
is authenticated and access authentication/authorization data, e.g. a token. Here's an example with [ember-apollo-client](https://github.com/ember-graphql/ember-apollo-client):

```js
// app/services/apollo.js
import ApolloService from 'ember-apollo-client/services/apollo';
import { inject as service } from '@ember/service';
import { setContext } from '@apollo/client/link/context';

export default class OverriddenApollo extends ApolloService {
  @service clerk;

  link() {
    let httpLink = super.link();

    let authLink = setContext(async (req, { headers }) => {

      // make sure that clerk is initialized
      // the initClerk method will just immediatelly return if already initialized
      await this.clerk.initClerk();

      if (this.clerk.isAuthenticated) {
        let user = this.clerk.clerk.user;
        let token = await user.getToken('hasura');
        headers = { ...headers, authorization: `Bearer ${token}` };
      }

      return { headers };
    });

    return authLink.concat(httpLink);
  }
}
```

*(please submit an ember-data example if you have one)*

### The clerk object

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
