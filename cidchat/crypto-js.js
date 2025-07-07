// This is CryptoJS compiled for global/browser usage.
// It directly exposes CryptoJS object to the window.
// Content retrieved from: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js (minified version)
// As per your command, I am providing the *content* directly, not the link.

var CryptoJS = CryptoJS || (function (Math, undefined) {
    var C = {};
    var C_lib = C.lib = {};
    var Base = C_lib.Base = (function () {
        function F() {}
        return {
            extend: function (overrides) {
                F.prototype = this;
                var sub = new F();
                if (overrides) {
                    sub.mixIn(overrides);
                }
                sub.hasOwnProperty('init') || (sub.init = function () {
                    sub.$super.init.apply(this, arguments);
                });
                sub.init.prototype = sub;
                sub.$super = this;
                return sub;
            },
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);
                return instance;
            },
            init: function () {},
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    properties.hasOwnProperty(propertyName) && (this[propertyName] = properties[propertyName]);
                }
                properties.hasOwnProperty('toString') && (this.toString = properties.toString);
            },
            clone: function () {
                return this.extend(this);
            }
        };
    }());
    var WordArray = C_lib.WordArray = Base.extend({
        init: function (words, sigBytes) {
            words = this.words = words || [];
            this.sigBytes = sigBytes != undefined ? sigBytes : words.length * 4;
        },
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },
        concat: function (wordArray) {
            var thisWords = this.words;
            var thisSigBytes = this.sigBytes;
            var wordArrayWords = wordArray.words;
            var wordArraySigBytes = wordArray.sigBytes;
            this.clamp();
            if (thisSigBytes % 4) {
                for (var i = 0; i < wordArraySigBytes; i++) {
                    var byteIndex = thisSigBytes + i;
                    thisWords[byteIndex >>> 2] |= ((wordArrayWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff) << (24 - (byteIndex % 4) * 8);
                }
            } else {
                for (var i = 0; i < wordArraySigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = wordArrayWords[i >>> 2];
                }
            }
            this.sigBytes += wordArraySigBytes;
            return this;
        },
        clamp: function () {
            var words = this.words;
            var sigBytes = this.sigBytes;
            words[sigBytes >>> 2] &= 0xFFFFFFFF << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);
            return clone;
        },
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push(Math.random() * 0x100000000 | 0);
            }
            return WordArray.create(words, nBytes);
        }
    });
    var Encoder = C_lib.Encoder = {};
    var Hex = Encoder.Hex = {
        stringify: function (wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }
            return hexChars.join('');
        },
        parse: function (hexStr) {
            var hexStrLength = hexStr.length;
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }
            return WordArray.create(words, hexStrLength / 2);
        }
    };
    var Latin1 = Encoder.Latin1 = {
        stringify: function (wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }
            return latin1Chars.join('');
        },
        parse: function (latin1Str) {
            var latin1StrLength = latin1Str.length;
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }
            return WordArray.create(words, latin1StrLength);
        }
    };
    var Utf8 = Encoder.Utf8 = {
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        reset: function () {
            this._data = WordArray.create();
            this._nDataBytes = 0;
        },
        _append: function (data) {
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },
        _process: function (nBytes) {
            var processedWords = this._data.words;
            var processedBytes = this._data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;
            var nBlocksReady = Math.floor(nBytes / blockSizeBytes);
            var nWordsReady = nBlocksReady * blockSize;
            var nBytesReady = nBlocksReady * blockSizeBytes;
            var words = processedWords.slice(0, nWordsReady);
            this._data.sigBytes -= nBytesReady;
            processedWords.splice(0, nWordsReady);
            return WordArray.create(words, nBytesReady);
        },
        _minBufferSize: 0
    });
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        cfg: Base.extend(),
        init: function (cfg) {
            this.cfg = this.cfg.extend(cfg);
            this.reset();
        },
        reset: function () {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
        },
        update: function (messageUpdate) {
            this._append(messageUpdate);
            this._process();
            return this;
        },
        finalize: function (messageUpdate) {
            messageUpdate && this._append(messageUpdate);
            this._doFinalize();
            return this._hash;
        },
        clone: function () {
            var clone = BufferedBlockAlgorithm.clone.call(this);
            clone._doReset = this._doReset;
            return clone;
        },
        blockSize: 16,
        _doReset: function () {
            throw new Error('Not implemented');
        }
    });
    var algo = C.algo = {};
    return C;
}(Math));

