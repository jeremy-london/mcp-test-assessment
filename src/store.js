// In-memory book catalog. Resets to the seed data with resetState().
const seed = () => [
  { id: 'b1', title: 'Dune', author: 'Frank Herbert', year: 1965 },
  { id: 'b2', title: 'Neuromancer', author: 'William Gibson', year: 1984 },
  { id: 'b3', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', year: 1969 },
  { id: 'b4', title: 'Foundation', author: 'Isaac Asimov', year: 1951 },
  { id: 'b5', title: 'Snow Crash', author: 'Neal Stephenson', year: 1992 },
  { id: 'b6', title: 'Hyperion', author: 'Dan Simmons', year: 1989 },
];

let rows = seed();
let nextNumericId = 7;

const copy = (book) => ({ ...book });

export const store = {
  all: () => rows.map(copy),
  get: (id) => {
    const book = rows.find((b) => b.id === id);
    return book ? copy(book) : undefined;
  },
  insert: (data) => {
    const book = { id: `b${nextNumericId++}`, ...data };
    rows.push(book);
    return copy(book);
  },
  replace: (id, record) => {
    rows = rows.map((b) => (b.id === id ? record : b));
    return copy(record);
  },
  remove: (id) => {
    const before = rows.length;
    rows = rows.filter((b) => b.id !== id);
    return rows.length < before;
  },
  reset: () => {
    rows = seed();
    nextNumericId = 7;
  },
};
