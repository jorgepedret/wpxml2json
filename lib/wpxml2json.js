var path          = require("path");
var request       = require("request");
var fs            = require("fs");
var parseString   = require("xml2js").parseString;

module.exports = function (xmlFile, callback) {

  var self = this;

  // 
  // 
  /**
   * Attempts to get a value from an object, if it's undefined at 
   * any point, it returns a default parameter
   *
   * @param obj Reference object
   * @param drillDown An array of values expected in obj
   * @param def Default value in case it fails
   */
  var g = function (obj, drillDown, def) {
    var BreakException = {};
    try {
      var fin = obj||{};
      drillDown.forEach(function (prop) {
        if (typeof fin[prop] !== "undefined") {
          fin = fin[prop];
        } else {
          throw BreakException;
        }
      });
      return fin;
    } catch (e) {
      if (e !== BreakException) throw e;
      return def;
    }
  }
  
  if (!xmlFile) throw new Error("Please specify an XML file");

  self.xml = xmlFile;

  // Check if XML exists
  fs.exists(self.xml, function (exists) {
    
    if (!exists) throw new Error("XML file not found");
    
    // Get XML content
    fs.readFile(self.xml, function (err, xmlString) {
      if (err) throw err;
      
      // Parse XML
      parseString(xmlString, function (err, xml) {
        if (err) throw err;

        var blog_info = xml.rss.channel[0];

        var blog = {
          generator: g(blog_info, ['generator', 0], ""),
          exporter_info: g(xml, ['rss', '$'], ""),
          blog_info: {
            title: g(blog_info, ['title', 0], ""),
            link: g(blog_info, ['link', 0], ""),
            description: g(blog_info, ['description', 0], ""),
            pubDate: g(blog_info, ['pubDate', 0], ""),
            language: g(blog_info, ['language', 0], ""),
            wxr_version: g(blog_info, ["wp:wxr_version", 0], ""),
            base_site_url: g(blog_info, ["wp:base_site_url", 0], ""),
            base_blog_url: g(blog_info, ["wp:base_blog_url", 0], ""),
            author: {
              display_name: g(blog_info, ["wp:author", 0, "wp:author_display_name", 0], ""),
              email: g(blog_info, ["wp:author", 0, "wp:author_email", 0], "")
            }
          },
          categories: g(blog_info, ["wp:category"], []),
          tags: g(blog_info, ["wp:tag"], []),
          terms: g(blog_info, ["wp:term"], []),
          items: g(blog_info, ["item"], [])
        };

        blog = cleanup(blog);

        callback(null, blog);

      });
    });
  });

  var isArray = function (item) {
    return typeof item === "object" && item.length;
  }

  var isString = function (item) {
    return typeof item === "string";
  }

  var cleanup = function (item) {

    var isAry = isArray(item);
    var isStr = isString(item);

    if (!isAry && !isStr) {
      var objlength = 0; for (key in item) objlength++;
      if (objlength > 0) {
        for (key in item) {
          item[key] = cleanup(item[key]);
        };
        return item;
      } else {
        return null;
      }
    } else if (isAry) {
      if (item.length === 1) {
        if (typeof item[0] === "string") {
          return item[0];
        } else {
          return cleanup(item[0]);
        }
      } else {
        item.forEach(function (value, index) {
          item[index] = cleanup(value);
        });
        return item;
      }
    } else {
      return item;
    }
  }
}