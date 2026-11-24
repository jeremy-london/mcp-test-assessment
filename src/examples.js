// Sample inputs shown in the web UI. Normal, valid cases only: use them as a starting
// point and write your own edge cases in the tests.
export const EXAMPLES = {
  echo: [
    { label: 'Hello', args: { message: 'hello' } },
    { label: 'Unicode', args: { message: 'café ✓ 日本語' } },
    { label: 'Empty string', args: { message: '' } },
  ],
  add_numbers: [
    { label: 'Small list', args: { numbers: [1, 2, 3] } },
    { label: 'Decimals', args: { numbers: [0.1, 0.2] } },
    { label: 'Negatives', args: { numbers: [-5, 10, -2] } },
    { label: 'Single value', args: { numbers: [42] } },
  ],
  get_book: [
    { label: 'Dune', args: { id: 'b1' } },
    { label: 'Hyperion', args: { id: 'b6' } },
  ],
  list_books: [
    { label: 'First page', args: { limit: 2, offset: 0 } },
    { label: 'Second page', args: { limit: 2, offset: 2 } },
    { label: 'Default paging', args: {} },
    { label: 'Past the end', args: { limit: 5, offset: 5 } },
  ],
  search_books: [
    { label: 'Title word', args: { query: 'Dark' } },
    { label: 'Lowercase', args: { query: 'snow' } },
    { label: 'No match', args: { query: 'Zzyzx' } },
  ],
  create_book: [
    { label: 'Valid book', args: { title: 'The Dispossessed', author: 'Ursula K. Le Guin', year: 1974 } },
    { label: 'Oldest allowed year', args: { title: 'Old Manuscript', author: 'Anonymous', year: 1450 } },
    { label: 'Missing author', args: { title: 'No Author', year: 2000 } },
  ],
  update_book: [
    { label: 'Change year', args: { id: 'b2', patch: { year: 1985 } } },
    { label: 'Change title', args: { id: 'b4', patch: { title: 'Foundation (Revised)' } } },
    { label: 'Unknown book', args: { id: 'missing', patch: { year: 2000 } } },
  ],
  delete_book: [
    { label: 'Delete b6', args: { id: 'b6' } },
    { label: 'Delete b5', args: { id: 'b5' } },
  ],
  get_exchange_rate: [
    { label: 'USD to EUR', args: { from: 'USD', to: 'EUR' } },
    { label: 'GBP to JPY', args: { from: 'GBP', to: 'JPY' } },
    { label: 'Same currency', args: { from: 'EUR', to: 'EUR' } },
    { label: 'Lowercase codes', args: { from: 'usd', to: 'gbp' } },
  ],
  wait_for_job: [
    { label: 'Job that succeeds', args: { jobId: 'job-ok' } },
    { label: 'Job that fails', args: { jobId: 'job-failed' } },
  ],
};