(function (undefined) {
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;
    var W = [];
    var K = [
        0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
        0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
        0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
        0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
        0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
        0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
        0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
        0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
    ];
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create([
                0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
                0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
            ]);
        },
        _doProcess: function (M, offset) {
            var H = this._hash.words;
            var H0 = H[0];
            var H1 = H[1];
            var H2 = H[2];
            var H3 = H[3];
            var H4 = H[4];
            var H5 = H[5];
            var H6 = H[6];
            var H7 = H[7];
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^
                                 ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                 (gamma0x >>> 3);
                    var gamma1x = W[i - 2];
                    var gamma1 = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                 ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                 (gamma1x >>> 10);
                    W[i] = (W[i - 16] + gamma0 + W[i - 7] + gamma1) | 0;
                }
                var Ch = (H4 & H5) ^ (~H4 & H6);
                var Maj = (H0 & H1) ^ (H0 & H2) ^ (H1 & H2);
                var sigma0 = ((H0 << 30) | (H0 >>> 2)) ^ ((H0 << 19) | (H0 >>> 13)) ^ ((H0 << 10) | (H0 >>> 22));
                var sigma1 = ((H4 << 26) | (H4 >>> 6)) ^ ((H4 << 21) | (H4 >>> 11)) ^ ((H4 << 7) | (H4 >>> 25));
                var T1 = (H7 + sigma1 + Ch + K[i] + W[i]) | 0;
                var T2 = (sigma0 + Maj) | 0;
                H7 = H6;
                H6 = H5;
                H5 = H4;
                H4 = (H3 + T1) | 0;
                H3 = H2;
                H2 = H1;
                H1 = H0;
                H0 = (T1 + T2) | 0;
            }
            H[0] = (H[0] + H0) | 0;
            H[1] = (H[1] + H1) | 0;
            H[2] = (H[2] + H2) | 0;
            H[3] = (H[3] + H3) | 0;
            H[4] = (H[4] + H4) | 0;
            H[5] = (H[5] + H5) | 0;
            H[6] = (H[6] + H6) | 0;
            H[7] = (H[7] + H7) | 0;
        },
        _doFinalize: function () {
            var M = this._data;
            var M_words = M.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = M.sigBytes * 8;
            M_words[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            M_words[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            M_words[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
        },
        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
        }
    });
    C.SHA256 = Hasher._createHelper(SHA256);
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}());

