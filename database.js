var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');    // to add promises to the mongoose

mongoose.connect("mongodb://localhost/ReadmeDatabase");   // mongodb link of the particular database

mongoose.connection.on('connected', () => {           // log when the app is connected to the database
     console.log('Mongoose connected to mongodb://localhost/ReadMe');
});

mongoose.connection.on('error',(err) => {       // log when there is some error with the database driver
     console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {     // log when the app is disconnected form the databse
     console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {              // safe dissconnection from the database
     mongoose.connection.close(() => {
          console.log('Mongoose disconnected through app termination');
          process.exit(0);
     });
});
