import React from 'react';
import {Accounts} from 'meteor/accounts-base';
import './Fields.jsx';
import './Buttons.jsx';
import './FormMessage.jsx';

export class Form extends React.Component {
  render() {
    const { fields, buttons, error, message, ready = true, className } = this.props;
    return (
      <form className={[className, ready ? "ready" : null].join(' ')}
        onSubmit={ evt => evt.preventDefault() } className="accounts-ui">
        <Accounts.ui.Fields fields={ fields } />
        <Accounts.ui.Buttons buttons={ buttons } />
        <Accounts.ui.FormMessage message={ message } />
      </form>
    );
  }
}
Form.propTypes = {
  fields: React.PropTypes.object.isRequired,
  buttons: React.PropTypes.object.isRequired,
  error: React.PropTypes.string,
  ready: React.PropTypes.bool
};

Accounts.ui.Form = Form;
