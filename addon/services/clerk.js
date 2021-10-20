import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

import Clerk from '@clerk/clerk-js';

export default class ClerkService extends Service {
  /**
   * Holds ClerkJS singleton after initialization
   */
  clerk = null;

  /**
   * Utility getter to return current session
   */
  get session() {
    assert(
      `You tried to access the session without initializing Clerk first`,
      isPresent(this.clerk)
    );
    return this.clerk.session;
  }

  async initClerk() {
    if (isPresent(this.clerk)) {
      // already initialized
      return this.clerk;
    }

    if (isPresent(this.loadPromise)) {
      // currently initializing clerk
      // wait for it to finish and return
      await this.loadPromise;
      return this.clerk;
    }

    let environment = getOwner(this).resolveRegistration('config:environment');
    let frontendApi = environment?.clerk?.frontendApi;

    assert(
      `ENV.clerk.frontendApi must be defined in the environment config`,
      isPresent(frontendApi)
    );

    // ClerkJS currently *requires* existing in window.Clerk global
    let clerk = new Clerk(frontendApi);
    this.loadPromise = await this.clerk.load();

    delete this.loadPromise;
    this.clerk = window.Clerk = clerk;

    return this.clerk;
  }

  async signIn(params) {
    await this.initClerk();
    let signInResource = await this.clerk.client.signIn.create(params);
    await this.clerk.setSession(signInResource.createdSessionId);
    return signInResource;
  }

  async signOut() {
    await this.initClerk();
    return await this.clerk.signOut(...arguments);
  }
}
