const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const Books = require('../models/books.js');
const UserModel = require('../models/users.js');
const bcrypt = require('bcrypt');

//only registered users can login
regd_users.post("/login", async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  try {
    // Retrieve the user document based on the username
    const user = await UserModel.findOne({ username });

    if (!user) {
      // User not found
      return { success: false, message: 'Invalid username or password' };
    }

    // Compare the hashed password with the provided password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Passwords match, login successful
      let accessToken = jwt.sign({
              data: password
            }, 'access', { expiresIn: 60 * 60 });
            req.session.authorization = {
              accessToken,username
          }

      res.cookie('accessToken', accessToken, { maxAge: 3600000, httpOnly: true });

      return res.json({ success: true, message: 'Login successful' ,username:username });
    } else {
      // Passwords do not match
      return res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.json({ success: false, message: 'An error occurred during login' });
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
  let uName = req.session.authorization.username;
  let review = req.body.review; 
  let bookNo = req.params.isbn;
  const newReview = {
    reviewer: uName,
    comment: review
  };
  
  try {
    const updatedBook = await Books.findOneAndUpdate(
      { bookno: bookNo },
      { $push: { 'reviews.0': newReview }},
      { new: true }
    );
    if (updatedBook) {
      console.log('Updated book:', updatedBook);
      return res.send(updatedBook);
    } else {
      console.log('Book not found');
      return res.send("book not found");
    }
  } catch (error) {
    
    console.error('Error updating book:', error);
    return res.send("error updating book");
  }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    let uName = req.session.authorization.username;
    let bookNo = req.params.isbn;
    try {
      const updatedBook = await Books.findOneAndUpdate(
        { bookno: bookNo },
        { $pull: { reviews: { reviewer: uName } } },
        { new: true }
      );
      if (updatedBook) {
        console.log('Updated book:', updatedBook);
        return res.send(updatedBook);
      } else {
        console.log('Book not found');
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
});

//Logout
regd_users.post('/logout', (req, res) => {
  try {
    res.clearCookie('jwt');

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);

    res.status(500).json({ message: 'An error occurred during logout' });
  }
});

module.exports.authenticated = regd_users;
