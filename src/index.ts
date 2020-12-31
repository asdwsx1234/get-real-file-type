import fileType from 'file-type';

import {
  isObjectObject,
  isString,
  isStringArray,
  isFileInstance,
  getFileExt,
  isFunction,
  isUint8Array,
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

type inputType = Object | File | Uint8Array;

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

  static compare(mime: string | null, targetMimeType: string | string[]): boolean {
    if (isString(targetMimeType)) {
      return mime === targetMimeType;
    } else if (isStringArray(targetMimeType)) {
      return targetMimeType.includes(mime as string);
    } else {
      throw new Error('targetMimeType is not a string or a stringArray.');
    }
  }

  input: inputType;
  ext: null | string;
  mime: null | string;
  realExt: null | string;
  realMime: null | string;
  onParseEnd: Function;
  onParseError: Function;

  constructor(input: any) {
    this.input = input;
    this.ext = null;
    this.mime = null;
    this.realExt = null;
    this.realMime = null;
    this.onParseEnd = () => {};
    this.onParseError = () => {};
  }

  start(): void {
    getType(this.input)
      .then((async_typeObj) => {
        this.ext = async_typeObj.ext;
        this.mime = async_typeObj.mime;
        this.realExt = async_typeObj.realExt;
        this.realMime = async_typeObj.realMime;
        isFunction(this.onParseEnd) && this.onParseEnd();
      })
      .catch((reason) => {
        console.error(reason);
        isFunction(this.onParseError) && this.onParseError(reason);
      });
  }

  isType(
    targetMimeType: string | string[],
    compareType: number = TypeFile.COMPARE_TYPE.REAL_FIRST,
  ) {
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

      return fileToUint8Array(file).then((u8) => {
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
    if (!FileReader) {
      return reject(new Error('FileReader is not support!'));
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file.slice ? file.slice(0, fileType.minimumBytes) : file); // 兼容test中的Node的File没有slice方法
    reader.onload = function (e) {
      if (e.target && e.target.readyState === FileReader.DONE) {
        resolve(new Uint8Array(<ArrayBuffer>e.target.result)); // 将arraybuffer类型转换为Uint8Array
      }
    };
    reader.onerror = reject;
  });
};

const getFileType = (input: inputType): Promise<Async_typeObj> => {
  return new Promise((resolve, reject) => {
    const typeFile = new TypeFile(input);
    typeFile.onParseEnd = () => {
      resolve(typeFile);
    };
    typeFile.onParseError = reject;
    typeFile.start();
  });
};

function fileIsType(
  input: inputType,
  type: string | string[],
  compareType: number = TypeFile.COMPARE_TYPE.REAL_FIRST,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const typeFile = new TypeFile(input);
    typeFile.onParseEnd = () => {
      resolve(typeFile.isType(type, compareType));
    };
    typeFile.onParseError = reject;
    typeFile.start();
  });
}

export { TypeFile, browserMimeMapping, realExtMapping, realMimeMapping, getFileType, fileIsType };
