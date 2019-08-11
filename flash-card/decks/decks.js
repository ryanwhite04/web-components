export default [
  {
    title: "Times Tables",
    notes: [
      {
        value: [],
        links: [],
      }
    ],
    views: [
      ``
    ]
  },
  {
    title: "French",
    names: [
      "English",
      "French"
    ],
    views: [
      {
      }
    ],
    notes: [
      ["Hello", "Bonjour"],
      ["French", "Francais"]
    ]
  },
  {
    title: "Chinese",
    views: [
      {
        react: null,
        links: ([links]) => {
          
        },
        solution: `{{note.2}}`,
      },
      {
        question: `{{note.1}}`,
        solution: `{{note.2}}`,
      },
      {
        question: `{{note.1}}`,
        solution: `{{note.2}}`,
      },
    ],
    names: ["Chinese", "Pinyin", "English"],
    notes: [
      ["中文", "zhong1wen2", "Chinese"],
      ["英文", "ying1wen2", "English"],
      ["拼音", "pin1yin1", "Pinyin"]
    ]
  }
];

let card = decks.map(process);

function process({
  title,
  names,
  views,
  notes,
}) {
  let cards =
}