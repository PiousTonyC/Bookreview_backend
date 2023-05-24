const express = require('express');
const public_users = express.Router();
const Books = require('../models/books.js')
const UserModel = require('../models/users.js');

//Register users
public_users.post("/register",async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    const newUser = {
      username,
      password
    };
    const newuser = await UserModel.create(newUser);
    if (newuser){
      return res.json({ success: true, message: 'User created. Login to continue' });
    }
    else{
      return res.json({ success: false, message: 'User not created' });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    return res.json({ success: false, message: 'An error occurred during user registration' });
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const allBooks = await Books.find().lean();
  if(!allBooks){
  return res.send('No books found')
}
  return res.send(allBooks)
});

//Add new Book
public_users.post('/addbooks', async function (req, res) {
  const bookno = req.body.bookno;
  const author = req.body.author;
  const title = req.body.title;

  const duplicate = await Books.findOne({bookno}).lean().exec()
  if(duplicate){
    return res.send('Duplicate book number !!')
  }

  const bookObject = {bookno,author,title};
  
  const book = await Books.create(bookObject);
  if (book){
    res.send('user created');
  }
  else{
    return res.send('user not created');
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  let bookno = req.params.isbn;
  const book = await Books.findOne({bookno}).lean().exec()
  if(book){
    res.send(book)
  }
  else{
    res.send('No such book')
  }

 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  let author = req.params.author;
  const book = await Books.findOne({author}).lean().exec()
  if(book){
    res.send(book)
  }
  else{
    res.send('No such book')
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  let title = req.params.title;
  const book = await Books.findOne({title}).lean().exec()
  if(book){
    res.send(book)
  }
  else{
    res.send('No such book')
  }
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  let bookno = req.params.isbn;
  const book = await Books.findOne({bookno}).lean().exec()
  if(book){
    res.send(book.reviews)
  }
  else{
    res.send('No such book')
  }

});

module.exports.general = public_users;
