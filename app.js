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

app.post('/add',  (req, res) => {
    console.log('Received a form submission');
    console.log(req);
    console.log('url-->' + process.env.DATABASE_URL);
    var conn = new jsforce.Connection({
        loginUrl: process.env.DATABASE_URL
    });
    var username = process.env.USER_NAME;
    console.log('username-->' + username);
    var password = process.env.USER_PASSWORD + process.env.SF_TOKEN;
    console.log('password-->' + password);
    conn.login(username, password, function (err, userInfo) {
        if (err) { return console.error(err); }
        // Now you can get the access token and instance URL information.
        // Save them to establish a connection next time.
        console.log(conn.accessToken);
        console.log(conn.instanceUrl);
        // logged in user property
        console.log("User ID: " + userInfo.id);
        console.log("Org ID: " + userInfo.organizationId);
        fs.readFile('./webflow.html', (error, html) => {
            if (error) {
                res.status(500).send('Internal Server Error');
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(html);
            }
        });
       // res.send('heySalesforce : JSForce Connect Successed!');
    });
});

const crypto = require('crypto');

function base64UrlEscape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
app.post('/oauthconn',  (req, res) => {
    console.log('Received a form submission');
    console.log(req);
    console.log('url-->' + process.env.DATABASE_URL);
    const codeVerifier = base64UrlEscape(crypto.randomBytes(32).toString('base64'));
    const codeChallenge = base64UrlEscape(crypto.createHash('sha256').update(codeVerifier).digest('base64'));
    console.log('codeVerifier--->'+codeVerifier);
    console.log('codeChallenge--->'+codeChallenge);
    const oauth2 = new jsforce.OAuth2({
        clientId: process.env.CONSUMER_KEY,
        clientSecret: process.env.CONSUMER_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
    console.log('Authorization URL: ' + oauth2.getAuthorizationUrl({}));
    res.redirect(oauth2.getAuthorizationUrl({}));
    //res.send('heySalesforce : JSForce Connect Successed!');
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});