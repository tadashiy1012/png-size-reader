[![Build Status](https://travis-ci.org/tadashiy1012/png-size-reader.svg?branch=master)](https://travis-ci.org/tadashiy1012/png-size-reader)
# png-size-reader
Gets the size of the png image

## Installation
`$ npm install png-size-reader`

## Example
```javascript
var reader = require('png-size-reader');
reader(tgtFilePath).then(function(result) {
  console.log(result); // [width, height]
});
```

## License
MIT
