import React from 'react';
import Tracker from 'tracker-component';
import { Accounts } from 'meteor/accounts-base';
import { T9n } from 'meteor/softwarerero:accounts-t9n';
import { KEY_PREFIX } from '../../login_session.js';
import './Form.jsx';

import {
  STATES,
  passwordSignupFields,
  validatePassword,
  loginResultCallback,
  getLoginServices,
  hasPasswordService,
  capitalize,
  getUserServices
} from '../../helpers.js';

export class LoginForm extends Tracker.Component {
  constructor(props) {
    super(props);
    let {
      formState = STATES.SIGN_IN,
      loginPath,
      signUpPath,
      resetPasswordPath,
      profilePath,
      changePasswordPath
    } = this.props;
    // Set inital state.
    this.state = {
      message: null,
      waiting: true,
      formState: Meteor.user() ? STATES.SIGN_OUT : formState
    };

    //adds the services list to the user document reactively
    this.autorun(() => {
      if(Meteor.user()) {
        Meteor.subscribe('servicesList');
      }
    });

    // Listen reactively.
    this.autorun(() => {
      this.setState({
        user: Meteor.user()
      });
    });
  }

  componentDidMount() {
    this.setState({ waiting: false, ready: true });
    let changeState = Session.get(KEY_PREFIX + 'state');
    switch (changeState) {
      case 'enrollAccountToken':
      case 'resetPasswordToken':
        this.setState({
          formState: STATES.PASSWORD_CHANGE
        });
        Session.set(KEY_PREFIX + 'state', null);
        break;

      case 'justVerifiedEmail':
        this.setState({
          formState: STATES.SIGN_OUT
        });
        Session.set(KEY_PREFIX + 'state', null);
        break;
    }
  }

  validateUsername( username ) {
    if ( username ) {
      return true;
    }
    else {
      this.showMessage(T9n.get("error.usernameRequired"), 'warning');
      if (this.state.formState == STATES.SIGN_UP) {
        Accounts.ui._options.onSubmitHook("error.accounts.usernameRequired", this.state.formState);
      }

      return false;
    }
  }

  validateEmail( email ) {
    if (passwordSignupFields() === "USERNAME_AND_OPTIONAL_EMAIL" && email === '')
      return true;

    if (email.indexOf('@') !== -1) {
      return true;
    }
    else {
      this.showMessage(T9n.get("error.accounts.Invalid email"), 'warning');
      if (this.state.formState == STATES.SIGN_UP) {
        Accounts.ui._options.onSubmitHook("error.accounts.Invalid email", this.state.formState);
      }

      return false;
    }
  }

  getUsernameOrEmailField() {
    return {
      id: 'usernameOrEmail',
      hint: T9n.get('Enter username or email'),
      label: T9n.get('usernameOrEmail'),
      required: true,
      defaultValue: this.state.username || "",
      onChange: this.handleChange.bind(this, 'usernameOrEmail')
    };
  }

  getUsernameField() {
    return {
      id: 'username',
      hint: T9n.get('Enter username'),
      label: T9n.get('username'),
      required: true,
      defaultValue: this.state.username || "",
      onChange: this.handleChange.bind(this, 'username')
    };
  }

  getEmailField() {
    return {
      id: 'email',
      hint: T9n.get('Enter email'),
      label: T9n.get('email'),
      type: 'email',
      required: true,
      defaultValue: this.state.email || "",
      onChange: this.handleChange.bind(this, 'email')
    };
  }

  getPasswordField() {
    return {
      id: 'password',
      hint: T9n.get('Enter password'),
      label: T9n.get('password'),
      type: 'password',
      required: true,
      defaultValue: this.state.password || "",
      onChange: this.handleChange.bind(this, 'password')
    };
  }

