import React from 'react';
import PropTypes from 'prop-types';
import { Accounts } from 'meteor/accounts-base';
import { T9n } from 'meteor/softwarerero:accounts-t9n';
import { hasPasswordService } from '../../helpers.js';

export class PasswordOrService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPasswordService: hasPasswordService(),
      services: Object.keys(props.oauthServices).map(service => {
        return props.oauthServices[service].label
      })
    };
  }

  translate(text) {
    if (this.props.translate) {
      return this.props.translate(text);
    }
    return T9n.get(text);
  }

  render () {
    let { className = "password-or-service", style = {} } = this.props;
    let { hasPasswordService, services } = this.state;
    labels = services;
    if (services.length > 2) {
      labels = [];
    }

    if (hasPasswordService && services.length > 0) {
      return (
        <div style={ style } className={ className }>
          { `${this.translate('orUse')} ${ labels.join(' / ') }` }
        </div>
      );
    }
    return null;
  }
}

PasswordOrService.propTypes = {
  oauthServices: PropTypes.object
};

Accounts.ui.PasswordOrService = PasswordOrService;
