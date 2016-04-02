import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export class Button extends React.Component {
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
      return <a href={ href } className={ className } onClick={ onClick }>{ label }</a>;
    }
    return <button className={ className }
                   type={ type } 
                   disabled={ disabled }
                   onClick={ onClick }>{ label }</button>;
  }
}
Button.propTypes = {
  onClick: React.PropTypes.func
};

Accounts.ui.Button = Button;