  getNewPasswordField() {
    return {
      id: 'newPassword',
      hint: T9n.get('Enter newPassword'),
      label: T9n.get('newPassword'),
      type: 'password',
      required: true,
      onChange: this.handleChange.bind(this, 'newPassword')
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

    if (hasPasswordService() && formState == STATES.SIGN_IN) {
      if (_.contains([
        "USERNAME_AND_EMAIL",
        "USERNAME_AND_OPTIONAL_EMAIL",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields())) {
        loginFields.push(this.getUsernameOrEmailField());
      }

      if (passwordSignupFields() === "USERNAME_ONLY") {
        loginFields.push(this.getUsernameField());
      }

      if (_.contains([
        "EMAIL_ONLY",
        "EMAIL_ONLY_NO_PASSWORD"
      ], passwordSignupFields())) {
        loginFields.push(this.getEmailField());
      }

      if (!_.contains([
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields())) {
        loginFields.push(this.getPasswordField());
      }
    }

    if (hasPasswordService() && formState == STATES.SIGN_UP) {
      if (_.contains([
        "USERNAME_AND_EMAIL",
        "USERNAME_AND_OPTIONAL_EMAIL",
        "USERNAME_ONLY",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields())) {
        loginFields.push(this.getUsernameField());
      }

      if (_.contains([
        "USERNAME_AND_EMAIL",
        "EMAIL_ONLY",
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields())) {
        loginFields.push(this.getEmailField());
      }

      if (_.contains(["USERNAME_AND_OPTIONAL_EMAIL"], passwordSignupFields())) {
        loginFields.push(Object.assign(this.getEmailField(), {required: false}));
      }

      if (!_.contains([
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields())) {
        loginFields.push(this.getPasswordField());
      }
    }

    if (formState == STATES.PASSWORD_RESET) {
      loginFields.push(this.getEmailField());
    }

    if (this.showPasswordChangeForm()) {
      if (Meteor.isClient && !Accounts._loginButtonsSession.get('resetPasswordToken')
        && !Accounts._loginButtonsSession.get('enrollAccountToken')) {
        loginFields.push(this.getPasswordField());
      }
      loginFields.push(this.getNewPasswordField());
    }

    return _.indexBy(loginFields, 'id');
  }

  buttons() {
    const { formState, waiting, user } = this.state;
    let loginButtons = [];

    if (user && formState == STATES.SIGN_OUT) {
      loginButtons.push({
        id: 'signOut',
        label: T9n.get('signOut'),
        disabled: waiting,
        onClick: this.signOut.bind(this)
      });
    }

    if (this.showCreateAccountLink()) {
      loginButtons.push({
        id: 'switchToSignUp',
        label: T9n.get('signUp'),
        type: 'link',
        href: this.props.signUpPath,
        onClick: this.switchToSignUp.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP || formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'switchToSignIn',
        label: T9n.get('signIn'),
        type: 'link',
        href: this.props.loginPath,
        onClick: this.switchToSignIn.bind(this)
      });
    }

    if (this.showForgotPasswordLink()) {
      loginButtons.push({
        id: 'switchToPasswordReset',
        label: T9n.get('forgotPassword'),
        type: 'link',
        href: this.props.passwordResetPath,
        onClick: this.switchToPasswordReset.bind(this)
      });
    }

    if (user && formState == STATES.SIGN_OUT && Package['accounts-password'] && getUserServices().indexOf("password") >= 0) {
      loginButtons.push({
        id: 'switchToChangePassword',
        label: T9n.get('changePassword'),
        type: 'link',
        href: this.props.changePasswordPath,
        onClick: this.switchToChangePassword.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP) {
      loginButtons.push({
        id: 'signUp',
        label: T9n.get('signUp'),
        type: hasPasswordService() ? 'submit' : 'link',
        className: 'active',
        disabled: waiting,
        onClick: hasPasswordService() ? this.signUp.bind(this) : null
      });
    }

    if (formState == STATES.SIGN_IN) {
      loginButtons.push({
        id: 'signIn',
        label: T9n.get('signIn'),
        type: hasPasswordService() ? 'submit' : 'link',
        className: 'active',
        disabled: waiting,
        onClick: hasPasswordService() ? this.signIn.bind(this) : null
      });
    }

    if (formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'emailResetLink',
        label: T9n.get('resetYourPassword'),
        type: 'submit',
        disabled: waiting,
        onClick: this.passwordReset.bind(this)
      });
    }

    if (this.showPasswordChangeForm()) {
      loginButtons.push({
        id: 'changePassword',
        label: T9n.get('changePassword'),
        type: 'submit',
        disabled: waiting,
        onClick: this.passwordChange.bind(this)
      });

      loginButtons.push({
        id: 'switchToSignOut',
        label: T9n.get('cancel'),
        type: 'link',
        href: this.props.profilePath,
        onClick: this.switchToSignOut.bind(this)
      });
    }

    // Sort the button array so that the submit button always comes first.
    loginButtons.sort((a, b) => {
      return a.label.localeCompare(b.label);
    }).sort((a, b) => {
      return (b.type == 'submit') - (a.type == 'submit');
    });

    return _.indexBy(loginButtons, 'id');
  }

  showPasswordChangeForm() {
    return(Package['accounts-password']
      && this.state.formState == STATES.PASSWORD_CHANGE);
  }

  showCreateAccountLink() {
    return this.state.formState == STATES.SIGN_IN && !Accounts._options.forbidClientAccountCreation;
  }

  showForgotPasswordLink() {
    return !this.state.user
      && this.state.formState == STATES.SIGN_IN
      && _.contains(
        ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "EMAIL_ONLY"],
        passwordSignupFields());
  }

  switchToSignUp() {
    this.setState({
      formState: STATES.SIGN_UP,
      message: null,
      email: null
    });
  }

  switchToSignIn() {
    this.setState({ formState: STATES.SIGN_IN, message: null });
  }

  switchToPasswordReset() {
    this.setState({ formState: STATES.PASSWORD_RESET, message: null });
  }

  switchToChangePassword() {
    this.setState({ formState: STATES.PASSWORD_CHANGE, message: null });
  }

  switchToSignOut() {
    this.setState({ formState: STATES.SIGN_OUT, message: null });
  }

  signOut() {
    Meteor.logout(() => {
      this.setState({ formState: STATES.SIGN_IN, message: null, password: null });
      Accounts.ui._options.onSignedOutHook();
    });
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
    else if (email !== null && usernameOrEmail == null) {
      if (!this.validateEmail(email)) {
        return;
      }
      else {
        if (_.contains([ "EMAIL_ONLY_NO_PASSWORD" ], passwordSignupFields())) {
          this.loginWithoutPassword();
          return;
        }
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
        if (_.contains([ "USERNAME_AND_EMAIL_NO_PASSWORD" ], passwordSignupFields())) {
          this.loginWithoutPassword();
          return;
        }
        loginSelector = usernameOrEmail;
      }
    }
    else {
      throw new Error("Unexpected -- no element to use as a login user selector");
    }

    Meteor.loginWithPassword(loginSelector, password, (error, result) => {
      if (error) {
        this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
      }
      else {
        this.setState({ formState: STATES.SIGN_OUT, message: null, password: null });
        loginResultCallback(() => {
          Meteor.setTimeout(() => Accounts.ui._options.onSignedInHook(), 100);
        });
      }
    });
  }

  oauthButtons() {
    const { formState, waiting } = this.state;
    let oauthButtons = [];
    if (formState == STATES.SIGN_IN || formState == STATES.SIGN_UP ) {
      if(Accounts.oauth) {
        Accounts.oauth.serviceNames().map((service) => {
          oauthButtons.push({
            id: service,
            label: capitalize(service),
            disabled: waiting,
            type: 'link',
            onClick: this.oauthSignIn.bind(this, service)
          });
        });
      }
    }
    return _.indexBy(oauthButtons, 'id');
  }

  oauthSignIn(service) {
    const { formState, waiting, user } = this.state;
    //Thanks Josh Owens for this one.
    function capitalService() {
      return service.charAt(0).toUpperCase() + service.slice(1);
    }
    login = Meteor["loginWith" + capitalService()];
    login({requestPermissions: Accounts.ui._options.requestPermissions}, (error) => {
      if (error) {
        this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"));
      } else {
        this.setState({ formState: STATES.SIGN_OUT, message: '' });
        loginResultCallback(() => {
          Meteor.setTimeout(() => Accounts.ui._options.onSignedInHook(), 100);
        });
      }
    });

  }

  signUp(event, options = {}) {
    const {
      username = null,
      email = null,
      usernameOrEmail = null,
      password,
      formState
    } = this.state;

    if (username !== null) {
      if ( !this.validateUsername(username) ) {
        return;
      }
      else {
        options.username = username;
      }
    }
    else {
      if (_.contains([
        "USERNAME_AND_EMAIL",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields()) && !this.validateUsername(username) ) {
        return;
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

    if (_.contains([
      "EMAIL_ONLY_NO_PASSWORD",
      "USERNAME_AND_EMAIL_NO_PASSWORD"
    ], passwordSignupFields())) {
      // Generate a random password.
      options.password = Meteor.uuid();
    }
    else if (!validatePassword(password)) {
      this.showMessage(T9n.get("error.minChar").replace(/7/, Accounts.ui._options.minimumPasswordLength), 'warning');
      Accounts.ui._options.onSubmitHook("error.minChar", formState);
      return;
    }
    else {
      options.password = password;
    }

    this.setState({waiting: true});

    const SignUp = () => {
      Accounts.createUser(options, (error) => {
        if (error) {
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
          if (T9n.get(`error.accounts.${error.reason}`)) {
            Accounts.ui._options.onSubmitHook(`error.accounts.${error.reason}`, formState);
          }
          else {
            Accounts.ui._options.onSubmitHook("Unknown error", formState);
          }
        }
        else {
          this.setState({
            formState: STATES.SIGN_OUT,
            message: null,
            password: null
          });
          loginResultCallback(Accounts.ui._options.postSignUpHook);
        }

        this.setState({ waiting: false });
      });
    };

    // Allow for Promises to return.
    let promise = Accounts.ui._options.onPreSignUpHook(options);
    if (promise instanceof Promise) {
      promise.then(SignUp);
    }
    else {
      SignUp();
    }
  }

  loginWithoutPassword(){
    const {
      email = '',
      usernameOrEmail = '',
      waiting
    } = this.state;

    if (waiting) {
      return;
    }

    if (email.indexOf('@') !== -1) {
      this.setState({ waiting: true });

      Accounts.loginWithoutPassword({ email: email }, (error) => {
        if (error) {
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
        }
        else {
          this.showMessage(T9n.get("info.emailSent"), 'success', 5000);
        }

        this.setState({ waiting: false });
      });
    }
    else if (this.validateUsername(usernameOrEmail)) {
      this.setState({ waiting: true });

      Accounts.loginWithoutPassword({ email: usernameOrEmail, username: usernameOrEmail }, (error) => {
        if (error) {
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
        }
        else {
          this.showMessage(T9n.get("info.emailSent"), 'success', 5000);
        }

        this.setState({ waiting: false });
      });
    }
    else {
      if (_.contains([ "USERNAME_AND_EMAIL_NO_PASSWORD" ], passwordSignupFields())) {
        this.showMessage(T9n.get("error.accounts.Invalid email or username"), 'warning');
      }
      else {
        this.showMessage(T9n.get("error.accounts.Invalid email"), 'warning');
      }
    }
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
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
        }
        else {
          this.showMessage(T9n.get("info.emailSent"), 'success', 5000);
        }

        this.setState({ waiting: false });
      });
    }
    else {
      this.showMessage(T9n.get("error.accounts.Invalid email"), 'warning');
    }
  }

  passwordChange() {
    const {
      password,
      newPassword
    } = this.state;

    if ( !validatePassword(newPassword) ){
      this.showMessage(T9n.get("error.minChar").replace(/7/, Accounts.ui._options.minimumPasswordLength), 'warning');
      return;
    }

    let token = Accounts._loginButtonsSession.get('resetPasswordToken');
    if (!token) {
      token = Accounts._loginButtonsSession.get('enrollAccountToken');
    }
    if (token) {
      Accounts.resetPassword(token, newPassword, (error) => {
        if (error) {
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
        }
        else {
          this.showMessage(T9n.get('info.passwordChanged'), 'success', 5000);
          this.setState({ formState: STATES.SIGN_OUT });
          Accounts._loginButtonsSession.set('resetPasswordToken', null);
          Accounts._loginButtonsSession.set('enrollAccountToken', null);
        }
      });
    }
    else {
      Accounts.changePassword(password, newPassword, (error) => {
        if (error) {
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
        }
        else {
          this.showMessage(T9n.get('info.passwordChanged'), 'success', 5000);
          this.setState({ formState: STATES.SIGN_OUT });
        }
      });
    }
  }

  showMessage(message, type, clearTimeout){
    message = message.trim();

    if (message){
      this.setState({ message: { message: message, type: type } });
      if (clearTimeout) {
        Meteor.setTimeout(() => {
          this.setState({ message: null });
        }, clearTimeout);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.user !== !this.state.user) {
      this.setState({
        formState: this.state.user ? STATES.SIGN_OUT : STATES.SIGN_IN
      });
    }
  }

  render() {
    this.oauthButtons();
    return <Accounts.ui.Form oauthServices={this.oauthButtons()}
                             fields={this.fields()} 
                             buttons={this.buttons()}
                             {...this.state} />;
  }
};

Accounts.ui.LoginForm = LoginForm;
