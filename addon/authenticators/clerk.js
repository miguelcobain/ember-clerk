import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default class ClerkAuthenticator extends BaseAuthenticator {
  @service clerk;

  async authenticate(params) {
    await this.clerk.signIn(params);
    return this.clerk.session;
  }

  async restore(data) {
    await this.clerk.initClerk();

    if (this.clerk.session?.id === data.id) {
      return this.clerk.session;
    } else {
      throw new Error('No active sessions');
    }
  }

  async invalidate() {
    await this.clerk.signOut();
  }
}
