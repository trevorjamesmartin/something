// sqlite doesn't support .returning(['name', 'etc'])
// quick filter (things the client wouldn't need to see)

const not_visible = ["deleted", "last_modified"];

async function returnVisible(record, columns = []) {
  if (!record) return {};
  const filtered_copy = { ...record };
  [...not_visible, ...columns].forEach((c) => delete filtered_copy[c]);
  return filtered_copy;
}

async function returnVisibles(records, columns = []) {
  const filtered_list = await Promise.all(
    records.map((record) => returnVisible(record, columns))
  );
  return filtered_list;
}

async function returnOnly(record, columns) {
  if (!record || !record?.path) return {};
  let filtered_copy = {};
  await columns.forEach((n) => {
    filtered_copy[n] = record[n];
  });
  return filtered_copy;
}

async function returnOnlyList(records, columns) {
  const filtered_list = await Promise.all(
    records.map((record) => returnOnly(record, columns))
  );
  return filtered_list;
}

module.exports = { returnVisible, returnVisibles, returnOnly, returnOnlyList };
