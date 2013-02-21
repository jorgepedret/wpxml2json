var wpxml2json = require("./lib/wpxml2json");

// You can try with these three different files:
// - assets/sample.xml
// - assets/sample-1.xml
// - assets/sample-2.xml

wpxml2json("assets/sample-1.xml", function (err, blog) {
  if (!err) {
    console.log("First category: ", blog.categories[0]);
  }
});