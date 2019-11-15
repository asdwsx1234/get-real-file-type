import fileType from 'file-type';

import {
  isObjectObject,
  isString,
  isStringArray,
  isFileInstance,
  getFileExt,
  isUint8Array,
  isInBrowser,
} from './util';
import browserMimeMapping from './browserMimeMapping';

interface realMimeMapping {
  [key: string]: string;
}

interface realExtMapping {
  [key: string]: string;
}

interface Async_typeObj {
  ext: null | string;
  mime: null | string;
  realExt: null | string;
  realMime: null | string;
}

const extensions = fileType.extensions;
const mimeTypes = fileType.mimeTypes;

const realMimeMapping: realMimeMapping = {};

for (let mime of mimeTypes) {
  realMimeMapping[mime] = mime;
}

const realExtMapping: realExtMapping = {};

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

  static compare(mime: null | string, targetMimeType: string): Boolean;
  static compare(mime: null | string, targetMimeType: string[]): Boolean;
  static compare(mime: null | string, targetMimeType: any): Boolean {
    if (isString(targetMimeType)) {
      return mime === targetMimeType;
    } else if (isStringArray(targetMimeType)) {
      return targetMimeType.includes(mime);
    } else {
      throw new Error('targetMimeType is not a string or a stringArray.');
    }
  }

  input: Object | File | Uint8Array;
  ext: null | string;
  mime: null | string;
  realExt: null | string;
  realMime: null | string;

  constructor(input: any) {
    this.input = input;
    this.ext = null;
    this.mime = null;
    this.realExt = null;
    this.realMime = null;
  }

  init(callback: Function) {
    getType(this.input)
      .then(async_typeObj => {
        this.ext = async_typeObj.ext;
        this.mime = async_typeObj.mime;
        this.realExt = async_typeObj.realExt;
        this.realMime = async_typeObj.realMime;
        callback.bind(this)();
      })
      .catch(reason => {
        console.error(reason);
      });
  }

  isType(targetMimeType: string, compareType?: Number): Boolean;
  isType(targetMimeType: string[], compareType?: Number): Boolean;
  isType(targetMimeType: any, compareType: Number = TypeFile.COMPARE_TYPE.REAL_FIRST) {
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
function getType(input: Object): Promise<Async_typeObj>;
function getType(input: File): Promise<Async_typeObj>;
function getType(input: Uint8Array): Promise<Async_typeObj>;
function getType(input: any): Promise<Async_typeObj> {
  return new Promise((resolve, reject) => {
    if (!isUint8Array(input)) {
      let file = input;
      if (isObjectObject(file) && !isFileInstance(file)) {
        for (let key in file) {
          if (isFileInstance(file[key])) {
            file = file[key];
            break;
          }
        }
      }

      if (!isFileInstance(file)) {
        return reject(
          new Error('first param need a File instance or a Object include File instance.'),
        );
      }

      return fileToUint8Array(file).then(u8 => {
        return resolve({
          ext: getFileExt(file),
          mime: file.type ? file.type : null,
          ...getRealTypeFromUint8Array(u8),
        });
      });
    }
    return resolve({ ext: null, mime: null, ...getRealTypeFromUint8Array(input) });
  });
}

const getRealTypeFromUint8Array = (u8: Uint8Array) => {
  const realType = fileType(u8);
  return {
    realExt: realType ? realType.ext : null,
    realMime: realType ? realType.mime : null,
  };
};

const fileToUint8Array = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    if (!isInBrowser()) {
      return reject(new Error('FileReader is not support! not in browser'));
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file.slice(0, fileType.minimumBytes));
    reader.onloadend = function(e) {
      if (e.target && e.target.readyState === FileReader.DONE) {
        resolve(new Uint8Array(<ArrayBuffer>e.target.result)); // 将arraybuffer类型转换为Uint8Array
      }
    };
    reader.onerror = reject;
  });
};

export { TypeFile, browserMimeMapping, realExtMapping, realMimeMapping };

// if (isInBrowser()) {
//   window.$getRealFileType = exportObj;
// }
