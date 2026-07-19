const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_ID = process.env.BLOG_ID;
const API_KEY = process.env.API_KEY;
const { Pool } = require('pg');
const fetch = require('node-fetch');
const cors = require('cors'); 

// Render automatically handles the DATABASE_URL variable once configured
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render's secure connection
  }
});

// Quick connection test
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

module.exports = pool;

app.use(cors()); 

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Mock database (In-memory array)
let items = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Smartphone', price: 499 }
];

// GET: Retrieve all items
app.get('/api/items', (req, res) => {
    res.status(200).json(items);
});

// GET: Retrieve a single item by ID
app.get('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(i => i.id === id);
    
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
});

// POST: Create a new item
app.post('/api/items', (req, res) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const newItem = {
        id: items.length + 1,
        name: req.body.name,
        price: req.body.price
    };

    items.push(newItem);
    res.status(201).json(newItem);
});

// PUT: Update an existing item entirely
app.put('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    item.name = req.body.name || item.name;
    item.price = req.body.price || item.price;

    res.status(200).json(item);
});

// DELETE: Remove an item by ID
app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    items.splice(index, 1);
    res.status(200).json({ message: 'Item successfully deleted' });
});

// GET: Fetch blog posts from Blogger API
app.get('/api/posts', async (req, res) => {
    try {
        const url = `https://googleapis.com{BLOG_ID}/posts?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Send JSON data to the frontend
        res.json(data.items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running smoothly on http://localhost:${PORT}`);
});



