import Service, { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

import Clerk from '@clerk/clerk-js';

export default class ClerkService extends Service {
  @service router;

  /**
   * Holds ClerkJS singleton after initialization
   */
  clerk = null;

  attemptedTransition = null;

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

  get isAuthenticated() {
    return isPresent(this.clerk?.session);
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
    window.Clerk = clerk;
    this.loadPromise = await clerk.load();

    delete this.loadPromise;
    this.clerk = clerk;

    return this.clerk;
  }

  async signIn(params) {
    await this.initClerk();
    let signInResource = await this.clerk.client.signIn.create(params);
    await this.clerk.setSession(signInResource.createdSessionId);

    if (this.attemptedTransition) {
      this.attemptedTransition.retry();
      this.attemptedTransition = null;
    }

    return signInResource;
  }

  async signOut() {
    this.attemptedTransition = null;

    await this.initClerk();
    return await this.clerk.signOut(...arguments);
  }

  /**
    Checks whether the session is authenticated and if it is not, transitions
    to the specified route or invokes the specified callback.
    If a transition is in progress and is aborted, this method will save it in the
    `attemptedTransition` property so that it can be retried after the session is authenticated.
    @method requireAuthentication
    @param {Transition} transition A transition that triggered the authentication requirement or null if the requirement originated independently of a transition
    @param {String|Function} routeOrCallback The route to transition to in case that the session is not authenticated or a callback function to invoke in that case
    @return {Promise<Boolean>} true when the session is authenticated, false otherwise
    @public
  */
  async requireAuthentication(transition, routeOrCallback) {
    await this.initClerk();

    let isAuthenticated = this.isAuthenticated;

    if (!isAuthenticated) {
      if (transition) {
        this.attemptedTransition = transition;
      }

      let argType = typeof routeOrCallback;
      if (argType === 'string') {
        this.router.transitionTo(routeOrCallback);
      } else if (argType === 'function') {
        routeOrCallback();
      } else {
        assert(
          `The second argument to requireAuthentication must be a String or Function, got "${argType}"!`,
          false
        );
      }
    }

    return isAuthenticated;
  }

  /**
    Checks whether the session is authenticated and if it is, transitions
    to the specified route or invokes the specified callback.
    @method prohibitAuthentication
    @param {String|Function} routeOrCallback The route to transition to in case that the session is authenticated or a callback function to invoke in that case
    @return {Promise<Boolean>} true when the session is not authenticated, false otherwise
    @public
  */
  async prohibitAuthentication(routeOrCallback) {
    await this.initClerk();

    let isAuthenticated = this.isAuthenticated;

    if (isAuthenticated) {
      let argType = typeof routeOrCallback;
      if (argType === 'string') {
        this.router.transitionTo(routeOrCallback);
      } else if (argType === 'function') {
        routeOrCallback();
      } else {
        assert(
          `The first argument to prohibitAuthentication must be a String or Function, got "${argType}"!`,
          false
        );
      }
    }

    return !isAuthenticated;
  }
}
