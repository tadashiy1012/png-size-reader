module.exports = (function() {
  const fs = require('fs');

  const PNG_SIGNATURE = '89504e470d0a1a0a';
  const SIGNATURE_SIZE = 8;
  const LENGTH_SIZE = 4;
  const CHANK_TYPE_SIZE = 4;
  const CRC_SIZE = 4;

  const HEX_IHDR = '49484452';
  const IHDR = 1;
  const CHANK_TYPE_MAP = {
    [HEX_IHDR]: IHDR
  };
  const IHDR_IW_SIZE = 4;
  const IHDR_IH_SIZE = 4;

  function readBuf(tgtImagePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(tgtImagePath, (err, data) => {
        if (err) { reject(err); }
        else { resolve(data); }
      });
    })
  }
  function readBufSync(tgtImagePath) {
    return fs.readFileSync(tgtImagePath);
  }
  function readHexStr(bary, initIdx, length) {
    let line = '';
    for (let i = initIdx; i < (initIdx + length); i++) {
      const str = bary[i].toString(16);
      if (str.length < 2) {
        line += ('0' + str);
      } else {
        line += str;
      }
    }
    return line;
  }
  function readAsInt(bary, initIdx, length) {
    const hex = readHexStr(bary, initIdx, length);
    const num = parseInt(hex, 16);
    return num;
  }
  function getSize(bary, idx) {
    const pos = idx + LENGTH_SIZE + CHANK_TYPE_SIZE;
    const data = bary.subarray(pos);
    const width = readAsInt(data, 0, IHDR_IW_SIZE);
    const height = readAsInt(data, 0 + IHDR_IW_SIZE, IHDR_IH_SIZE);
    return [width, height];
  }
  function analysis(bary) {
    let idx = 0 + SIGNATURE_SIZE;
    let size = null;
    while (idx >= 0) {
      const length = readAsInt(bary, idx, LENGTH_SIZE);
      const str = readHexStr(bary, idx + LENGTH_SIZE, CHANK_TYPE_SIZE);
      const type = CHANK_TYPE_MAP[str] || -1;
      if (type === IHDR) {
        size = getSize(bary, idx);
        break;
      }
      idx += LENGTH_SIZE + CHANK_TYPE_SIZE + length + CRC_SIZE;
    }
    return size;
  }
  function check(bary) {
    const str = readHexStr(bary, 0, SIGNATURE_SIZE);
    return str === PNG_SIGNATURE;
  }
  const returnFn = function pngSizeReader(tgtImagePath) {
    return new Promise((resolve, reject) => {
      readBuf(tgtImagePath).then((resp) => {
        if (check(resp)) {
          resolve(analysis(resp));
        } else {
          reject(new Error('Unsupported file type'));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  };
  returnFn.sync = function pngSizeReaderSync(tgtImagePath) {
    const buffer = readBufSync(tgtImagePath);
    return analysis(buffer);
  };
  return returnFn;
})();
