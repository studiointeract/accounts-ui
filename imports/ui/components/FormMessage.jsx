import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class FormMessage extends React.Component {
  render () {
    let { message, className = "message" } = this.props;
    return message ? (
      <div className={ className }>{ message }</div>
    ) : null;
  }
}

Accounts.ui.FormMessage = FormMessage;
