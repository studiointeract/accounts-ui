import { Accounts } from 'meteor/accounts-base';
import './imports/accounts_ui.js';
import './imports/login_session.js';
import { redirect } from './imports/helpers.js';
import './imports/api/server/loginWithoutPassword.js';

import './imports/ui/components/LoginForm.jsx';

export { Accounts, redirect };
export default Accounts;
