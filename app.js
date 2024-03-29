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
    const data = {
        displayButton: true,
        displayContext: false
    };
    res.render('pages/webserverflow', {data, activeTab: 'OAuth Web Flow'});
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
    const conn = new jsforce.Connection({ oauth2: oauth2 });
    conn.authorize(req.query.code, { code_verifier: codeVerifier }, function (err, userInfo) {
        if (err) {
            return console.error(err);
        }
        instantceURL = conn.instanceUrl;
        accessToken = conn.accessToken;
        const conn2 = new jsforce.Connection({
            instanceUrl: conn.instanceUrl,
            accessToken: conn.accessToken
        });
        const restApiEndpoint = `${conn.instanceUrl}/services/data/v53.0/query/?q=SELECT+Id,Name+FROM+Account`;
        conn2.request(restApiEndpoint, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
    
            // Process and send the account details to the client
            const account = result.records.map(account => {
                return {
                    id: account.Id,
                    name: account.Name
                };
            });
            const data = {
                accounts:account,
                displayButton: false,
                displayContext: true
            }
            const response = res;
            response.render('pages/webserverflow', { data ,  activeTab: 'OAuth Web Flow'});
        });
    });
});



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

app.get('/flow', (req, res) => {
    const flowName = req.query.flow;
    console.log('flowName-->'+flowName);
    const data = {
        accounts:[],
        displayButton: false,
        displayContext: true
    }
    view = (flowName == 'userAgentFlow' ? 'pages/userAgentFlow' : (flowName == 'jwtBearerFlow' ? 'pages/userAgentFlow' : 'pages/webserverflow'))
    if (flowName === 'userAgentFlow') {
        view = 'pages/userAgentFlow';
    } else if(flowName == 'jwtBearerFlow'){
        view = 'pages/jwtBearerFlow';
    }
    else
    {
        makeCallout(res);
        view = 'pages/webserverflow';

    }
    res.render(view, {data, activeTab: flowName });
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});



function makeCallout(res) {
    const oauth2 = new jsforce.OAuth2({
        clientId: process.env.CONSUMER_KEY,
        clientSecret: process.env.CONSUMER_SECRET,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirectUri: process.env.REDIRECT_URI,
    });
    const authorizationUrl = oauth2.getAuthorizationUrl({}) + `&code_challenge=${encodeURIComponent(codeChallenge)}`;
    res.redirect(authorizationUrl);
}