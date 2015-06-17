Package.describe({
  name: 'meteorblackbelt:role-permissions',
  summary: 'Role-based access control for Meteor',
  version: '0.0.2',
  documentation: null
});

Package.onUse(function(api) {
  api.use([ 'templating@1.0.0', 'blaze@2.0.0', 'underscore@1.0.3', 'iron:router@1.0.3' ])

  api.addFiles([
    'roles_common.js',
    'roles_client.js'
  ], 'client');
  api.addFiles([
    'roles_common.js',
    'roles_server.js'
  ], 'server');

  api.export && api.export('Roles');
});
