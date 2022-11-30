// stores which sites where visited yet

var storage = {
  // stores the sites which where visited
  visited: [],
};

function saveStorage() {
  localStorage.setItem("storage", JSON.stringify(storage));
}

function loadStorage() {
  var storageString = localStorage.getItem("storage");
  if (storageString) {
    storage = JSON.parse(storageString);
  }
}

function addVisitedSite(site) {
  loadStorage();
  if (storage.visited.indexOf(site) === -1) {
    storage.visited.push(site);
    saveStorage();
  }
}
