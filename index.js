module.exports = (function() {
  const fs = require('fs');

  const PNG_SIGNATURE = '89504e470d0a1a0a';
  const SIGNATURE_SIZE = 8;
  const LENGTH_SIZE = 4;
  const CHANK_TYPE_SIZE = 4;
  const CRC_SIZE = 4;

  const HEX_IHDR = '49484452';
  const HEX_IDAT = '49444154';
  const HEX_IEND = '49454e44';
  const IHDR = 1;
  const IDAT = 2;
  const IEND = 3;
  const CHANK_TYPE_MAP = {
    [HEX_IHDR]: IHDR,
    [HEX_IDAT]: IDAT,
    [HEX_IEND]: IEND
  };

  const IHDR_DATA_SIZE = 13;
  const IHDR_IW_SIZE = 4;
  const IHDR_IH_SIZE = 4;
  const IHDR_BD_SIZE = 1;
  const IHDR_CT_SIZE = 1;
  const IHDR_CM_SIZE = 1;
  const IHDR_FM_SIZE = 1;
  const IHDR_IM_SIZE = 1;

  function readBuf(tgtImagePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(tgtImagePath, (err, data) => {
        if (err) { reject(err); }
        else { resolve(new Uint8Array(data)); }
      });
    })
  }
  function check(bary) {
    let idx = 0;
    const str = readAsHexString(bary, idx, SIGNATURE_SIZE);
    return str === PNG_SIGNATURE;
  }
  function readAsHexString(bary, initIdx, length) {
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
    const hex = readAsHexString(bary, initIdx, length);
    const num = parseInt(hex, 16);
    return num;
  }
  function getChankDataPosition(idx) {
    return idx + LENGTH_SIZE + CHANK_TYPE_SIZE;
  }
  function readChankType(bary, idx) {
    const str = readAsHexString(bary, idx, CHANK_TYPE_SIZE);
    const type = CHANK_TYPE_MAP[str] || -1;
    return type;
  }
  function readChankDataLength(bary, idx) {
    return readAsInt(bary, idx, LENGTH_SIZE);
  }
  function HeaderInfo(bary) {
    let idx = 0;
    this.width = readAsInt(bary, idx, IHDR_IW_SIZE);
    idx += IHDR_IW_SIZE;
    this.height = readAsInt(bary, idx, IHDR_IH_SIZE);
    idx += IHDR_IH_SIZE;
    this.bitDepth = readAsInt(bary, idx, IHDR_BD_SIZE);
    idx += IHDR_BD_SIZE;
    this.colorType = readAsInt(bary, idx, IHDR_CT_SIZE);
    idx += IHDR_CT_SIZE;
    this.compressMethod = readAsInt(bary, idx, IHDR_CM_SIZE);
    idx += IHDR_CM_SIZE;
    this.filterMethod = readAsInt(bary, idx, IHDR_FM_SIZE);
    idx += IHDR_FM_SIZE;
    this.interlaceMethod = readAsInt(bary, idx, IHDR_IM_SIZE);
  }
  function readIHDR(bary, idx) {
    const pos = getChankDataPosition(idx);
    const data = bary.subarray(pos);
    return new HeaderInfo(data);
  }
  function analysis(bary) {
    let idx = 0 + SIGNATURE_SIZE;
    let length = -1;
    let type = -1;
    let imageInfo = null;
    let loop = true;
    while (idx >= 0 && loop) {
      length = readChankDataLength(bary, idx);
      type = readChankType(bary, idx + LENGTH_SIZE);
      switch (type) {
        case IHDR:
          imageInfo = readIHDR(bary, idx);
          break;
        default:
          loop = false;
          break;
      }
      if (idx >= 0) {
        const chankSize = LENGTH_SIZE + CHANK_TYPE_SIZE + length + CRC_SIZE;
        idx += chankSize;
      }
    }
    return imageInfo;
  }
  return function pngSizeReader(tgtImagePath) {
    return new Promise((resolve, reject) => {
      readBuf(tgtImagePath).then((resp) => {
        if (check(resp)) {
          const obj = analysis(resp);
          resolve([obj.width, obj.height]);
        } else {
          reject(new Error('Unsupported file type'));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  };
})();