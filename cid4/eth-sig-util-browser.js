window.ethSigUtil = {
  encrypt: function(publicKey, dataObj, version) {
    if (!window.nacl || !window.naclUtil) {
      throw new Error("nacl or naclUtil not loaded in window.");
    }

    const nacl = window.nacl;
    const naclUtil = window.naclUtil;

    const ephemKeyPair = nacl.box.keyPair();
    const msgParams = naclUtil.decodeUTF8(dataObj.data);
    const nonce = nacl.randomBytes(24);
    const encryptedMessage = nacl.box(
      msgParams,
      nonce,
      naclUtil.decodeBase64(publicKey),
      ephemKeyPair.secretKey
    );

    return {
      version: version,
      ephemPublicKey: naclUtil.encodeBase64(ephemKeyPair.publicKey),
      nonce: naclUtil.encodeBase64(nonce),
      ciphertext: naclUtil.encodeBase64(encryptedMessage)
    };
  }
};
