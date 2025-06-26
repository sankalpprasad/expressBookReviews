const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    //Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Both username and password are required" });
    }
  
    //Check if the username already exists
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // 3️⃣ Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn]) {
      return res.json(books[isbn]);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const results = [];
  
    for (let isbn in books) {
      if (books[isbn].author.toLowerCase() === author) {
        results.push({ isbn, ...books[isbn] });
      }
    }
  
    if (results.length > 0) {
      return res.json(results);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const results = [];
  
    for (let isbn in books) {
      if (books[isbn].title.toLowerCase() === title) {
        results.push({ isbn, ...books[isbn] });
      }
    }
  
    if (results.length > 0) {
      return res.json(results);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn]) {
      return res.json(books[isbn].reviews || { message: "No reviews available for this book" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });

module.exports.general = public_users;
