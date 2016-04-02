import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class FormMessage extends React.Component {
  render () {
    let { message, type, className = "message", style = {} } = this.props;
    return message ? (
      <div style={ style } 
           className={[ className, type ].join(' ')}>{ message }</div>
    ) : null;
  }
}

Accounts.ui.FormMessage = FormMessage;
