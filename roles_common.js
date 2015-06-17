if (!Meteor.roles) Meteor.roles = new Meteor.Collection("roles");

if ('undefined' === typeof Roles) Roles = {};
if ('undefined' === typeof Roles._permission_checks) Roles._permission_checks = {};

_.extend(Roles, {
  _flatten: function (ary) {
    return [].concat.apply([], [ ary ]);
  },

  createRoles: function (roles) {
    if (!roles) return;
    roles = Roles._flatten(roles);

    return _.map( roles, function(role) {
      role = role.trim();
      return Meteor.roles.upsert({ name: role }, { $set: { name: role } });
    });
  },

  flushRoles: function () {
    Meteor.roles.remove({});
  },

  deleteRoles: function (roles) {
    if (!roles) return;
    roles = Roles._flatten(roles);

    Meteor.roles.remove({ name: { $in: roles } });
    Meteor.users.update({ roles: { $in: roles } }, { $pullAll: { roles: roles } }, { multi: true } );
  },

  addPermissionsToRoles: function (permissions, roles) {
    permissions = Roles._flatten(permissions);
    roles = Roles._flatten(roles);

    Meteor.roles.update({ name: { $in: roles } }, { $addToSet: { permissions: { $each: permissions } } }, { multi: true } );
  },

  addPermissionCheck: function (permission, check) {
    Roles._permission_checks[permission] = check;
  },

  removePermissionsFromRoles: function (permissions, roles) {
    permissions = Roles._flatten(permissions);
    roles = Roles._flatten(roles);

    Meteor.roles.update({ name: { $in: roles } }, { $pullAll: { permissions: permissions } }, { multi: true } );
  },

  addUsersToRoles: function (userIds, roles) {
    userIds = Roles._flatten(userIds);
    roles = Roles._flatten(roles);

    Meteor.users.update({ _id: { $in: userIds } }, { $addToSet: { roles: { $each: roles } } }, { multi: true } );
  },

  removeUsersFromRoles: function (userIds, roles) {
    userIds = Roles._flatten(userIds);
    roles = Roles._flatten(roles);

    Meteor.users.update({ _id: { $in: userIds } }, { $pullAll: { roles: roles } }, { multi: true } );
  },

  usersExistInRoles: function (roles) {
    roles = Roles._flatten(roles);

    var user = Meteor.users.findOne({ roles: { $in: roles } });

    return user ? true : false;
  },

  userIs: function (roles, userId) {
    if (!roles) return true;
    roles = Roles._flatten(roles);

    var user = Meteor.users.findOne( {
      _id: userId,
      roles: {
        $in: roles
      }
    }, {
      fields: { roles: 1 }
    });

    return user ? true : false;
  },

  userCan: function () {
    var args = Array.prototype.slice.call(arguments);
    var permissions = args.shift();
    var userId = args[0];

    if (!permissions) return true;
    permissions = Roles._flatten(permissions);

    var user = Meteor.users.findOne( {
      _id: userId
    }, {
      fields: { roles: 1 }
    });

    if (user) {
      var roles = Meteor.roles.find({ name: { $in: user.roles }, permissions: { $in: permissions } }).fetch();
      var myPermissions = _.intersection(_.uniq(_.flatten(_.pluck(roles, 'permissions'))), permissions);

      return _.any(myPermissions, function(permission){ return Roles._permission_checks[permission] ? Roles._permission_checks[permission](args) : true });
    }

    return false;
  }
});

permissionDenied = function (router) {
  var permissions = router.route.options.permissions || Router.options.permissions;
  var hasPermission = Roles.userCan(permissions, Meteor.userId());
  return !hasPermission;
}

roleDenied = function (router) {
  var roles = router.route.options.roles || Router.options.roles;
  var hasRole = Roles.userIs(roles, Meteor.userId());
  return !hasRole;
}

isAuthorized = function () {
  var router = this;
  if (!Meteor.loggingIn()) {
    if ( permissionDenied(router) || roleDenied(router)) {
      router.render('errors.accessDenied');
    }
    else {
      router.next();
    }
  }
  else {
    router.next();
  }
}

Router.onBeforeAction(isAuthorized)
