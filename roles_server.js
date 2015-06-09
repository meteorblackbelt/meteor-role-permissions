if (Meteor.isServer) {
  if (!Meteor.roles) {
    Meteor.roles = new Meteor.Collection("roles")
    Meteor.roles._ensureIndex( 'name', { unique: 1 } )
  }

  Meteor.publish(null, function () {
    return Meteor.users.find( { _id: this.userId }, { fields: { roles: 1 } });
  })

  Meteor.publish(null, function (){
    var user = Meteor.users.findOne( { _id: this.userId }, { fields: { roles: 1 } });

    if (user) {
      return Meteor.roles.find({ name: { $in: user.roles || [] } });
    }
  })
}
