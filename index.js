require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns').promises;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UrlShort = require('./model/urlShort');
 
const urlShortMemo = [];

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url; 

  try {
    const urlCount = await UrlShort.countDocuments({});
    const urlValid = await validateUrl(url);    
    const urlObj = new UrlShort({ original_url: urlValid.origin, short_url: urlCount + 1 });
    await urlObj.save();
    
    res.json({original_url: urlObj.original_url, short_url: urlObj.short_url});
  } catch (error) {
    res.json({ error: 'invalid url' });
  }

});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  try {
    const urlObj = await UrlShort.find({short_url: shortUrl});
    res.redirect(urlObj.original_url);
    
  } catch (error) {
    return res.json({ error: 'invalid url' });
      }

});

// check if is valid url
const validateUrl = async(url) => {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  try {
    await dns.lookup(hostname);
    return { origin: urlObj.origin };
  } catch (error) {
    throw new Error(error.message);
  }
 
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