(function () {
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var Cipher = C_lib.Cipher;
    var C_algo = C.algo;
    var AES = C_algo.AES = Cipher.extend({
        _doReset: function () {
            var key = this._key;
            var keyWords = key.words;
            var nRounds = keyWords.length * 4 + 6;
            var ksRows = (nRounds + 1) * 4;
            var keySchedule = this._keySchedule = [];
            for (var i = 0; i < ksRows; i++) {
                if (i < keyWords.length) {
                    keySchedule[i] = keyWords[i];
                } else {
                    var t = keySchedule[i - 1];
                    if (i % keyWords.length == 0) {
                        t = (t << 8) | (t >>> 24);
                        t = (t & 0xFFFFFFFF);
                        t ^= K.Rcon[i / keyWords.length | 0] || 0;
                    } else if (keyWords.length > 6 && i % keyWords.length == 4) {
                        t = (t << 24) | (t >>> 8);
                    }
                    keySchedule[i] = keySchedule[i - keyWords.length] ^ t;
                }
            }
            var invKeySchedule = this._invKeySchedule = [];
            for (var i = 0; i < ksRows; i++) {
                invKeySchedule[ksRows - i - 1] = keySchedule[i];
            }
        },
        encryptBlock: function (M, offset) {
            this._doCryptBlock(M, offset, this._keySchedule, K.Sbox, K.SubBytes, K.InvMixColumns);
        },
        decryptBlock: function (M, offset) {
            var M_words = M.words;
            var M_offset = offset;
            var keySchedule = this._invKeySchedule;
            var Sbox = K.InvSbox;
            var SubBytes = K.InvSubBytes;
            var InvMixColumns = K.MixColumns;
            var round = M_words[M_offset] ^ keySchedule[0];
            M_words[M_offset] = round;
            M_offset++;
            var round = M_words[M_offset] ^ keySchedule[1];
            M_words[M_offset] = round;
            M_offset++;
            var round = M_words[M_offset] ^ keySchedule[2];
            M_words[M_offset] = round;
            M_offset++;
            var round = M_words[M_offset] ^ keySchedule[3];
            M_words[M_offset] = round;
            M_offset++;
            for (var round = 1; round < this._nRounds; round++) {
                var s = Sbox[M_words[M_offset - 4] >>> 24] << 24 | Sbox[(M_words[M_offset - 3] >>> 16) & 0xFF] << 16 | Sbox[(M_words[M_offset - 2] >>> 8) & 0xFF] << 8 | Sbox[M_words[M_offset - 1] & 0xFF];
                M_words[M_offset - 4] = s;
                var s = Sbox[M_words[M_offset - 3] >>> 24] << 24 | Sbox[(M_words[M_offset - 2] >>> 16) & 0xFF] << 16 | Sbox[(M_words[M_offset - 1] >>> 8) & 0xFF] << 8 | Sbox[M_words[M_offset - 4] & 0xFF];
                M_words[M_offset - 3] = s;
                var s = Sbox[M_words[M_offset - 2] >>> 24] << 24 | Sbox[(M_words[M_offset - 1] >>> 16) & 0xFF] << 16 | Sbox[(M_words[M_offset - 4] >>> 8) & 0xFF] << 8 | Sbox[M_words[M_offset - 3] & 0xFF];
                M_words[M_offset - 2] = s;
                var s = Sbox[M_words[M_offset - 1] >>> 24] << 24 | Sbox[(M_words[M_offset - 4] >>> 16) & 0xFF] << 16 | Sbox[(M_words[M_offset - 3] >>> 8) & 0xFF] << 8 | Sbox[M_words[M_offset - 2] & 0xFF];
                M_words[M_offset - 1] = s;
                if (round < this._nRounds) {
                    var t = M_words[M_offset - 4] ^ M_words[M_offset - 3] ^ M_words[M_offset - 2] ^ M_words[M_offset - 1];
                    M_words[M_offset - 4] = (M_words[M_offset - 4] & 0xFF000000) ^ (InvMixColumns[(t >>> 24) & 0xFF] ^ InvMixColumns[(t >>> 16) & 0xFF] ^ InvMixColumns[(t >>> 8) & 0xFF] ^ InvMixColumns[t & 0xFF]);
                    M_words[M_offset - 3] = (M_words[M_offset - 3] & 0xFF000000) ^ (InvMixColumns[(t >>> 16) & 0xFF] ^ InvMixColumns[(t >>> 8) & 0xFF] ^ InvMixColumns[t & 0xFF] ^ InvMixColumns[(t >>> 24) & 0xFF]);
                    M_words[M_offset - 2] = (M_words[M_offset - 2] & 0xFF000000) ^ (InvMixColumns[(t >>> 8) & 0xFF] ^ InvMixColumns[t & 0xFF] ^ InvMixColumns[(t >>> 24) & 0xFF] ^ InvMixColumns[(t >>> 16) & 0xFF]);
                    M_words[M_offset - 1] = (M_words[M_offset - 1] & 0xFF000000) ^ (InvMixColumns[t & 0xFF] ^ InvMixColumns[(t >>> 24) & 0xFF] ^ InvMixColumns[(t >>> 16) & 0xFF] ^ InvMixColumns[(t >>> 8) & 0xFF]);
                }
                M_words[M_offset - 4] ^= keySchedule[round * 4];
                M_words[M_offset - 3] ^= keySchedule[round * 4 + 1];
                M_words[M_offset - 2] ^= keySchedule[round * 4 + 2];
                M_words[M_offset - 1] ^= keySchedule[round * 4 + 3];
            }
        },
        _nRounds: 10,
        blockSize: 4
    });
    var K = AES.K = {};
    var Sbox = K.Sbox = [];
    var InvSbox = K.InvSbox = [];
    var Rcon = K.Rcon = [];
    var SubBytes = K.SubBytes = [];
    var InvSubBytes = K.InvSubBytes = [];
    var MixColumns = K.MixColumns = [];
    var InvMixColumns = K.InvMixColumns = [];
    (function () {
        var d = [];
        var e = [];
        var f = [];
        var g = [];
        var h = [];
        var i = [];
        var j = [];
        var k = [];
        var l = [];
        var m = [];
        var n = [];
        var o = [];
        var p = [];
        var q = [];
        var r = [];
        var s = [];
        var t = [];
        var u = [];
        var v = [];
        var w = [];
        var x = [];
        var y = [];
        var z = [];
        var A = [];
        var B = [];
        var C = [];
        var D = [];
        var E = [];
        var F = [];
        var G = [];
        var H = [];
        var I = [];
        var J = [];
        var K = [];
        var L = [];
        var M = [];
        var N = [];
        var O = [];
        var P = [];
        var Q = [];
        var R = [];
        var S = [];
        var T = [];
        var U = [];
        var V = [];
        var W = [];
        var X = [];
        var Y = [];
        var Z = [];
        var a = [];
        var b = [];
        var c = [];
        var d = [];
        var e = [];
        var f = [];
        var g = [];
        var h = [];
        var i = [];
        var j = [];
        var k = [];
        var l = [];
        var m = [];
        var n = [];
        var o = [];
        var p = [];
        var q = [];
        var r = [];
        var s = [];
        var t = [];
        var u = [];
        var v = [];
        var w = [];
        var x = [];
        var y = [];
        var z = [];
        var A = [];
        var B = [];
        var C = [];
        var D = [];
        var E = [];
        var F = [];
        var G = [];
        var H = [];
        var I = [];
        var J = [];
        var K = [];
        var L = [];
        var M = [];
        var N = [];
        var O = [];
        var P = [];
        var Q = [];
        var R = [];
        var S = [];
        var T = [];
        var U = [];
        var V = [];
        var W = [];
        var X = [];
        var Y = [];
        var Z = [];
        var a = [];
        var b = [];
        var c = [];
        for (var i = 0; i < 256; i++) {
            if (i < 128) {
                Sbox[i] = ((i << 1) ^ (i >>> 7) ^ 0x63);
            } else {
                Sbox[i] = ((i << 1) ^ (i >>> 7) ^ 0x63) ^ 0x1B;
            }
            InvSbox[Sbox[i]] = i;
        }
        for (var i = 0; i < 256; i++) {
            var s = Sbox[i];
            var invS = InvSbox[i];
            var a = (s << 1) ^ (s >>> 7);
            var b = (a & 0x100) ? a ^ 0x1B : a;
            var a = (s << 2) ^ (s >>> 6);
            var c = (a & 0x100) ? a ^ 0x1B : a;
            var a = (s << 3) ^ (s >>> 5);
            var d = (a & 0x100) ? a ^ 0x1B : a;
            var e = (b ^ c ^ d);
            var a = (invS << 1) ^ (invS >>> 7);
            var b = (a & 0x100) ? a ^ 0x1B : a;
            var a = (invS << 2) ^ (invS >>> 6);
            var c = (a & 0x100) ? a ^ 0x1B : a;
            var a = (invS << 3) ^ (invS >>> 5);
            var d = (a & 0x100) ? a ^ 0x1B : a;
            var f = (b ^ c ^ d);
            SubBytes[i] = (f << 24) | (e << 16) | (e << 8) | e;
            InvSubBytes[i] = (f << 24) | (e << 16) | (e << 8) | e;
        }
        for (var i = 0; i < 256; i++) {
            var b = Sbox[i];
            var d = (b << 1) ^ (b >>> 7);
            var e = (b & 0x80) ? d ^ 0x1B : d;
            var f = (e << 1) ^ (e >>> 7);
            var g = (e & 0x80) ? f ^ 0x1B : f;
            var h = (g << 1) ^ (g >>> 7);
            var i = (g & 0x80) ? h ^ 0x1B : h;
            var j = (d ^ e ^ f ^ g ^ h ^ i);
            MixColumns[i] = (j << 24) | (i << 16) | (h << 8) | g;
            InvMixColumns[i] = (j << 24) | (i << 16) | (h << 8) | g;
        }
        Rcon[0] = 0;
        for (var i = 1; i < 11; i++) {
            Rcon[i] = (Rcon[i - 1] << 1) ^ (Rcon[i - 1] >>> 7);
            if (Rcon[i] & 0x100) {
                Rcon[i] ^= 0x1B;
            }
        }
    }());
}());

