import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service clerk;
  @service router;

  @tracked email;
  @tracked password;
  @tracked errors;

  @action
  async authenticate(e) {
    e.preventDefault();

    try {
      await this.clerk.signIn({
        identifier: this.email,
        password: this.password,
      });
      this.router.transitionTo('authenticated');
    } catch (e) {
      this.errors = e.errors;
    }
  }
}
