const https = require("https");
const user = require('./user');


let bookName = undefined;
let bookslist = undefined;
let listpage = 1;

module.exports = (app, passport) =>{

     // normal routes ===============================================================


     app.get('/', (req, res) => {
          bookName= undefined;
          bookslist = undefined;
          res.render('index.ejs', {
               user: req.user
          });
     });


     app.get('/books', isLoggedIn, (req, res) => {
          res.render('books.ejs', {
               user : req.user,
               books : bookslist,
               page : listpage
          });
     });

     app.get('/preview', isLoggedIn, (req, res) => {
          let i = parseInt(req.query.id);
          bookName = bookslist[i].volumeInfo.title;
          bookImage = bookslist[i].volumeInfo.imageLinks.thumbnail;
          res.render('preview.ejs', {
               book: bookslist[i],
               index: i
          });
     });


     app.get('/logout', (req, res) => {
          req.logout();
          res.redirect('/');
     });

     // send to google to do the authentication
     app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

     // the callback after google has authenticated the user
     app.get('/auth/google/callback',
     passport.authenticate('google', {
          successRedirect : '/books',
          failureRedirect : '/'
     }));

     // send to google to do the authentication
     app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

     // the callback after google has authorized the user
     app.get('/connect/google/callback',
     passport.authorize('google', {
          successRedirect : '/books',
          failureRedirect : '/'
     }));


     //============================================ form route====================
     let fetchBookList = (page, res) => { // Function to fetch book by name query
          let index = page * 9;
          const url = "https://www.googleapis.com/books/v1/volumes?q=";
          let getData = () => {
               return new Promise((resolve, reject) => {
                    https.get(url+bookName+'&maxResults=9&startIndex='+index, res => {
                         res.setEncoding("utf8");
                         let body = "";
                         res.on("data", data => {
                              body += data;
                         });
                         res.on("end", () => {
                              resolve(JSON.parse(body));
                         });
                    });
               })
          }

          let dataCall = getData();
          dataCall.then((result) => {
               bookslist =  result.items;
               res.redirect('/books');
          })
     }

     let fetchSingleBook = (id, res) => { // function to fetch book by id
          const url = 'https://www.googleapis.com/books/v1/volumes/';
          let getData = () => {
               return new Promise((resolve, reject) => {
                    https.get(url+id, res => {
                         res.setEncoding("utf8");
                         let body = "";
                         res.on("data", data => {
                              body += data;
                         });
                         res.on("end", () => {
                              resolve(JSON.parse(body));
                         });
                    });
               })
          }

          let dataCall = getData();
          dataCall.then((result) => {
               bookslist = [];
               bookslist.push(result);
               res.redirect('/preview?id=0');
          })
     }

     app.post('/searchBooks', (req, res) => {
          bookName = req.body.name;
          listpage = 1;

          fetchBookList(1, res);
     })

     app.get('/nextPage', (req, res) => {
          listpage = listpage + 1;
          fetchBookList(listpage, res);
     })

     app.get('/previousPage', (req, res) => {
          listpage = listpage - 1;
          fetchBookList(listpage, res);
     })

     app.get('/addFav', (req, res) => {
          let i = parseInt(req.query.id);
          let obj = {
               link: bookslist[i].id,
               title: bookslist[i].volumeInfo.title,
               imageLink: bookslist[i].volumeInfo.imageLinks.thumbnail
          }
          if (req.user.favBooks) {
               req.user.favBooks.push(obj);
          }else {
               req.user.favBooks = [obj];
          };
          user.addFav(req.user.google.id, obj);
          res.redirect('/preview?id='+i);
     })

     app.get('/removeFav', (req, res) => {
          let i = parseInt(req.query.id);
          req.user.favBooks.splice(i, 1);
          user.removeFav(req.user.google.id, i);
          res.redirect('/');
     });

     app.get('/openFav', (req, res) => {
          let i = parseInt(req.query.id);
          let bookid = req.user.favBooks[i].link;
          fetchSingleBook(bookid, res);
     })



};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
     if (req.isAuthenticated())
     return next();

     res.redirect('/');
}
