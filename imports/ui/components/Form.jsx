import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Accounts } from 'meteor/accounts-base';

import './Fields.jsx';
import './Buttons.jsx';
import './FormMessage.jsx';
import './PasswordOrService.jsx';
import './SocialButtons.jsx';
import './FormMessages.jsx';

export class Form extends React.Component {
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
      translate,
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
        <Accounts.ui.PasswordOrService oauthServices={ oauthServices } translate={ translate } />
        <Accounts.ui.SocialButtons oauthServices={ oauthServices } />
        <Accounts.ui.FormMessages messages={messages} />
      </form>
    );
  }
}

Form.propTypes = {
  oauthServices: PropTypes.object,
  fields: PropTypes.object.isRequired,
  buttons: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
  error: PropTypes.string,
  ready: PropTypes.bool
};

Accounts.ui.Form = Form;
