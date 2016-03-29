import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class FormMessage extends React.Component {
  render () {
    let { message } = this.props;
    return message ? (
      <div className="message">{ message }</div>
    ) : null;
  }
}

Accounts.ui.FormMessage = FormMessage;
