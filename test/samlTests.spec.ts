"use strict";
import * as fs from "fs";
import * as url from "url";
import * as should from "should";
import assert = require("assert");
import { SAML } from "../src/passport-saml/saml";
import { RequestWithUser, AuthenticateOptions, AuthorizeOptions } from "../src/passport-saml/types";
import { assertRequired } from "../src/passport-saml/utility";
import { FAKE_CERT } from "./types";

describe("SAML.js", function () {
  describe("get Urls", function () {
    let saml: SAML;
    let req: RequestWithUser;
    let options: AuthenticateOptions & AuthorizeOptions;
    beforeEach(function () {
      saml = new SAML({
        entryPoint: "https://exampleidp.com/path?key=value",
        logoutUrl: "https://exampleidp.com/path?key=value",
        cert: FAKE_CERT,
      });
      req = {
        protocol: "https",
        headers: {
          host: "examplesp.com",
        },
        user: {
          nameIDFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
          nameID: "nameID",
        },
        samlLogoutRequest: {
          ID: 123,
        },
      } as RequestWithUser;
      options = {
        additionalParams: {
          additionalKey: "additionalValue",
        },
      };
    });

    describe("getAuthorizeUrl", function () {
      it("calls callback with right host", async () => {
        const target = await saml.getAuthorizeUrlAsync(req, {});
        url.parse(target!).host!.should.equal("exampleidp.com");
      });
      it("calls callback with right protocol", async () => {
        const target = await saml.getAuthorizeUrlAsync(req, {});
        url.parse(target!).protocol!.should.equal("https:");
      });
      it("calls callback with right path", async () => {
        const target = await saml.getAuthorizeUrlAsync(req, {});
        url.parse(target!).pathname!.should.equal("/path");
      });
      it("calls callback with original query string", async () => {
        const target = await saml.getAuthorizeUrlAsync(req, {});
        url.parse(target!, true).query["key"]!.should.equal("value");
      });
      it("calls callback with additional run-time params in query string", async () => {
        const target = await saml.getAuthorizeUrlAsync(req, options);
        Object.keys(url.parse(target!, true).query).should.have.length(3);
        url.parse(target!, true).query["key"]!.should.equal("value");
        url.parse(target!, true).query["SAMLRequest"]!.should.not.be.empty();
        url.parse(target!, true).query["additionalKey"]!.should.equal("additionalValue");
      });
      // NOTE: This test only tests existence of the assertion, not the correctness
      it("calls callback with saml request object", async () => {
        const target = await saml.getAuthorizeUrlAsync(req, {});
        should(url.parse(target!, true).query).have.property("SAMLRequest");
      });
    });

    describe("getLogoutUrl", function () {
      it("calls callback with right host", async () => {
        const target = await saml.getLogoutUrlAsync(req, {});
        url.parse(target!).host!.should.equal("exampleidp.com");
      });
      it("calls callback with right protocol", async () => {
        const target = await saml.getLogoutUrlAsync(req, {});
        url.parse(target!).protocol!.should.equal("https:");
      });
      it("calls callback with right path", async () => {
        const target = await saml.getLogoutUrlAsync(req, {});
        url.parse(target!).pathname!.should.equal("/path");
      });
      it("calls callback with original query string", async () => {
        const target = await saml.getLogoutUrlAsync(req, {});
        url.parse(target!, true).query["key"]!.should.equal("value");
      });
      it("calls callback with additional run-time params in query string", async () => {
        const target = await saml.getLogoutUrlAsync(req, options);
        Object.keys(url.parse(target!, true).query).should.have.length(3);
        url.parse(target!, true).query["key"]!.should.equal("value");
        url.parse(target!, true).query["SAMLRequest"]!.should.not.be.empty();
        url.parse(target!, true).query["additionalKey"]!.should.equal("additionalValue");
      });
      // NOTE: This test only tests existence of the assertion, not the correctness
      it("calls callback with saml request object", async () => {
        const target = await saml.getLogoutUrlAsync(req, {});
        should(url.parse(target!, true).query).have.property("SAMLRequest");
      });
    });

    describe("getLogoutResponseUrl", function () {
      it("calls callback with right host", function (done) {
        saml.getLogoutResponseUrl(req, {}, function (err, target) {
          should.not.exist(err);
          try {
            target = assertRequired(target);
            const parsed = url.parse(target);
            assert.strictEqual(parsed.host, "exampleidp.com");
            done();
          } catch (err2) {
            done(err2);
          }
        });
      });
      it("calls callback with right protocol", function (done) {
        saml.getLogoutResponseUrl(req, {}, function (err, target) {
          should.not.exist(err);
          try {
            target = assertRequired(target);
            const parsed = url.parse(target);
            assert.strictEqual(parsed.protocol, "https:");
            done();
          } catch (err2) {
            done(err2);
          }
        });
      });
      it("calls callback with right path", function (done) {
        saml.getLogoutResponseUrl(req, {}, function (err, target) {
          should.not.exist(err);
          try {
            target = assertRequired(target);
            const parsed = url.parse(target);
            assert.strictEqual(parsed.pathname, "/path");
            done();
          } catch (err2) {
            done(err2);
          }
        });
      });
      it("calls callback with original query string", function (done) {
        saml.getLogoutResponseUrl(req, {}, function (err, target) {
          should.not.exist(err);
          try {
            target = assertRequired(target);
            const parsed = url.parse(target, true);
            assert.strictEqual(parsed.query["key"], "value");
            done();
          } catch (err2) {
            done(err2);
          }
        });
      });
      it("calls callback with additional run-time params in query string", function (done) {
        saml.getLogoutResponseUrl(req, options, function (err, target) {
          should.not.exist(err);
          try {
            target = assertRequired(target);
            const parsed = url.parse(target, true);
            assert.strictEqual(parsed.query["key"], "value");
            should.exist(parsed.query["SAMLResponse"]);
            assert.strictEqual(parsed.query["additionalKey"], "additionalValue");
            done();
          } catch (err2) {
            done(err2);
          }
        });
      });
      // NOTE: This test only tests existence of the assertion, not the correctness
      it("calls callback with saml response object", function (done) {
        saml.getLogoutResponseUrl(req, {}, function (err, target) {
          should.not.exist(err);
          try {
            target = assertRequired(target);
            const parsed = url.parse(target, true);
            should(parsed.query).have.property("SAMLResponse");
            done();
          } catch (err2) {
            done(err2);
          }
        });
      });
    });

    describe("keyToPEM", function () {
      const [regular, singleline] = ["acme_tools_com.key", "singleline_acme_tools_com.key"].map(
        keyFromFile
      );

      it("formats singleline keys properly", function () {
        const result = saml.keyToPEM(singleline);
        result.should.equal(regular);
      });

      it("passes all other multiline keys", function () {
        const result = saml.keyToPEM(regular);
        result.should.equal(regular);
      });

      it("fails with falsy", function () {
        assert.throws(() => saml.keyToPEM(null as any));
      });

      it("does nothing to non strings", function () {
        const result = saml.keyToPEM(1 as any);
        should.equal(result, 1);
      });
    });
  });
});

function keyFromFile(file: string) {
  return fs.readFileSync(`./test/static/${file}`).toString();
}
