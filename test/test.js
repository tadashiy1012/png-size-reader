const assert = require('power-assert');
const reader = require('../index.js');

describe('png-size-reader test', () => {
  const testImgDir = __dirname + '/test_image/';
  const testPngFile = testImgDir + 'test_png_image.png';
  const testJpgFile = testImgDir + 'test_jpg_image.jpg';
  it('test1', (done) => {
    reader(testPngFile).then((resp) => {
      assert(resp[0] === 800);
      assert(resp[1] === 600);
      done();
    });
  });
  it('test2', (done) => {
    reader(testJpgFile).catch((err) => {
      assert(err !== undefined);
      done();
    });
  });
  it('test1-sync', (done) => {
    const size = reader.sync(testPngFile);
    assert(size[0] === 800);
    assert(size[1] === 600);
    done();
  });
  it('test2-sync', (done) => {
    try{
      const size = reader.sync(testJpgFile);
      assert();
    }catch (e) {
      assert(e !== undefined);
      done();
    }
  });
});
