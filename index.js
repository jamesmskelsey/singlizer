#!/usr/bin/env node
console.log('Make a single file from a set of files specified in singlizer.json');

const fs = require('fs');
const {URL} = require('url');
const https = require('https');
const args = process.argv.slice(2);

let config = {
  title: "No title given"
}

// Grab config file first thing
if (args[0] !== 'init') {
  let configFile = fs.createReadStream('singlizer.json')

  configFile.on('readable', () => {
    const info = JSON.parse(configFile.read())
    if (info) {
      config = {
        ...info
      };
      console.log(config)
    }
  })

  // When the configuration file is done loading, we continue on.
  configFile.on('end', () => {
      readAndOutput()
  })
} else if (args[0] === 'init') {
  initialize();
} else {
  console.log('Either you meant init or nothing. There are only two options.')
}

function initialize() {
  console.log("Initializing 'singlizer.json' configuration file")
  const configFile = fs.createWriteStream('./singlizer.json');
  configFile.write(`
    {
      "title": "Singlizer",
      "jsFiles": [
        "./main.js"
      ],
      "cssFile": "./main.css",
      "htmlFile": "./index.html",
      "outputPath": "./dist/",
      "outputFileName": "index.html"
    }
  `)
}

// Utility function to check if a url is valid - ie, treat as local file or url?
function validURL(fileName) {
  try {
    let url = new URL(fileName)
    // I only want a Boolean here, not a string.
    return true
  } catch (e) {
    // Just discarding the error to instead output false.
    return false
  }
}

// Returns a promise that resolves to the file contents or an error.
function getFile(fileName) {
  if ( validURL(fileName) ) {
    return new Promise( (resolve, rej) => {
      let url = new URL(fileName);
      https.get(url.href, (response) => {
        let completeFile = ''
        response.on('data', (data) => {
          completeFile += data
        })
        .on('end', () => {
          resolve(completeFile)
        })
        .on('error', (err) => {
          rej(err)
        })
      })
    })
  } else {
    return new Promise( (resolve, rej) => {
      let f = fs.createReadStream(fileName)
      f.on('readable', () => {
        let content = f.read();
        if (content) {
          resolve(content)
        }
        
      })
    })
  }
  
}

function readAndOutput() {
  const h = fs.createReadStream(config.htmlFile);
  const c = fs.createReadStream(config.cssFile);
  const title = config.title;

  let outputParts = {
    header: `
    <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
    `,
    ender: `
      </body>
    </html>
    `,
    html: ``,
    css: ``,
    jsFiles: [],
    addJSFile: function (js) {
      this.jsFiles.push(`<script type='text/javascript'>${js}</script>`)
    },
    setHTML: function (html) {
      this.html = html;
    },
    setCSS: function (css) {
      this.css = css;
    },
    getFile: function () {
      return `
        ${this.header}
        ${this.html}
        <style>
          ${this.css}
        </style>
        ${this.jsFiles.join("\n")}
        ${this.ender}
      `
    }
  }

  // Read in each of the js files from the configuration
  // in the order they're given in singlizer.json
  let jsFilesPromisesArray = config.jsFiles.map((file) => {
    return getFile(file)
  })

  Promise.all(jsFilesPromisesArray).then((values) => {
    values.forEach((file) => {
      outputParts.addJSFile(file)
    })

    let distFolder = fs.mkdir('./dist', () => {
      let output = fs.createWriteStream(`${config.outputPath}${config.outputFileName}`);
      output.write(outputParts.getFile())
    });
  })

  h.on('readable', () => {
    let piece = h.read();
    if (piece) {
      outputParts.setHTML(piece);
    }
  });

  c.on('readable', () => {
    let piece = c.read();
    if (piece) {
      outputParts.setCSS(piece);
    }
  })

  c.on('end', () => {
    
  })
}

