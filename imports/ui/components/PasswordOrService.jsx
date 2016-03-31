import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import { T9n } from 'meteor/softwarerero:accounts-t9n';

export class PasswordOrService extends React.Component {
  render () {
    let {
      oauthServices = {},
      className,
      style = {}
    } = this.props;
    let labels = Object.keys(oauthServices).map(service => oauthServices[service].label);
    if (labels.length > 2) {
      labels = [];
    }

    if (labels.length) {
      return (
        <div style={ style } className={ className }>
          { `${T9n.get('or use')} ${ labels.join(' / ') }` }
        </div>
      );
    }
    return null;
  }
}

Accounts.ui.PasswordOrService = PasswordOrService;
