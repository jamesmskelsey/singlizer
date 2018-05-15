#!/usr/bin/env node
console.log('Make a single file from a set of files specified in singlizer.json');

const fs = require('fs');
let config = {
  title: "No title given"
}
const args = process.argv.slice(2);
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
  let configFile = fs.createWriteStream('./singlizer.json');
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

function readAndOutput() {
  const jsFiles = [];
  const h = fs.createReadStream(config.htmlFile);
  const c = fs.createReadStream(config.cssFile);
  config.jsFiles.forEach((file) => {
    let f = fs.createReadStream(file)
    f.on('readable', () => {
      let content = f.read();
      if (content) {
        jsFiles.push(`<script type='text/javascript'>${content}</script>`)
      }
      
    })
  })

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
        ${jsFiles.join("\n")}
        ${this.ender}
      `
    }
  }


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
    let distFolder = fs.mkdir('./dist', () => {
      let output = fs.createWriteStream(`${config.outputPath}${config.outputFileName}`);
      output.write(outputParts.getFile())
    });
    console.log(jsFiles.join("\n"))
  })
}

