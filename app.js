var express = require('express');
var http = require('http');
var jsforce = require('jsforce');
var fs = require('fs');
var ejs = require('ejs'); 
var app = express();
app.set('port', process.env.PORT || 3001);
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
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

const codeVerifier = base64UrlEscape(crypto.randomBytes(32).toString('base64'));
const codeChallenge = base64UrlEscape(crypto.createHash('sha256').update(codeVerifier).digest('base64'));
var instantceURL;
var accessToken;
app.get('/oauthcallback', function (req, res) {
    const oauth2 = new jsforce.OAuth2({
        clientId: process.env.CONSUMER_KEY,
        clientSecret: process.env.CONSUMER_SECRET,
        redirectUri: process.env.REDIRECT_URI
    });
    console.log('codeVerifier-->'+codeVerifier);
    const conn = new jsforce.Connection({ oauth2: oauth2 });
    conn.authorize(req.query.code, { code_verifier: codeVerifier }, function (err, userInfo) {
        if (err) {
            return console.error(err);
        }
        instantceURL = conn.instanceUrl;
        accessToken = conn.accessToken;
        const conn2 = new jsforce.Connection({
            instanceUrl : conn.instanceUrl,
            accessToken : conn.accessToken
        });
        conn2.identity(function(err, sfUserInfo) {
            if (err) { return console.error(err); }
            const data = {
                userName: sfUserInfo.username,
                displayname: sfUserInfo.display_name
            };
            const response = res;
            console.log("user ID: " + res.user_id);
            console.log("organization ID: " + res.organization_id);
            console.log("username: " + res.username);
            console.log("display name: " + res.display_name);
            fs.readFile('./webflow.html', (error, html) => {
                if (error) {
                    res.status(500).send('Internal Server Error');
                } else {
                   // res.setHeader('Content-Type', 'text/html');
                    response.render('app.js', { data });
                   // res.status(200).send(html);
                }
            });
        });
    });
});

function makeCallout(accessToken) {
    // Example: Making a callout to the Salesforce REST API
    const apiUrl = 'https://your-salesforce-instance.salesforce.com/services/data/v52.0/sobjects/Account';
    axios.get(apiUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            console.log('API Response:', response.data);
            // Handle the response from the Salesforce API
        })
        .catch(error => {
            console.error('API Error:', error);
            // Handle errors
        });
}


app.post('/oauthconn', (req, res) => {
    const oauth2 = new jsforce.OAuth2({
        clientId: process.env.CONSUMER_KEY,
        clientSecret: process.env.CONSUMER_SECRET,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirectUri: process.env.REDIRECT_URI,
    });
    const authorizationUrl = oauth2.getAuthorizationUrl({}) + `&code_challenge=${encodeURIComponent(codeChallenge)}`;
    res.redirect(authorizationUrl);
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});