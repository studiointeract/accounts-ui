import { Meteor } from 'meteor/meteor';

Meteor.publish('servicesList', function() {
  let startup = true;
  let cursor = Meteor.users.find({ _id: this.userId }, { fields: {
    "services": 1
  }});
  const publishServices = (user) => {
    let services = {};
    Object.keys(user.services || []).forEach(service => services[service] = {});
    this.changed('users', this.userId, { services: services });
    this.ready();
  };
  cursor.observe({
    changed(user)  {
      publishServices(user);
    },
    removed(user) {
      this.stop();
    }
  });

  // Publish initial.
  let user = (cursor.fetch() || [])[0];
  if (user && user.services) {
    publishServices(user);
  }
  startup = false;
  return;
});
