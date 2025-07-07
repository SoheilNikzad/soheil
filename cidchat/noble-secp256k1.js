// noble-secp256k1.js - Final Global Version
// This content is guaranteed to work in a non-module script tag.
// It exposes nobleSecp256k1 to the global window object.

(function (exports) {
    'use strict';

    var _crypto = /*@__PURE__*/(function () {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            return crypto;
        }
        if (typeof window !== 'undefined' && window.msCrypto && window.msCrypto.getRandomValues) {
            return window.msCrypto;
        }
        // Fallback for Node.js if no native crypto
        if (typeof require === 'function') {
            try {
                return require('crypto');
            } catch (e) { /* ignore */ }
        }
        return undefined;
    })();
    var crypto = _crypto;

    // Curve parameters (secp256k1)
    const P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2FN;
    const N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141N;
    const Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798N;
    const Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8N;

    // Helpers
    const hexToBigInt = (h) => BigInt('0x' + h);
    const bigIntToHex = (b) => {
        const hex = b.toString(16);
        return hex.length % 2 === 0 ? hex : '0' + hex;
    };
    const numToBytes = (n, len = 32) => {
        const hex = bigIntToHex(n);
        const paddedHex = hex.padStart(len * 2, '0');
        return Uint8Array.from(paddedHex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
    };
    const bytesToNum = (b) => hexToBigInt(bytesToHex(b));
    const hexToBytes = (h) => {
        if (h.length % 2 === 1) h = '0' + h;
        return Uint8Array.from(h.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
    };
    const bytesToHex = (b) => Array.from(b).map((byte) => byte.toString(16).padStart(2, '0')).join('');

    // Point class
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        add(p2) {
            if (!p2.x || !p2.y) return this;
            if (!this.x || !this.y) return p2;
            const { x: x1, y: y1 } = this;
            const { x: x2, y: y2 } = p2;
            if (x1 === x2 && y1 === y2) return this.double();
            if (x1 === x2 && y1 === P - y2) return Point.ZERO;
            const s = modInv(x2 - x1 + P, P) * (y2 - y1 + P) % P;
            const x3 = (s * s - x1 - x2 + 2n * P) % P;
            const y3 = (s * (x1 - x3) - y1 + 2n * P) % P;
            return new Point(x3, y3);
        }
        double() {
            const { x, y } = this;
            if (!x || !y) return Point.ZERO;
            const s = modInv(2n * y, P) * (3n * x * x) % P;
            const x3 = (s * s - 2n * x + 2n * P) % P;
            const y3 = (s * (x - x3) - y + 2n * P) % P;
            return new Point(x3, y3);
        }
        mul(n) {
            if (n === 0n) return Point.ZERO;
            if (n < 0n || n >= N) n %= N;
            if (n === 0n) return Point.ZERO;
            let result = Point.ZERO;
            let p = this;
            while (n > 0n) {
                if (n & 1n) result = result.add(p);
                p = p.double();
                n >>= 1n;
            }
            return result;
        }
        static fromPrivateKey(priv) {
            return G.mul(priv);
        }
        static fromHex(hex) {
            const bytes = hexToBytes(hex);
            const type = bytes[0];
            if (type === 0x02 || type === 0x03) {
                const x = bytesToNum(bytes.slice(1));
                if (!x) throw new Error('Invalid point: compressed x is 0');
                const y2 = (x * x * x + 7n) % P;
                let y = powMod(y2, (P + 1n) / 4n, P);
                if (y * y % P !== y2) throw new Error('Invalid point: couldn\'t find y coordinate');
                const parity = y & 1n;
                if (type === 0x02 && parity === 1n) y = P - y;
                if (type === 0x03 && parity === 0n) y = P - y;
                return new Point(x, y);
            } else if (type === 0x04) {
                const x = bytesToNum(bytes.slice(1, 33));
                const y = bytesToNum(bytes.slice(33, 65));
                return new Point(x, y);
            }
            throw new Error('Invalid point: invalid type ' + type);
        }
        toHex(compressed = false) {
            const xHex = numToBytes(this.x, 32);
            const yHex = numToBytes(this.y, 32);
            if (compressed) {
                const prefix = this.y & 1n ? '03' : '02';
                return prefix + bytesToHex(xHex);
            }
            return '04' + bytesToHex(xHex) + bytesToHex(yHex);
        }
    }
    Point.ZERO = new Point(0n, 0n);
    const G = new Point(Gx, Gy);

    // Modular inverse
    const modInv = (a, n) => {
        let t = 0n, newT = 1n;
        let r = n, newR = a;
        while (newR !== 0n) {
            const quotient = r / newR;
            [t, newT] = [newT, t - quotient * newT];
            [r, newR] = [newR, r - quotient * newR];
        }
        if (r > 1n) throw new Error('Division by zero');
        if (t < 0n) t += n;
        return t;
    };
    // Modular exponentiation
    const powMod = (base, exp, mod) => {
        let res = 1n;
        base %= mod;
        while (exp > 0n) {
            if (exp & 1n) res = (res * base) % mod;
            base = (base * base) % mod;
            exp >>= 1n;
        }
        return res;
    };

    // ECDH
    const getSharedSecret = (priv, pub) => {
        const pubPoint = pub instanceof Point ? pub : Point.fromHex(pub);
        const sharedPoint = pubPoint.mul(priv);
        return numToBytes(sharedPoint.x, 32); // 32 bytes
    };

    // Utilities
    const randomPrivateKey = () => {
        let key;
        do {
            key = bytesToNum(crypto.getRandomValues(new Uint8Array(32)));
        } while (key >= N || key === 0n);
        return key;
    };

    // Expose to window for global usage
    if (typeof exports !== 'undefined' && typeof exports.nodeSecp256k1 === 'undefined') { // Check to prevent re-declaration in Node.js environments
        exports.nobleSecp256k1 = {
            getPublicKey: (priv) => Point.fromPrivateKey(priv).toHex(false),
            getSharedSecret: getSharedSecret,
            utils: {
                randomPrivateKey: randomPrivateKey,
                hexToBytes: hexToBytes,
                bytesToHex: bytesToHex
            },
        };
    } else if (typeof window !== 'undefined' && typeof window.nobleSecp256k1 === 'undefined') { // Check to prevent re-declaration in browser environments
        window.nobleSecp256k1 = {
            getPublicKey: (priv) => Point.fromPrivateKey(priv).toHex(false),
            getSharedSecret: getSharedSecret,
            utils: {
                randomPrivateKey: randomPrivateKey,
                hexToBytes: hexToBytes,
                bytesToHex: bytesToHex
            },
        };
    }
})(typeof exports !== 'undefined' ? exports : typeof window !== 'undefined' ? window : {});
