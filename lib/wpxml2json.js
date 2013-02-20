var path          = require("path");
var request       = require("request");
var fs            = require("fs");
var parseString   = require("xml2js").parseString;

module.exports = function (xmlFile, callback) {

  var self = this;
  
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
          generator: blog_info.generator[0],
          exporter_info: xml.rss.$,
          blog_info: {
            title: blog_info.title[0],
            link: blog_info.link[0],
            description: blog_info.description[0],
            pubDate: blog_info.pubDate[0],
            language: blog_info.language[0],
            wxr_version: blog_info["wp:wxr_version"][0],
            base_site_url: blog_info["wp:base_site_url"][0],
            base_blog_url: blog_info["wp:base_blog_url"][0],
            author: {
              display_name: blog_info["wp:author"][0]["wp:author_display_name"][0],
              email: blog_info["wp:author"][0]["wp:author_email"][0],
            }
          },
          categories: blog_info["wp:category"],
          tags: blog_info["wp:tag"],
          terms: blog_info["wp:term"],
          items: blog_info["item"]
        };

        blog.categories.forEach(function (category, index, categories) {
          categories[index] = cleanCategory(category);
        });

        blog.tags.forEach(function (tag, index, tags) {
          tags[index] = cleanTag(tag);
        });

        blog.terms.forEach(function (term, index, terms) {
          terms[index] = cleanTerm(term);
        });

        blog.items.forEach(function (item, index, items) {
          items[index] = cleanItem(item);
        });

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

  var generalCleanup = function (item) {

    var isAry = isArray(item);
    var isStr = isString(item);

    if (!isAry && !isStr) {
      var objlength = 0; for (key in item) objlength++;
      if (objlength > 0) {
        for (key in item) {
          item[key] = generalCleanup(item[key]);
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
          return generalCleanup(item[0]);
        }
      } else {
        item.forEach(function (value, index) {
          item[index] = generalCleanup(value);
        });
        return item;
      }
    } else {
      return item;
    }
  }
  
  var cleanItem = function (item) {
    generalCleanup(item);
    return item;
  }

  var cleanTerm = function (term) {
    return {
      term_id: term['wp:term_id'][0],
      term_taxonomy: term['wp:term_taxonomy'][0],
      term_slug: term['wp:term_slug'][0],
      term_name: term['wp:term_name'][0]
    }
  }

  var cleanTag = function (tag) {
    return {
      term_id: tag["wp:term_id"][0],
      tag_slug: tag["wp:tag_slug"][0],
      tag_name: tag["wp:tag_name"][0]
    }
  }

  var cleanCategory = function (cat) {
    return {
      term_id: cat["wp:term_id"][0],
      category_nicename: cat["wp:category_nicename"][0],
      category_parent: cat["wp:category_parent"][0],
      cat_name: cat["wp:cat_name"][0]
    }
  }
}