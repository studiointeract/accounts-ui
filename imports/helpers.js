export const loginButtonsSession = Accounts._loginButtonsSession;
export const STATES = {
  SIGN_IN: Symbol('SIGN_IN'),
  SIGN_UP: Symbol('SIGN_UP'),
  PROFILE: Symbol('PROFILE'),
  PASSWORD_CHANGE: Symbol('PASSWORD_CHANGE'),
  PASSWORD_RESET: Symbol('PASSWORD_RESET')
};

export function getLoginServices() {
  // First look for OAuth services.
  const services = Package['accounts-oauth'] ? Accounts.oauth.serviceNames() : [];

  // Be equally kind to all login services. This also preserves
  // backwards-compatibility.
  services.sort();

  return _.map(services, function(name){
    return {name: name};
  });
};
// Export getLoginServices using old style globals for accounts-base which
// requires it.
this.getLoginServices = getLoginServices;

export function hasPasswordService() {
  // First look for OAuth services.
  return !!Package['accounts-password'];
};

export function loginResultCallback(service, err) {
  if (!err) {

  } else if (err instanceof Accounts.LoginCancelledError) {
    // do nothing
  } else if (err instanceof ServiceConfiguration.ConfigError) {

  } else {
    //loginButtonsSession.errorMessage(err.reason || "Unknown error");
  }

  if (Meteor.isClient) {
    if (typeof redirect === 'string'){
      window.location.href = '/';
    }

    if (typeof service === 'function'){
      service();
    }
  }
};

export function passwordSignupFields() {
  return Accounts.ui._options.passwordSignupFields || "EMAIL_ONLY_NO_PASSWORD";
};

export function validatePassword(password){
  if (password.length >= Accounts.ui._options.minimumPasswordLength) {
    return true;
  } else {
    return false;
  }
};

export function redirect(redirect) {
  if (Meteor.isClient) {
    if (window.history) {
      Meteor.setTimeout(() => {
        if (Package['kadira:flow-router']) {
          Package['kadira:flow-router'].FlowRouter.go(redirect);
        }
        else if (Package['kadira:flow-router-ssr']) {
          Package['kadira:flow-router-ssr'].FlowRouter.go(redirect);
        }
        else {
          window.history.pushState( {} , 'redirect', redirect );
        }
      }, 500);
    }
  }
}

export function capitalize(string) {
  return string.replace(/\-/, ' ').split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}
