require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const TinyURL = require('tinyurl');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use('/', bodyParser.urlencoded({extended:false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl', (req, res, next) => {
  console.log(req.body);
  next();
}, (req, res) =>{
  let longUrl = req.body.url;
  console.log(`long url ${longUrl}`);
  TinyURL.shorten(longUrl)
    .then((shortened) => {
        console.log('Shortened URL:', shortened);
        res.json({"original_url": longUrl, "short_url": shortened});
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
