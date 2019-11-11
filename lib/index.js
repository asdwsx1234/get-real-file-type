"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "browserMimeMapping", {
  enumerable: true,
  get: function get() {
    return _browserMimeMapping["default"];
  }
});
exports.TypeFile = exports.realMimeMapping = exports.realExtMapping = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fileType = _interopRequireDefault(require("file-type"));

var _util = require("./util.js");

var _browserMimeMapping = _interopRequireDefault(require("./browserMimeMapping"));

var extensions = _fileType["default"].extensions;
var mimeTypes = _fileType["default"].mimeTypes;
var realMimeMapping = {};
exports.realMimeMapping = realMimeMapping;
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = mimeTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var mime = _step.value;
    realMimeMapping[mime] = mime;
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
      _iterator["return"]();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var realExtMapping = {};
exports.realExtMapping = realExtMapping;
var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
  for (var _iterator2 = extensions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    var ext = _step2.value;
    realExtMapping[ext] = ext;
  }
} catch (err) {
  _didIteratorError2 = true;
  _iteratorError2 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
      _iterator2["return"]();
    }
  } finally {
    if (_didIteratorError2) {
      throw _iteratorError2;
    }
  }
}

var TypeFile = function () {
  (0, _createClass2["default"])(TypeFile, null, [{
    key: "compare",
    value: function compare(mime, targetMimeType) {
      if ((0, _util.isString)(targetMimeType)) {
        return mime === targetMimeType;
      } else if ((0, _util.isStringArray)(targetMimeType)) {
        return targetMimeType.includes(mime);
      } else {
        throw new Error('targetMimeType is not a string or a stringArray.');
      }
    }
  }, {
    key: "build",
    value: function build(file) {
      var getRealType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return getType(file, getRealType).then(function (typeObj) {
        return new TypeFile(typeObj);
      });
    }
  }]);

  function TypeFile(async_typeObj) {
    (0, _classCallCheck2["default"])(this, TypeFile);

    if (typeof async_typeObj === 'undefined') {
      throw new Error('Cannot be called directly');
    } else if ((0, _typeof2["default"])(async_typeObj) !== 'object') {
      throw new Error("need a object like { ext: 'mp4', mime: 'video/mp4', realExt: 'mp4', realMime: 'video/mp4' }");
    }

    this.ext = async_typeObj.ext;
    this.mime = async_typeObj.mime;
    this.realExt = async_typeObj.realExt;
    this.realMime = async_typeObj.realMime;
  }

  (0, _createClass2["default"])(TypeFile, [{
    key: "isType",
    value: function isType(targetMimeType) {
      var compareType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TypeFile.COMPARE_TYPE.REAL_FIRST;

      switch (compareType) {
        case TypeFile.COMPARE_TYPE.REAL_FIRST:
          {
            if (this.realMime) {
              return TypeFile.compare(this.realMime, targetMimeType);
            } else {
              return TypeFile.compare(this.mime, targetMimeType);
            }
          }

        case TypeFile.COMPARE_TYPE.BROWSER_FIRST:
          {
            if (this.mime) {
              return TypeFile.compare(this.mime, targetMimeType);
            } else {
              return TypeFile.compare(this.realMime, targetMimeType);
            }
          }

        case TypeFile.COMPARE_TYPE.REAL_ONLY:
          {
            return TypeFile.compare(this.realMime, targetMimeType);
          }

        case TypeFile.COMPARE_TYPE.BROWSER_ONLY:
          {
            return TypeFile.compare(this.mime, targetMimeType);
          }

        default:
          throw new Error('unknown compare type.');
      }
    }
  }]);
  return TypeFile;
}();

exports.TypeFile = TypeFile;
(0, _defineProperty2["default"])(TypeFile, "COMPARE_TYPE", {
  REAL_FIRST: 0,
  BROWSER_FIRST: 1,
  REAL_ONLY: 2,
  BROWSER_ONLY: 3
});

var getType = function getType(fileInstance, getRealType) {
  return new Promise(function (resolve, reject) {
    var file = fileInstance;

    if ((0, _typeof2["default"])(file) !== 'object' && !file instanceof File) {
      reject(new Error('first param need a File instance or a Object include File instance.'));
    } else {
      for (var key in file) {
        if (file[key] instanceof File) {
          file = file[key];
          break;
        }
      }
    }

    if (getRealType) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(file.slice(0, _fileType["default"].minimumBytes));

      reader.onloadend = function (e) {
        if (e.target.readyState === FileReader.DONE) {
          var buffer = e.target.result;
          var type = (0, _fileType["default"])(new Uint8Array(buffer));
          var realTypeObj = getBrowserTypeObj(file);
          realTypeObj.realExt = type ? type.ext : null;
          realTypeObj.realMime = type ? type.mime : null;
          resolve(realTypeObj);
        }
      };

      reader.onerror = function (e) {
        reject(e);
      };
    } else {
      resolve(getBrowserTypeObj(file));
    }
  });
};

function getBrowserTypeObj(file) {
  var ext = (0, _util.getFileExt)(file);
  return {
    ext: ext,
    mime: file.type ? file.type : null,
    realExt: null,
    realMime: null
  };
}