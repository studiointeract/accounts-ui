# ChangeLog

### v1.2.9
10-November-2016

* #73 – in constructor, we should use `props` and not `this.props`
* #78 – Move react packages to peerDependencies
* Added support for React Router Link in buttons.

### v1.2.8
26-October-2016

* #70 – Added link to new material UI package.
* #71 – make sure nextProps.formState actually exists before overwriting state

### v1.2.7
19-October-2016

* Make sure `nextProps.formState` actually exists before overwriting `state.formState`.

### v1.2.6
2-June-2016

* Allow form state to be set from prop formState when logged in #51 @todda00

### v1.2.4-5
28-May-2016

* Adding missing configuration in oauth services.

### v1.2.2-3
24-May-2016

* Solves issue with social redirect flow being redirected to a faulty urls: #36
* Solves issue: Accounts.sendLoginEmail does not work if address is set: #42

### v1.2.1
10-May-2016

* Solves issue with props not being passed down: #39

### v1.2.0
10-May-2016

* Adding the hooks to be passed as props.

### v1.1.19

* Improving hooks for server side rendered pages.
* Improving so that browser pre-filled input values are pushed back to the form state.

### v1.1.18

* Updated Tracker dependency.

### v1.1.17

* Updated Tracker dependency.

### v1.1.16

* Bumping version on check-npm-versions to solve #29

### v1.1.15

* @SachaG added classes to the social buttons distinguishing which service.

### v1.1.14

* @SachaG added tmeasday:check-npm-versions to check for the correct version of npm packages.
* @ArthurPai updated T9n, which adds the Chinese language for accounts, so we can update it to v1.3.3
* @ArthurPai fixed a forgotten update T9n translation in the PasswordOrService component.
* @PolGuixe fixed the faulty meteor-developer account integration.

### v1.1.13

* Fixed faulty language strings.

### v1.1.12

* Updated to use the latest translations in softwarerero:accounts-t9n

### v1.1.11

* Updated to softwarerero:accounts-t9n@1.3.1
* Don't show change password link if using NO_PASSWORD.

### v1.1.10

* Fixed a bug that caused the form when submitted to reload the page, related:
https://github.com/studiointeract/accounts-ui/issues/18

### v1.1.9

* Fixed a faulty default setting, that got replaced in 1.0.21.

### v1.1.8

* Added notice on missing login services.

### v1.1.7

* Upgraded dependency of softwarerero:accounts-t9n to 1.3.0, related:
https://github.com/studiointeract/accounts-ui/issues/15

### v1.1.6

* Removed server side version of onPostSignUpHook, related issues:
https://github.com/studiointeract/accounts-ui/issues/17
https://github.com/studiointeract/accounts-ui/issues/16

### v1.1.5

* Improving and removing redundant logging.

### v1.1.4

* Bugfixes for Telescope Nova

### v1.1.1-3

* Bugfixes

### v1.1.0

* Renamed package to std:accounts-ui

### v1.0.21

* Buttons for oauth services
* Option for "NO_PASSWORD" changed to "EMAIL_ONLY_NO_PASSWORD"
* Added new options to accounts-password "USERNAME_AND_EMAIL_NO_PASSWORD".

### v1.0.20

* Clear the password when logging in or out.

### v1.0.19

* Added defaultValue to fields, so that when switching formState the form keeps the value it had from the other form. Which has always been a really great experience with Meteor accounts-ui.

### v1.0.18

* Bug fixes

### v1.0.17

* Added so that the formState responds to user logout from the terminal.

### v1.0.16

* Bug fix

### v1.0.15

* Added required boolean to Fields
* Added type to message and changed to Object type
* Added ready boolean to form.

### v1.0.12-14

* Bug fixes

### v1.0.11

* Bump version of Tracker.Component

### v1.0.10

* Support for extending with more fields.

### v1.0.1-9

* Bugfixes

### v1.0.0

* Fully featured accounts-password
* Support for "NO_PASSWORD".
