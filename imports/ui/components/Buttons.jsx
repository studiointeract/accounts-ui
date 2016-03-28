import React from 'react';
import './Button.jsx';
import { Accounts } from 'meteor/accounts-base';

export const Buttons = ({ buttons = {} }) => (
  <div className="buttons">
    {Object.keys(buttons).map((id, i) =>
      <Accounts.ui.Button {...buttons[id]} key={i} />
    )}
  </div>
);

Accounts.ui.Buttons = Buttons;
