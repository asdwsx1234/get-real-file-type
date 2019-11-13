"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var objectToString = Object.prototype.toString;
function isInBrowser() {
    return typeof window !== 'undefined';
}
exports.isInBrowser = isInBrowser;
function isObject(arg) {
    var type = typeof arg;
    return arg != null && (type == 'object' || type == 'function');
}
exports.isObject = isObject;
function isString(arg) {
    return typeof arg === 'string';
}
exports.isString = isString;
function isStringArray(arg) {
    return Array.isArray(arg) && arg.every(isString);
}
exports.isStringArray = isStringArray;
function isFunction(arg) {
    var tag = isObject(arg) ? objectToString.call(arg) : '';
    return tag == funcTag || tag == genTag;
}
exports.isFunction = isFunction;
function isFileInstance(arg) {
    if (!isInBrowser() || !isObject(arg))
        return false;
    return arg instanceof File;
}
exports.isFileInstance = isFileInstance;
function isUint8Array(arg) {
    if (!isObject(arg))
        return false;
    return arg instanceof Uint8Array;
}
exports.isUint8Array = isUint8Array;
function getFileExt(file) {
    var fileName = file.name;
    var lastPointIndex = fileName.lastIndexOf('.');
    return lastPointIndex === -1 ? null : fileName.slice(lastPointIndex + 1);
}
exports.getFileExt = getFileExt;
