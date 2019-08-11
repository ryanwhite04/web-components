require('console.table');
var notes = require('./decks/alphabet').notes;
var state = require('./state');

state = state.length === notes.length ? state : Array(notes.length).fill(0);

let convert = (n, i = 0) => n < 0.5 ? i : n < 1 ? convert(2 * n - 1, i + 1) : 0;

function getBox(score) {
  var progress = score.toString(2);
  var correct = score.toString(2).split('1').length - 1;
  var incorrect = score.toString(2).split('0').length - 2;
  var net = correct - incorrect;
  var box = correct > incorrect ? net : 0;
  return box;
}

function choose(state) {
  var random = Math.random();
  
  // return Math.floor(state.length * random); // stupid approach
  var boxNumber = convert(random);
  var boxes = state.map(getBox);
  var box = boxes.findIndex(box =>box === boxNumber);
  var starts = boxes.findIndex(box => !box);
  
  console.log({ random, boxNumber, box, starts })
  return box > -1 ? box : starts
}

function answer(state, index, right) {
  console.log({ index, right });
  state[index] = (right ? state[index] + 1 : state[index]) / 2;
}

answer(state, choose(state), Math.random() > (parseFloat(process.argv[2]) || 0.5));

require('fs').writeFileSync('state.json', JSON.stringify(state, null, 2));

console.table(['score', 'progress', 'guesses', 'correct', 'incorrect', 'net', 'box'], state.map(score => {
  var progress = score.toString(2);
  var guesses = progress.length;
  var correct = score.toString(2).split('1').length - 1;
  var incorrect = score.toString(2).split('0').length - 2;
  var net = correct - incorrect;
  var box = correct > incorrect ? net : 0;
  return [
    score,
    progress,
    guesses,
    correct,
    incorrect,
    net,
    box
  ]
}));