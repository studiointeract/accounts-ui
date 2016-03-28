import React from 'react';
import Tracker from 'tracker-component';
import { Accounts } from 'meteor/accounts-base';
import './Form.jsx';

import {
  passwordSignupFields,
  validatePassword,
  loginResultCallback,
  getLoginServices,
  t9n
} from '../../helpers.js';

const STATES = {
  SIGN_IN: Symbol('SIGN_IN'),
  SIGN_UP: Symbol('SIGN_UP'),
  PASSWORD_CHANGE: Symbol('PASSWORD_CHANGE'),
  PASSWORD_RESET: Symbol('PASSWORD_RESET')
};
// Expose available states.
Accounts.ui.STATES = STATES;

export class LoginForm extends Tracker.Component {
  constructor(props) {
    super(props);
    // Set inital state.
    this.state = {
      message: '',
      waiting: false,
      formState: Meteor.user() ? STATES.PASSWORD_CHANGE : STATES.SIGN_IN
    };

    // Listen reactively.
    this.autorun(() => {
      this.setState({
        user: Meteor.user()
      });
    });
  }

  validateUsername( username ){
    if ( username.length >= 3 ) {
      return true;
    }
    else {
      this.showMessage( t9n("error.usernameTooShort") );

      return false;
    }
  }

  validateEmail( email ){
    if (passwordSignupFields() === "USERNAME_AND_OPTIONAL_EMAIL" && email === '')
      return true;

    if (email.indexOf('@') !== -1) {
      return true;
    }
    else {
      this.showMessage(t9n("error.emailInvalid"));

      return false;
    }
  }

  getUsernameOrEmailField(){
    return {
      id: 'usernameOrEmail',
      hint: t9n('Enter username or email'),
      label: t9n('usernameOrEmail'),
      onChange: this.handleChange.bind(this, 'usernameOrEmail')
    };
  }

  getUsernameField(){
    return {
      id: 'username',
      hint: t9n('Enter username'),
      label: t9n('username'),
      onChange: this.handleChange.bind(this, 'username')
    };
  }

  getEmailField(){
    return {
      id: 'email',
      hint: t9n('Enter email'),
      label: t9n('email'),
      onChange: this.handleChange.bind(this, 'email')
    };
  }

  getPasswordField(){
    return {
      id: 'password',
      hint: t9n('Enter password'),
      label: t9n('password'),
      type: 'password',
      onChange: this.handleChange.bind(this, 'password')
    };
  }

  getNewPasswordField(){
    return {
      id: 'newPassword',
      hint: t9n('Enter newPassword'),
      label: t9n('newPassword'),
      type: 'password',
      onChange: this.handleChange.bind(this, 'password')
    };
  }

  handleChange(field, evt) {
    let value = evt.target.value;
    switch (field) {
      case 'password': break;
      default:
        value = value.trim();
        break;
    }
    this.setState({ [field]: value });
  }

  fields() {
    const loginFields = [];
    const { formState } = this.state;

    if (formState == STATES.SIGN_IN) {
      if (_.contains(["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL"],
        passwordSignupFields())) {
        loginFields.push(this.getUsernameOrEmailField());
      }

      if (passwordSignupFields() === "USERNAME_ONLY") {
        loginFields.push(this.getUsernameField());
      }

      if (passwordSignupFields() === "EMAIL_ONLY") {
        loginFields.push(this.getEmailField());
      }

      loginFields.push(this.getPasswordField());
    }

    if (formState == STATES.SIGN_UP) {
      if (_.contains(["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "USERNAME_ONLY"],
        passwordSignupFields())) {
        loginFields.push(this.getUsernameField());
      }

      if (_.contains(["USERNAME_AND_EMAIL", "EMAIL_ONLY"], passwordSignupFields())) {
        loginFields.push(this.getEmailField());
      }

      loginFields.push(this.getPasswordField());
    }

    if (formState == STATES.PASSWORD_RESET) {
      loginFields.push(this.getEmailField());
    }

    if (this.showPasswordChangeForm()) {
      loginFields.push(this.getPasswordField());
      loginFields.push(this.getNewPasswordField());
    }

    return _.indexBy(loginFields, 'id');
  }

  buttons() {
    const { formState, waiting, user } = this.state;
    let loginButtons = [];

    if (user) {
      loginButtons.push({
        id: 'signOut',
        label: t9n('signOut'),
        onClick: this.signOut.bind(this)
      });
    }

    if (this.showCreateAccountLink()) {
      loginButtons.push({
        id: 'switchToSignUp',
        label: t9n('signUp'),
        type: 'link',
        onClick: this.switchToSignUp.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP || formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'switchToSignIn',
        label: t9n('signIn'),
        type: 'link',
        onClick: this.switchToSignIn.bind(this)
      });
    }

    if (this.showForgotPasswordLink()) {
      loginButtons.push({
        id: 'switchToPasswordReset',
        label: t9n('resetYourPassword'),
        type: 'link',
        onClick: this.switchToPasswordReset.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP) {
      loginButtons.push({
        id: 'signUp',
        label: t9n('signUp'),
        type: 'submit',
        disabled: waiting,
        onClick: this.signUp.bind(this)
      });
    }

    if (formState == STATES.SIGN_IN) {
      loginButtons.push({
        id: 'signIn',
        label: t9n('signIn'),
        type: 'submit',
        disabled: waiting,
        onClick: this.signIn.bind(this)
      });
    }

    if (formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'emailResetLink',
        label: t9n('emailResetLink'),
        type: 'submit',
        disabled: waiting,
        onClick: this.passwordReset.bind(this)
      });
    }

    if (this.showPasswordChangeForm()) {
      loginButtons.push({
        id: 'changePassword',
        label: t9n('changePassword'),
        disabled: waiting,
        onClick: this.passwordChange.bind(this)
      });
    }

    // Sort the button array so that the submit button always comes first.
    loginButtons.sort((a, b) => {
      return (b.type == 'submit') - (a.type == 'submit');
    });

    return _.indexBy(loginButtons, 'id');
  }

  showPasswordChangeForm() {
    return(getLoginServices().indexOf('password') != -1
      && this.state.formState == STATES.PASSWORD_CHANGE);
  }

  showCreateAccountLink() {
    return this.state.formState == STATES.SIGN_IN && !Accounts._options.forbidClientAccountCreation;
  }

  showForgotPasswordLink() {
    return !this.state.user
      && this.state.formState != STATES.PASSWORD_RESET
      && _.contains(
        ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "EMAIL_ONLY"],
        passwordSignupFields());
  }

