import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class Button extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.href == nextProps.href;
  }

  render () {
    const { label, href = null, type, disabled = false, className, onClick } = this.props;
    return type == 'link' ? (
      <a href={ href } className={ className } onClick={ onClick }>{ label }</a>
    ) : (
      <button className={ className }
              type={type} 
              disabled={ disabled }
              onClick={ onClick }>{ label }</button>
    );
  }
}
Button.propTypes = {
  onClick: React.PropTypes.func
};

Accounts.ui.Button = Button;
