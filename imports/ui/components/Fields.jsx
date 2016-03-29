import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import './Field.jsx';

export class Fields extends React.Component {
  render () {
    let { fields = {} } = this.props;
    return (
      <div className="fields">
        {Object.keys(fields).map((id, i) =>
          <Accounts.ui.Field {...fields[id]} key={i} />
        )}
      </div>
    );
  }
}

Accounts.ui.Fields = Fields;
