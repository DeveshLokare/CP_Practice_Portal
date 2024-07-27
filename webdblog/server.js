const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Middleware to parse JSON request body
app.use(express.json());

// Define a route to fetch data from external API using Axios
app.get('/views/main', async (req, res) => {
  try {
    const response = await axios.get('"https://codeforces.com/api/{user.info}"');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});