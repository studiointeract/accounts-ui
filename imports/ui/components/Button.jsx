import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import PropTypes from 'prop-types'

let Link;
try { Link = require('react-router').Link; } catch(e) {}

export class Button extends React.Component {
  propTypes: {
    onClick: React.PropTypes.func
  }

  render () {
    const {
      label,
      href = null,
      type,
      disabled = false,
      className,
      onClick
    } = this.props;
    if (type == 'link') {
      // Support React Router.
      if (Link && href) {
        return <Link to={ href } className={ className }>{ label }</Link>;
      } else {
        return <a href={ href } className={ className } onClick={ onClick }>{ label }</a>;
      }
    }
    return <button className={ className }
                   type={ type } 
                   disabled={ disabled }
                   onClick={ onClick }>{ label }</button>;
  }
}

Accounts.ui.Button = Button;
