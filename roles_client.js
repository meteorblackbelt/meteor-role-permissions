if (Meteor.isClient) {
  if ('undefined' === typeof Roles) Roles = {};

  Roles._uiHelpers = {
    userCan: function (permission) {
      var userId = Meteor.userId();
      return Roles.userCan(permission, userId);
    },

    userIs: function (role) {
      var userId = Meteor.userId();
      return Roles.userIs(role, userId);
    }
  }

  _.each(Roles._uiHelpers, function (func, name) {
    UI.registerHelper(name, func) 
  })
}
