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

  triggerUpdate() {
    // Trigger an onChange on inital load, to support browser prefilled values.
    const { onChange } = this.props;
    if (this.input) {
      onChange({ target: { value: this.input.value } });
    }
  }

  componentDidMount() {
    this.triggerUpdate();
  }

  componentDidUpdate(prevProps) {
    // Re-mount component so that we don't expose browser prefilled passwords if the component was
    // a password before and now something else.
    if (prevProps.formState !== this.props.formState) {
      this.setState({mount: false});
    }
    else if (!this.state.mount) {
      this.setState({mount: true});
      this.triggerUpdate();
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
               ref={ (ref) => this.input = ref }
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