  switchToSignUp() {
    this.setState({ formState: STATES.SIGN_UP, message: '' });
  }

  switchToSignIn() {
    this.setState({ formState: STATES.SIGN_IN, message: '' });
  }

  switchToPasswordReset() {
    this.setState({ formState: STATES.PASSWORD_RESET, message: '' });
  }

  signOut() {
    Meteor.logout();
  }

  signIn() {
    const {
      username = null,
      email = null,
      usernameOrEmail = null,
      password
    } = this.state;

    let loginSelector;

    if (username !== null) {
      if (!this.validateUsername(username)) {
        return;
      }
      else {
        loginSelector = { username: username };
      }
    }
    else if (email !== null) {
      if (!this.validateEmail(email)) {
        return;
      }
      else {
        loginSelector = { email };
      }
    }
    else if (usernameOrEmail !== null) {
      // XXX not sure how we should validate this. but this seems good enough (for now),
      // since an email must have at least 3 characters anyways
      if (!this.validateUsername(usernameOrEmail)) {
        return;
      }
      else {
        loginSelector = usernameOrEmail;
      }
    }
    else {
      throw new Error("Unexpected -- no element to use as a login user selector");
    }

    Meteor.loginWithPassword(loginSelector, password, (error, result) => {
      if (error) {
        this.showMessage(t9n(`error.accounts.${error.reason}`) || t9n("Unknown error"));
      }
      else {
        this.setState({ formState: STATES.PASSWORD_CHANGE });
        loginResultCallback(this.props.redirect);
      }
    });
  }

  signUp() {
    const options = {}; // to be passed to Accounts.createUser
    const {
      username = null,
      email = null,
      usernameOrEmail = null,
      password
    } = this.state;

    if (username !== null) {
      if ( !this.validateUsername(username) ) {
        return;
      }
      else {
        options.username = username;
      }
    }

    if (email !== null) {
      if ( !this.validateEmail(email) ){
        return;
      }
      else {
        options.email = email;
      }
    }

    if (!validatePassword(password)) {
      this.showMessage(t9n("error.pwTooShort"));

      return;
    }
    else {
      options.password = password;
    }

    this.setState({waiting: true});

    Accounts.createUser(options, (error)=>{
      if (error) {
        this.showMessage(t9n(`error.accounts.${error.reason}`) || t9n("Unknown error"));
      }
      else {
        this.setState({
          formState: STATES.PASSWORD_CHANGE,
          message: ''
        });
        loginResultCallback(this.props.redirect);
      }

      this.setState({ waiting: false });
    });
  }

  passwordReset(){
    const {
      email = '',
      waiting
    } = this.state;

    if (waiting) {
      return;
    }

    if (email.indexOf('@') !== -1) {
      this.setState({ waiting: true });

      Accounts.forgotPassword({ email: email }, (error) => {
        if (error) {
          this.showMessage(t9n(`error.accounts.${error.reason}`) || t9n("Unknown error"));
        }
        else {
          this.showMessage(t9n("info.emailSent"));
        }

        this.setState({ waiting: false });
      });
    }
    else {
      this.showMessage(t9n("error.emailInvalid"));
    }
  }

  passwordChange() {
    const {
      password,
      newPassword
    } = this.state;

    if ( !validatePassword(newPassword) ){
      this.showMessage(t9n("error.pwTooShort"));

      return;
    }

    Accounts.changePassword(password, newPassword, (error) => {
      if (error) {
        this.showMessage(t9n(`error.accounts.${error.reason}`) || t9n("Unknown error"));
      }
      else {
        this.showMessage(t9n('info.passwordChanged'));
      }
    });
  }

  showMessage(message){
    message = message.trim();

    if (message){
      this.setState({ message: message });
    }
  }

  render() {
    return <Accounts.ui.Form fields={this.fields()} buttons={this.buttons()} {...this.state} />;
  }
}

Accounts.ui.LoginForm = LoginForm;