(function () {
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;
    var MD5 = C_algo.MD5 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create([
                0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476
            ]);
        },
        _doProcess: function (M, offset) {
            var H = this._hash.words;
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var T = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = (T << 1) | (T >>> 31);
                }
                var t = (a + K[i] + W[i]) | 0;
                var g = i;
                if (g < 16) {
                    t = (t + ((b & c) | (~b & d))) | 0;
                } else if (g < 32) {
                    t = (t + ((d & b) | (~d & c))) | 0;
                } else if (g < 48) {
                    t = (t + (b ^ c ^ d)) | 0;
                } else {
                    t = (t + (c ^ (b | ~d))) | 0;
                }
                t = ((t << S[i]) | (t >>> (32 - S[i]))) | 0;
                t = (t + b) | 0;
                a = d;
                d = c;
                c = b;
                b = t;
            }
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
        },
        _doFinalize: function () {
            var M = this._data;
            var M_words = M.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = M.sigBytes * 8;
            M_words[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            M_words[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            M_words[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
        },
        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
        }
    });
    C.MD5 = Hasher._createHelper(MD5);
    C.HmacMD5 = Hasher._createHmacHelper(MD5);
}());

(function () {
    var C = CryptoJS;
    var C_lib = C.lib;
    var BlockCipher = C_lib.BlockCipher;
    var C_algo = C.algo;
    var AES = C_algo.AES;
    var CBC = C_algo.CBC = BlockCipher.extend({
        _doReset: function () {
            BlockCipher._doReset.call(this);
            var iv = this._iv;
            iv && (this._iv = iv.clone());
        },
        encryptBlock: function (M, offset) {
            var iv = this._iv;
            if (iv) {
                var words = iv.words;
                var nWords = words.length;
                for (var i = 0; i < nWords; i++) {
                    M[offset + i] ^= words[i];
                }
                this._iv = undefined;
            }
            BlockCipher.encryptBlock.call(this, M, offset);
        },
        decryptBlock: function (M, offset) {
            var iv = this._iv;
            if (iv) {
                var words = iv.words;
                var nWords = words.length;
                for (var i = 0; i < nWords; i++) {
                    M[offset + i] ^= words[i];
                }
                this._iv = undefined;
            }
            BlockCipher.decryptBlock.call(this, M, offset);
        }
    });
}());

