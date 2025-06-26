const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// ===========================
// Route: Register New User
// ===========================
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// ===========================
// Route: Get All Book List (using Axios)
// ===========================
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

// Route: Internal Book List
public_users.get('/internal/books', (req, res) => {
  res.json(books);
});

// ===========================
// Route: Get Book Details by ISBN (using Axios)
// ===========================
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/internal/book/isbn/${isbn}`);
    return res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error retrieving book details", error: error.message });
  }
});

// Route: Internal Book Details by ISBN
public_users.get('/internal/book/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const response = await axios.get(`http://localhost:5000/internal/book/author/${author}`);
    return res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "No books found for this author" });
    }
    return res.status(500).json({ message: "Error retrieving book(s) by author", error: error.message });
  }
});

public_users.get('/internal/book/author/:author', (req, res) => {
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

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get(`http://localhost:5000/internal/book/title/${title}`);
    return res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(500).json({ message: "Error retrieving book(s) by title", error: error.message });
  }
});

public_users.get('/internal/book/title/:title', (req, res) => {
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

// ===========================
// Route: Get Book Reviews
// ===========================
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.json(books[isbn].reviews || { message: "No reviews available for this book" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;