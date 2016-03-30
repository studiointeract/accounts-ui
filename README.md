# React Accounts UI for Meteor 1.3

Current version 1.0.8

## Features

1. **Easy to use**, mixing the ideas of useraccounts configuration and accounts-ui that everyone already knows and loves.
2. **Server Side Rendering** are supported, trough FlowRouter (SSR).
3. **Components** are everywhere, and extensible by replacing them on Accounts.ui.
4. **Basic routing** included.
5. **Unstyled** is the default, no CSS included.
6. **No password** sign up and sign in are included.
7. **[Extra fields](#extra-fields)** is now supported.

### Existing styles (Use these for a complete solution):

* [Basic](https://atmospherejs.com/studiointeract/react-accounts-ui-basic)

> Create your own styling, se section below on extending and styling.

## Installation

### Meteor 1.3

`meteor add studiointeract:react-accounts-ui`

> Configuration instructions coming shortly! In the meantime check the example below, and for full details about configuration options check in `./lib/accounts_ui.js`

### Meteor 1.2

> Not supported yet.

## Example setup using FlowRouter (Meteor 1.3)

`meteor add accounts-password`  
`meteor add studiointeract:react-accounts-ui`  
`meteor add kadira:flow-router-ssr`

```javascript

import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { Accounts } from 'meteor/studiointeract:react-accounts-ui';
import React from 'react';

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

## Styled versions

> Check back here later for a list of styled version i.e. bootstrap, semantic-ui.

**And to you who are a package author**, its easy to write extensions for `studiointeract:react-accounts-ui` by importing and export like the following example:

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
    "tracker-component": "^1.3.3"
  }
}

```

To install the dependencies added in package.json run:  
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
// Notice! Accounts.ui.LoginForm manages all state logic at the moment, so avoid
// overwriting this one, but have a look at it and learn how it works. And pull
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

Thx to the Folks at [Studio Interact](http://studiointeract.se)
