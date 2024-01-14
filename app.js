var http = require('http');
var fs = require('fs');

// Port Number
const PORT = process.env.PORT ||5000;

fs.readFile('./app.html', function(error,html)
{
    if(error) throw error;
    http.createServer(function(request,response)
    {
        response.writeHeader(200,{"Content-Type":"text/html"});
        response.write(html);
        response.end();
    }).listen(PORT)
});
const express = require("express");
const app = express();
app.get('/', (req, res) => { 
    res.send('A simple Node App is '
        + 'running on this server') 
    res.end() 
}) 
 
 
// Server Setup
app.listen(PORT,console.log(
  `Server started on port ${PORT}`));