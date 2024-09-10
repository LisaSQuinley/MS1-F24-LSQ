/*
  Exercise 2
  JavaScript quirks and tricks
*/

var schoolName = "Parsons";
var schoolYear = 1936;

// Task
// What is the value of test3? false
var test1;
if (1 == true) { // == is a loose equality, (type conversion) so num can be compared to boolean
  test1 = true;
} else {
  test1 = false;
}
// test1 is true here

var test2;
if (1 === true) { // === is a strict equality, (no type conversion) so num cannot be compared to boolean
  test2 = true;
} else {
  test2 = false;
}
// test2 is false here

var test3 = test1 === test2;
// var test3 is false because test1 and test2 are not equal

// Task
// Change this code so test4 is false and test5 is true. Use console.log() to confirm your code works.

var test4 = 1 === "1"; // could also do var test4 = 0 == "1" for false
var test5 = 1 == "1"; // and could also do var test5 = 1 == "1" for true

console.log("test4 is", test4, "and test 5 is", test5);

// Task
// What are the values of p, q, and r? Research what is going on here.
var w = 0.1;
var x = 0.2;
var y = 0.4;
var z = 0.5;

var p = w + x;
// console.log(p) is 0.30000000000000004 has to do with a floating point precision error

var q = z - x;
// console.log(q) is 0.3 

var r = y - w;
// console.log(r) is 0.30000000000000004 has to do with a floating point precision error