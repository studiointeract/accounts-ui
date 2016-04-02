Accounts.onCreateUser(function(options, user) {
  if (Accounts.ui._options.onPostSignUpHook) {
    let _user = Accounts.ui._options.onPostSignUpHook(options, user);
    return _user || user;
  }
  return user;
});
