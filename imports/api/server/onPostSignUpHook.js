try {
  Accounts.onCreateUser(function(options, user) {
    if (Accounts.ui._options.onPostSignUpHook) {
      let _user = Accounts.ui._options.onPostSignUpHook(options, user);
      return _user || user;
    }
    return user;
  });
} catch(e) {
  console.log('You\'ve implemented Accounts.onCreateUser elsewhere in your application, you can therefor not use Accounts.ui.config({ onPostSignUpHook }) on the server.');
}
