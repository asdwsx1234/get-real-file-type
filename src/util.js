const funcTag = '[object Function]';
const genTag = '[object GeneratorFunction]';

const objectToString = Object.prototype.toString;

export function isObject(arg) {
  var type = typeof arg;
  return arg != null && (type == 'object' || type == 'function');
}

export function isString(arg) {
  return typeof arg === 'string';
}

export function isStringArray(arg) {
  return Array.isArray(arg) && arg.every(isString);
}

export function isFunction(arg) {
  var tag = isObject(arg) ? objectToString.call(arg) : '';
  return tag == funcTag || tag == genTag;
}

export function isFileInstance(arg) {
  if (!window) return false;
  return arg instanceof File;
}

export function getFileExt(file) {
  const fileName = file.name;
  const lastPointIndex = fileName.lastIndexOf('.');
  return lastPointIndex === -1 ? null : fileName.slice(lastPointIndex + 1);
}
