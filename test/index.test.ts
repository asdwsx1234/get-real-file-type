import { expect } from 'chai';
import 'mocha';

import { TypeFile } from '../src/index';

describe('TypeFile Test', () => {
  it('TypeFile Instanece.', () => {
    const t = new TypeFile(new Uint8Array());
    t.init(function() {
      expect(t.isType('image/png')).to.equal(false);
      expect(t.isType([''])).to.equal(false); // mime = null
    });
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
