module.exports = {
  portable,
  loadPortable,
};


/**
 * transport 1d JSON
 *
 * (pipeline your object)
 *
 * @param {object} obj JS object
 *
 * @returns URLSearchParams
 */
function portable(obj) {
  let objKeys = Object.keys(obj);
  const params = new URLSearchParams();
  params.set("keys", objKeys);
  for (let key of objKeys) {
    params.set(
      key,
      typeof obj[key] === "object"
        ? ".OK." + JSON.stringify({ "JSON.string": JSON.stringify(obj[key]) })
        : obj[key]
    );
  }
  return params;
}

/**
 * construct object from portable JSON
 *
 * @param {URLSearchParams} portable JSON
 * @returns object
 */
function loadPortable(usp) {
  let params = new URLSearchParams(usp);
  let keys = params.get("keys").split(",");
  const jsonObj = {};
  keys.forEach((keyName) => {
    let value = params.get(keyName);
    if (value?.startsWith(".OK.")) {
      value = value.slice(4); // remove the extra bit
    }
    let encodingType = value.slice(2, 13); // expandable
    switch (encodingType) {
      case "JSON.string":
        jsonObj[keyName] = JSON.parse(JSON.parse(value)["JSON.string"]);
        break;
      // ** future types **
      default:
        jsonObj[keyName] = value;
        break;
    }
  });
  return jsonObj;
}
