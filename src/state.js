import { store } from './store.js';
import { resetUpstream } from './mock-upstream.js';

export function resetState() {
  store.reset();
  resetUpstream();
}