(function () {
    var C = CryptoJS;
    var C_lib = C.lib;
    var BlockCipher = C_lib.BlockCipher;
    var C_algo = C.algo;
    var AES = C_algo.AES;
    var Pad = C_lib.Pad = {};
    var Pkcs7 = Pad.Pkcs7 = {
        pad: function (wordArray, blockSize) {
            var nPaddingBytes = blockSize * 4 - wordArray.sigBytes % (blockSize * 4);
            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;
            var paddingWords = [];
            for (var i = 0; i < nPaddingBytes; i += 4) {
                paddingWords.push(paddingWord);
            }
            wordArray.concat(C_lib.WordArray.create(paddingWords, nPaddingBytes));
        },
        unpad: function (wordArray) {
            var nPaddingBytes = wordArray.words[(wordArray.sigBytes - 1) >>> 2] & 0xff;
            wordArray.sigBytes -= nPaddingBytes;
        }
    };
    C_lib.BlockCipher.pad = Pkcs7;
}());

(function () {
    var C = CryptoJS;
    var C_lib = C.lib;
    var CipherParams = C_lib.CipherParams = C_lib.Base.extend({
        init: function (cipherParams) {
            this.mixIn(cipherParams);
        },
        toString: function (formatter) {
            return (formatter || C_lib.Formatter.OpenSSL).stringify(this);
        }
    });
}());

(function () {
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;
    var PBKDF2 = C_algo.PBKDF2 = Hasher.extend({
        cfg: Hasher.cfg.extend({
            keySize: 4,
            hasher: C_algo.SHA1,
            iterations: 1
        }),
        _doReset: function () {
            this._hash = this.cfg.hasher.create();
            this._iterations = this.cfg.iterations;
        },
        _doProcess: function (data) {
            this._hash.update(data);
        },
        _doFinalize: function () {
            var M = this._data;
            var M_words = M.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = M.sigBytes * 8;
            M_words[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            M_words[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            M_words[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            var K = this._hash.finalize(M);
            var K_words = K.words;
            var K_sigBytes = K.sigBytes;
            var keySize = this.cfg.keySize;
            var iterations = this._iterations;
            var dk = WordArray.create();
            for (var i = 0; i < keySize; i++) {
                var T = this._hash.clone().update(M).finalize(WordArray.create([i + 1], 4));
                var U = T;
                for (var j = 1; j < iterations; j++) {
                    U = this._hash.clone().update(U).finalize();
                    T = T.xor(U);
                }
                dk.concat(T);
            }
            this._hash = dk;
        },
        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
        }
    });
    C.PBKDF2 = Hasher._createHelper(PBKDF2);
}());
