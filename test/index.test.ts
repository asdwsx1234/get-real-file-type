import { expect } from 'chai';
import path from 'path';
import 'mocha';

import { TypeFile } from '../src/index';
const FileApi = require('file-api'); // 使用require可以不需要@types/file-api

type FILE = typeof FileApi.File;
type FILEREADER = typeof FileApi.FileReader;
declare global {
  namespace NodeJS {
    interface Global {
      File: FILE;
      FileReader: FILEREADER;
    }
  }
}

global.File = FileApi.File;
global.FileReader = FileApi.FileReader;

describe('TypeFile Test', () => {
  it('TypeFile Instance(u8).', done => {
    const t1 = new TypeFile(new Uint8Array()); // empty file
    t1.onParseEnd = function() {
      expect(t1.isType('image/png')).to.equal(false);
      expect(t1.isType([''])).to.equal(false);
      done();
    };
    t1.start();
  });

  it('TypeFile Instance(File).', done => {
    const t1 = new TypeFile(new global['File'](path.resolve(__dirname, '../tsconfig.json')));
    t1.onParseEnd = function() {
      expect(t1.isType('image/png')).to.equal(false);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.REAL_FIRST)).to.equal(true);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.BROWSER_FIRST)).to.equal(true);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.BROWSER_ONLY)).to.equal(true);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.REAL_ONLY)).to.equal(false);
      expect(t1.isType([''])).to.equal(false);
      expect(t1.isType(['image/png', 'application/json'])).to.equal(true);
      done();
    };
    t1.start();
  });

  it('TypeFile Instance(Object include File).', done => {
    const t1 = new TypeFile({
      ttt: 'haha',
      file: new global['File'](path.resolve(__dirname, '../tsconfig.json')),
    });
    t1.onParseEnd = function() {
      expect(t1.isType('image/png')).to.equal(false);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.REAL_FIRST)).to.equal(true);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.BROWSER_FIRST)).to.equal(true);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.BROWSER_ONLY)).to.equal(true);
      expect(t1.isType('application/json', TypeFile.COMPARE_TYPE.REAL_ONLY)).to.equal(false);
      expect(t1.isType([''])).to.equal(false);
      expect(t1.isType(['image/png', 'application/json'])).to.equal(true);
      done();
    };

    t1.start();
  });

  it('TypeFile static compare.', () => {
    expect(TypeFile.compare('image/png', 'image/png')).to.equal(true);
    expect(TypeFile.compare('image/png', 'image/jpeg')).to.equal(false);
    expect(TypeFile.compare(null, 'image/jpeg')).to.equal(false);

    expect(TypeFile.compare('image/png', ['image/png', 'image/jpeg'])).to.equal(true);
    expect(TypeFile.compare('image/png', ['image/jpeg', 'audio/mp4'])).to.equal(false);
    expect(TypeFile.compare(null, ['image/png', 'image/jpeg'])).to.equal(false);
  });
});
