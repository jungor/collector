var Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})]
});
var Libraries = new Mongo.Collection("libraries");

Images.allow({
    download: function() {
        return true;
    },
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

Libraries.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return true;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    },
    fetch: []
});


// Codes run on client
if (Meteor.isClient) {

    // Subscribe data
    Meteor.subscribe("userData");
    Meteor.subscribe("images");
    Meteor.subscribe("libraries");

    // Template render
    Template.library.rendered = function() {
        $('.ui.accordion').accordion();
    }

    Template.libraryform.rendered = function() {
        $('.ui.accordion').accordion();
    }
    // Template helpers
    Template.body.helpers({
        libraries: function(){
            return Libraries.find({});
        },
        isAdmin: function(){
            console.log(Meteor.user().username.match(/Admin/));
            return Meteor.user().username.match(/Admin/);
        }
    });

    
    // Template events
    Template.sampleform.events({
        'click .upload.button': function(event, template) {
            var groupname = this.name;
            var libname = this.lib;
            var groupindex = parseInt(groupname[groupname.length-1])-1;
            var path = 'groups.'+groupindex+'.samples'
            var file = template.$('input[name=photo]').get(0).files[0];
            var fileObj = Images.insert(file);
            Meteor.call('uploadImage', libname, groupindex, fileObj, function (error, result) {
                //to do
            });
        }
    });

    Template.libraryform.events({
        'click .add.button': function(event, template) {
            var libname = template.$('input[name=libname]').val();
            Libraries.insert({
                name: libname,
                groups:[{name: 'group1', lib: libname, samples: []}, {name: 'group2', lib: libname, samples: []}, {name: 'group3', lib: libname, samples: []}]
            });
            template.$('input[name=libname]').val('');
        }
    });
    
    Template.body.events({
    });


    // Account configuration
    Accounts.ui.config({
        requestPermissions: {
            github: ['user', 'repo']
        },
        requestOfflineToken: {
            google: true
        },
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
    });

    Meteor.startup(function () {
        // to do
    });
}


// Methods insure security
Meteor.methods({
    'uploadImage': function(libname, groupindex, fileObj){
        console.log(fileObj, libname, groupindex);
        if (groupindex === 0) {
                Libraries.update({name: libname}, {$push: {'groups.0.samples': fileObj}});
        }
        else if (groupindex === 1) {
            Libraries.update({name: libname}, {$push: {'groups.1.samples': fileObj}});
        }
        else if (groupindex === 2) {
            Libraries.update({name: libname}, {$push: {'groups.2.samples': fileObj}});
        }
    }
});




// Codes run on server 
if (Meteor.isServer) {
    // Accounts.onCreateUser(function(options, user) {
    // if (options.profile)
    //   user.profile = options.profile;
    // return user;
    // });
    // Publish data
    Meteor.publish("userData", function () {
        if (this.userId) {
            return Meteor.users.find({},{fields: {'username': 1, 'profile': 1}});
        } else {
            this.ready();
        }
    });
    Meteor.publish('images', function () {
        return Images.find({});
    });
    Meteor.publish('libraries', function () {
        return Libraries.find({});
    });
    // Listen to incoming HTTP requests, can only be used on the server
    // WebApp.connectHandlers.use("/upload", function(req, res, next) {
    //   if (req.method === 'POST') {
    //     res.writeHead(200);
    //     res.end("Hello world post: " + EJSON.stringify(req));
    //     // res.redirect("/");
    //   }
    // });
}
