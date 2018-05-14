console.log('Make a single file from a set of files specified in singlizer.json');

const fs = require('fs');

// Grab config file first thing
let configFile = fs.createReadStream('singlizer.json');
var config = {
  title: "Singlized File",
  htmlFile: 'index.html',
  cssFile: 'default.css',
  jsFiles: ['default.js'],
  outputPath: './dist/',
  outputFileName: 'index.html'
};

configFile.on('readable', () => {
  const info = JSON.parse(configFile.read())
  
  config = {
    ...config,
    ...info
  };
  console.log(info)
})

// When the configuration file is done loading, we continue on.
configFile.on('end', () => {
  readAndOutput();
})

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

