var wpxml2json = require("./lib/wpxml2json");

wpxml2json("assets/sample.xml", function (err, blog) {
  if (!err) {
    console.log("First category: ", blog.categories[0]);
  }
});