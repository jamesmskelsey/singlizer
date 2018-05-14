# Singlizer

## What it's for
Use `single.js` to combine a single html file that contains only the contents of a body element (minus the <body></body> tags), a single 'main.css' file, and any number of javascript files, specified through `singlizer.json`.

This may only be useful for me, because I have a specific need to distribute files to coworkers who are Sailors, whose email system will strip any .zip files I send them. They have a ridiculously bad internet connection, the need for tools that are normally only available online, or are developed for them for some specific task they need to do.

### Configuration

```json
  {
    "title": "Singlizer",
    "jsFiles": [
      "main.js"
    ],
    "cssFile": "main.css",
    "htmlFile": "index.html",
    "outputPath": "./dist/",
    "outputFileName": "index.html"
  }
```

"jsFiles" must be an array of JavaScript files. It can include files in subfolders, don't forget './'
All of the config entries are optional, but setting them to blank files will cause problems.

### Usage

Example files.

`singlizer.json`
```json
  "title": "Hello, world",
  "jsFiles": ["./js/main.js"]
```

`./index.html`
```html
  <p>Hello, world</p>
```

`./js/main.js`
```javascript
  console.log("Hello, world");
```

`./main.css`
```css
  body {
    background-color: #eee;
    color: #222;
  }
```

Then, type: `node single.js`

Outputs:

```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Hello, world</title>
    </head>
    <body>
      <p>Hello, world</p>
      <style>
        body {
        background-color: #eee;
        color: #222;
      }
      </style>
      <script>
        console.log("Hello, world");
      </script>
    </body>
  </html>
```
