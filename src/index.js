import fileType from 'file-type';

import {
  isObject,
  isString,
  isStringArray,
  isFileInstance,
  getFileExt,
  isUint8Array,
  isInBrowser,
} from './util.js';
import browserMimeMapping from './browserMimeMapping';

const extensions = fileType.extensions;
const mimeTypes = fileType.mimeTypes;

const realMimeMapping = {};

for (let mime of mimeTypes) {
  realMimeMapping[mime] = mime;
}

const realExtMapping = {};

for (let ext of extensions) {
  realExtMapping[ext] = ext;
}

class TypeFile {
  static COMPARE_TYPE = {
    REAL_FIRST: 0,
    BROWSER_FIRST: 1,
    REAL_ONLY: 2,
    BROWSER_ONLY: 3,
  };

  static compare(mime, targetMimeType) {
    if (isString(targetMimeType)) {
      return mime === targetMimeType;
    } else if (isStringArray(targetMimeType)) {
      return targetMimeType.includes(mime);
    } else {
      throw new Error('targetMimeType is not a string or a stringArray.');
    }
  }

  constructor(input) {
    this.input = input;
  }

  init(callback) {
    getType(this.input)
      .then(async_typeObj => {
        this.ext = async_typeObj.ext;
        this.mime = async_typeObj.mime;
        this.realExt = async_typeObj.realExt;
        this.realMime = async_typeObj.realMime;
        callback.bind(this)();
      })
      .catch(reason => {
        throw new Error(reason);
      });
  }
  /**
   * @param {*} targetMimeType
   * @param {*} compareRealType
   */
  isType(targetMimeType, compareType = TypeFile.COMPARE_TYPE.REAL_FIRST) {
    switch (compareType) {
      case TypeFile.COMPARE_TYPE.REAL_FIRST: {
        if (this.realMime) {
          return TypeFile.compare(this.realMime, targetMimeType);
        } else {
          return TypeFile.compare(this.mime, targetMimeType);
        }
      }
      case TypeFile.COMPARE_TYPE.BROWSER_FIRST: {
        if (this.mime) {
          return TypeFile.compare(this.mime, targetMimeType);
        } else {
          return TypeFile.compare(this.realMime, targetMimeType);
        }
      }
      case TypeFile.COMPARE_TYPE.REAL_ONLY: {
        return TypeFile.compare(this.realMime, targetMimeType);
      }
      case TypeFile.COMPARE_TYPE.BROWSER_ONLY: {
        return TypeFile.compare(this.mime, targetMimeType);
      }
      default:
        throw new Error('unknown compare type.');
    }
  }
}

const getType = input => {
  return new Promise((resolve, reject) => {
    if (!isUint8Array(input)) {

      let file = input;
      if (isObject(file) && !isFileInstance(file)) {
        for (let key in file) {
          if (isFileInstance(file[key])) {
            file = file[key];
            break;
          }
        }
      }
  
      if (!isFileInstance(file)) {
        return reject('first param need a File instance or a Object include File instance.');
      }

      return fileToUint8Array(file).then(
        u8 => {
          return resolve({
            ext: getFileExt(file),
            mime: file.type ? file.type : null,
            ...getRealTypeFromUint8Array(u8),
          });
        },
        reason => {
          return reject(reason);
        },
      );
    }
    return resolve({ ext: null, mime: null, ...getRealTypeFromUint8Array(input) });
  });
};

const getRealTypeFromUint8Array = u8 => {
  const realType = fileType(u8);
  return {
    realExt: realType ? realType.ext : null,
    realMime: realType ? realType.mime : null,
  };
};

const fileToUint8Array = file => {
  return new Promise((resolve, reject) => {
    if (!isInBrowser()) {
      return reject('FileReader is not support! not in browser');
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file.slice(0, fileType.minimumBytes));
    reader.onloadend = function(e) {
      if (e.target.readyState === FileReader.DONE) {
        return resolve(new Uint8Array(e.target.result)); // 将arraybuffer类型转换为Uint8Array
      }
    };
    reader.onerror = function(e) {
      return reject(e);
    };
  });
};

export const exportObj = { TypeFile, browserMimeMapping, realExtMapping, realMimeMapping };

// if (isInBrowser()) {
//   window.$getRealFileType = exportObj;
// }
