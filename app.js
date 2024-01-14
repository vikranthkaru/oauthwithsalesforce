var express = require('express');
var http = require('http');
var jsforce = require('jsforce');
var fs = require('fs');
//const PORT = process.env.PORT ||5000;
var app = express();
app.set('port', process.env.PORT || 3001);

fs.readFile('./app.html', function(error,html)
{
    if(error) throw error;
    http.createServer(function(request,response)
    {
        response.writeHeader(200,{"Content-Type":"text/html"});
        response.write(html);
        response.end();
    }).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    })
});
app.get('/', (req, res) => { 
    res.send('A simple Node App is '
        + 'running on this server') 
    res.end() 
}) 

app.post('/add',function(req,res)
{
    console.log('url-->'+process.env.DATABASE_URL);
    var conn = new jsforce.Connection({
         loginUrl : process.env.DATABASE_URL
    });
    var username = process.env.USER_NAME;
    console.log('username-->'+username);
    var password = process.env.USER_PASSWORD+process.env.SF_TOKEN;
    console.log('password-->'+password);
    conn.login(username, password, function (err, userInfo) {
        if (err) { return console.error(err); }
        // Now you can get the access token and instance URL information.
        // Save them to establish a connection next time.
        console.log(conn.accessToken);
        console.log(conn.instanceUrl);
        // logged in user property
        console.log("User ID: " + userInfo.id);
        console.log("Org ID: " + userInfo.organizationId);
        res.send('heySalesforce : JSForce Connect Successed!');
    });
});
// app.get('/', function (req, res) {

// });