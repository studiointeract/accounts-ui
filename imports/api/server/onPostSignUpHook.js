Accounts.onCreateUser(function(options, user) {
  if (Accounts.ui._options.onPostSignUpHook) {
    return Accounts.ui._options.onPostSignUpHook(options, user);
  }
  return user;
});
