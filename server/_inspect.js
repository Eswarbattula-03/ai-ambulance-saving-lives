import { connectToDatabase, closeDatabase } from './db.js';
import { collections } from './models/index.js';

async function main() {
  await connectToDatabase();
  const out = {};
  for (const [name, model] of Object.entries(collections)) {
    try {
      out[name] = await model.estimatedDocumentCount();
    } catch (e) {
      out[name] = 'ERR: ' + (e?.message || e);
    }
  }
  console.log('COUNTS ' + JSON.stringify(out));
  await closeDatabase();
  process.exit(0);
}
main();