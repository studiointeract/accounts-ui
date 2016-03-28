import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export const FormMessage = ({ message }) => message ? (
  <div className="message">{ message }</div>
) : null;

Accounts.ui.FormMessage = FormMessage;
