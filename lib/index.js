"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var e_1, _a, e_2, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var file_type_1 = __importDefault(require("file-type"));
var util_js_1 = require("./util.js");
var browserMimeMapping_1 = __importDefault(require("./browserMimeMapping"));
exports.browserMimeMapping = browserMimeMapping_1.default;
var extensions = file_type_1.default.extensions;
var mimeTypes = file_type_1.default.mimeTypes;
var realMimeMapping = {};
exports.realMimeMapping = realMimeMapping;
try {
    for (var mimeTypes_1 = __values(mimeTypes), mimeTypes_1_1 = mimeTypes_1.next(); !mimeTypes_1_1.done; mimeTypes_1_1 = mimeTypes_1.next()) {
        var mime = mimeTypes_1_1.value;
        realMimeMapping[mime] = mime;
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (mimeTypes_1_1 && !mimeTypes_1_1.done && (_a = mimeTypes_1.return)) _a.call(mimeTypes_1);
    }
    finally { if (e_1) throw e_1.error; }
}
var realExtMapping = {};
exports.realExtMapping = realExtMapping;
try {
    for (var extensions_1 = __values(extensions), extensions_1_1 = extensions_1.next(); !extensions_1_1.done; extensions_1_1 = extensions_1.next()) {
        var ext = extensions_1_1.value;
        realExtMapping[ext] = ext;
    }
}
catch (e_2_1) { e_2 = { error: e_2_1 }; }
finally {
    try {
        if (extensions_1_1 && !extensions_1_1.done && (_b = extensions_1.return)) _b.call(extensions_1);
    }
    finally { if (e_2) throw e_2.error; }
}
var TypeFile = /** @class */ (function () {
    function TypeFile(input) {
        this.input = input;
        this.ext = null;
        this.mime = null;
        this.realExt = null;
        this.realMime = null;
    }
    TypeFile.compare = function (mime, targetMimeType) {
        if (util_js_1.isString(targetMimeType)) {
            return mime === targetMimeType;
        }
        else if (util_js_1.isStringArray(targetMimeType)) {
            return targetMimeType.includes(mime);
        }
        else {
            throw new Error('targetMimeType is not a string or a stringArray.');
        }
    };
    TypeFile.prototype.init = function (callback) {
        var _this = this;
        getType(this.input)
            .then(function (async_typeObj) {
            _this.ext = async_typeObj.ext;
            _this.mime = async_typeObj.mime;
            _this.realExt = async_typeObj.realExt;
            _this.realMime = async_typeObj.realMime;
            callback.bind(_this)();
        })
            .catch(function (reason) {
            console.error(reason);
        });
    };
    TypeFile.prototype.isType = function (targetMimeType, compareType) {
        if (compareType === void 0) { compareType = TypeFile.COMPARE_TYPE.REAL_FIRST; }
        switch (compareType) {
            case TypeFile.COMPARE_TYPE.REAL_FIRST: {
                if (this.realMime) {
                    return TypeFile.compare(this.realMime, targetMimeType);
                }
                else {
                    return TypeFile.compare(this.mime, targetMimeType);
                }
            }
            case TypeFile.COMPARE_TYPE.BROWSER_FIRST: {
                if (this.mime) {
                    return TypeFile.compare(this.mime, targetMimeType);
                }
                else {
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
    };
    TypeFile.COMPARE_TYPE = {
        REAL_FIRST: 0,
        BROWSER_FIRST: 1,
        REAL_ONLY: 2,
        BROWSER_ONLY: 3,
    };
    return TypeFile;
}());
exports.TypeFile = TypeFile;
function getType(input) {
    return new Promise(function (resolve, reject) {
        if (!util_js_1.isUint8Array(input)) {
            var file_1 = input;
            if (util_js_1.isObject(file_1) && !util_js_1.isFileInstance(file_1)) {
                for (var key in file_1) {
                    if (util_js_1.isFileInstance(file_1[key])) {
                        file_1 = file_1[key];
                        break;
                    }
                }
            }
            if (!util_js_1.isFileInstance(file_1)) {
                return reject(new Error('first param need a File instance or a Object include File instance.'));
            }
            return fileToUint8Array(file_1).then(function (u8) {
                return resolve(__assign({ ext: util_js_1.getFileExt(file_1), mime: file_1.type ? file_1.type : null }, getRealTypeFromUint8Array(u8)));
            });
        }
        return resolve(__assign({ ext: null, mime: null }, getRealTypeFromUint8Array(input)));
    });
}
var getRealTypeFromUint8Array = function (u8) {
    var realType = file_type_1.default(u8);
    return {
        realExt: realType ? realType.ext : null,
        realMime: realType ? realType.mime : null,
    };
};
var fileToUint8Array = function (file) {
    return new Promise(function (resolve, reject) {
        if (!util_js_1.isInBrowser()) {
            return reject(new Error('FileReader is not support! not in browser'));
        }
        var reader = new FileReader();
        reader.readAsArrayBuffer(file.slice(0, file_type_1.default.minimumBytes));
        reader.onloadend = function (e) {
            if (e.target && e.target.readyState === FileReader.DONE) {
                resolve(new Uint8Array(e.target.result)); // 将arraybuffer类型转换为Uint8Array
            }
        };
        reader.onerror = reject;
    });
};
// if (isInBrowser()) {
//   window.$getRealFileType = exportObj;
// }
