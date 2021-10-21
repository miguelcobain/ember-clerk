import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class LoginRoute extends Route {
  @service clerk;

  async beforeModel() {
    await this.clerk.prohibitAuthentication('authenticated');
  }
}
