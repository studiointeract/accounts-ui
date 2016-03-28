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

export function loginResultCallback(redirect) {
  if (Meteor.isClient){
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

// Helper to dynamically inject react components.
Global = this;
export function Inject(component, ...args) {
  return Global[component] ? React.createElement.apply(React.createElement, [Global[component], ...args]) : '';
}

export function redirect(path) {
  if (Meteor.isClient) {
    if (window.history) {
      window.history.replaceState( {} , 'redirect', path );
    }
    else {
      window.location.href = href;
    }
  }
}

// capitalize = function(str){
//   str = str == null ? '' : String(str);
//
//   return str.charAt(0).toUpperCase() + str.slice(1);
// };
