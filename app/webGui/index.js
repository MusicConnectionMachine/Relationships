const express         = require('express');
const app             = express();
const algorithms      = require('../algorithms');

module.exports = function(websiteCount) {
  const started = Date.now();

  let requestStatus = function (req, res, next) {
    req.status = algorithms.status();
    next();
  };

  app.use(requestStatus);

  app.get('/', function (req, res) {
    let responseText = 'Current Status:<br>Time: ' + ((Date.now() - started) / 1000) + 's<br>';
    responseText += '<table>';
    responseText += '<tr><td>AlgorithmLocation</td><td>status</td><td>(failed requests)</td><td>/ total requests</td></tr>';

    for (let location in req.status) {
      responseText += '<tr><td>' + location + '</td><td>' + req.status[location].count + '</td><td> (' + req.status[location].error + ')</td><td>/ ' + websiteCount + '</td></tr>';
    }
    responseText += '</table>';
    // auto reload every 5 seconds
    responseText += '<script type="text/javascript">setTimeout(function () { location.reload(); }, 5000); </script>';
    res.send(responseText)
  });

  app.listen(3210);
  console.log('You can view the status in your browser on 127.0.0.1:3210');
};

