import React from 'react';
import ReactDOM from 'react-dom';
import { Accounts } from 'meteor/accounts-base';
import PropTypes from 'prop-types'

import './Fields.jsx';
import './Buttons.jsx';
import './FormMessage.jsx';
import './PasswordOrService.jsx';
import './SocialButtons.jsx';
import './FormMessages.jsx';

export class Form extends React.Component {
  propTypes: {
    oauthServices: React.PropTypes.object,
    fields: React.PropTypes.object.isRequired,
    buttons: React.PropTypes.object.isRequired,
    error: React.PropTypes.string,
    ready: React.PropTypes.bool
  };

  componentDidMount() {
    let form = this.form;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    }
  }

  render() {
    const {
      hasPasswordService,
      oauthServices,
      fields,
      buttons,
      error,
      messages,
      ready = true,
      className
    } = this.props;
    return (
      <form
        ref={(ref) => this.form = ref}
        className={[className, ready ? "ready" : null].join(' ')}
        className="accounts-ui"
        noValidate
      >
        <Accounts.ui.Fields fields={ fields } />
        <Accounts.ui.Buttons buttons={ buttons } />
        <Accounts.ui.PasswordOrService oauthServices={ oauthServices } />
        <Accounts.ui.SocialButtons oauthServices={ oauthServices } />
        <Accounts.ui.FormMessages messages={messages} />
      </form>
    );
  }
}

Accounts.ui.Form = Form;
