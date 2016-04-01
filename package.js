Package.describe({
  name: 'std:react-accounts-ui',
  version: '1.1.0',
  summary: 'Accounts UI for React in Meteor 1.3',
  git: 'https://github.com/studiointeract/react-accounts-ui',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use('ecmascript');
  api.use('tracker');
  api.use('underscore');
  api.use('accounts-base');
  api.use('check');
  api.use('random');
  api.use('email');
  api.use('session');
  api.use('softwarerero:accounts-t9n');

  api.imply('accounts-base');
  api.imply('softwarerero:accounts-t9n@0.0.20');

  api.use('accounts-oauth', {weak: true});
  api.use('accounts-password', {weak: true});

  api.mainModule('main_client.js', 'client');
  api.mainModule('main_server.js', 'server');
});
