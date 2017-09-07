import {expect} from 'chai';
import sinon from 'sinon';
import clearRequire from 'clear-require';

import constants from '../../../../../gulp-tasks/utils/constants.js';

constants.BUILD_TYPES.forEach((buildType) => {
  describe(`messageGenerator - ${buildType}`, function() {
    const detailsObj = {
      exampleDetail: 'With Value',
    };
    const detailsString = `${JSON.stringify([detailsObj])}`;

    const MSG_GEN_PATH = '../../../../../packages/workbox-core/models/messages/messageGenerator.mjs';
    let sandbox;
    let messageGenerator;

    before(async function() {
      sandbox = sinon.sandbox.create();
      process.env.NODE_ENV = buildType;

      clearRequire.all();

      const messageGenModule = await import(MSG_GEN_PATH);
      messageGenerator = messageGenModule.default;
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should return the code if the code is unknown', function() {
      const stub = sandbox.stub(console, 'warn');

      const message = messageGenerator('fake-code');
      expect(message).to.equal('fake-code');

      if (process.env.NODE_ENV === 'prod') {
        expect(stub.callCount).to.equal(0);
      } else {
        expect(stub.callCount).to.equal(1);
      }
    });

    it('should return the code with details if the code is unknown', function() {
      const stub = sandbox.stub(console, 'warn');

      const message = messageGenerator('fake-code', detailsObj);
      expect(message).to.equal(`fake-code :: ${detailsString}`);

      if (process.env.NODE_ENV === 'prod') {
        expect(stub.callCount).to.equal(0);
      } else {
        expect(stub.callCount).to.equal(1);
      }
    });

    it('should return the code if the code is valid, requires specific details but nothing given', function() {
      const stub = sandbox.stub(console, 'warn');

      const message = messageGenerator('invalid-type');
      expect(message).to.equal(`invalid-type`);

      if (process.env.NODE_ENV === 'prod') {
        expect(stub.callCount).to.equal(0);
      } else {
        expect(stub.callCount).to.equal(1);
      }
    });

    it('should return the code if the code is valid but requires specific details', function() {
      const stub = sandbox.stub(console, 'warn');

      const message = messageGenerator('invalid-type', detailsObj);
      expect(message).to.equal(`invalid-type :: ${detailsString}`);

      if (process.env.NODE_ENV === 'prod') {
        expect(stub.callCount).to.equal(0);
      } else {
        expect(stub.callCount).to.equal(1);
      }
    });

    it('should return the message if the code and details are valid', function() {
      const invalidTypeDetails = {
        paramName: 'Param',
        expectedType: 'Type',
        value: {
          example: 'Value',
        },
      };

      const message = messageGenerator('invalid-type', invalidTypeDetails);
      if (process.env.NODE_ENV === 'prod') {
        expect(message).to.equal(`invalid-type :: ${JSON.stringify([invalidTypeDetails])}`);
      } else {
        expect(message.indexOf('invalid-type')).to.equal(-1);
      }
    });
  });
});