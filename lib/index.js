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
exports.realMimeMapping = exports.realExtMapping = exports.TypeFile = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fileType = _interopRequireDefault(require("file-type"));

var _util = require("./util.js");

var _browserMimeMapping = _interopRequireDefault(require("./browserMimeMapping"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
  }]);

  function TypeFile(input) {
    (0, _classCallCheck2["default"])(this, TypeFile);
    this.input = input;
  }

  (0, _createClass2["default"])(TypeFile, [{
    key: "init",
    value: function init(callback) {
      var _this = this;

      getType(this.input).then(function (async_typeObj) {
        _this.ext = async_typeObj.ext;
        _this.mime = async_typeObj.mime;
        _this.realExt = async_typeObj.realExt;
        _this.realMime = async_typeObj.realMime;
        callback.bind(_this)();
      })["catch"](function (reason) {
        console.error(reason);
      });
    }
  }, {
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

var getType = function getType(input) {
  return new Promise(function (resolve, reject) {
    if (!(0, _util.isUint8Array)(input)) {
      var file = input;

      if ((0, _util.isObject)(file) && !(0, _util.isFileInstance)(file)) {
        for (var key in file) {
          if ((0, _util.isFileInstance)(file[key])) {
            file = file[key];
            break;
          }
        }
      }

      if (!(0, _util.isFileInstance)(file)) {
        return reject(new Error('first param need a File instance or a Object include File instance.'));
      }

      return fileToUint8Array(file).then(function (u8) {
        return resolve(_objectSpread({
          ext: (0, _util.getFileExt)(file),
          mime: file.type ? file.type : null
        }, getRealTypeFromUint8Array(u8)));
      });
    }

    return resolve(_objectSpread({
      ext: null,
      mime: null
    }, getRealTypeFromUint8Array(input)));
  });
};

var getRealTypeFromUint8Array = function getRealTypeFromUint8Array(u8) {
  var realType = (0, _fileType["default"])(u8);
  return {
    realExt: realType ? realType.ext : null,
    realMime: realType ? realType.mime : null
  };
};

var fileToUint8Array = function fileToUint8Array(file) {
  return new Promise(function (resolve, reject) {
    if (!(0, _util.isInBrowser)()) {
      return reject(new Error('FileReader is not support! not in browser'));
    }

    var reader = new FileReader();
    reader.readAsArrayBuffer(file.slice(0, _fileType["default"].minimumBytes));

    reader.onloadend = function (e) {
      if (e.target.readyState === FileReader.DONE) {
        resolve(new Uint8Array(e.target.result));
      }
    };

    reader.onerror = reject;
  });
};