import fileType from 'file-type';

import { isString, isStringArray, getFileExt } from './util.js';
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

  static build(file, getRealType = true) {
    return getType(file, getRealType).then(typeObj => {
      return new TypeFile(typeObj);
    });
  }

  constructor(async_typeObj) {
    if (typeof async_typeObj === 'undefined') {
      throw new Error('Cannot be called directly');
    } else if (typeof async_typeObj !== 'object') {
      throw new Error(
        `need a object like { ext: 'mp4', mime: 'video/mp4', realExt: 'mp4', realMime: 'video/mp4' }`,
      );
    }

    this.ext = async_typeObj.ext;
    this.mime = async_typeObj.mime;
    this.realExt = async_typeObj.realExt;
    this.realMime = async_typeObj.realMime;
  }
  /**
   * 如果传入mimeType字符串
   * 1、先比较真实的mime
   *    匹配  -> true
   *    不匹配  -> false
   *    真实的mime为null,去比较浏览器的mime
   *      2、比较浏览器的mime
   *         匹配 -> true
   *         不匹配 -> false
   *         浏览器的mime为null -> false
   *
   * 如果传入mimeType数组
   * 1、遍历数组比较真实的mime
   *    存在匹配  -> true
   *    不存在匹配  -> false
   *    真实的mime为null,去比较浏览器的mime
   *      2、遍历数组比较浏览器的mime
   *         存在匹配 -> true
   *         不存在匹配 -> false
   *         浏览器的mime为null -> false
   *
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

/**
 * 获取文件的后缀和mimeType， 如果getRealType为true则通过读取文件二进制获取真实的数据，否则只获取浏览器解析的数据
 * @param {File} file
 * @param {Boolean} getRealType
 */
const getType = (fileInstance, getRealType) => {
  return new Promise((resolve, reject) => {
    let file = fileInstance;
    if (typeof file !== 'object' && !file instanceof File) {
      reject(new Error('first param need a File instance or a Object include File instance.'));
    } else {
      for (let key in file) {
        if (file[key] instanceof File) {
          file = file[key];
          break;
        }
      }
    }

    if (getRealType) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(file.slice(0, fileType.minimumBytes));
      reader.onloadend = function(e) {
        if (e.target.readyState === FileReader.DONE) {
          const buffer = e.target.result; //此时是arraybuffer类型
          const type = fileType(new Uint8Array(buffer));
          const realTypeObj = getBrowserTypeObj(file);
          realTypeObj.realExt = type ? type.ext : null;
          realTypeObj.realMime = type ? type.mime : null;
          resolve(realTypeObj);
        }
      };
      reader.onerror = function(e) {
        reject(e);
      };
    } else {
      resolve(getBrowserTypeObj(file));
    }
  });
};

function getBrowserTypeObj(file) {
  const ext = getFileExt(file);
  return {
    ext: ext,
    mime: file.type ? file.type : null,
    realExt: null,
    realMime: null,
  };
}

export { browserMimeMapping, realExtMapping, realMimeMapping, TypeFile };
