
export default function parse(text, lines = text.split('\n')) {

  
  return lines

    // Include Row
    .map((string, row) => ({ string, row }))

    // Remove non-instrument strings
    .filter(({ string }) => /^(\|?[-\w]*)\s?(\|[-\w]*\s{0,2})\s*#?/.test(string))

    // ProcessLine
    .reduce((reduced, { string, row }, i, strings) => {
      let siblings = [];
      if (i && reduced[0].siblings.includes(row)) {
        siblings = reduced[0].siblings;
      } else {
        let nextRow = row;
        let nextString = i;
        do {
          siblings.push(nextRow)
          nextRow++;
          nextString++;
        } while (strings[nextString] && (nextRow === strings[nextString].row))
      }

      console.log('blablabla', {
        reduced,
        string,
        row,
        i,
        strings
      });
      let instrument = getInstrument(string);
      let open = getOpen(string);
      let ordinal = siblings.indexOf(row);
      let previousRow;
      let previousLine = reduced
        .filter(line => line.siblings.length === siblings.length)
        .filter(line => instrument === line.instrument)
        [siblings.length - 1]

      if (previousLine) {
          previousLine.nextRow = row;
          previousRow = previousLine.row;
          instrument = instrument || previousLine.instrument;
          open = open || previousLine.open;
      }

      reduced.unshift({
        ordinal,
        string,
        row,
        siblings,
        instrument,
        open,
        previousRow,
        i,
      })
      return reduced
    }, [])

    .map(processLine(lines))

    .reduce((unreduced, { row, ...string }) => {
      unreduced[row] = string;
      return unreduced;
    }, new Array(lines.length).fill(false))

}

export function processLine(lines) {
  return ({
    row,
    open,
    string,
    nextRow,
    siblings,
    instrument,
    previousRow,
  }, i, rows) => {

  return {
    row,
    open,
    string,
    nextRow,
    siblings,
    instrument,
    previousRow,
    columns: [...new Array(string.length).keys()].map(column => ({
      next: (function() {
        const next = string.slice(column, column + 4);
        var type = 'play'
        var position = [row, column + 1];
        var further = true;
        var pause = false;
        var play = false;

        // If it's At the beginning of a measure, need to skip stuff
        // For instance |--2--3-----4--2--|, would skip first | and first 2 hyphens
        if (/^\|[-a-z]{1,3}/.test(next) || (!column && /^[-a-z]{1,3}/.test(next))) {
          position = [row, column + getSkips(siblings, lines, column)]
          type = 'start measure'
        // } else if (/\|L\d\d/.test(next)) {
          // position = [parseInt(next.slice(2)), 0]
        }

        // If 1 or 2 || followed by white space, it's the end of the measures for that lined
        // if there is a next row, jump to the beginning of it, otherwise end the song
        // TODO add possibly repeat functionality (jumping back to the beginning of the song)
        else if (/^\|\|?\s*$/.test(next)) {
          if (nextRow) {
            // const topRow = editor.renderer.getScrollTopRow();
            // editor.renderer.scrollToRow(topRow + (nextRow - row))
            position = [nextRow, 0]
            type = 'end row'
          } else {
            pause = true;
            type = 'end song'
          }
        } 

        // If it's a command block
        // These are a new line, or |, followed by a letter, up to two [a-zA-Z# ] and a |
        else if (!column && /\w[\w\d# ]{0,2}\|/.test(string.slice(column, column + 5))) {
          if (string[column] == '|') {
            position = [row, column + next.split('|')[0].length]
            type = 'command:start of row'
          } else {
            position = [row, column + next.split('|')[1].length]
          }
        }
        else if (column && /\|\w[\w\d# ]{0,2}\|/.test(string.slice(column, column + 5))) {
          position = [row, column + next.split('|')[1].length + 1]
          type = 'command';
        }
        else {
          // const jump = Math.max(...something)
          // jump && editor.navigateRight(jump)
          play = {
            note: getNote(string, column),
            // duration: getDuration(string, column),
          }
          further = false;
        }
        return {
          play,
          position,
          further,
          pause,
          type,
        }
      })(),
      prev: (function() {
        const next = string.slice(Math.max(0, column - 4), column);
        var position = [row, column - 1];
        var play = false;
        var further = true;
        var pause = false;
        var type = 'play';
        if (/^\|[-a-z]{1,3}/.test(next) || (!column && /^[-a-z]{1,3}/.test(next))) {
          position = [row, column - getSkips(siblings, lines, column, true)]
          type = 'start measure';
        // } else if (/\|L\d\d/.test(next)) {
          // position = [parseInt(next.slice(2)), 0]
        }
        else if (column === 0) {
          if (previousRow) {
            let previousLine = lines[previousRow]
            position = [previousRow, previousLine.length - previousLine.split('').reverse().indexOf('|') - 1]
            type = 'start of row';
          } else {
            pause = true;
            further = false;
            type = 'beginning of song'
          }
        // } else if (!column && /\|?[A-Ga-g]?#?\d?\|/.test(next)) {
        //   position = [row, column + next.split('|')[0].length]
        }
         // If it's a command block
        // These are a new line, or |, followed by a letter, up to two [a-zA-Z# ] and a |
        else if (string[column] === '|' && /^\|?\w[\w\d# ]{0,2}$/.test(next)) {
          let jump = next.split('').reverse().join('').split('|')[0].length;
          position = [row, column - jump]
          type = 'command';
        }
        else {
          // const jump = Math.max(...something)
          // jump && editor.navigateRight(jump)
          further = false;
          play = {
            note: getNote(string, column, true),
            // duration: getDuration(string, column, true)
          }
        }
        const same = (position.row === row) && (position.column === column)
        further = further && (!same) && (position[0] > 0) && (position[0] > 0)
        return {
          play,
          position,
          further,
          pause,
          type,
        }
      })(),
    })),
  }
}}

export function getSkips(siblings, lines, column, backwards) {
  return Math.min(...siblings.map(row => {
    const line = lines[row];
    const points = backwards ? [column - 4, column] : [column, column + 4]
    const sliced = line.slice(...points)
    const prefixed = sliced[0] === '|' ? sliced : '|' + sliced;
    const matched = prefixed.match(/\|([-a-z*]*)/)
    const first = matched[0]
    return first.length
  }), 4)
}

export function getJumps(lines, siblings, column) {
  return Math.max(...siblings.map(row => {
    const line = lines[row];
    const sliced = line.slice(column)
    const split = sliced.split(/[-a-z*]/)
    const first = split[0]
    return first.length
  }))
}

export function getDuration(string, column, backwards = false) {
  if (backwards) {
    let following = string.slice(0, column + 1).split('').reverse().join('')
    let duration = following.split(/[^-a-z]/)[1].length + 1;
    return /[A-Z\d]/.test(following[duration]) && duration
  } else {
    let following = string.slice(column)
    let duration = following.split(/[^-a-z]/)[1].length + 1;
    return /[A-Z\d]/.test(following[duration]) && duration
  }
}

export function getOpen(string) {
  const trimmed = string.trim()
  const prefixed = '|' + trimmed;
  const commands = prefixed.match(/(?:\||\n)([a-gA-G]\d?\s?(\#|\s)?)(?:\|)/g);
  var note;
  if (commands && commands.length) {
    let command = commands[commands.length - 1]
    let a = command.slice(1, -1)
    note = a.match(/([a-gA-G])(\d)?(\#)?/).slice(1);
  } else {
    return false;
  }

  // ({
  //     'e': '|E6 ',
  //     'B': '|B5 ',
  //     'G': '|G5 ',
  //     'D': '|D5 ',
  //     'A': '|A4 ',
  //     'E': '|E4 ',
  //     'F': '|F5 ',
  // }[key])

  const [key, octave, sharp] = note

  const it = `${key}${sharp ? sharp : ''}`;

  const open =  ([
    'C', 'C#',
    'D', 'D#',
    'E',
    'F', 'F#',
    'G', 'G#',
    'A', 'A#',
    'B'
  ].indexOf(it) + 12 * octave) - 21;
  return open;
}

// get the name of the instrument on that string
export function getInstrument(string) {
  console.log('getInstrument', {
    string,
  })
  const instrument = string.match(/(?:^|\|)I(\d\d?)/)
  return instrument ? parseInt(instrument[1]) : 0;
}

export function getNote(string, column, backwards = false) {
  const char = string[backwards ? (column - 1) : column]
  const note = /[\dA-Z]/.test(char) && parseInt(char, 36);
  return Number.isInteger(note) ? note : false;
}

// get the positions of all the bars
export function getIndexes(string) {
  return string.split('|').slice(0, -1).map(s => s.length).join('|')
}
