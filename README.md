# React Accounts UI for Meteor 1.3

Current version 1.0.0

> NOTICE! Work in progress here.

## Features

1. **Easy to use**, mixing the ideas of useraccounts configuration and accounts-ui that everyone already knows.
2. **Server Side Rendering** are supported, trough FlowRouter (SSR).
3. **Components** are everywhere, and extensible by replacing them on Accounts.ui.
4. **Basic routing** included.
5. **Unstyled** is the default, no CSS included.

### Styled version

* Check back here later for styled version i.e. bootstrap, semantic-ui.

We're hoping package developers write extensions for these by importing like this:

```javascript
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
// Overwrite provided form.
Accounts.ui.Form = Form;
exports default Accounts;

```

### Available components

* Accounts.ui.LoginForm
  * Accounts.ui.Form
    * Accounts.ui.Fields
      * Accounts.ui.Field
    * Accounts.ui.Buttons
      * Accounts.ui.Button
    * Accounts.ui.FormMessage

## Installation

### Meteor 1.3

`meteor add studiointeract:react-accounts-ui`

> Configuration instructions coming shortly! In the meantime check the example below, and for full details about configuration options check in `./lib/accounts_ui.js`

### Meteor 1.2

> Not supported.

## Example setup using FlowRouter (Meteor 1.3)

`meteor add accounts-password`
`meteor add studiointeract:react-accounts-ui`

```javascript

import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { Accounts } from 'meteor/studiointeract:react-accounts';
import React from 'react';

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL',
  onSubmitHook(error, state) {
    console.log('onSubmitHook')
  },
  preSignUpHook(password, info) {
    console.log('preSignUpHook')
  },
  postSignUpHook(userId, info) {
    console.log('postSignUpHook')
  },
  onSignedInHook: () => redirect('/general'),
  onSignedOutHook: () => redirect('/')
});

FlowRouter.route("/login", {
  action(params) {
    mount(MainLayout, {
      content: <Accounts.ui.LoginForm />
    });
  }
});

```
