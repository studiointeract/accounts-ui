export function t9n(str) {
  return str;
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

export function loginResultCallback(redirect, error) {
  if (Meteor.isClient) {
    if (typeof redirect === 'string'){
      window.location.href = redirect;
    }

    if (typeof redirect === 'function'){
      redirect();
    }
  }
};

export function passwordSignupFields() {
  return Accounts.ui._options.passwordSignupFields || "EMAIL_ONLY";
};

export function validatePassword(password){
  if (password.length >= 6) {
    return true;
  } else {
    return false;
  }
};

export function redirect(path) {
  if (Meteor.isClient) {
    if (window.history) {
      window.history.replaceState( {} , 'redirect', path );
    }
  }
}
