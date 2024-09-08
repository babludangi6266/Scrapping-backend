// const express = require('express');
// const { scrapeWebsite, getAllCompanies, deleteCompanies } = require('../controllers/companyController');

// const router = express.Router();

// // POST route to scrape and save data
// router.post('/scrape', scrapeWebsite);

// // GET route to fetch all companies
// router.get('/', getAllCompanies);

// // DELETE route to delete companies by IDs
// router.delete('/delete', deleteCompanies);

// module.exports = router;
const express = require('express');
const { scrapeWebsite, getAllCompanies, getCompanyById, deleteCompanies } = require('../controllers/companyController');

const router = express.Router();

// POST route to scrape and save data
router.post('/scrape', scrapeWebsite);

// GET route to fetch all companies
router.get('/', getAllCompanies);

// GET route to fetch a single company by ID
router.get('/:id', getCompanyById);

// DELETE route to delete companies by IDs
router.post('/delete-batch', deleteCompanies);

module.exports = router;
