import assert from "assert";
import val from "../libs/unalib.js";

describe("unalib - Pruebas Simplificadas", function(){
  
  describe("Validación Básica", function(){
    it("deberia validar teléfonos", function(){
      assert.equal(val.is_valid_phone("8297-8547"), true);
      assert.equal(val.is_valid_phone("8297p-8547"), false);
    });

    it("deberia validar imágenes", function(){
      assert.equal(val.is_valid_url_image("http://www.w3.org/html/logo/img/mark-word-icon.png"), true);
      assert.equal(val.is_valid_url_image("http://untrusted-domain.com/image.gif"), false);
    });

    it("deberia validar videos de YouTube", function(){
      assert.equal(val.is_valid_yt_video("https://www.youtube.com/watch?v=qYwlqx-JLok"), true);
    });
  });

  describe("Seguridad XSS", function(){
    it("debería detectar patrones maliciosos", function(){
      assert.equal(val.containsMaliciousPatterns("javascript:alert()"), true);
      assert.equal(val.containsMaliciousPatterns("https://www.w3.org/image.jpg"), false);
    });

    it("debería sanitizar HTML", function(){
      assert.equal(val.sanitizeHtml("<script>"), "&lt;script&gt;");
    });

    it("debería validar dominios", function(){
      assert.equal(val.isDomainTrusted("https://www.youtube.com/watch"), true);
      assert.equal(val.isDomainTrusted("https://fake-youtube.com/"), false);
    });
  });

  
});
