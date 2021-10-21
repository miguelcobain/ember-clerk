import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedController extends Controller {
  @service clerk;

  @action
  async logout() {
    await this.clerk.signOut();
    window.location.replace('');
  }
}
