export function getURLCredential(appURL) {
  let assoc = {};

  let searchString = appURL.split("?")[1];
  if (searchString) {
    let keyValues = searchString.split("&");
    for (let i = 0; i < keyValues.length; i++) {
      const element = keyValues[i];
      let key = element.split("=");
      if (key.length > 1) {
        assoc[key[0]] = key[1];
      }
    }
  }

  return assoc;
}
