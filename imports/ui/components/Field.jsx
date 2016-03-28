import React from 'react';
import ReactDOM from 'react-dom';
import { Accounts } from 'meteor/accounts-base';

export class Field extends React.Component {
  componentDidMount() {
    // Trigger an onChange on inital load, to support browser prefilled values.
    const { onChange } = this.props;
    let node = ReactDOM.findDOMNode(this);
    let value = node.getElementsByTagName('input')[0].value;
    // Match the data format of a typical onChange event.
    onChange({ target: { value: value } });
  }

  render() {
    const { id, hint, label, type = 'text', onChange } = this.props;
    return (
      <div className="field">
        <label htmlFor={ id }>{ label }</label>
        <input id={ id } type={ type } onChange={ onChange } placeholder={ hint } />
      </div>
    );
  }
}
Field.propTypes = {
  onChange: React.PropTypes.func
};

Accounts.ui.Field = Field;
