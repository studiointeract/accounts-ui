import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class Button extends React.Component {
  handleClick(evt) {
    let { onClick, href } = this.props;
    if (!href) {
      evt.preventDefault();
      onClick(evt);
    }
  }

  render () {
    const { label, href = null, type, disabled = false, className } = this.props;
    return type == 'link' ? (
      <a href={ href } className={ className } onClick={ this.handleClick.bind(this) }>{ label }</a>
    ) : (
      <button className={ className }
              type={type} 
              disabled={ disabled }
              onClick={ this.handleClick.bind(this) }>{ label }</button>
    );
  }
}
Button.propTypes = {
  onClick: React.PropTypes.func
};

Accounts.ui.Button = Button;
