import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Accounts } from 'meteor/accounts-base';
import { T9n } from 'meteor/softwarerero:accounts-t9n';
import { KEY_PREFIX } from '../../login_session.js';
import './Form.jsx';

import {
  STATES,
  passwordSignupFields,
  validateEmail,
  validatePassword,
  validateUsername,
  loginResultCallback,
  getLoginServices,
  hasPasswordService,
  capitalize
} from '../../helpers.js';

function indexBy(array, key) {
  const result = {};
  array.forEach(function(obj) {
    result[obj[key]] = obj;
  });
  return result;
}

class LoginForm extends Component {
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

    if (formState === STATES.SIGN_IN && Package['accounts-password']) {
      console.warn('Do not force the state to SIGN_IN on Accounts.ui.LoginForm, it will make it impossible to reset password in your app, this state is also the default state if logged out, so no need to force it.');
    }

    // Set inital state.
    this.state = {
      messages: [],
      waiting: true,
      formState: formState ? formState : Accounts.user() ? STATES.PROFILE : STATES.SIGN_IN,
      onSubmitHook: props.onSubmitHook || Accounts.ui._options.onSubmitHook,
      onSignedInHook: props.onSignedInHook || Accounts.ui._options.onSignedInHook,
      onSignedOutHook: props.onSignedOutHook || Accounts.ui._options.onSignedOutHook,
      onPreSignUpHook: props.onPreSignUpHook || Accounts.ui._options.onPreSignUpHook,
      onPostSignUpHook: props.onPostSignUpHook || Accounts.ui._options.onPostSignUpHook,
    };
    this.translate = this.translate.bind(this);
  }

  componentDidMount() {
    this.setState(prevState => ({ waiting: false, ready: true }));
    let changeState = Session.get(KEY_PREFIX + 'state');
    switch (changeState) {
      case 'enrollAccountToken':
        this.setState(prevState => ({
          formState: STATES.ENROLL_ACCOUNT
        }));
        Session.set(KEY_PREFIX + 'state', null);
        break;
      case 'resetPasswordToken':
        this.setState(prevState => ({
          formState: STATES.PASSWORD_CHANGE
        }));
        Session.set(KEY_PREFIX + 'state', null);
        break;

      case 'justVerifiedEmail':
        this.setState(prevState => ({
          formState: STATES.PROFILE
        }));
        Session.set(KEY_PREFIX + 'state', null);
        break;
    }

    // Add default field values once the form did mount on the client
    this.setState(prevState => ({
      ...this.getDefaultFieldValues(),
    }));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.formState && nextProps.formState !== this.state.formState) {
      this.setState({
        formState: nextProps.formState,
        ...this.getDefaultFieldValues(),
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.user !== !this.props.user) {
      this.setState({
        formState: this.props.user ? STATES.PROFILE : STATES.SIGN_IN
      });
    }
  }

  translate(text) {
    // if (this.props.t) {
    //   return this.props.t(text);
    // }
    return T9n.get(text);
  }

  validateField(field, value) {
    const { formState } = this.state;
    switch(field) {
      case 'email':
        return validateEmail(value,
          this.showMessage.bind(this),
          this.clearMessage.bind(this),
        );
      case 'password':
        return validatePassword(value,
          this.showMessage.bind(this),
          this.clearMessage.bind(this),
        );
      case 'username':
        return validateUsername(value,
          this.showMessage.bind(this),
          this.clearMessage.bind(this),
          formState,
        );
    }
  }

  getUsernameOrEmailField() {
    return {
      id: 'usernameOrEmail',
      hint: this.translate('enterUsernameOrEmail'),
      label: this.translate('usernameOrEmail'),
      required: true,
      defaultValue: this.state.username || "",
      onChange: this.handleChange.bind(this, 'usernameOrEmail'),
      message: this.getMessageForField('usernameOrEmail'),
    };
  }

  getUsernameField() {
    return {
      id: 'username',
      hint: this.translate('enterUsername'),
      label: this.translate('username'),
      required: true,
      defaultValue: this.state.username || "",
      onChange: this.handleChange.bind(this, 'username'),
      message: this.getMessageForField('username'),
    };
  }

  getEmailField() {
    return {
      id: 'email',
      hint: this.translate('enterEmail'),
      label: this.translate('email'),
      type: 'email',
      required: true,
      defaultValue: this.state.email || "",
      onChange: this.handleChange.bind(this, 'email'),
      message: this.getMessageForField('email'),
    };
  }

  getPasswordField() {
    return {
      id: 'password',
      hint: this.translate('enterPassword'),
      label: this.translate('password'),
      type: 'password',
      required: true,
      defaultValue: this.state.password || "",
      onChange: this.handleChange.bind(this, 'password'),
      message: this.getMessageForField('password'),
    };
  }

  getSetPasswordField() {
    return {
      id: 'newPassword',
      hint: this.translate('enterPassword'),
      label: this.translate('choosePassword'),
      type: 'password',
      required: true,
      onChange: this.handleChange.bind(this, 'newPassword')
    };
  }

  getNewPasswordField() {
    return {
      id: 'newPassword',
      hint: this.translate('enterNewPassword'),
      label: this.translate('newPassword'),
      type: 'password',
      required: true,
      onChange: this.handleChange.bind(this, 'newPassword'),
      message: this.getMessageForField('newPassword'),
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
    this.setDefaultFieldValues({ [field]: value });
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
      if ([
        "USERNAME_AND_EMAIL",
        "USERNAME_AND_OPTIONAL_EMAIL",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields())) {
        loginFields.push(this.getUsernameOrEmailField());
      }

      if (passwordSignupFields() === "USERNAME_ONLY") {
        loginFields.push(this.getUsernameField());
      }

      if ([
        "EMAIL_ONLY",
        "EMAIL_ONLY_NO_PASSWORD"
      ].includes(passwordSignupFields())) {
        loginFields.push(this.getEmailField());
      }

      if (![
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields())) {
        loginFields.push(this.getPasswordField());
      }
    }

    if (hasPasswordService() && formState == STATES.SIGN_UP) {
      if ([
        "USERNAME_AND_EMAIL",
        "USERNAME_AND_OPTIONAL_EMAIL",
        "USERNAME_ONLY",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields())) {
        loginFields.push(this.getUsernameField());
      }

      if ([
        "USERNAME_AND_EMAIL",
        "EMAIL_ONLY",
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields())) {
        loginFields.push(this.getEmailField());
      }

      if (["USERNAME_AND_OPTIONAL_EMAIL"].includes(passwordSignupFields())) {
        loginFields.push(Object.assign(this.getEmailField(), {required: false}));
      }

      if (![
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields())) {
        loginFields.push(this.getPasswordField());
      }
    }

    if (formState == STATES.PASSWORD_RESET) {
      loginFields.push(this.getEmailField());
    }

    if (this.showPasswordChangeForm()) {
      if (Meteor.isClient && !Accounts._loginButtonsSession.get('resetPasswordToken')) {
        loginFields.push(this.getPasswordField());
      }
      loginFields.push(this.getNewPasswordField());
    }

    if (this.showEnrollAccountForm()) {
      loginFields.push(this.getSetPasswordField());
    }
    return indexBy(loginFields, 'id');
  }

  buttons() {
    const {
      loginPath = Accounts.ui._options.loginPath,
      signUpPath = Accounts.ui._options.signUpPath,
      resetPasswordPath = Accounts.ui._options.resetPasswordPath,
      changePasswordPath = Accounts.ui._options.changePasswordPath,
      profilePath = Accounts.ui._options.profilePath,
    } = this.props;
    const { user } = this.props;
    const { formState, waiting } = this.state;
    let loginButtons = [];

    if (user && formState == STATES.PROFILE) {
      loginButtons.push({
        id: 'signOut',
        label: this.translate('signOut'),
        disabled: waiting,
        onClick: this.signOut.bind(this)
      });
    }

    if (this.showCreateAccountLink()) {
      loginButtons.push({
        id: 'switchToSignUp',
        label: this.translate('signUp'),
        type: 'link',
        href: signUpPath,
        onClick: this.switchToSignUp.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP || formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'switchToSignIn',
        label: this.translate('signIn'),
        type: 'link',
        href: loginPath,
        onClick: this.switchToSignIn.bind(this)
      });
    }

    if (this.showForgotPasswordLink()) {
      loginButtons.push({
        id: 'switchToPasswordReset',
        label: this.translate('forgotPassword'),
        type: 'link',
        href: resetPasswordPath,
        onClick: this.switchToPasswordReset.bind(this)
      });
    }

    if (user && ![
        "EMAIL_ONLY_NO_PASSWORD",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields())
      && formState == STATES.PROFILE
      && (user.services && 'password' in user.services)) {
      loginButtons.push({
        id: 'switchToChangePassword',
        label: this.translate('changePassword'),
        type: 'link',
        href: changePasswordPath,
        onClick: this.switchToChangePassword.bind(this)
      });
    }

    if (formState == STATES.SIGN_UP) {
      loginButtons.push({
        id: 'signUp',
        label: this.translate('signUp'),
        type: hasPasswordService() ? 'submit' : 'link',
        className: 'active',
        disabled: waiting,
        onClick: hasPasswordService() ? this.signUp.bind(this, {}) : null
      });
    }

    if (this.showSignInLink()) {
      loginButtons.push({
        id: 'signIn',
        label: this.translate('signIn'),
        type: hasPasswordService() ? 'submit' : 'link',
        className: 'active',
        disabled: waiting,
        onClick: hasPasswordService() ? this.signIn.bind(this) : null
      });
    }

    if (formState == STATES.PASSWORD_RESET) {
      loginButtons.push({
        id: 'emailResetLink',
        label: this.translate('resetYourPassword'),
        type: 'submit',
        disabled: waiting,
        onClick: this.passwordReset.bind(this)
      });
    }

    if (this.showPasswordChangeForm() || this.showEnrollAccountForm()) {
      loginButtons.push({
        id: 'changePassword',
        label: (this.showPasswordChangeForm() ? this.translate('changePassword') : this.translate('setPassword')),
        type: 'submit',
        disabled: waiting,
        onClick: this.passwordChange.bind(this)
      });

      if (Accounts.user()) {
        loginButtons.push({
          id: 'switchToSignOut',
          label: this.translate('cancel'),
          type: 'link',
          href: profilePath,
          onClick: this.switchToSignOut.bind(this)
        });
      } else {
        loginButtons.push({
          id: 'cancelResetPassword',
          label: this.translate('cancel'),
          type: 'link',
          onClick: this.cancelResetPassword.bind(this),
        });
      }
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

    return indexBy(loginButtons, 'id');
  }

  showSignInLink(){
    return this.state.formState == STATES.SIGN_IN && Package['accounts-password'];
  }

  showPasswordChangeForm() {
    return(Package['accounts-password']
      && this.state.formState == STATES.PASSWORD_CHANGE);
  }

  showEnrollAccountForm() {
    return(Package['accounts-password']
      && this.state.formState == STATES.ENROLL_ACCOUNT);
  }

  showCreateAccountLink() {
    return this.state.formState == STATES.SIGN_IN && !Accounts._options.forbidClientAccountCreation && Package['accounts-password'];
  }

  showForgotPasswordLink() {
    return !this.props.user
      && this.state.formState == STATES.SIGN_IN
      && ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "EMAIL_ONLY"].includes(passwordSignupFields());
  }

  /**
   * Helper to store field values while using the form.
   */
  setDefaultFieldValues(defaults) {
    if (typeof defaults !== 'object') {
      throw new Error('Argument to setDefaultFieldValues is not of type object');
    } else if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('accounts_ui', JSON.stringify({
        passwordSignupFields: passwordSignupFields(),
        ...this.getDefaultFieldValues(),
        ...defaults,
      }));
    }
  }

  /**
   * Helper to get field values when switching states in the form.
   */
  getDefaultFieldValues() {
    if (typeof localStorage !== 'undefined' && localStorage) {
      const defaultFieldValues = JSON.parse(localStorage.getItem('accounts_ui') || null);
      if (defaultFieldValues
        && defaultFieldValues.passwordSignupFields === passwordSignupFields()) {
        return defaultFieldValues;
      }
    }
  }

  /**
   * Helper to clear field values when signing in, up or out.
   */
  clearDefaultFieldValues() {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.removeItem('accounts_ui');
    }
  }

  switchToSignUp(event) {
    event.preventDefault();
    this.setState({
      formState: STATES.SIGN_UP,
      ...this.getDefaultFieldValues(),
    });
    this.clearMessages();
  }

  switchToSignIn(event) {
    event.preventDefault();
    this.setState({
      formState: STATES.SIGN_IN,
      ...this.getDefaultFieldValues(),
    });
    this.clearMessages();
  }

  switchToPasswordReset(event) {
    event.preventDefault();
    this.setState({
      formState: STATES.PASSWORD_RESET,
      ...this.getDefaultFieldValues(),
    });
    this.clearMessages();
  }

  switchToChangePassword(event) {
    event.preventDefault();
    this.setState({
      formState: STATES.PASSWORD_CHANGE,
      ...this.getDefaultFieldValues(),
    });
    this.clearMessages();
  }

  switchToSignOut(event) {
    event.preventDefault();
    this.setState({
      formState: STATES.PROFILE,
    });
    this.clearMessages();
  }

  cancelResetPassword(event) {
    event.preventDefault();
    Accounts._loginButtonsSession.set('resetPasswordToken', null);
    this.setState({
      formState: STATES.SIGN_IN,
      messages: [],
    });
  }

  signOut() {
    Meteor.logout(() => {
      this.setState({
        formState: STATES.SIGN_IN,
        password: null,
      });
      this.state.onSignedOutHook();
      this.clearMessages();
      this.clearDefaultFieldValues();
    });
  }

  signIn() {
    const {
      username = null,
      email = null,
      usernameOrEmail = null,
      password,
      formState,
      onSubmitHook
    } = this.state;
    let error = false;
    let loginSelector;
    this.clearMessages();

    if (usernameOrEmail !== null) {
      if (!this.validateField('username', usernameOrEmail)) {
        if (this.state.formState == STATES.SIGN_UP) {
          this.state.onSubmitHook("error.accounts.usernameRequired", this.state.formState);
        }
        error = true;
      }
      else {
        if (["USERNAME_AND_EMAIL_NO_PASSWORD"].includes(passwordSignupFields())) {
          this.loginWithoutPassword();
          return;
        } else {
          loginSelector = usernameOrEmail;
        }
      }
    } else if (username !== null) {
      if (!this.validateField('username', username)) {
        if (this.state.formState == STATES.SIGN_UP) {
          this.state.onSubmitHook("error.accounts.usernameRequired", this.state.formState);
        }
        error = true;
      }
      else {
        loginSelector = { username: username };
      }
    }
    else if (usernameOrEmail == null) {
      if (!this.validateField('email', email)) {
        error = true;
      }
      else {
        if (["EMAIL_ONLY_NO_PASSWORD"].includes(passwordSignupFields())) {
          this.loginWithoutPassword();
          error = true;
        } else {
          loginSelector = { email };
        }
      }
    }
    if (!["EMAIL_ONLY_NO_PASSWORD"].includes(passwordSignupFields())
      && !this.validateField('password', password)) {
      error = true;
    }

    if (!error) {
      Meteor.loginWithPassword(loginSelector, password, (error, result) => {
        onSubmitHook(error,formState);
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
        }
        else {
          loginResultCallback(() => this.state.onSignedInHook());
          this.setState({
            formState: STATES.PROFILE,
            password: null,
          });
          this.clearDefaultFieldValues();
        }
      });
    }
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
    return indexBy(oauthButtons, 'id');
  }

  oauthSignIn(serviceName) {
    const { user } = this.props;
    const { formState, waiting, onSubmitHook } = this.state;
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

    this.clearMessages();
    const self = this
    loginWithService(options, (error) => {
      onSubmitHook(error,formState);
      if (error) {
        this.showMessage(`error.accounts.${error.reason}` || "unknown_error");
      } else {
        this.setState({ formState: STATES.PROFILE });
        this.clearDefaultFieldValues();
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
      formState,
      onSubmitHook
    } = this.state;
    let error = false;
    this.clearMessages();

    if (username !== null) {
      if ( !this.validateField('username', username) ) {
        if (this.state.formState == STATES.SIGN_UP) {
          this.state.onSubmitHook("error.accounts.usernameRequired", this.state.formState);
        }
        error = true;
      } else {
        options.username = username;
      }
    } else {
      if ([
        "USERNAME_AND_EMAIL",
        "USERNAME_AND_EMAIL_NO_PASSWORD"
      ].includes(passwordSignupFields()) && !this.validateField('username', username) ) {
        if (this.state.formState == STATES.SIGN_UP) {
          this.state.onSubmitHook("error.accounts.usernameRequired", this.state.formState);
        }
        error = true;
      }
    }

    if (!this.validateField('email', email)){
      error = true;
    } else {
      options.email = email;
    }

    if ([
      "EMAIL_ONLY_NO_PASSWORD",
      "USERNAME_AND_EMAIL_NO_PASSWORD"
    ].includes(passwordSignupFields())) {
      // Generate a random password.
      options.password = Meteor.uuid();
    } else if (!this.validateField('password', password)) {
      onSubmitHook("Invalid password", formState);
      error = true;
    } else {
      options.password = password;
    }

    const SignUp = function(_options) {
      Accounts.createUser(_options, (error) => {
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
          if (this.translate(`error.accounts.${error.reason}`)) {
            onSubmitHook(`error.accounts.${error.reason}`, formState);
          }
          else {
            onSubmitHook("unknown_error", formState);
          }
        }
        else {
          onSubmitHook(null, formState);
          this.setState({ formState: STATES.PROFILE, password: null });
          let user = Accounts.user();
          loginResultCallback(this.state.onPostSignUpHook.bind(this, _options, user));
          this.clearDefaultFieldValues();
        }

        this.setState({ waiting: false });
      });
    };

    if (!error) {
      this.setState({ waiting: true });
      // Allow for Promises to return.
      let promise = this.state.onPreSignUpHook(options);
      if (promise instanceof Promise) {
        promise.then(SignUp.bind(this, options));
      }
      else {
        SignUp(options);
      }
    }
  }

  loginWithoutPassword(){
    const {
      email = '',
      usernameOrEmail = '',
      waiting,
      formState,
      onSubmitHook
    } = this.state;

    if (waiting) {
      return;
    }

    if (this.validateField('email', email)) {
      this.setState({ waiting: true });

      Accounts.loginWithoutPassword({ email: email }, (error) => {
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
        }
        else {
          this.showMessage(this.translate("info.emailSent"), 'success', 5000);
          this.clearDefaultFieldValues();
        }
        onSubmitHook(error, formState);
        this.setState({ waiting: false });
      });
    } else if (this.validateField('username', usernameOrEmail)) {
      this.setState({ waiting: true });

      Accounts.loginWithoutPassword({ email: usernameOrEmail, username: usernameOrEmail }, (error) => {
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
        }
        else {
          this.showMessage(this.translate("info.emailSent"), 'success', 5000);
          this.clearDefaultFieldValues();
        }
        onSubmitHook(error, formState);
        this.setState({ waiting: false });
      });
    } else {
      let errMsg = null;
      if (["USERNAME_AND_EMAIL_NO_PASSWORD"].includes(passwordSignupFields())) {
        errMsg = this.translate("error.accounts.invalid_email");
      }
      else {
        errMsg = this.translate("error.accounts.invalid_email");
      }
      this.showMessage(errMsg,'warning');
      onSubmitHook(errMsg, formState);
    }
  }

  passwordReset() {
    const {
      email = '',
      waiting,
      formState,
      onSubmitHook
    } = this.state;

    if (waiting) {
      return;
    }

    this.clearMessages();
    if (this.validateField('email', email)) {
      this.setState({ waiting: true });

      Accounts.forgotPassword({ email: email }, (error) => {
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
        }
        else {
          this.showMessage(this.translate("info.emailSent"), 'success', 5000);
          this.clearDefaultFieldValues();
        }
        onSubmitHook(error, formState);
        this.setState({ waiting: false });
      });
    }
  }

  passwordChange() {
    const {
      password,
      newPassword,
      formState,
      onSubmitHook,
      onSignedInHook,
    } = this.state;

    if (!this.validateField('password', newPassword)){
      onSubmitHook('err.minChar',formState);
      return;
    }

    let token = Accounts._loginButtonsSession.get('resetPasswordToken');
    if (!token) {
      token = Accounts._loginButtonsSession.get('enrollAccountToken');
    }
    if (token) {
      Accounts.resetPassword(token, newPassword, (error) => {
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
          onSubmitHook(error, formState);
        }
        else {
          this.showMessage(this.translate('info.passwordChanged'), 'success', 5000);
          onSubmitHook(null, formState);
          this.setState({ formState: STATES.PROFILE });
          Accounts._loginButtonsSession.set('resetPasswordToken', null);
          Accounts._loginButtonsSession.set('enrollAccountToken', null);
          onSignedInHook();
        }
      });
    }
    else {
      Accounts.changePassword(password, newPassword, (error) => {
        if (error) {
          this.showMessage(`error.accounts.${error.reason}` || "unknown_error", 'error');
          onSubmitHook(error, formState);
        }
        else {
          this.showMessage('info.passwordChanged', 'success', 5000);
          onSubmitHook(null, formState);
          this.setState({ formState: STATES.PROFILE });
          this.clearDefaultFieldValues();
        }
      });
    }
  }

  showMessage(message, type, clearTimeout, field){
    message = this.translate(message).trim();
    if (message) {
      this.setState(({ messages = [] }) => {
        messages.push({
          message,
          type,
          ...(field && { field }),
        });
        return  { messages };
      });
      if (clearTimeout) {
        this.hideMessageTimout = setTimeout(() => {
          // Filter out the message that timed out.
          this.clearMessage(message);
        }, clearTimeout);
      }
    }
  }

  getMessageForField(field) {
    const { messages = [] } = this.state;
    return messages.find(({ field:key }) => key === field);
  }

  clearMessage(message) {
    if (message) {
      this.setState(({ messages = [] }) => ({
        messages: messages.filter(({ message:a }) => a !== message),
      }));
    }
  }

  clearMessages() {
    if (this.hideMessageTimout) {
      clearTimeout(this.hideMessageTimout);
    }
    this.setState({ messages: [] });
  }

  componentWillMount() {
    // XXX Check for backwards compatibility.
    if (Meteor.isClient) {
      const container = document.createElement('div');
      ReactDOM.render(<Accounts.ui.Field message="test" />, container);
      if (container.getElementsByClassName('message').length == 0) {
        // Found backwards compatibility issue with 1.3.x
        console.warn(`Implementations of Accounts.ui.Field must render message in v1.2.11.
          https://github.com/studiointeract/accounts-ui/#deprecations`);
      }
    }
  }

  componentWillUnmount() {
    if (this.hideMessageTimout) {
      clearTimeout(this.hideMessageTimout);
    }
  }

  render() {
    this.oauthButtons();
    // Backwords compatibility with v1.2.x.
    const { messages = [] } = this.state;
    const message = {
      deprecated: true,
      message: messages.map(({ message }) => message).join(', '),
    };
    return (
      <Accounts.ui.Form
        oauthServices={this.oauthButtons()}
        fields={this.fields()} 
        buttons={this.buttons()}
        {...this.state}
        message={message}
        translate={text => this.translate(text)}
      />
    );
  }
}
LoginForm.propTypes = {
  formState: PropTypes.symbol,
  loginPath: PropTypes.string,
  signUpPath: PropTypes.string,
  resetPasswordPath: PropTypes.string,
  profilePath: PropTypes.string,
  changePasswordPath: PropTypes.string,
};
LoginForm.defaultProps = {
  formState: null,
  loginPath: null,
  signUpPath: null,
  resetPasswordPath: null,
  profilePath: null,
  changePasswordPath: null,
};

Accounts.ui.LoginForm = LoginForm;

export default createContainer(() => {
  // Listen for the user to login/logout and the services list to the user.
  Meteor.subscribe('servicesList');
  return ({
    user: Accounts.user(),
  });
}, LoginForm);
