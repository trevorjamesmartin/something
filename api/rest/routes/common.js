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

const PUBLIC = "rest/public";
const BASEURL = "";

const multer = require("multer");
// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  // saving them to the public folder should allow us to serve them
  destination: PUBLIC + "/images",
  filename: (req, file, cb) => {
    const fname = Date.now().toString();
    const ext = file.mimetype.split("/")[1];
    cb(null, `ul_${fname}.${ext}`);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 15000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.match(/\image\/(png|jpg|jpeg|gif)$/)) {
      // upload only png and jpg format
      return cb(
        new Error("Please upload Image in format [png, jpg, jpeg, gif]")
      );
    }
    cb(undefined, true);
  },
});

module.exports = {
  returnVisible,
  returnVisibles,
  returnOnly,
  returnOnlyList,
  PUBLIC,
  BASEURL,
  upload,
};
