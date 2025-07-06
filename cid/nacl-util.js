// nacl-util.js - safe for browser
(function () {
  function checkBytes(x, name) {
    if (!(x instanceof Uint8Array))
      throw new TypeError(name + " must be a Uint8Array.");
  }

  var util = {
    encodeUTF8: function (arr) {
      checkBytes(arr, "encodeUTF8");
      return new TextDecoder("utf-8").decode(arr);
    },

    decodeUTF8: function (str) {
      if (typeof str !== "string") throw new TypeError("decodeUTF8 expects a string.");
      return new TextEncoder().encode(str);
    },

    encodeBase64: function (arr) {
      checkBytes(arr, "encodeBase64");
      if (typeof btoa === "undefined") {
        throw new Error("btoa not available");
      }
      var bin = "";
      for (var i = 0; i < arr.length; i++) {
        bin += String.fromCharCode(arr[i]);
      }
      return btoa(bin);
    },

    decodeBase64: function (str) {
      if (typeof str !== "string") throw new TypeError("decodeBase64 expects a string.");
      if (typeof atob === "undefined") {
        throw new Error("atob not available");
      }
      var bin = atob(str);
      var len = bin.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = util;
  } else {
    window.naclUtil = util;
  }
})();
