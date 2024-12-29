require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const TinyURL = require('tinyurl');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

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

app.use('/api/shorturl', (req, res, next) =>{
  let url_ = (req.body.url == null)? (`${req.protocol}://${req.get('host')}${req.originalUrl}`) : req.body.url;
  if (url_.indexOf('localhost') < 0){
    console.log('---------- dns lookup ------');
    dns.lookup(url_, {all: true}, (err, addresses)=>{
      if(err){
        res.json({'error': 'invalid url'})
      }
      else{
        next();
      }
    });  
  }
  else{
    next();
  }
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
        const shortenedUrlObj = url.parse(shortened, true);
        res.json({"original_url": longUrl, "short_url": shortenedUrlObj.path.substring(1,shortenedUrlObj.path.length)});
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

app.get("/api/shorturl/:short_url", (req, res)=>{
  console.log('--------resolving'+req.params.short_url);
  let tiny_url = `https://tinyurl.com/${req.params.short_url}`;
  TinyURL.resolve(tiny_url)
  .then((original)=> {
    console.log(`Original url ${original}`);
    res.redirect(original);
  })
  .catch((error)=> {
    console.error("Error", error);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
