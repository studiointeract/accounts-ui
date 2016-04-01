import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import { T9n } from 'meteor/softwarerero:accounts-t9n';
import { hasPasswordService } from '../../helpers.js';

export class PasswordOrService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPasswordService: hasPasswordService()
    };
  }

  render () {
    let {
      oauthServices = {},
      className,
      style = {}
    } = this.props;
    let { hasPasswordService } = this.state;
    let labels = Object.keys(oauthServices).map(service => oauthServices[service].label);
    if (labels.length > 2) {
      labels = [];
    }

    if (hasPasswordService && Object.keys(oauthServices).length > 0) {
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
