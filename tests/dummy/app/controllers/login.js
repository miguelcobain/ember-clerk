import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service session;
  @service router;

  @tracked email;
  @tracked password;
  @tracked errors;

  @action
  async authenticate(e) {
    e.preventDefault();
    this.emailError = this.passwordError = '';

    try {
      await this.session.authenticate('authenticator:clerk', {
        identifier: this.email,
        password: this.password,
      });
    } catch (e) {
      this.errors = e.errors;
    }

    if (this.session.isAuthenticated) {
      this.router.transitionTo('authenticated');
    }
  }
}
