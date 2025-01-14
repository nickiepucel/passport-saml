import * as fs from "fs";
import { signSamlPost, signAuthnRequestPost } from "../src/passport-saml/saml-post-signing";
import { SamlOptions, SamlSigningOptions } from "../src/passport-saml/types";

const signingKey = fs.readFileSync(__dirname + "/static/key.pem");

describe("SAML POST Signing", function () {
  it("should sign a simple saml request", function () {
    const xml =
      '<SAMLRequest><saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://example.com</saml2:Issuer></SAMLRequest>';
    const result = signSamlPost(xml, "/SAMLRequest", { privateKey: signingKey });
    result.should.match(/<DigestValue>[A-Za-z0-9/+=]+<\/DigestValue>/);
    result.should.match(/<SignatureValue>[A-Za-z0-9/+=]+<\/SignatureValue>/);
  });

  it("should place the Signature element after the Issuer element", function () {
    const xml =
      '<SAMLRequest><saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://example.com</saml2:Issuer><SomeOtherElement /></SAMLRequest>';
    const result = signSamlPost(xml, "/SAMLRequest", { privateKey: signingKey });
    result.should.match(/<\/saml2:Issuer><Signature/);
    result.should.match(/<\/Signature><SomeOtherElement/);
  });

  it("should sign and digest with SHA256 when specified", function () {
    const xml =
      '<SAMLRequest><saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://example.com</saml2:Issuer></SAMLRequest>';
    const options: SamlSigningOptions = {
      signatureAlgorithm: "sha256",
      digestAlgorithm: "sha256",
      privateKey: signingKey,
    };
    const result = signSamlPost(xml, "/SAMLRequest", options);
    result.should.match(
      /<SignatureMethod Algorithm="http:\/\/www.w3.org\/2001\/04\/xmldsig-more#rsa-sha256"/
    );
    result.should.match(/<Transform Algorithm="http:\/\/www.w3.org\/2001\/10\/xml-exc-c14n#"\/>/);
    result.should.match(
      /<Transform Algorithm="http:\/\/www.w3.org\/2000\/09\/xmldsig#enveloped-signature"\/>/
    );
    result.should.match(
      /<DigestMethod Algorithm="http:\/\/www.w3.org\/2001\/04\/xmlenc#sha256"\/>/
    );
  });

  it("should sign and digest with SHA256 when specified and using privateKey", function () {
    const xml =
      '<SAMLRequest><saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://example.com</saml2:Issuer></SAMLRequest>';
    const options: SamlSigningOptions = {
      signatureAlgorithm: "sha256",
      digestAlgorithm: "sha256",
      privateKey: signingKey,
    };
    const result = signSamlPost(xml, "/SAMLRequest", options);
    result.should.match(
      /<SignatureMethod Algorithm="http:\/\/www.w3.org\/2001\/04\/xmldsig-more#rsa-sha256"/
    );
    result.should.match(/<Transform Algorithm="http:\/\/www.w3.org\/2001\/10\/xml-exc-c14n#"\/>/);
    result.should.match(
      /<Transform Algorithm="http:\/\/www.w3.org\/2000\/09\/xmldsig#enveloped-signature"\/>/
    );
    result.should.match(
      /<DigestMethod Algorithm="http:\/\/www.w3.org\/2001\/04\/xmlenc#sha256"\/>/
    );
  });

  it("should sign an AuthnRequest", function () {
    const xml =
      '<AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol"><saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://example.com</saml2:Issuer></AuthnRequest>';
    const result = signAuthnRequestPost(xml, { privateKey: signingKey });
    result.should.match(/<DigestValue>[A-Za-z0-9/+=]+<\/DigestValue>/);
    result.should.match(/<SignatureValue>[A-Za-z0-9/+=]+<\/SignatureValue>/);
  });
});
