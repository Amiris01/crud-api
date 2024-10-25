const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const budgetRoutes = require('./routes/budgets');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Use the product routes
app.use('/api', budgetRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});