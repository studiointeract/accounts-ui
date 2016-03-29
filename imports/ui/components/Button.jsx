import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class Button extends React.Component {
  render () {
    const { label, type, disabled = false, onClick, className } = this.props;
    return type == 'link' ? (
      <a className={ className } onClick={ onClick }>{ label }</a>
    ) : (
      <button className={ className } type={type} disabled={ disabled }
        onClick={ onClick }>{ label }</button>
    );
  }
}
Button.propTypes = {
  onClick: React.PropTypes.func
};

Accounts.ui.Button = Button;
