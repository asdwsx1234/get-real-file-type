import { expect } from 'chai';
import 'mocha';
import path from 'path';
import {
  isObject,
  isObjectObject,
  isString,
  isStringArray,
  isFunction,
  isFileInstance,
  isUint8Array,
  getFileExt,
} from '../src/util';
const FileApi = require('file-api'); // 使用require可以不需要@types/file-api

type FILE = typeof FileApi.File;
declare global {
  namespace NodeJS {
    interface Global {
      File: FILE;
    }
  }
}

global.File = FileApi.File;

describe('Utils Test', () => {
  
  it('isObject should return Boolean.', () => {
    expect(isObject({})).to.equal(true);
    expect(isObject([])).to.equal(true);
    expect(isObject(null)).to.equal(false);
  });

  it('isObjectObject should return Boolean.', () => {
    expect(isObjectObject({})).to.equal(true);
    expect(isObjectObject([])).to.equal(false);
    expect(isObject(null)).to.equal(false);
  });

  it('isString should return Boolean.', () => {
    expect(isString('haha')).to.equal(true);
    expect(isString(123)).to.equal(false);
  });

  it('isStringArray should return Boolean.', () => {
    expect(isStringArray([])).to.equal(true);
    expect(isStringArray(['1'])).to.equal(true);
    expect(isStringArray([1])).to.equal(false);
  });

  it('isFunction should return Boolean.', () => {
    expect(isFunction('haha')).to.equal(false);
    expect(isFunction(() => {})).to.equal(true);
    expect(isFunction(function() {})).to.equal(true);
    expect(isFunction(String)).to.equal(true);
  });

  it('isFileInstance should return Boolean.', () => {
    expect(isFileInstance(new global['File'](path.resolve(__dirname, '../LICENSE')))).to.equal(
      true,
    );
    expect(isFileInstance(new String())).to.equal(false);
    expect(isFileInstance({})).to.equal(false);
  });

  it('isUint8Array should return Boolean.', () => {
    expect(isUint8Array([])).to.equal(false);
    expect(isUint8Array(new Uint8Array())).to.equal(true);
    expect(isUint8Array(new ArrayBuffer(2))).to.equal(false);
  });

  it('getFileExt should return Boolean.', () => {
    expect(getFileExt(<File>{ name: 'testFile.jpg' })).to.equal('jpg');
    expect(getFileExt(<File>{ name: 'testFile' })).to.equal(null);
    expect(getFileExt(<File>{ name: 'testFile.m.mp4' })).to.equal('mp4');
  });
});
