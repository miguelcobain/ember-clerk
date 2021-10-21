import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class AuthenticatedRoute extends Route {
  @service clerk;

  async beforeModel(transition) {
    await this.clerk.requireAuthentication(transition, 'login');
  }
}
