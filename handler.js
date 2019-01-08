const MamClient = require('./app/client.js') 
const csv = require("fast-csv");
const fs = require('fs')
const results = []
const AWS = require('aws-sdk')

AWS.config.update({ region: 'eu-central-1' })
AWS.config.apiVersions = {
  ssm: '2014-11-06',
  // other service API versions
};

let ssm = new AWS.SSM();
found = false
// exports.patientMeasure = async (event, _context, callback) => {
//    console.log("starting..")
//    return await init()
// }
init()

function init(){
  return new Promise((resolve, reject) => {
    csv
    .fromPath("dataset_clean.csv")
    .on("data", function(data){
      results.push(data)
    })
    .on("end", function(){
      console.log("done");
      console.log(results)
      main().then(function(value) {
        console.log(value);
        resolve(value)
        // expected output: "Success!"
      })
    })
  })
}


async function main(){
  parameterCounterFull = await asyncGetParam()
  parameterCounter = parseInt(parameterCounterFull.Parameter.Value)
  console.log("Counter: " + JSON.stringify(parameterCounter))
  for(let zac = parameterCounter + 1; zac < results.length; zac++){
    date = new Date(parseInt(results[zac][6])*1000)
    datenow = new Date()
    
    console.log(datenow.getTime())
    console.log(date.getTime())
    console.log(datenow.getTime() > date.getTime())
    if(results[zac][0] !== '' && results[zac][5] === '0' && found === false && datenow.getTime() > date.getTime()){
      
      found = true
      console.log("Attaching..")
      root = await tangle(results[zac][0], {
        "FirstName": "Patient",
        "LastName": "Zero",
        "Sex": "male",
        "Weight": "95",
        "Height": "196",
        "Age": "36",
        "Timestamp": date.toISOString(),
        "systolicBP": results[zac][1],
        "diastolicBP": results[zac][2],
        "HeartRate": results[zac][3],
        "Comment": results[zac][4]
      })
      console.log(root)
      await asyncSetParam('' + zac)
      Console.log("Parameter changed to: " + zac)
      return root;
    }
  }
  return "No change"
}

function asyncGetParam(){
  return new Promise((resolve, reject) => {
    var params = {
      Name: 'patient_counter', /* required */
    };
    ssm.getParameter(params, function(err, data) {
      if (err) reject(err); // an error occurred
      else     resolve(data);           // successful response
    })
  })
}

function asyncSetParam(param){
  return new Promise((resolve, reject) => {
    console.log('Set Parameter to: ' + param)
    var params = {
      Name: 'patient_counter', /* required */
      Type: "String", /* required */
      Value: param, /* required */
      Overwrite: true
    };
    ssm.putParameter(params, function(err, data) {
      if (err) {
        console.log(err)
        reject(err); // an error occurred
      }
      else{
        console.log(data)
        resolve(data);   
      }        // successful response
    });
  })
}


async function tangle(counter, data) {
  console.log("attaching...")
  console.log(data)
    let client = new MamClient('https://nodes.thetangle.org:443', "QFSXAACAT9SEOINAOLPFIWACPXJZSNIFQLBDRSMPFVZOSS9IEOFHVCVXYSRKAEFHPVIGSTNQWKWRRHTCF")
    // INIT the index to store the data and delete it afterwards.
    try {
      return root = await client.send(JSON.stringify(data), parseInt(counter))
    } catch (err) {
      console.log(err)
    }
}