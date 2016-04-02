import { Meteor } from 'meteor/meteor';

Meteor.publish('servicesList', function() {
  let startup = true;
  let cursor = Meteor.users.find({ _id: this.userId }, { fields: {
    "services": 1
  }});
  const publishServices = (user) => {
    let services = {};
    Object.keys(user.services || []).forEach(service => {
      if (!_.contains(['resume', 'email'], service)) {
        services[service] = {}
      }
    });
    this.added('users', this.userId, { services: services });
    this.ready();
  };
  cursor.observe({
    changed(user) {
      !startup && publishServices(user);
    },
    removed(userId) {
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
