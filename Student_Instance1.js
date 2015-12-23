var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var http = require('http');
var sd = require('./student_dynamo.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 16386;        // set our port


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

router.use(function(req, res, next) {
  next(); // make sure we go to the next routes and don't stop here
});

router.route('/')
  .get(function(req, res) {
    res.send({'status': "All systems go!"});
  })
  .post(function(req, res) {
    sd.createTable(function(response) {
      res.send({message: response});
    });
  });

router.route('/student/:ssn')
  .get(function(req, res) {
      var ssn = parseInt(req.params.ssn);
      sd.getStudentForSsn(ssn, function(err,data) {
        if (!err) {
          var result = data.Items[0];
          console.log(result);
          res.json({ "Student Details" : result});
        }
        else {
          console.log(err);
          res.json({message:err});
        }
      });
  })

  .put(function(req, res) {
    var ssn = parseInt(req.params.ssn);
    updateFields = req.body;
    sd.updateStudent(ssn, updateFields, function(err,data) {
      if (!err) {
        res.json({message: "Updated Student Details"});
      }
      else {
        console.log(JSON.stringify(err, null, 2));
        res.json({error: err});
      }
    });
  })

  .delete(function(req, res) {
    var ssn = parseInt(req.params.ssn);
    console.log(ssn);
    sd.deleteStudent(ssn, function (err, data) {
      if (!err) {
        res.json({message: "Student Deleted"});
      }
      else {
        res.json({message: "Student could not be deleted"});
      }
    });
  });

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
        else {
          res.json({message:err});
        }
    });
  });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on ' + port);
