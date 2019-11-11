export function isString(arg) {
  return typeof arg === 'string';
}

export function isStringArray(arg) {
  return Array.isArray(arg) && arg.every(isString);
}

export function getFileExt(file) {
  const fileName = file.name;
  const lastPointIndex = fileName.lastIndexOf('.');
  return lastPointIndex === -1 ? null : fileName.slice(lastPointIndex + 1);
}
