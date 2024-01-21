var express = require('express');
var http = require('http');
var jsforce = require('jsforce');
var fs = require('fs');
//const PORT = process.env.PORT ||5000; s
var app = express();
app.set('port', process.env.PORT || 3001);
app.use(express.urlencoded({ extended: true }));
// fs.readFile('./app.html', function(error,html)
// {
//     if(error) throw error;
//     http.createServer(function(request,response)
//     {
//         response.writeHeader(200,{"Content-Type":"text/html"});
//         response.write(html);
//         response.end();
//     }).listen(app.get('port'), function () {
//         console.log('Express server listening on port ' + app.get('port'));
//     })
// });
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
        fs.readFile('./app.html', (error, html) => {
            if (error) {
                res.status(500).send('Internal Server Error');
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(html);
            }
        });
       // res.send('heySalesforce : JSForce Connect Successed!');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
    });
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
});