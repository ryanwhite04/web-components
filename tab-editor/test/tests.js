export default [

{
  file: 'Tabscii/1',
  tests: [
    {
      position: { row: 12, column: 11 },
      getOpen: 38,
      getNote: 39
    },
    {
      position: { row: 13, column: 11 },
      getFirstSibling: 11,
      getLastSibling: 16,
      getPreviousSiblings: [11, 12],
      getLine: 'G4 |-------0-------|-------0-------|',
      getOpen: 34,
      getNote: 34
    },
    {
      position: { row: 14, column: 11 },
      getOpen: 29,
      getNote: false
    },
    {
      position: { row: 25, column: 0 },
      getLine: undefined,
    },
    {
      position: { row: 21, column: 0 },
      getFirstSibling: 19,
      getLastSibling: 24,
    },
    {
      position: { row: 13 },
      getNextRow: 21,
    },
    {
      position: { row: 21 },
      getPreviousRow: 13,
    }
  ]
},

{
  ignore: true,
  file: 'Guitar Pro/All of them Witches',
  tests: [
    {
      position: { row: 31, column: 0 },
      getFirstSibling: 31,
      getStartingRows: [0, 1, 2, 3, 4, 5],
    }
  ]
},

{
  ignore: true,
  file: 'Guitar Pro/Anatole',
  tests: [ {
    position: { row: 10, column: 10 },
    getFirstSibling: 9,
  }, {
    position: { row: 20, column: 10 },
    getFirstSibling: 20,
  }]
},

{
  ignore: true,
  file: 'Tabscii/The Judge',
  tests: [
    {
      position: { row: 16 },
      getFirstSibling: 14,
      isInstrumentString: true,
    },
    {
      position: { row: 11 },
      isInstrumentString: false,
    }
  ]
}

]