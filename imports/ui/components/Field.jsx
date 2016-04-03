import React from 'react';
import ReactDOM from 'react-dom';
import { Accounts } from 'meteor/accounts-base';

export class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mount: true
    };
  }

  componentDidMount() {
    // Trigger an onChange on inital load, to support browser prefilled values.
    const { onChange } = this.props;
    let node = ReactDOM.findDOMNode(this);
    if (node) {
      let value = node.getElementsByTagName('input')[0].value;
      // Match the data format of a typical onChange event.
      onChange({ target: { value: value } });
    }
  }

  componentDidUpdate(prevProps) {
    // Re-mount component so that we don't expose browser prefilled passwords if the component was
    // a password before and now something else.
    if (prevProps.type !== this.props.type) {
      this.setState({mount: false});
    }
    else if (!this.state.mount) {
      this.setState({mount: true});
    }
  }

  render() {
    const {
      id,
      hint,
      label,
      type = 'text',
      onChange,
      required = false,
      className = "field",
      defaultValue = ""
    } = this.props;
    const { mount = true } = this.state;
    if (type == 'notice') {
      return <div className={ className }>{ label }</div>;
    }
    return mount ? (
      <div className={ className }>
        <label htmlFor={ id }>{ label }</label>
        <input id={ id } 
               type={ type }
               onChange={ onChange }
               placeholder={ hint }
               defaultValue={ defaultValue } />
      </div>
    ) : null;
  }
}
Field.propTypes = {
  onChange: React.PropTypes.func
};

Accounts.ui.Field = Field;
