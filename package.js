Package.describe({
  name: 'studiointeract:react-accounts-ui',
  version: '1.0.1',
  summary: 'Accounts UI for React Component in Meteor',
  git: 'https://github.com/studiointeract/react-accounts-ui',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3-rc.1');
  api.use('ecmascript');
  api.use('tracker');
  api.use('underscore');
  api.use('accounts-base');
  api.use('check');

  api.imply('accounts-base');

  api.use('accounts-oauth', {weak: true});
  api.use('accounts-password', {weak: true});

  api.mainModule('main.js');
});
