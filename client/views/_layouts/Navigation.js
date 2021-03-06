Template.Navigation.onRendered(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

Template.Navigation.helpers({
  currentConnection() {
    return CurrentSession.connection;
  },
  currentDatabase() {
    return CurrentSession.database;
  },
  currentCollection() {
    return CurrentSession.collection;
  },
  connections() {
    return Connections.find({}, {sort: {name: 1}});
  },
  databases() {
    var connection = CurrentSession.connection;
    return Databases.find({connection_id: connection._id}, {sort: {name: 1}});
  },
  collections() {
    var database = CurrentSession.database;
    return Collections.find({database_id: database._id}, {sort: {name: 1}});
  }
});

Template.Navigation.events({
  'click .add-collection'(e, i) {
    e.preventDefault();
    let name = prompt("Collection name:");

    if (name != null) {
      Meteor.call('createCollection', CurrentSession.database._id, name, (error, result) => {
        if(error) {
          log(error);
          sAlert.warning('error');
        } else {
          CurrentSession.mountedCollections[result] = new Mongo.Collection(name);
          sAlert.success('Collection created');
        }
      });
    }

  },
  'submit #quick-search': function (event, templateInstance) {
    event.preventDefault();
    let searchString = $('#quick-search input').val();
    if (!resemblesId(searchString)) {
      sAlert.warning('Not an ID.');
      return false;
    }
    Session.set('showLoader', true);
    Meteor.call('findCollectionForDocumentId', CurrentSession.database._id, searchString, (error, result) => {
      if (result === null) {
        sAlert.warning('Document not found.');
        Session.set('showLoader', false);
      }
      let c = Collections.findOne({database_id: CurrentSession.database._id, name: result});
      if (c) {
        const data = {
          collection: c.name,
          database: c.database().name,
          connection: c.database().connection().slug
        };
        CurrentSession.documentsFilter = searchString;

        goTo(FlowRouter.path('Documents', data));
      }
    });
  }
});
