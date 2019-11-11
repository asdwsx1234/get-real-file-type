"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isString = isString;
exports.isStringArray = isStringArray;
exports.getFileExt = getFileExt;

function isString(arg) {
  return typeof arg === 'string';
}

function isStringArray(arg) {
  return Array.isArray(arg) && arg.every(isString);
}

function getFileExt(file) {
  var fileName = file.name;
  var lastPointIndex = fileName.lastIndexOf('.');
  return lastPointIndex === -1 ? null : fileName.slice(lastPointIndex + 1);
}