/*!
 * eth-sig-util v4.0.0 - placeholder stub
 * This is a placeholder. Replace with the actual contents from:
 * https://unpkg.com/@metamask/eth-sig-util@4.0.0/dist/index.umd.js
 */
window.ethSigUtil = {
  encrypt: function(publicKey, dataObj, version) {
    console.log("Stub encrypt called");
    return {
      version: version,
      ephemPublicKey: '...',
      nonce: '...',
      ciphertext: btoa(dataObj.data)
    };
  }
};
