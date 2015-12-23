var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var http = require('http');
var sd = require('./student_dynamo.js');

var port = process.env.PORT || 9000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
    next();
});

router.route('/')
  .get(function(req, res) {
    res.send({'status': "All systems go!"});
  })
  .post(function(req, res) {
    sd.createTable(function(response) {
      res.send({message: response});
    });
  })

router.route('/student/:ssn')
  .get(function(req, res) {
    var ssn = parseInt(req.params.ssn);
    console.log(ssn);
    sd.getStudentForSsn(ssn, function(data) {
      if (!err) {
        var result = data.Items[0];
        console.log(result);
        res.send(result);
      }
      else {
        console.log(err);
      }
    });
  })

router.route('/student')
  .post(function(req,res) {
    
    var ssn = parseInt(req.body.ssn);
    var fname = req.body.fname;
    var lname = req.body.lname;
    var school = req.body.school;
    sd.addStudent(ssn, fname, lname, school, function(err,response) {
        if (!err) {
          res.json({message: "New student added"})
      }
    });
  })




// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on 9000');
