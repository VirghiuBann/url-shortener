require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns').promises;

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
    const urlValid = await validateUrl(url);    
    const urlObj = { original_url: urlValid.origin, short_url: urlShortMemo.length + 1 }
    urlShortMemo.push(urlObj);
    res.json(urlObj);
  } catch (error) {
    res.json({ error: 'invalid url' });
  }

});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const urlObj = urlShortMemo.find((item) => item.short_url === shortUrl);

  if (!urlObj) {
    return res.json({ error: 'invalid url' });
  }
  res.redirect(urlObj.original_url);

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

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
