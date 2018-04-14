const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.addFav = (id, obj) => {
     User.findOne({'google.id' : id}, (err, user) => {
          if (err) {
               console.log(err);
          }
          if (user.favBooks) {
               user.favBooks.push(obj);
          }else {
               user.favBooks = [obj];
          }
          user.save((err) => {
               if (err) {
                    console.log(err);
               }
               console.log('added');
          })
     });
}

module.exports.removeFav = (id, index) => {
     User.findOne({'google.id' : id}, (err, user) => {
          if (err) {
               console.log(err);
          }
          user.favBooks.splice(index,1);
          user.save((err) => {
               if (err) {
                    console.log(err);
               }
               console.log('removed');
          })
     });
}
