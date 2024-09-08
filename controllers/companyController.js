const axios = require('axios');
const cheerio = require('cheerio');
const Company = require('../models/Company');

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Function to capture screenshot
const captureScreenshot = async (url, companyId) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Define the relative path for saving the screenshot
    const screenshotFileName = `${companyId}.png`;  // Just the file name
    const screenshotPath = path.join(__dirname, '..', 'public', 'screenshots', screenshotFileName);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    // Return the relative path for storing in the database
    return `/screenshots/${screenshotFileName}`;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
};

const scrapeWebsite = async (req, res) => {
  try {
    const { url } = req.body;

    // Validate the URL
    if (!url || !/^https?:\/\/.+\..+/.test(url)) {
      return res.status(400).json({ message: 'Invalid URL provided' });
    }

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/58.0.3029.110 Safari/537.3'
      }
    });
    const $ = cheerio.load(data);

    const name = $('meta[property="og:site_name"]').attr('content') || $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || 'No description available';
    const logo = $('meta[property="og:image"]').attr('content') || '';

    const facebookUrl = $('a[href*="facebook.com"]').attr('href') || '';
    const linkedinUrl = $('a[href*="linkedin.com"]').attr('href') || '';
    const twitterUrl = $('a[href*="twitter.com"]').attr('href') || '';
    const instagramUrl = $('a[href*="instagram.com"]').attr('href') || '';

    let email = '';
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const bodyText = $('body').text();
    const emailMatch = bodyText.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      email = emailMatch[0];
    }

    let phoneNumber = '';
    const phoneRegex = /(\+?\d{1,3}[-.\s]?(\(?\d{1,4}\)?)[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
    const phoneMatch = bodyText.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      phoneNumber = phoneMatch[0];
    }

    let address = '';
    const addressSelectors = ['address', '[itemprop="address"]', '[class*="address"]', '[id*="address"]'];
    for (const selector of addressSelectors) {
      const addr = $(selector).text().trim();
      if (addr) {
        address = addr;
        break;
      }
    }

    const company = new Company({
      url,
      name,
      description,
      logo,
      facebookUrl,
      linkedinUrl,
      twitterUrl,
      instagramUrl,
      address,
      phoneNumber,
      email,
    });

    const savedCompany = await company.save();

    // Capture the screenshot and save the relative URL
    const screenshotPath = await captureScreenshot(url, savedCompany._id);

    // Update the company record with the relative screenshot path
    savedCompany.screenshot = screenshotPath;
    await savedCompany.save();

    res.status(201).json({ message: 'Company data and screenshot saved successfully', company: savedCompany });
  } catch (error) {
    console.error('Error scraping the website:', error);
    res.status(500).json({ message: 'Error scraping the website', error: error.message });
  }
};

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company', error });
  }
};

// Delete companies by ID
const deleteCompanies = async (req, res) => {
  try {
    const { ids } = req.body;
    await Company.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Companies deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting companies', error });
  }
};

module.exports = { scrapeWebsite, getAllCompanies, getCompanyById, deleteCompanies };
