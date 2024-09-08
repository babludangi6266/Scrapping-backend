
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const companyRoutes = require('./routes/companyRoutes');
require('dotenv').config(); // Make sure dotenv is imported

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Routes
app.use('/api/companies', companyRoutes);

app.use('/screenshots', express.static(path.join(__dirname, 'public', 'screenshots')));
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
