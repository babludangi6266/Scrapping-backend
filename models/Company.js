
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  description: String,
  logo: String,
  facebookUrl: String,
  linkedinUrl: String,
  twitterUrl: String,
  instagramUrl: String,
  address: String,
  phoneNumber: String,
  email: String,
  url: String,
  screenshot: String, 
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
