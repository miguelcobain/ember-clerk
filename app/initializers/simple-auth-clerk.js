import ClerkAuthenticator from 'ember-simple-auth-clerk/authenticators/clerk';

// register ClerkAuthenticator
export function initialize(container) {
  container.register('authenticator:clerk', ClerkAuthenticator);
}
export default {
  initialize,
};
