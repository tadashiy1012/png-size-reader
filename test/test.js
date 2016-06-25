const assert = require('power-assert');
const reader = require('../index.js');

describe('png-size-reader test', () => {
  const testImgDir = __dirname + '/test_image/';
  const testPngFile = testImgDir + 'test_png_image.png';
  it('test1', (done) => {
    reader(testPngFile).then((resp) => {
      console.log(resp)
      done();
    });
  })
});