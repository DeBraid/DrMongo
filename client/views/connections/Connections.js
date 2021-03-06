Template.Connections.onCreated(function () {
});

Template.Connections.helpers({
  connections() {
    return Connections.find({}, {sort: {name: 1}});
  },
  connectLink() {
    let database = null;
    if (this.database) {
      database = this.defaultDatabase();
    }
    if (database) {
      return '/' + this.slug + '/' + database.name;
    } else {
      return '/' + this.slug;
    }
  }
});

Template.Connections.events({
  'click .add-connection': function (event, templateInstance) {
    event.preventDefault();
    var newId = Connections.insert({
      name: 'New Connection',
      host: 'localhost',
      port: '27017'
    });
    Session.set('EditConnectionModal', {
      connectionId: newId
    });
    $('#EditConnectionModal').modal('show');
  },

  'click .edit-connection': function (event, templateInstance) {
    event.preventDefault();
    Session.set('EditConnectionModal', {
      connectionId: this._id
    });
    $('#EditConnectionModal').modal('show');
  },

  'click .refresh-connection': function (event, templateInstance) {
    event.preventDefault();
    const connection = this;

    if (connection) {
      $('.refresh-connection i').addClass('fa-spin');
      Meteor.call('updateConnectionStructure', connection._id, function (error, result) {
        $('.refresh-connection i').removeClass('fa-spin');
        if (result === false) {
          sAlert.error('Connection failed.')
        }
      });
    }
  },

  'click .remove-connection': function (event, templateInstance) {
    event.preventDefault();
    Connections.remove(this._id)
  }
});
