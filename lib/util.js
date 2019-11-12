"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInBrowser = isInBrowser;
exports.isObject = isObject;
exports.isString = isString;
exports.isStringArray = isStringArray;
exports.isFunction = isFunction;
exports.isFileInstance = isFileInstance;
exports.isUint8Array = isUint8Array;
exports.getFileExt = getFileExt;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var objectToString = Object.prototype.toString;

function isInBrowser() {
  return typeof window !== 'undefined';
}

function isObject(arg) {
  var type = (0, _typeof2["default"])(arg);
  return arg != null && (type == 'object' || type == 'function');
}

function isString(arg) {
  return typeof arg === 'string';
}

function isStringArray(arg) {
  return Array.isArray(arg) && arg.every(isString);
}

function isFunction(arg) {
  var tag = isObject(arg) ? objectToString.call(arg) : '';
  return tag == funcTag || tag == genTag;
}

function isFileInstance(arg) {
  if (!isInBrowser() || !isObject(arg)) return false;
  return arg instanceof File;
}

function isUint8Array(arg) {
  if (!isObject(arg)) return false;
  return arg instanceof Uint8Array;
}

function getFileExt(file) {
  var fileName = file.name;
  var lastPointIndex = fileName.lastIndexOf('.');
  return lastPointIndex === -1 ? null : fileName.slice(lastPointIndex + 1);
}