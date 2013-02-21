# WordPress XML to JSON parser

__A NodeJS library and CLI tool to parse WordPress XML files into a beautiful and understandable JSON file__


## Prerequisites

- NodeJS Installed in your computer
- A well formatted WordPress XML file
- Common sense

## Install

```
git clone git@github.com:jorgepedret/wpxml2json.git
cd wpxml2json/
npm install
```

## CLI Tool

```
$ ./bin/wpxml2json my-awesome/wordpress/file.xml -o any/output/dir/my-blog.json
--> File saved to `any/output/dir/my-blog.json`
```

## NodeJS Module

Checkout or run example.js

```js
var wpxml2json = require("wpxml2json");
wpxml2json("assets/sample.xml", function (err, blog) {
  if (!err) {
    console.log("First category: ", blog.categories[0]);
  }
});
```

# Use at your own risk!
I've only tested this library agains 3 different xml files. If you find any errors or unexpected behaviour, please create an issue and I'll look into it.

## License

MIT