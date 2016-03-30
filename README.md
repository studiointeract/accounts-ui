# React Accounts UI

Current version 1.0.12

## Features

1. **[Easy to use](#using-react-accounts-ui)**, mixing the ideas of useraccounts configuration and accounts-ui that everyone already knows and loves.
3. **[Components](#components-available)** are everywhere, and extensible by replacing them on Accounts.ui.
4. **[Basic routing](#configuration)** included, redirections when the user clicks a link in an email or when signing in or out.
5. **[Unstyled](#styling)** is the default, no CSS included.
6. **[No password](#no-password-required)** sign up and sign in are included.
7. **[Extra fields](#extra-fields)** is now supported.
8. **[Server Side Rendering](#server-side-rendering)** are supported, trough FlowRouter (SSR).
9. **[Extending](#create-your-own-styled-version)** to make your own package, all components can be extended and customized.

## Styling

This package does not by standard come with any styling, you can easily [extend and make your own](#create-your-own-styled-version), here are a couple versions we've made for the typical use case:

* [**Basic**](https://atmospherejs.com/studiointeract/react-accounts-ui-basic)  `studiointeract:react-accounts-ui-basic`

* Add your styled version here [Learn how](#create-your-own-styled-version)

## Installation

`meteor add studiointeract:react-accounts-ui`

## Configuration

We support the standard [configuration in the account-ui package](http://docs.meteor.com/#/full/accounts_ui_config). But have extended with some new options.

### Accounts.ui.config(options)

`import { Accounts } from 'meteor/studiointeract:react-accounts-ui`

Configure the behavior of `<Accounts.ui.LoginForm />`

**_Options:_**

* **requestPermissions**&nbsp;&nbsp;&nbsp; Object  
  Which [permissions](http://docs.meteor.com/#requestpermissions) to request from the user for each external service.

* **requestOfflineToken**&nbsp;&nbsp;&nbsp; Object  
  To ask the user for permission to act on their behalf when offline, map the relevant external service to true. Currently only supported with Google. See [Meteor.loginWithExternalService](http://docs.meteor.com/#meteor_loginwithexternalservice) for more details.

* **forceApprovalPrompt**&nbsp;&nbsp;&nbsp; Object  
  If true, forces the user to approve the app's permissions, even if previously approved. Currently only supported with Google.

* **passwordSignupFields**&nbsp;&nbsp;&nbsp; String  
  Which fields to display in the user creation form. One of `'USERNAME_AND_EMAIL'`, `'USERNAME_AND_OPTIONAL_EMAIL'`, `'USERNAME_ONLY'`, or `'EMAIL_ONLY'`, **`'NO_PASSWORD'`** (**default**).

* **loginPath**&nbsp;&nbsp;&nbsp; String  
  Change the default path a user should be redirected to after a clicking a link in a mail provided to them from the accounts system, it could be a mail set to them when they have reset their password, verifying their email if the setting for `sendVerificationEmail` is turned on ([read more on accounts configuration ](http://docs.meteor.com/#/full/accounts_config)).

* **homeRoutePath**&nbsp;&nbsp;&nbsp; String  
  Set the path to where you would like the user to be redirected after a successful login or sign out.

* **onSubmitHook**&nbsp;&nbsp;&nbsp; function(error, state)  
  Called when the LoginForm is being submitted: allows for custom actions to be taken on form submission. error contains possible errors occurred during the submission process, state specifies the LoginForm internal state from which the submission was triggered. A nice use case might be closing the modal or side-menu or dropdown showing LoginForm.

* **preSignUpHook**&nbsp;&nbsp;&nbsp; function(options)  
  Called just before submitting the LoginForm for sign-up: allows for custom actions on the data being submitted. A nice use could be extending the user profile object accessing options.profile. to be taken on form submission. The plain text password is also provided for any reasonable use. If you return a promise, the submission will wait until you resolve it.

* **postSignUpHook**&nbsp;&nbsp;&nbsp; func(userId, info)&nbsp;&nbsp;&nbsp; **server**  
  Called server side, just after a successful user account creation, post submitting the pwdForm for sign-up: allows for custom actions on the data being submitted after we are sure a new user was successfully created. A common use might be applying roles to the user, as this is only possible after fully completing user creation in `alanning:roles`. The userId is available as the first parameter, so that user user object may be retrieved.

* **postSignUpHook**&nbsp;&nbsp;&nbsp; func(userId, info)&nbsp;&nbsp;&nbsp; **client**   
  Called client side, just after a successful user account creation, post submitting the pwdForm for sign-up: allows for custom actions on the data being submitted after we are sure a new user was successfully created. Default is **loginPath**.  

* **resetPasswordHook**&nbsp;&nbsp;&nbsp; function()  
  Change the default redirect behavior when the user clicks the link to reset their email sent from the system, i.e. you want a custom path for the reset password form. Default is **loginPath**.

* **onEnrollAccountHook**&nbsp;&nbsp;&nbsp; function()  
  Change the default redirect behavior when the user clicks the link to enroll for an account sent from the system, i.e. you want a custom path for the enrollment form. Learn more about [how to send enrollment emails](http://docs.meteor.com/#/full/accounts_sendenrollmentemail). Default is **loginPath**.

* **onVerifyEmailHook**&nbsp;&nbsp;&nbsp; function()  
  Change the default redirect behavior when the user clicks the link to verify their email sent from the system, i.e. you want a custom path after the user verifies their email or login with `NO_PASSWORD`. Default is **homeRoutePath**.

* **onSignedInHook**&nbsp;&nbsp;&nbsp; function()  
  Change the default redirect behavior when the user successfully login to your application, i.e. you want a custom path for the reset password form. Default is **homeRoutePath**.

* **onSignedOutHook**&nbsp;&nbsp;&nbsp; function()  
  Change the default redirect behavior when the user signs out using the LoginForm, i.e. you want a custom path after the user signs out. Default is **homeRoutePath**.

## No password required

This package provides a state that makes it possible to create and manage accounts without a password. The idea is simple, you always verify your email, so to login you enter your mail and the system emails you a link to login. The mail that is sent can be changed if needed, just [how you alter the email templates in accounts-base](http://docs.meteor.com/#/full/accounts_emailtemplates).

This is the default setting for **passwordSignupFields** in the [configuration](#configuration).

## Using React Accounts UI

### Example setup (Meteor 1.3)

`meteor add accounts-password`  
`meteor add studiointeract:react-accounts-ui`

```javascript

import React from 'react';
import { Accounts } from 'meteor/studiointeract:react-accounts-ui';

Accounts.ui.config({
  passwordSignupFields: 'NO_PASSWORD',
  loginPath: '/',
});

if (Meteor.isClient) {
  ReactDOM.render(<Accounts.ui.LoginForm />, document.body)
}

```

### Example setup using FlowRouter (Meteor 1.3)

`meteor add accounts-password`  
`meteor add studiointeract:react-accounts-ui`  
`meteor add kadira:flow-router-ssr`

```javascript

import React from 'react';
import { Accounts } from 'meteor/studiointeract:react-accounts-ui';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';

Accounts.ui.config({
  passwordSignupFields: 'NO_PASSWORD',
  loginPath: '/login',
  onSignedInHook: () => FlowRouter.go('/general'),
  onSignedOutHook: () => FlowRouter.go('/')
});

FlowRouter.route("/login", {
  action(params) {
    mount(MainLayout, {
      content: <Accounts.ui.LoginForm />
    });
  }
});

```

## Create your own styled version

**To you who are a package author**, its easy to write extensions for `studiointeract:react-accounts-ui` by importing and export like the following example:

```javascript
// package.js

Package.describe({
  name: 'author:react-accounts-ui-bootstrap',
  version: '1.0.0',
  summary: 'Bootstrap – Accounts UI for React in Meteor 1.3',
  git: 'https://github.com/author/react-accounts-ui-bootstrap',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use('ecmascript');
  api.use('studiointeract:react-accounts-ui');

  api.imply('session');

  api.mainModule('main.jsx');
});
```

```javascript
// package.json

{
  "name": "react-accounts-ui-bootstrap",
  "description": "Bootstrap – Accounts UI for React in Meteor 1.3",
  "repository": {
    "type": "git",
    "url": "https://github.com/author/react-accounts-ui-bootstrap.git"
  },
  "keywords": [
    "react",
    "meteor",
    "accounts",
    "tracker"
  ],
  "author": "author",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/author/react-accounts-ui-bootstrap/issues"
  },
  "homepage": "https://github.com/author/react-accounts-ui-bootstrap",
  "dependencies": {
    "react": "^15.x",
    "react-dom": "^15.x",
    "tracker-component": "^1.3.13"
  }
}

```

To install the dependencies added in your package.json run:  
`npm i`

```javascript
// main.jsx

import React from 'react';
import { Accounts } from 'meteor/studiointeract:react-accounts-ui';

/**
 * Form.propTypes = {
 *   fields: React.PropTypes.object.isRequired,
 *   buttons: React.PropTypes.object.isRequired,
 *   error: React.PropTypes.string,
 *   ready: React.PropTypes.bool
 * };
 */
class Form extends Accounts.ui.Form {
  render() {
    const { fields, buttons, error, message, ready = true} = this.props;
    return (
      <form className={ready ? "ready" : null} onSubmit={ evt => evt.preventDefault() } className="accounts-ui">
        <Accounts.ui.Fields fields={ fields } />
        <Accounts.ui.Buttons buttons={ buttons } />
        <Accounts.ui.FormMessage message={ message } />
      </form>
    );
  }
}

class Buttons extends Accounts.ui.Buttons {}
class Button extends Accounts.ui.Button {}
class Fields extends Accounts.ui.Fields {}
class Field extends Accounts.ui.Field {}
class FormMessage extends Accounts.ui.FormMessage {}
// Notice! Accounts.ui.LoginForm manages all state logic
// at the moment, so avoid overwriting this one, but have
// a look at it and learn how it works. And pull
// requests altering how that works are welcome.

// Alter provided default unstyled UI.
Accounts.ui.Form = Form;
Accounts.ui.Buttons = Buttons;
Accounts.ui.Button = Button;
Accounts.ui.Fields = Fields;
Accounts.ui.Field = Field;
Accounts.ui.FormMessage = FormMessage;

// Export the themed version.
export { Accounts as default };

```

### Available components

* Accounts.ui.LoginForm
  * Accounts.ui.Form
    * Accounts.ui.Fields
      * Accounts.ui.Field
    * Accounts.ui.Buttons
      * Accounts.ui.Button
    * Accounts.ui.FormMessage

## Extra fields

> Example provided by [@radzom](https://github.com/radzom).

```javascript
import { Accounts, STATES } from 'meteor/react-accounts-ui';

class NewLogin extends Accounts.ui.LoginForm {
  fields() {
    const { formState } = this.state;
    if (formState == STATES.SIGN_UP) {
      return {
        firstname: {
          id: 'firstname',
          hint: 'Enter firstname',
          label: 'firstname',
          onChange: this.handleChange.bind(this, 'firstname')
        },
        ...super.fields()
      };
    }
    return super.fields();
  }

  signUp(options = {}) {
    const { firstname = null } = this.state;
    if (firstname !== null) {
      options.profile = Object.assign(options.profile || {}, {
        firstname: firstname
      });
    }
    super.signUp(options);
  }
}
```


## Credits

Made by the [creative folks at Studio Interact](http://studiointeract.com)
