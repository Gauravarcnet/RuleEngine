// the main entry point for the node app
var express = require("express");
var app = express();

var ejs = require('ejs');
var path = require("path");
var url = require('url');
var bodyParser = require("body-parser");
var { Engine } = require("json-rules-engine");

let d = require('date-and-time');
let date = new Date();
app.use(bodyParser.urlencoded({ extended: true }));

let engine = new Engine();
// default rules are 2 so we will start the counters from 2
var i = 2;
// maintain a dictionary of all the rules which we can refer later
// for editing/updating the rules dynamically
var dict = {};

let Rule = require('json-rules-engine').Rule    // define a rule for user activity
app.set('view engine', 'ejs');      //Setting View Engine
app.use(express.static(__dirname + '/public'));       //Store all HTML/ejs/css files in view folder.

// Functions Definitions

function addingNewRule(operatorVal, Admvalue, AdmMesg,time) {     //function for adding Rule

  let rule = new Rule({
    conditions: {
      any: [{
        all: [{
          fact: 'userMessage',
          operator: 'equal',
          value: Admvalue
        },
        {
          fact: 'userTime',
          operator: operatorVal,
          value: time

        }
      ]
      }]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'Business Rule',
      params: {
        message: AdmMesg
      }
    }
  });
  engine.addRule(rule);
  i++;
  dict['' + i] = rule;
}

function updateRule(operatorVal, Admvalue, AdmMesg, id,time) {   // function for Update Rule
  let rule = new Rule({
    conditions: {
      any: [{
        all: [{
          fact: 'userMessage',
          operator: 'equal',
          value: Admvalue
        },
        {
          fact: 'userTime',
          operator: operatorVal,
          value: time

        }
      ]
      }]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'Business Rule',
      params: {
        message: AdmMesg
      }
    }
  });

  // remove the existing rule first.
  engine.removeRule(dict['' + id]);
  // now add the updated rule
  engine.addRule(rule);
  // update the reference in our dictionary structure
  dict['' + id] = rule;
}

function createDefaultRules(dict) {
    // lets predefine some rules
  let rule = new Rule({
    conditions: {
      any: [{
        all: [{
          fact: 'userMessage',
          operator: 'equal',
          value: "Good Morning"
        },{
          fact: 'userTime',
          operator: 'greaterThanInclusive',
          value: 24

        }
      ]
      }]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'Business Rule',
      params: {
        message: 'Great day it is'
      }
    }
  });
  engine.addRule(rule);
  dict['1'] = rule;

  rule = new Rule({
    conditions: {
      any: [{
        all: [{
          fact: 'userMessage',
          operator: 'equal',
          value: "good"
        },
        {
          fact: 'userTime',
          operator: 'lessThanInclusive',
          value: 24

        }]
      }]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'Business Rule',
      params: {
        message: 'hold session and wait'
      }
    }
  });

  engine.addRule(rule);
  dict['2'] = rule;
}

// create the default rules
createDefaultRules(dict);

// Routes definition

// User input screen route
app.get('/', function (req, res) {
  // find and render user.html from public
  res.render('user');
});

app.post('/', function (req, res) {
  let facts = {
    userMessage: req.body.message,
    userTime: date.getHours()
  };

  // Run the engine to evaluate
  engine
    .run(facts)
    .then(events => {
      // check if any event was triggered or not.
      // if not, then redirect to user page
      if (events == undefined || events.length == 0) {
        res.render('user');
      }
      // run() returns events with truthy conditions
      events.map(event => res.send(event.params.message))
    })

});

// Viewing All Existing Rules page i.e admin page
app.get('/admin', function (req, res) {
  //console.log(dict);
  
  res.render('admin', { data: dict });
});

// New Rules page
app.get('/rule', function (req, res) {
  res.render('rule');
});

// REST API for posting new rule in our rules engine
app.post('/addNew', function (req, res) {
  // calling function
   addingNewRule(req.body.country, req.body.Uvalue, req.body.Umessage,req.body.Utime);
   res.redirect('/admin')
});

// edit view page
app.get('/editRule', function (req, res) {
  let val = req.query.id;
  res.render('edit', { data: dict[parseInt(val)], key: val });

});

// REST API for updating/editing an existing Rule
app.post('/editRule', function (req, res) {
  
  //calling update function for Update Exixting Rule
  updateRule(req.body.country, req.body.Uvalue, req.body.Umessage, req.body.key,req.body.Utime);
  res.redirect('/admin')
});

app.listen(5000);
console.log("Running at Port 5000");
