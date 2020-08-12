var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var router = express.Router();

const path = require('path');
const dbPath = path.resolve(__dirname, '../db/sort-app.db');

//the following variables are used to record and store database steps into an object
var results = [];
var steps = 0;

/*This function swaps 2 items in an array*/
function swap(items, leftIndex, rightIndex){
    var temp = items[leftIndex];
    items[leftIndex] = items[rightIndex];
    items[rightIndex] = temp;

    steps++;
    var desc = "Swapped " + items[leftIndex] + " with " + items[rightIndex];
    results.push({step:steps, description: desc, array: items.toString(), left: leftIndex, right: rightIndex});
}

/*Used in quicksort. Define a 'middle' index in the array, and compare the values from the left and right index*/
function partition(items, left, right) {
    var pivot   = items[Math.floor((right + left) / 2)], //middle element
        i       = left, //left pointer
        j       = right; //right pointer
    while (i <= j) {
        while (items[i] < pivot) {
            i++;
        }
        while (items[j] > pivot) {
            j--;
        }
        if (i <= j) {
            swap(items, i, j); //sawpping two elements
            i++;
            j--;
        }
    }
    return i;
}

/*implements the quicksort algorithm*/
function quickSort(items, left, right) {
    var index;
    if (items.length > 1) {
        index = partition(items, left, right); //index returned from partition
        if (left < index - 1) { //more elements on the left side of the pivot
            quickSort(items, left, index - 1);
        }
        if (index < right) { //more elements on the right side of the pivot
            quickSort(items, index, right);
        }
    }
    return items;
}

/*This function records a request into the database, then inserts data from array*/
function register(array){
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let sqlRegister = `INSERT INTO requests(timestamp) VALUES (?)`;

  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  db.serialize(() => {
      db.run(sqlRegister, [date], err => {
        if (err) {
          console.error(err.message);
        }
        else{
          console.log('Registered request successfully.');
        }
      });

      db.all(`SELECT * FROM requests ORDER BY request_id DESC LIMIT 1`, (err, row) => {
        if (err) {
          console.error(err.message);
        }
        else{
          //get id of latest request and insert the data
          let request_id = row[0].request_id;
          insertRows(array, request_id);
        }
      });

  });

  //close the database
  db.close();
}

/*This function inserts rows of data into the database*/
function insertRows(array, id){

  let sqlInsert = `INSERT INTO sorting_steps(request_id, step_no, description, array) VALUES (?, ?, ?, ?)`;

  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  db.serialize(() => {
    array.forEach(function(item, i) {
      let arr = [];
      if (i == 0){
        arr = [id, item.step, "Sort started", item.array]
      }
      else{
        arr = [id, item.step, item.description, item.array]
      }
      db.run(sqlInsert, arr, err => {
        if (err) {
          console.error(err.message);
        }
        else{
          console.log('Row was inserted successfully.');
        }
      });
    });
  });

  //close the database
  db.close();
}

//validates a JSON object
function validate(obj){
  let sortType = obj.sortType;
  let text = obj.text;
  let array = text.split(",");
  let size = array.length;
  let valid = true;

  if(!text){
    valid = false;
  }

  if(size > 100){
    //console.log(size);
    valid = false;
  }

  //check word length
  array.forEach(function(value, i){
    if (sortType === "string" && value.length > 10){
      valid = false;
    }

    if (!value){
      valid = false;
    }

    if (sortType === "integer" && (parseInt(value, 10) > Number.MAX_SAFE_INTEGER || parseInt(value, 10) < Number.MIN_SAFE_INTEGER)){
      valid = false;
    }
  });

  return valid;
}

/*Handle the request and sort*/
router.post('/', function(req, res, next) {

  var items = req.body.text.split(",");
  items = items.map(item => item.trim())


  if (validate(req.body)){
    //sorted array is only used to hold result, can be used for more things if needed
    var sortedArray = [];
    results = [];
    steps = 0;

    results.push({step:0, description: "Original Array", array: items.toString()});

    if (req.body.sortType === 'integer'){
      items = items.map(num => parseInt(num, 10))
      sortedArray = quickSort(items, 0, items.length - 1);
    }
    else{
      // first call to quick sort
      items = items.map(item => item.toString().toLowerCase())
      sortedArray = quickSort(items, 0, items.length - 1);
    }

    //register sorting data into the database
    register(results);

    res.send(JSON.stringify(results));
  }
  else{
    console.log("Invalid request caught");
    res.status(500).send("Bad Request");
  }


});

module.exports = router;
