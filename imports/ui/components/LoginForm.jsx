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
  capitalize
} from '../../helpers.js';

export class LoginForm extends Tracker.Component {
  constructor(props) {
    super(props);
    let {
      formState,
      loginPath,
      signUpPath,
      resetPasswordPath,
      profilePath,
      changePasswordPath
    } = props;
    // Set inital state.
    this.state = {
      message: null,
      waiting: true,
      formState: formState ? formState : Accounts.user() ? STATES.PROFILE : STATES.SIGN_IN,
      onSubmitHook: props.onSubmitHook || Accounts.ui._options.onSubmitHook,
      onSignedInHook: props.onSignedInHook || Accounts.ui._options.onSignedInHook,
      onSignedOutHook: props.onSignedOutHook || Accounts.ui._options.onSignedOutHook,
      onPreSignUpHook: props.onPreSignUpHook || Accounts.ui._options.onPreSignUpHook,
      onPostSignUpHook: props.onPostSignUpHook || Accounts.ui._options.onPostSignUpHook
    };

    // Listen for the user to login/logout.
    this.autorun(() => {
      // Add the services list to the user.
      this.subscribe('servicesList');
      this.setState({
        user: Accounts.user()
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
          formState: STATES.PROFILE
        });
        Session.set(KEY_PREFIX + 'state', null);
        break;
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.formState && nextProps.formState !== this.state.formState) {
      this.setState({
        formState: nextProps.formState
      });
    }
  }

  validateUsername( username ) {
    if ( username ) {
      return true;
    }
    else {
      this.showMessage(T9n.get("error.usernameRequired"), 'warning');
      if (this.state.formState == STATES.SIGN_UP) {
        this.state.onSubmitHook("error.accounts.usernameRequired", this.state.formState);
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
        this.state.onSubmitHook("error.accounts.Invalid email", this.state.formState);
      }

      return false;
    }
  }

  getUsernameOrEmailField() {
    return {
      id: 'usernameOrEmail',
      hint: T9n.get('enterUsernameOrEmail'),
      label: T9n.get('usernameOrEmail'),
      required: true,
      defaultValue: this.state.username || "",
      onChange: this.handleChange.bind(this, 'usernameOrEmail')
    };
  }

  getUsernameField() {
    return {
      id: 'username',
      hint: T9n.get('enterUsername'),
      label: T9n.get('username'),
      required: true,
      defaultValue: this.state.username || "",
      onChange: this.handleChange.bind(this, 'username')
    };
  }

  getEmailField() {
    return {
      id: 'email',
      hint: T9n.get('enterEmail'),
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
      hint: T9n.get('enterPassword'),
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
      hint: T9n.get('enterNewPassword'),
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

    if (!hasPasswordService() && getLoginServices().length == 0) {
      loginFields.push({
        label: 'No login service added, i.e. accounts-password',
        type: 'notice'
      });
    }

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

    if (user && formState == STATES.PROFILE) {
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
        href: this.props.signUpPath || Accounts.ui._options.signUpPath,
        onClick: this.switchToSignUp.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP || formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'switchToSignIn',
        label: T9n.get('signIn'),
        type: 'link',
        href: this.props.loginPath || Accounts.ui._options.loginPath,
        onClick: this.switchToSignIn.bind(this)
      });
    }

    if (this.showForgotPasswordLink()) {
      loginButtons.push({
        id: 'switchToPasswordReset',
        label: T9n.get('forgotPassword'),
        type: 'link',
        href: this.props.resetPasswordPath || Accounts.ui._options.resetPasswordPath,
        onClick: this.switchToPasswordReset.bind(this)
      });
    }

    if (user && !_.contains([
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ], passwordSignupFields())
      && formState == STATES.PROFILE
      && (user.services && 'password' in user.services)) {
      loginButtons.push({
        id: 'switchToChangePassword',
        label: T9n.get('changePassword'),
        type: 'link',
        href: this.props.changePasswordPath || Accounts.ui._options.changePasswordPath,
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
        onClick: hasPasswordService() ? this.signUp.bind(this, {}) : null
      });
    }

    if (this.showSignInLink()) {
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
        href: this.props.profilePath || Accounts.ui._options.profilePath,
        onClick: this.switchToSignOut.bind(this)
      });
    }

    // Sort the button array so that the submit button always comes first, and
    // buttons should also come before links.
    loginButtons.sort((a, b) => {
      return (
        b.type == 'submit' &&
        a.type != undefined) - (
          a.type == 'submit' &&
          b.type != undefined);
    });

    return _.indexBy(loginButtons, 'id');
  }

  showSignInLink(){
    return this.state.formState == STATES.SIGN_IN && Package['accounts-password'];
  }

  showPasswordChangeForm() {
    return(Package['accounts-password']
      && this.state.formState == STATES.PASSWORD_CHANGE);
  }

  showCreateAccountLink() {
    return this.state.formState == STATES.SIGN_IN && !Accounts._options.forbidClientAccountCreation && Package['accounts-password'];
  }

  showForgotPasswordLink() {
    return !this.state.user
      && this.state.formState == STATES.SIGN_IN
      && _.contains(
        ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "EMAIL_ONLY"],
        passwordSignupFields());
  }

  switchToSignUp(event) {
    event.preventDefault();
    this.setState({
      formState: STATES.SIGN_UP,
      message: null,
      email: null
    });
  }

  switchToSignIn(event) {
    event.preventDefault();
    this.setState({ formState: STATES.SIGN_IN, message: null });
  }

  switchToPasswordReset(event) {
    event.preventDefault();
    this.setState({ formState: STATES.PASSWORD_RESET, message: null });
  }

  switchToChangePassword(event) {
    event.preventDefault();
    this.setState({ formState: STATES.PASSWORD_CHANGE, message: null });
  }

  switchToSignOut(event) {
    event.preventDefault();
    this.setState({ formState: STATES.PROFILE, message: null });
  }

  signOut() {
    Meteor.logout(() => {
      this.setState({ formState: STATES.SIGN_IN, message: null, password: null });
      this.state.onSignedOutHook();
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

    if (usernameOrEmail !== null) {
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
    } else if (username !== null) {
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
    } else {
      throw new Error("Unexpected -- no element to use as a login user selector");
    }

    Meteor.loginWithPassword(loginSelector, password, (error, result) => {
      if (error) {
        this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
      }
      else {
        loginResultCallback(() => this.state.onSignedInHook());
        this.setState({ formState: STATES.PROFILE, message: null, password: null });
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
            type: 'button',
            className: `btn-${service} ${service}`,
            onClick: this.oauthSignIn.bind(this, service)
          });
        });
      }
    }
    return _.indexBy(oauthButtons, 'id');
  }

  oauthSignIn(serviceName) {
    const { formState, waiting, user } = this.state;
    //Thanks Josh Owens for this one.
    function capitalService() {
      return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }

    if(serviceName === 'meteor-developer'){
      serviceName = 'meteorDeveloperAccount';
    }

    const loginWithService = Meteor["loginWith" + capitalService()];

    let options = {}; // use default scope unless specified
    if (Accounts.ui._options.requestPermissions[serviceName])
      options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
    if (Accounts.ui._options.requestOfflineToken[serviceName])
      options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
    if (Accounts.ui._options.forceApprovalPrompt[serviceName])
      options.forceApprovalPrompt = Accounts.ui._options.forceApprovalPrompt[serviceName];

    loginWithService(options, (error) => {
      if (error) {
        this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"));
      } else {
        this.setState({ formState: STATES.PROFILE, message: '' });
        loginResultCallback(() => {
          Meteor.setTimeout(() => this.state.onSignedInHook(), 100);
        });
      }
    });

  }

  signUp(options = {}) {
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
      this.state.onSubmitHook("error.minChar", formState);
      return;
    }
    else {
      options.password = password;
    }

    this.setState({waiting: true});

    const SignUp = function(_options) {
      Accounts.createUser(_options, (error) => {
        if (error) {
          this.showMessage(T9n.get(`error.accounts.${error.reason}`) || T9n.get("Unknown error"), 'error');
          if (T9n.get(`error.accounts.${error.reason}`)) {
            this.state.onSubmitHook(`error.accounts.${error.reason}`, formState);
          }
          else {
            this.state.onSubmitHook("Unknown error", formState);
          }
        }
        else {
          this.setState({
            formState: STATES.PROFILE,
            message: null,
            password: null
          });
          let user = Accounts.user();
          loginResultCallback(this.state.onPostSignUpHook.bind(this, _options, user));
        }

        this.setState({ waiting: false });
      });
    };

    // Allow for Promises to return.
    let promise = this.state.onPreSignUpHook(options);
    if (promise instanceof Promise) {
      promise.then(SignUp.bind(this, options));
    }
    else {
      SignUp(options);
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

  passwordReset() {
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
          this.setState({ formState: STATES.PROFILE });
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
          this.setState({ formState: STATES.PROFILE });
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
        formState: this.state.user ? STATES.PROFILE : STATES.SIGN_IN
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
