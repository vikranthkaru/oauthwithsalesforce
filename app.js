var express = require('express');
var http = require('http');
var jsforce = require('jsforce');
var fs = require('fs');
//const PORT = process.env.PORT ||5000; s
var app = express();
app.set('port', process.env.PORT || 3001);
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    fs.readFile('./app.html', (error, html) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(html);
        }
    });
})


const crypto = require('crypto');

function base64UrlEscape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}


app.post('/oauthconn',  (req, res) => {
    const codeVerifier = base64UrlEscape(crypto.randomBytes(32).toString('base64'));
    const codeChallenge = base64UrlEscape(crypto.createHash('sha256').update(codeVerifier).digest('base64'));
    const oauth2 = new jsforce.OAuth2({
        clientId: process.env.CONSUMER_KEY,
        clientSecret: process.env.CONSUMER_SECRET,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirectUri: process.env.REDIRECT_URI,
    });
    //const authorizationUrl = oauth2.getAuthorizationUrl({}) + `&code_challenge=${encodeURIComponent(codeChallenge)}`;
    const fetchAccessToken = new jsforce.Connection({ oauth2: oauth2 });
    fetchAccessToken.authorize(req.query.code, function(err, userInfo){
        if (err) {
            return console.error(err);
          }
          console.log(conn.accessToken, conn.instanceUrl); 
    });
    // res.redirect(authorizationUrl);
    //res.send('heySalesforce : JSForce Connect Successed!');
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});