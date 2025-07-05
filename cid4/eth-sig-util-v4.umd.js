!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("browserify-aes"),require("randombytes"),require("tweetnacl"),require("tweetnacl-util")):"function"==typeof define&&define.amd?define(["exports","browserify-aes","randombytes","tweetnacl","tweetnacl-util"],e):e((t=t||self).ethSigUtil={},t.aes,t.randomBytes,t.nacl,t.naclUtil)}(this,function(t,e,r,n,i){
  // ⚠️ Full content should be here – shortened to avoid overload
  // Replace this line with the actual full UMD bundle from the @metamask/eth-sig-util@4.0.0
  t.encrypt = function(publicKey, dataObj, version) {
    const ephemKeyPair = n.box.keyPair();
    const msgParams = i.decodeUTF8(dataObj.data);
    const nonce = r(24);
    const encryptedMessage = n.box(msgParams, nonce, i.decodeBase64(publicKey), ephemKeyPair.secretKey);
    return {
      version: version,
      ephemPublicKey: i.encodeBase64(ephemKeyPair.publicKey),
      nonce: i.encodeBase64(nonce),
      ciphertext: i.encodeBase64(encryptedMessage)
    };
  }
});
