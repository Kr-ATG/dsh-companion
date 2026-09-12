// src/host/mp/lib/auth.js
import { randomBytes as randomBytes2 } from "node:crypto";
import { join as join2 } from "node:path";

// src/host/mp/qrcodegen.js
var qrcodegen;
((qrcodegen2) => {
  const _QrCode = class _QrCode2 {
    /*-- Constructor (low level) and fields --*/
    // Creates a new QR Code with the given version number,
    // error correction level, data codeword bytes, and mask number.
    // This is a low-level API that most users should not use directly.
    // A mid-level API is the encodeSegments() function.
    constructor(version, errorCorrectionLevel, dataCodewords, msk) {
      this.version = version;
      this.errorCorrectionLevel = errorCorrectionLevel;
      this.modules = [];
      this.isFunction = [];
      if (version < _QrCode2.MIN_VERSION || version > _QrCode2.MAX_VERSION)
        throw new RangeError("Version value out of range");
      if (msk < -1 || msk > 7)
        throw new RangeError("Mask value out of range");
      this.size = version * 4 + 17;
      let row = [];
      for (let i = 0; i < this.size; i++)
        row.push(false);
      for (let i = 0; i < this.size; i++) {
        this.modules.push(row.slice());
        this.isFunction.push(row.slice());
      }
      this.drawFunctionPatterns();
      const allCodewords = this.addEccAndInterleave(dataCodewords);
      this.drawCodewords(allCodewords);
      if (msk == -1) {
        let minPenalty = 1e9;
        for (let i = 0; i < 8; i++) {
          this.applyMask(i);
          this.drawFormatBits(i);
          const penalty = this.getPenaltyScore();
          if (penalty < minPenalty) {
            msk = i;
            minPenalty = penalty;
          }
          this.applyMask(i);
        }
      }
      assert(0 <= msk && msk <= 7);
      this.mask = msk;
      this.applyMask(msk);
      this.drawFormatBits(msk);
      this.isFunction = [];
    }
    /*-- Static factory functions (high level) --*/
    // Returns a QR Code representing the given Unicode text string at the given error correction level.
    // As a conservative upper bound, this function is guaranteed to succeed for strings that have 738 or fewer
    // Unicode code points (not UTF-16 code units) if the low error correction level is used. The smallest possible
    // QR Code version is automatically chosen for the output. The ECC level of the result may be higher than the
    // ecl argument if it can be done without increasing the version.
    static encodeText(text, ecl) {
      const segs = qrcodegen2.QrSegment.makeSegments(text);
      return _QrCode2.encodeSegments(segs, ecl);
    }
    // Returns a QR Code representing the given binary data at the given error correction level.
    // This function always encodes using the binary segment mode, not any text mode. The maximum number of
    // bytes allowed is 2953. The smallest possible QR Code version is automatically chosen for the output.
    // The ECC level of the result may be higher than the ecl argument if it can be done without increasing the version.
    static encodeBinary(data, ecl) {
      const seg = qrcodegen2.QrSegment.makeBytes(data);
      return _QrCode2.encodeSegments([seg], ecl);
    }
    /*-- Static factory functions (mid level) --*/
    // Returns a QR Code representing the given segments with the given encoding parameters.
    // The smallest possible QR Code version within the given range is automatically
    // chosen for the output. Iff boostEcl is true, then the ECC level of the result
    // may be higher than the ecl argument if it can be done without increasing the
    // version. The mask number is either between 0 to 7 (inclusive) to force that
    // mask, or -1 to automatically choose an appropriate mask (which may be slow).
    // This function allows the user to create a custom sequence of segments that switches
    // between modes (such as alphanumeric and byte) to encode text in less space.
    // This is a mid-level API; the high-level API is encodeText() and encodeBinary().
    static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
      if (!(_QrCode2.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= _QrCode2.MAX_VERSION) || mask < -1 || mask > 7)
        throw new RangeError("Invalid value");
      let version;
      let dataUsedBits;
      for (version = minVersion; ; version++) {
        const dataCapacityBits2 = _QrCode2.getNumDataCodewords(version, ecl) * 8;
        const usedBits = QrSegment.getTotalBits(segs, version);
        if (usedBits <= dataCapacityBits2) {
          dataUsedBits = usedBits;
          break;
        }
        if (version >= maxVersion)
          throw new RangeError("Data too long");
      }
      for (const newEcl of [_QrCode2.Ecc.MEDIUM, _QrCode2.Ecc.QUARTILE, _QrCode2.Ecc.HIGH]) {
        if (boostEcl && dataUsedBits <= _QrCode2.getNumDataCodewords(version, newEcl) * 8)
          ecl = newEcl;
      }
      let bb = [];
      for (const seg of segs) {
        appendBits(seg.mode.modeBits, 4, bb);
        appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
        for (const b of seg.getData())
          bb.push(b);
      }
      assert(bb.length == dataUsedBits);
      const dataCapacityBits = _QrCode2.getNumDataCodewords(version, ecl) * 8;
      assert(bb.length <= dataCapacityBits);
      appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
      appendBits(0, (8 - bb.length % 8) % 8, bb);
      assert(bb.length % 8 == 0);
      for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 236 ^ 17)
        appendBits(padByte, 8, bb);
      let dataCodewords = [];
      while (dataCodewords.length * 8 < bb.length)
        dataCodewords.push(0);
      bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
      return new _QrCode2(version, ecl, dataCodewords, mask);
    }
    /*-- Accessor methods --*/
    // Returns the color of the module (pixel) at the given coordinates, which is false
    // for light or true for dark. The top left corner has the coordinates (x=0, y=0).
    // If the given coordinates are out of bounds, then false (light) is returned.
    getModule(x, y) {
      return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
    }
    // Modified to expose modules for easy access
    getModules() {
      return this.modules;
    }
    /*-- Private helper methods for constructor: Drawing function modules --*/
    // Reads this object's version field, and draws and marks all function modules.
    drawFunctionPatterns() {
      for (let i = 0; i < this.size; i++) {
        this.setFunctionModule(6, i, i % 2 == 0);
        this.setFunctionModule(i, 6, i % 2 == 0);
      }
      this.drawFinderPattern(3, 3);
      this.drawFinderPattern(this.size - 4, 3);
      this.drawFinderPattern(3, this.size - 4);
      const alignPatPos = this.getAlignmentPatternPositions();
      const numAlign = alignPatPos.length;
      for (let i = 0; i < numAlign; i++) {
        for (let j = 0; j < numAlign; j++) {
          if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
            this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
        }
      }
      this.drawFormatBits(0);
      this.drawVersion();
    }
    // Draws two copies of the format bits (with its own error correction code)
    // based on the given mask and this object's error correction level field.
    drawFormatBits(mask) {
      const data = this.errorCorrectionLevel.formatBits << 3 | mask;
      let rem = data;
      for (let i = 0; i < 10; i++)
        rem = rem << 1 ^ (rem >>> 9) * 1335;
      const bits = (data << 10 | rem) ^ 21522;
      assert(bits >>> 15 == 0);
      for (let i = 0; i <= 5; i++)
        this.setFunctionModule(8, i, getBit(bits, i));
      this.setFunctionModule(8, 7, getBit(bits, 6));
      this.setFunctionModule(8, 8, getBit(bits, 7));
      this.setFunctionModule(7, 8, getBit(bits, 8));
      for (let i = 9; i < 15; i++)
        this.setFunctionModule(14 - i, 8, getBit(bits, i));
      for (let i = 0; i < 8; i++)
        this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
      for (let i = 8; i < 15; i++)
        this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
      this.setFunctionModule(8, this.size - 8, true);
    }
    // Draws two copies of the version bits (with its own error correction code),
    // based on this object's version field, iff 7 <= version <= 40.
    drawVersion() {
      if (this.version < 7)
        return;
      let rem = this.version;
      for (let i = 0; i < 12; i++)
        rem = rem << 1 ^ (rem >>> 11) * 7973;
      const bits = this.version << 12 | rem;
      assert(bits >>> 18 == 0);
      for (let i = 0; i < 18; i++) {
        const color = getBit(bits, i);
        const a = this.size - 11 + i % 3;
        const b = Math.floor(i / 3);
        this.setFunctionModule(a, b, color);
        this.setFunctionModule(b, a, color);
      }
    }
    // Draws a 9*9 finder pattern including the border separator,
    // with the center module at (x, y). Modules can be out of bounds.
    drawFinderPattern(x, y) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const xx = x + dx;
          const yy = y + dy;
          if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
            this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
        }
      }
    }
    // Draws a 5*5 alignment pattern, with the center module
    // at (x, y). All modules must be in bounds.
    drawAlignmentPattern(x, y) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++)
          this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
      }
    }
    // Sets the color of a module and marks it as a function module.
    // Only used by the constructor. Coordinates must be in bounds.
    setFunctionModule(x, y, isDark) {
      this.modules[y][x] = isDark;
      this.isFunction[y][x] = true;
    }
    /*-- Private helper methods for constructor: Codewords and masking --*/
    // Returns a new byte string representing the given data with the appropriate error correction
    // codewords appended to it, based on this object's version and error correction level.
    addEccAndInterleave(data) {
      const ver = this.version;
      const ecl = this.errorCorrectionLevel;
      if (data.length != _QrCode2.getNumDataCodewords(ver, ecl))
        throw new RangeError("Invalid argument");
      const numBlocks = _QrCode2.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
      const blockEccLen = _QrCode2.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
      const rawCodewords = Math.floor(_QrCode2.getNumRawDataModules(ver) / 8);
      const numShortBlocks = numBlocks - rawCodewords % numBlocks;
      const shortBlockLen = Math.floor(rawCodewords / numBlocks);
      let blocks = [];
      const rsDiv = _QrCode2.reedSolomonComputeDivisor(blockEccLen);
      for (let i = 0, k = 0; i < numBlocks; i++) {
        let dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
        k += dat.length;
        const ecc = _QrCode2.reedSolomonComputeRemainder(dat, rsDiv);
        if (i < numShortBlocks)
          dat.push(0);
        blocks.push(dat.concat(ecc));
      }
      let result = [];
      for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((block, j) => {
          if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
            result.push(block[i]);
        });
      }
      assert(result.length == rawCodewords);
      return result;
    }
    // Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
    // data area of this QR Code. Function modules need to be marked off before this is called.
    drawCodewords(data) {
      if (data.length != Math.floor(_QrCode2.getNumRawDataModules(this.version) / 8))
        throw new RangeError("Invalid argument");
      let i = 0;
      for (let right = this.size - 1; right >= 1; right -= 2) {
        if (right == 6)
          right = 5;
        for (let vert = 0; vert < this.size; vert++) {
          for (let j = 0; j < 2; j++) {
            const x = right - j;
            const upward = (right + 1 & 2) == 0;
            const y = upward ? this.size - 1 - vert : vert;
            if (!this.isFunction[y][x] && i < data.length * 8) {
              this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
              i++;
            }
          }
        }
      }
      assert(i == data.length * 8);
    }
    // XORs the codeword modules in this QR Code with the given mask pattern.
    // The function modules must be marked and the codeword bits must be drawn
    // before masking. Due to the arithmetic of XOR, calling applyMask() with
    // the same mask value a second time will undo the mask. A final well-formed
    // QR Code needs exactly one (not zero, two, etc.) mask applied.
    applyMask(mask) {
      if (mask < 0 || mask > 7)
        throw new RangeError("Mask value out of range");
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          let invert;
          switch (mask) {
            case 0:
              invert = (x + y) % 2 == 0;
              break;
            case 1:
              invert = y % 2 == 0;
              break;
            case 2:
              invert = x % 3 == 0;
              break;
            case 3:
              invert = (x + y) % 3 == 0;
              break;
            case 4:
              invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
              break;
            case 5:
              invert = x * y % 2 + x * y % 3 == 0;
              break;
            case 6:
              invert = (x * y % 2 + x * y % 3) % 2 == 0;
              break;
            case 7:
              invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
              break;
            default:
              throw new Error("Unreachable");
          }
          if (!this.isFunction[y][x] && invert)
            this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
    // Calculates and returns the penalty score based on state of this QR Code's current modules.
    // This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
    getPenaltyScore() {
      let result = 0;
      for (let y = 0; y < this.size; y++) {
        let runColor = false;
        let runX = 0;
        let runHistory = [0, 0, 0, 0, 0, 0, 0];
        for (let x = 0; x < this.size; x++) {
          if (this.modules[y][x] == runColor) {
            runX++;
            if (runX == 5)
              result += _QrCode2.PENALTY_N1;
            else if (runX > 5)
              result++;
          } else {
            this.finderPenaltyAddHistory(runX, runHistory);
            if (!runColor)
              result += this.finderPenaltyCountPatterns(runHistory) * _QrCode2.PENALTY_N3;
            runColor = this.modules[y][x];
            runX = 1;
          }
        }
        result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * _QrCode2.PENALTY_N3;
      }
      for (let x = 0; x < this.size; x++) {
        let runColor = false;
        let runY = 0;
        let runHistory = [0, 0, 0, 0, 0, 0, 0];
        for (let y = 0; y < this.size; y++) {
          if (this.modules[y][x] == runColor) {
            runY++;
            if (runY == 5)
              result += _QrCode2.PENALTY_N1;
            else if (runY > 5)
              result++;
          } else {
            this.finderPenaltyAddHistory(runY, runHistory);
            if (!runColor)
              result += this.finderPenaltyCountPatterns(runHistory) * _QrCode2.PENALTY_N3;
            runColor = this.modules[y][x];
            runY = 1;
          }
        }
        result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * _QrCode2.PENALTY_N3;
      }
      for (let y = 0; y < this.size - 1; y++) {
        for (let x = 0; x < this.size - 1; x++) {
          const color = this.modules[y][x];
          if (color == this.modules[y][x + 1] && color == this.modules[y + 1][x] && color == this.modules[y + 1][x + 1])
            result += _QrCode2.PENALTY_N2;
        }
      }
      let dark = 0;
      for (const row of this.modules)
        dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
      const total = this.size * this.size;
      const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      assert(0 <= k && k <= 9);
      result += k * _QrCode2.PENALTY_N4;
      assert(0 <= result && result <= 2568888);
      return result;
    }
    /*-- Private helper functions --*/
    // Returns an ascending list of positions of alignment patterns for this version number.
    // Each position is in the range [0,177), and are used on both the x and y axes.
    // This could be implemented as lookup table of 40 variable-length lists of integers.
    getAlignmentPatternPositions() {
      if (this.version == 1)
        return [];
      else {
        const numAlign = Math.floor(this.version / 7) + 2;
        const step = this.version == 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
        let result = [6];
        for (let pos = this.size - 7; result.length < numAlign; pos -= step)
          result.splice(1, 0, pos);
        return result;
      }
    }
    // Returns the number of data bits that can be stored in a QR Code of the given version number, after
    // all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
    // The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
    static getNumRawDataModules(ver) {
      if (ver < _QrCode2.MIN_VERSION || ver > _QrCode2.MAX_VERSION)
        throw new RangeError("Version number out of range");
      let result = (16 * ver + 128) * ver + 64;
      if (ver >= 2) {
        const numAlign = Math.floor(ver / 7) + 2;
        result -= (25 * numAlign - 10) * numAlign - 55;
        if (ver >= 7)
          result -= 36;
      }
      assert(208 <= result && result <= 29648);
      return result;
    }
    // Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
    // QR Code of the given version number and error correction level, with remainder bits discarded.
    // This stateless pure function could be implemented as a (40*4)-cell lookup table.
    static getNumDataCodewords(ver, ecl) {
      return Math.floor(_QrCode2.getNumRawDataModules(ver) / 8) - _QrCode2.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * _QrCode2.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
    }
    // Returns a Reed-Solomon ECC generator polynomial for the given degree. This could be
    // implemented as a lookup table over all possible parameter values, instead of as an algorithm.
    static reedSolomonComputeDivisor(degree) {
      if (degree < 1 || degree > 255)
        throw new RangeError("Degree out of range");
      let result = [];
      for (let i = 0; i < degree - 1; i++)
        result.push(0);
      result.push(1);
      let root = 1;
      for (let i = 0; i < degree; i++) {
        for (let j = 0; j < result.length; j++) {
          result[j] = _QrCode2.reedSolomonMultiply(result[j], root);
          if (j + 1 < result.length)
            result[j] ^= result[j + 1];
        }
        root = _QrCode2.reedSolomonMultiply(root, 2);
      }
      return result;
    }
    // Returns the Reed-Solomon error correction codeword for the given data and divisor polynomials.
    static reedSolomonComputeRemainder(data, divisor) {
      let result = divisor.map((_) => 0);
      for (const b of data) {
        const factor = b ^ result.shift();
        result.push(0);
        divisor.forEach((coef, i) => result[i] ^= _QrCode2.reedSolomonMultiply(coef, factor));
      }
      return result;
    }
    // Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
    // are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
    static reedSolomonMultiply(x, y) {
      if (x >>> 8 != 0 || y >>> 8 != 0)
        throw new RangeError("Byte out of range");
      let z = 0;
      for (let i = 7; i >= 0; i--) {
        z = z << 1 ^ (z >>> 7) * 285;
        z ^= (y >>> i & 1) * x;
      }
      assert(z >>> 8 == 0);
      return z;
    }
    // Can only be called immediately after a light run is added, and
    // returns either 0, 1, or 2. A helper function for getPenaltyScore().
    finderPenaltyCountPatterns(runHistory) {
      const n = runHistory[1];
      assert(n <= this.size * 3);
      const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
      return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
    }
    // Must be called at the end of a line (row or column) of modules. A helper function for getPenaltyScore().
    finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
      if (currentRunColor) {
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        currentRunLength = 0;
      }
      currentRunLength += this.size;
      this.finderPenaltyAddHistory(currentRunLength, runHistory);
      return this.finderPenaltyCountPatterns(runHistory);
    }
    // Pushes the given value to the front and drops the last value. A helper function for getPenaltyScore().
    finderPenaltyAddHistory(currentRunLength, runHistory) {
      if (runHistory[0] == 0)
        currentRunLength += this.size;
      runHistory.pop();
      runHistory.unshift(currentRunLength);
    }
  };
  _QrCode.MIN_VERSION = 1;
  _QrCode.MAX_VERSION = 40;
  _QrCode.PENALTY_N1 = 3;
  _QrCode.PENALTY_N2 = 3;
  _QrCode.PENALTY_N3 = 40;
  _QrCode.PENALTY_N4 = 10;
  _QrCode.ECC_CODEWORDS_PER_BLOCK = [
    // Version: (note that index 0 is for padding, and is set to an illegal value)
    //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    // Low
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    // Medium
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    // Quartile
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
    // High
  ];
  _QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
    // Version: (note that index 0 is for padding, and is set to an illegal value)
    //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    // Low
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    // Medium
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    // Quartile
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
    // High
  ];
  let QrCode = _QrCode;
  qrcodegen2.QrCode = _QrCode;
  function appendBits(val, len, bb) {
    if (len < 0 || len > 31 || val >>> len != 0)
      throw new RangeError("Value out of range");
    for (let i = len - 1; i >= 0; i--)
      bb.push(val >>> i & 1);
  }
  function getBit(x, i) {
    return (x >>> i & 1) != 0;
  }
  function assert(cond) {
    if (!cond)
      throw new Error("Assertion error");
  }
  const _QrSegment = class _QrSegment2 {
    /*-- Constructor (low level) and fields --*/
    // Creates a new QR Code segment with the given attributes and data.
    // The character count (numChars) must agree with the mode and the bit buffer length,
    // but the constraint isn't checked. The given bit buffer is cloned and stored.
    constructor(mode, numChars, bitData) {
      this.mode = mode;
      this.numChars = numChars;
      this.bitData = bitData;
      if (numChars < 0)
        throw new RangeError("Invalid argument");
      this.bitData = bitData.slice();
    }
    /*-- Static factory functions (mid level) --*/
    // Returns a segment representing the given binary data encoded in
    // byte mode. All input byte arrays are acceptable. Any text string
    // can be converted to UTF-8 bytes and encoded as a byte mode segment.
    static makeBytes(data) {
      let bb = [];
      for (const b of data)
        appendBits(b, 8, bb);
      return new _QrSegment2(_QrSegment2.Mode.BYTE, data.length, bb);
    }
    // Returns a segment representing the given string of decimal digits encoded in numeric mode.
    static makeNumeric(digits) {
      if (!_QrSegment2.isNumeric(digits))
        throw new RangeError("String contains non-numeric characters");
      let bb = [];
      for (let i = 0; i < digits.length; ) {
        const n = Math.min(digits.length - i, 3);
        appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1, bb);
        i += n;
      }
      return new _QrSegment2(_QrSegment2.Mode.NUMERIC, digits.length, bb);
    }
    // Returns a segment representing the given text string encoded in alphanumeric mode.
    // The characters allowed are: 0 to 9, A to Z (uppercase only), space,
    // dollar, percent, asterisk, plus, hyphen, period, slash, colon.
    static makeAlphanumeric(text) {
      if (!_QrSegment2.isAlphanumeric(text))
        throw new RangeError("String contains unencodable characters in alphanumeric mode");
      let bb = [];
      let i;
      for (i = 0; i + 2 <= text.length; i += 2) {
        let temp = _QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
        temp += _QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
        appendBits(temp, 11, bb);
      }
      if (i < text.length)
        appendBits(_QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
      return new _QrSegment2(_QrSegment2.Mode.ALPHANUMERIC, text.length, bb);
    }
    // Returns a new mutable list of zero or more segments to represent the given Unicode text string.
    // The result may use various segment modes and switch modes to optimize the length of the bit stream.
    static makeSegments(text) {
      if (text == "")
        return [];
      else if (_QrSegment2.isNumeric(text))
        return [_QrSegment2.makeNumeric(text)];
      else if (_QrSegment2.isAlphanumeric(text))
        return [_QrSegment2.makeAlphanumeric(text)];
      else
        return [_QrSegment2.makeBytes(_QrSegment2.toUtf8ByteArray(text))];
    }
    // Returns a segment representing an Extended Channel Interpretation
    // (ECI) designator with the given assignment value.
    static makeEci(assignVal) {
      let bb = [];
      if (assignVal < 0)
        throw new RangeError("ECI assignment value out of range");
      else if (assignVal < 1 << 7)
        appendBits(assignVal, 8, bb);
      else if (assignVal < 1 << 14) {
        appendBits(2, 2, bb);
        appendBits(assignVal, 14, bb);
      } else if (assignVal < 1e6) {
        appendBits(6, 3, bb);
        appendBits(assignVal, 21, bb);
      } else
        throw new RangeError("ECI assignment value out of range");
      return new _QrSegment2(_QrSegment2.Mode.ECI, 0, bb);
    }
    // Tests whether the given string can be encoded as a segment in numeric mode.
    // A string is encodable iff each character is in the range 0 to 9.
    static isNumeric(text) {
      return _QrSegment2.NUMERIC_REGEX.test(text);
    }
    // Tests whether the given string can be encoded as a segment in alphanumeric mode.
    // A string is encodable iff each character is in the following set: 0 to 9, A to Z
    // (uppercase only), space, dollar, percent, asterisk, plus, hyphen, period, slash, colon.
    static isAlphanumeric(text) {
      return _QrSegment2.ALPHANUMERIC_REGEX.test(text);
    }
    /*-- Methods --*/
    // Returns a new copy of the data bits of this segment.
    getData() {
      return this.bitData.slice();
    }
    // (Package-private) Calculates and returns the number of bits needed to encode the given segments at
    // the given version. The result is infinity if a segment has too many characters to fit its length field.
    static getTotalBits(segs, version) {
      let result = 0;
      for (const seg of segs) {
        const ccbits = seg.mode.numCharCountBits(version);
        if (seg.numChars >= 1 << ccbits)
          return Infinity;
        result += 4 + ccbits + seg.bitData.length;
      }
      return result;
    }
    // Returns a new array of bytes representing the given string encoded in UTF-8.
    static toUtf8ByteArray(str) {
      str = encodeURI(str);
      let result = [];
      for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) != "%")
          result.push(str.charCodeAt(i));
        else {
          result.push(parseInt(str.substring(i + 1, i + 3), 16));
          i += 2;
        }
      }
      return result;
    }
  };
  _QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
  _QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
  _QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  let QrSegment = _QrSegment;
  qrcodegen2.QrSegment = _QrSegment;
})(qrcodegen || (qrcodegen = {}));
((qrcodegen2) => {
  let QrCode;
  ((QrCode2) => {
    const _Ecc = class _Ecc {
      // The QR Code can tolerate about 30% erroneous codewords
      /*-- Constructor and fields --*/
      constructor(ordinal, formatBits) {
        this.ordinal = ordinal;
        this.formatBits = formatBits;
      }
    };
    _Ecc.LOW = new _Ecc(0, 1);
    _Ecc.MEDIUM = new _Ecc(1, 0);
    _Ecc.QUARTILE = new _Ecc(2, 3);
    _Ecc.HIGH = new _Ecc(3, 2);
    let Ecc = _Ecc;
    QrCode2.Ecc = _Ecc;
  })(QrCode = qrcodegen2.QrCode || (qrcodegen2.QrCode = {}));
})(qrcodegen || (qrcodegen = {}));
((qrcodegen2) => {
  let QrSegment;
  ((QrSegment2) => {
    const _Mode = class _Mode {
      /*-- Constructor and fields --*/
      constructor(modeBits, numBitsCharCount) {
        this.modeBits = modeBits;
        this.numBitsCharCount = numBitsCharCount;
      }
      /*-- Method --*/
      // (Package-private) Returns the bit width of the character count field for a segment in
      // this mode in a QR Code at the given version number. The result is in the range [0, 16].
      numCharCountBits(ver) {
        return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
      }
    };
    _Mode.NUMERIC = new _Mode(1, [10, 12, 14]);
    _Mode.ALPHANUMERIC = new _Mode(2, [9, 11, 13]);
    _Mode.BYTE = new _Mode(4, [8, 16, 16]);
    _Mode.KANJI = new _Mode(8, [8, 10, 12]);
    _Mode.ECI = new _Mode(7, [0, 0, 0]);
    let Mode = _Mode;
    QrSegment2.Mode = _Mode;
  })(QrSegment = qrcodegen2.QrSegment || (qrcodegen2.QrSegment = {}));
})(qrcodegen || (qrcodegen = {}));
var qrcodegen_default = qrcodegen;
function makeQrSvg(text) {
  const qr = qrcodegen_default.QrCode.encodeText(String(text), qrcodegen_default.QrCode.Ecc.MEDIUM);
  const margin = 4;
  const size = qr.size + margin * 2;
  const cells = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) cells.push(`M${x + margin} ${y + margin}h1v1h-1z`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${cells.join("")}" fill="#111827"/></svg>`;
}

// src/host/mp/lib/constants.js
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var PREFIX = "/mp";
var COOKIE = "mp_device";
var TOKEN_TTL_MS = 2 * 60 * 60 * 1e3;
var IDLE_MS = 7 * 24 * 60 * 60 * 1e3;
var COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;
var OFFLINE_MS = 90 * 1e3;
var MAX_BODY = 12 * 1024 * 1024;
var MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
var DIR_MAX_ENTRIES = 1e3;
var SESSION_PAGE = 20;
var QUOTA_TTL_MS = 8e3;
var ALLOW = /* @__PURE__ */ new Set([
  "workspace.list",
  "workspace.create",
  "host.listDirectory",
  "agentPreset.list",
  "session.list",
  "session.create",
  "session.history",
  "session.prompt",
  "session.cancel",
  "session.attachment",
  "session.models",
  "session.selectModel",
  "skill.list",
  "command.list",
  "command.execute",
  "mobile.pending",
  "mobile.respond",
  "quota.read",
  "host.restart"
]);
var MIME_MAP = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};
var ROOT = dirname(fileURLToPath(import.meta.url));
var PLUGIN_ROOT = join(ROOT, "..");
var PUBLIC = join(PLUGIN_ROOT, "public");
function dshHome() {
  return process.env.DSH_HOME && process.env.DSH_HOME !== "" ? process.env.DSH_HOME : join(homedir(), ".dsh");
}

// src/host/mp/lib/utils.js
import { timingSafeEqual } from "node:crypto";
import { networkInterfaces } from "node:os";
function json(res, status, body, extra = {}) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extra
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}
async function readBody(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > maxBytes) throw new Error("body too large");
    chunks.push(buf);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (text === "") return {};
  return JSON.parse(text);
}
async function readRawBody(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > maxBytes) throw new Error("body too large");
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}
async function fetchLoopbackJson(port2, path, signal) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 1e4);
  const onAbort2 = () => ac.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      return { present: false, code: "aborted" };
    }
    signal.addEventListener("abort", onAbort2, { once: true });
  }
  try {
    const res = await fetch(`http://127.0.0.1:${port2}${path}`, {
      method: "GET",
      headers: { accept: "application/json", "user-agent": "dsh-mobile-plus/quota" },
      signal: ac.signal
    });
    if (res.status === 404) return { present: false, code: "missing-plugin" };
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return { present: false, code: "malformed" };
    }
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return { present: false, code: "malformed" };
    }
    return { present: true, ...body };
  } catch {
    return { present: false, code: ac.signal.aborted ? "timeout" : "unavailable" };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort2);
  }
}
function hostnameOf(req) {
  const host = req.headers.host;
  if (typeof host !== "string" || host === "") return void 0;
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return void 0;
  }
}
function hostIsLoopback(req) {
  const hostname2 = hostnameOf(req);
  return hostname2 === "127.0.0.1" || hostname2 === "localhost" || hostname2 === "::1";
}
function socketIsLoopback(req) {
  const addr = req.socket?.remoteAddress;
  return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1";
}
function isLoopback(req) {
  return hostIsLoopback(req) && socketIsLoopback(req);
}
function cookieValue(header, name2) {
  if (typeof header !== "string") return void 0;
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name2) return rest.join("=");
  }
  return void 0;
}
function sameSecret(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
function isHttps(req) {
  if (req.socket?.encrypted) return true;
  const forwarded = req.headers["x-forwarded-proto"];
  if (typeof forwarded !== "string" || forwarded === "") return false;
  return forwarded.split(",")[0].trim() === "https";
}
function svgDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function getLanIps() {
  const nets = networkInterfaces();
  const ips = [];
  for (const name2 of Object.keys(nets)) {
    for (const net2 of nets[name2] || []) {
      const family = typeof net2.family === "string" ? net2.family : net2.family === 4 ? "IPv4" : "";
      if (family === "IPv4" && !net2.internal) {
        ips.push(net2.address);
      }
    }
  }
  return ips;
}
function isLanHost(req, lanIps = getLanIps()) {
  const hostname2 = hostnameOf(req);
  if (!hostname2) return false;
  return lanIps.includes(hostname2);
}
var wrap = (rpcId, response) => ({
  type: "server-response",
  rpcId,
  result: response.result
});

// src/host/mp/lib/devices.js
import { randomBytes, randomInt } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname as dirname2 } from "node:path";
function deviceCookie(id, row) {
  return typeof row?.secret === "string" && row.secret !== "" ? row.secret : id;
}
function deviceId() {
  return randomBytes(16).toString("hex");
}
function pairingCode() {
  return String(randomInt(1e5, 1e6));
}
function loadDevices(file) {
  try {
    const raw = JSON.parse(readFileSync(file, "utf8"));
    if (raw && typeof raw === "object" && raw.devices && typeof raw.devices === "object") return raw.devices;
  } catch {
  }
  return {};
}
function saveDevices(file, devices) {
  mkdirSync(dirname2(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ version: 1, devices }, null, 2), { mode: 384 });
}
function aliveDevices(devices) {
  const now = Date.now();
  let count = 0;
  let cleaned = false;
  for (const id of Object.keys(devices)) {
    const row = devices[id];
    if (!row.pinned && now - row.lastSeenAt > IDLE_MS) {
      delete devices[id];
      cleaned = true;
      continue;
    }
    count += 1;
  }
  return { count, cleaned };
}
function deviceRows(devices) {
  const now = Date.now();
  return Object.entries(devices).map(([id, row]) => ({
    id,
    createdAt: row.createdAt,
    lastSeenAt: row.lastSeenAt,
    userAgent: row.label,
    pinned: row.pinned === true,
    online: now - row.lastSeenAt < OFFLINE_MS
  }));
}

// src/host/mp/lib/guard.js
var MAX_FAILS = 10;
var WINDOW_MS = 10 * 60 * 1e3;
var AttemptGuard = class {
  constructor() {
    this.fails = /* @__PURE__ */ new Map();
  }
  blocked(key) {
    const hits = this.fails.get(key);
    if (!hits) return false;
    const recent = hits.filter((t) => Date.now() - t < WINDOW_MS);
    if (recent.length === 0) this.fails.delete(key);
    else this.fails.set(key, recent);
    return recent.length >= MAX_FAILS;
  }
  fail(key) {
    const hits = this.fails.get(key) || [];
    hits.push(Date.now());
    this.fails.set(key, hits.slice(-MAX_FAILS));
  }
  reset(key) {
    this.fails.delete(key);
  }
};
function remoteKey(req) {
  const addr = req?.socket?.remoteAddress;
  return typeof addr === "string" && addr !== "" ? addr : "unknown";
}

// src/host/mp/lib/push.js
import { hostname } from "node:os";
var PUSH_TIMEOUT_MS = 1e4;
var RETRY_DELAYS_MS = [0, 3e3, 1e4, 3e4];
function normalizePushUrl(raw) {
  const trimmed = String(raw || "").trim().replace(/\/$/, "");
  if (trimmed === "") return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return trimmed;
  } catch {
    return "";
  }
}
function buildPushPayload(issue, reason) {
  const { qr, qrLan, qrLocal, fixedPairCode, ...compact } = issue;
  return {
    type: "dsh-mobile-plus/pair",
    reason,
    pushedAt: Date.now(),
    hostname: hostname(),
    platform: process.platform,
    hasFixedPairCode: Boolean(fixedPairCode),
    ...compact
  };
}
function sleep(ms) {
  return new Promise((resolve3) => setTimeout(resolve3, ms));
}
async function pushPairInfo(url, headers, payload, warn3 = (m) => console.warn(m)) {
  const body = JSON.stringify(payload);
  let lastError = "";
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    if (RETRY_DELAYS_MS[attempt] > 0) await sleep(RETRY_DELAYS_MS[attempt]);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers || {} },
        body,
        signal: AbortSignal.timeout(PUSH_TIMEOUT_MS)
      });
      if (res.ok) return true;
      lastError = "HTTP " + res.status;
    } catch (error) {
      lastError = String(error && error.message || error);
    }
  }
  warn3("[dsh-mobile-plus] \u914D\u5BF9\u4EE4\u724C\u63A8\u9001\u5931\u8D25\uFF08" + url + "\uFF09\uFF1A" + lastError);
  return false;
}

// src/host/mp/lib/web-session.js
import { createHash, createHmac } from "node:crypto";
var AUTH_RECORD_KEY = "client-connection/browser-session";
var COOKIE_PREFIX = "dsh-auth-";
var DAY_MS = 24 * 60 * 60 * 1e3;
var GRANT_DAYS = 29;
function encodeBase64Url(buf) {
  return Buffer.from(buf).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}
function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) return void 0;
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const decoded = Buffer.from(value.replaceAll("-", "+").replaceAll("_", "/") + padding, "base64");
  return encodeBase64Url(decoded) === value ? decoded : void 0;
}
function webSessionCookieName(authority) {
  return COOKIE_PREFIX + encodeBase64Url(createHash("sha256").update(authority).digest());
}
var WebSessionGranter = class {
  constructor(credentials) {
    this.credentials = credentials;
    this.secret = void 0;
  }
  /** 载入签名密钥；credentials 里没有记录（宿主太老）则保持不可用。 */
  async prepare() {
    try {
      const record = await this.credentials.readRecord(AUTH_RECORD_KEY);
      if (!record || record.kind !== "grant") return false;
      const secret = decodeBase64Url(String(record.payload?.secret ?? ""));
      if (!secret || secret.length !== 32) return false;
      this.secret = secret;
      return true;
    } catch {
      return false;
    }
  }
  cookieFor(authority) {
    if (this.secret === void 0 || typeof authority !== "string" || authority === "") return void 0;
    const issuedAt = Date.now();
    const expiresAt = issuedAt + GRANT_DAYS * DAY_MS;
    const body = encodeBase64Url(Buffer.from(JSON.stringify({
      version: 1,
      authority,
      issuedAt,
      expiresAt
    }), "utf8"));
    const sig = encodeBase64Url(createHmac("sha256", this.secret).update(body).digest());
    const maxAge = Math.floor((expiresAt - issuedAt) / 1e3);
    return `${webSessionCookieName(authority)}=v1.${body}.${sig}; Max-Age=${String(maxAge)}; Path=/; Expires=${new Date(expiresAt).toUTCString()}; HttpOnly; SameSite=Lax`;
  }
};
function clearCookieForRequest(req) {
  const host = req?.headers?.host;
  if (typeof host !== "string" || host === "") return {};
  let authority;
  try {
    authority = new URL(`http://${host}`).host;
  } catch {
    return {};
  }
  const name2 = webSessionCookieName(authority);
  if (cookieValue(req.headers.cookie, name2) === void 0) return {};
  return { "set-cookie": `${name2}=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax` };
}
function cookieForRequest(granter, req) {
  if (!granter) return void 0;
  const host = req?.headers?.host;
  if (typeof host !== "string" || host === "") return void 0;
  try {
    return granter.cookieFor(new URL(`http://${host}`).host);
  } catch {
    return void 0;
  }
}

// src/host/mp/lib/auth.js
function normalizeFixedCode(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed.length < 4 || trimmed.length > 64) return "";
  if (!/^[A-Za-z0-9._~-]+$/.test(trimmed)) return "";
  return trimmed;
}
var AuthManager = class {
  constructor(config = {}) {
    this.publicBaseUrl = (config.publicBaseUrl || "").trim().replace(/\/$/, "");
    this.requirePairing = config.requirePairing !== false;
    this.publicHost = "";
    try {
      this.publicHost = this.publicBaseUrl === "" ? "" : new URL(this.publicBaseUrl).host;
    } catch {
      this.publicHost = "";
    }
    this.devicesFile = config.devicesFile || join2(dshHome(), "mobile-plus-devices.json");
    this.devices = loadDevices(this.devicesFile);
    this.lanPort = typeof config.lanPort === "number" ? config.lanPort : 0;
    this.token = void 0;
    this.fixedPairCode = normalizeFixedCode(config.fixedPairCode ?? process.env.DSH_MOBILE_PAIR_CODE);
    this.pushUrl = normalizePushUrl(config.tokenPushUrl || process.env.DSH_MOBILE_PUSH_URL);
    this.pushHeaders = config.tokenPushHeaders && typeof config.tokenPushHeaders === "object" ? config.tokenPushHeaders : {};
    this.guard = new AttemptGuard();
    this.grantWebSession = config.grantWebSession === true;
    this.webGrant = void 0;
  }
  /** grantWebSession: true 时预热 credentials 签名密钥。 */
  setupWebSession(credentials) {
    if (!this.grantWebSession || !credentials) return;
    this.webGrant = new WebSessionGranter(credentials);
    void this.webGrant.prepare();
  }
  persist() {
    saveDevices(this.devicesFile, this.devices);
  }
  trustedHost(req) {
    if (isLoopback(req)) return true;
    if (isLanHost(req)) return true;
    const host = req.headers.host;
    return typeof host === "string" && this.publicHost !== "" && host === this.publicHost;
  }
  findByCookie(cookie) {
    if (typeof cookie !== "string" || cookie === "") return void 0;
    for (const id of Object.keys(this.devices)) {
      const row = this.devices[id];
      if (sameSecret(deviceCookie(id, row), cookie)) return { id, row };
    }
    return void 0;
  }
  touch(req) {
    const found = this.findByCookie(cookieValue(req.headers.cookie, COOKIE));
    if (!found) return false;
    if (!found.row.pinned && Date.now() - found.row.lastSeenAt > IDLE_MS) {
      delete this.devices[found.id];
      this.persist();
      return false;
    }
    found.row.lastSeenAt = Date.now();
    this.persist();
    return true;
  }
  setDeviceCookie(resHeaders, secret, req) {
    const expires = new Date(Date.now() + COOKIE_MAX_AGE_SEC * 1e3).toUTCString();
    const parts = [
      `${COOKIE}=${secret}`,
      `Path=${PREFIX}`,
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${COOKIE_MAX_AGE_SEC}`,
      `Expires=${expires}`
    ];
    if (isHttps(req)) parts.push("Secure");
    resHeaders["set-cookie"] = parts.join("; ");
    return resHeaders;
  }
  cookieHeadersIfPaired(req) {
    const found = this.findByCookie(cookieValue(req.headers.cookie, COOKIE));
    if (!found) return {};
    const headers = this.setDeviceCookie({}, deviceCookie(found.id, found.row), req);
    const web = cookieForRequest(this.webGrant, req);
    if (web) headers["set-cookie"] = [headers["set-cookie"], web];
    return headers;
  }
  /** 生成一次性令牌与三种配对链接（setup 页与推送共用）。 */
  mintToken(port2) {
    const secret = randomBytes2(16).toString("hex");
    const code = pairingCode();
    this.token = { secret, code, expiresAt: Date.now() + TOKEN_TTL_MS, consumed: false };
    const lanIps = getLanIps();
    const primaryLanIp = lanIps[0] || "";
    const lanPort = this.lanPort || port2;
    const lanUrl = primaryLanIp !== "" ? `http://${primaryLanIp}:${String(lanPort)}${PREFIX}/?pair=${secret}` : "";
    const localUrl = `http://127.0.0.1:${String(port2)}${PREFIX}/?pair=${secret}`;
    const url = this.publicBaseUrl !== "" ? `${this.publicBaseUrl}${PREFIX}/?pair=${secret}` : lanUrl || localUrl;
    return {
      ok: true,
      token: secret,
      url,
      lanUrl,
      localUrl,
      lanIp: primaryLanIp,
      code,
      qr: svgDataUri(makeQrSvg(url)),
      qrLan: lanUrl !== "" ? svgDataUri(makeQrSvg(lanUrl)) : "",
      qrLocal: svgDataUri(makeQrSvg(localUrl)),
      expiresAt: this.token.expiresAt,
      publicBaseUrl: this.publicBaseUrl,
      fixedPairCode: this.fixedPairCode
    };
  }
  /** 把最新一次性令牌推给自建接收端；未配置则静默跳过。 */
  pushToken(issue, reason) {
    if (this.pushUrl === "") return Promise.resolve(false);
    return pushPairInfo(this.pushUrl, this.pushHeaders, buildPushPayload(issue, reason));
  }
  /** 服务启动后自动签发并推送一份，重启后服务器永远有最新 token。 */
  async autoIssuePush(port2) {
    if (this.pushUrl === "") return false;
    return this.pushToken(this.mintToken(port2), "startup");
  }
  handleIssue = async (port2, req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }
    if (!isLoopback(req)) {
      json(res, 403, { ok: false, code: "forbidden" });
      return;
    }
    const payload = this.mintToken(port2);
    void this.pushToken(payload, "issue");
    json(res, 200, payload);
  };
  handleAccept = async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }
    if (!this.trustedHost(req)) {
      json(res, 403, { ok: false, code: "forbidden" });
      return;
    }
    let body;
    try {
      body = await readBody(req, 4096);
    } catch {
      json(res, 400, { ok: false, code: "bad-payload" });
      return;
    }
    const offered = typeof body.token === "string" ? body.token.trim() : "";
    const ip = remoteKey(req);
    if (this.guard.blocked(ip)) {
      json(res, 429, { ok: false, code: "too-many-attempts" });
      return;
    }
    const oneTime = Boolean(
      this.token && !this.token.consumed && Date.now() <= this.token.expiresAt && (sameSecret(this.token.secret, offered) || sameSecret(this.token.code, offered))
    );
    const fixed = !oneTime && this.fixedPairCode !== "" && sameSecret(this.fixedPairCode, offered);
    if (!oneTime && !fixed) {
      if (offered !== "") this.guard.fail(ip);
      json(res, 404, { ok: false, code: "invalid-token" });
      return;
    }
    this.guard.reset(ip);
    if (oneTime) this.token.consumed = true;
    const id = deviceId();
    const cookieSecret = deviceId();
    this.devices[id] = {
      secret: cookieSecret,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      pinned: fixed,
      label: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"].slice(0, 180) : "phone"
    };
    this.persist();
    const extra = this.setDeviceCookie({}, cookieSecret, req);
    const web = cookieForRequest(this.webGrant, req);
    if (web) extra["set-cookie"] = [extra["set-cookie"], web];
    json(res, 200, { ok: true, deviceId: id }, extra);
  };
  handleStatus = (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405);
      res.end();
      return;
    }
    if (!this.trustedHost(req)) {
      json(res, 403, { ok: false, code: "forbidden" });
      return;
    }
    const paired = this.requirePairing ? this.touch(req) : true;
    const extra = paired && this.requirePairing ? this.cookieHeadersIfPaired(req) : {};
    if (!isLoopback(req)) {
      json(res, 200, {
        ok: true,
        paired,
        deviceCount: 0,
        onlineCount: 0,
        devices: [],
        publicBaseUrl: this.publicBaseUrl
      }, extra);
      return;
    }
    const alive = aliveDevices(this.devices);
    if (alive.cleaned) this.persist();
    const rows = deviceRows(this.devices);
    json(res, 200, {
      ok: true,
      paired,
      deviceCount: alive.count,
      onlineCount: rows.filter((row) => row.online).length,
      devices: rows,
      publicBaseUrl: this.publicBaseUrl
    }, extra);
  };
  handleStop = (req, res) => {
    if (req.method !== "POST") return res.writeHead(405).end();
    if (!isLoopback(req)) return json(res, 403, { ok: false, code: "forbidden" });
    this.token = void 0;
    for (const id of Object.keys(this.devices)) delete this.devices[id];
    this.persist();
    json(res, 200, { ok: true });
  };
  handleRevoke = async (req, res) => {
    if (req.method !== "POST") return res.writeHead(405).end();
    if (!isLoopback(req)) return json(res, 403, { ok: false, code: "forbidden" });
    let body;
    try {
      body = await readBody(req, 4096);
    } catch {
      return json(res, 400, { ok: false, code: "bad-payload" });
    }
    const id = typeof body.deviceId === "string" ? body.deviceId : "";
    if (id === "" || !Object.prototype.hasOwnProperty.call(this.devices, id)) {
      return json(res, 404, { ok: false, code: "unknown-device" });
    }
    delete this.devices[id];
    this.persist();
    json(res, 200, { ok: true });
  };
};

// src/host/mp/lib/lan-bridge.js
import net from "node:net";
var LanBridge = class {
  /**
   * @param {number} targetPort - DSH local loopback port (e.g. 3080)
   * @param {number} [preferredPort=3088] - preferred LAN listening port
   */
  constructor(targetPort, preferredPort = 3088) {
    this.targetPort = targetPort;
    this.preferredPort = preferredPort;
    this.server = null;
    this.listeningPort = 0;
  }
  /**
   * Start listening on 0.0.0.0 for LAN traffic and forwarding to loopback target
   * @returns {Promise<number>} bound LAN port, or 0 if failed
   */
  async start() {
    for (let offset = 0; offset < 20; offset++) {
      const candidate = this.preferredPort + offset;
      if (candidate === this.targetPort) continue;
      try {
        await this.tryListen(candidate);
        this.listeningPort = candidate;
        return candidate;
      } catch (err) {
        if (err.code !== "EADDRINUSE") {
          break;
        }
      }
    }
    return 0;
  }
  tryListen(port2) {
    return new Promise((resolve3, reject) => {
      const server = net.createServer((clientSocket) => {
        const targetSocket = net.connect(this.targetPort, "127.0.0.1");
        clientSocket.on("error", () => {
          targetSocket.destroy();
        });
        targetSocket.on("error", () => {
          clientSocket.destroy();
        });
        clientSocket.pipe(targetSocket);
        targetSocket.pipe(clientSocket);
      });
      server.once("error", (err) => {
        server.close();
        reject(err);
      });
      server.listen(port2, "0.0.0.0", () => {
        this.server = server;
        resolve3(port2);
      });
    });
  }
  stop() {
    if (this.server) {
      try {
        this.server.close();
      } catch {
      }
      this.server = null;
      this.listeningPort = 0;
    }
  }
};

// src/host/mp/lib/events.js
function muxEnvelope(frame) {
  if (!frame || typeof frame !== "object") return null;
  if (frame.type === "server-request" && frame.payload && typeof frame.payload === "object") {
    return { rpcId: typeof frame.rpcId === "string" ? frame.rpcId : "", payload: frame.payload };
  }
  if (typeof frame.rpcId === "string" && frame.payload && typeof frame.payload === "object" && typeof frame.payload.type === "string") {
    return { rpcId: frame.rpcId, payload: frame.payload };
  }
  if (typeof frame.type === "string") {
    return { rpcId: typeof frame.rpcId === "string" ? frame.rpcId : "", payload: frame };
  }
  return null;
}
function createPendingTracker() {
  const sessions = /* @__PURE__ */ new Map();
  const bucket = (sessionId) => {
    let row = sessions.get(sessionId);
    if (!row) {
      row = { approvals: /* @__PURE__ */ new Map(), questions: /* @__PURE__ */ new Map() };
      sessions.set(sessionId, row);
    }
    return row;
  };
  return {
    onFrame(raw) {
      const env = muxEnvelope(raw);
      if (!env) return;
      const payload = env.payload;
      const sessionId = payload.sessionId;
      if (typeof sessionId !== "string") return;
      if (payload.type === "approval/requested") {
        bucket(sessionId).approvals.set(payload.approvalId, {
          rpcId: env.rpcId,
          approvalId: payload.approvalId,
          toolName: payload.toolName,
          callId: payload.callId,
          reason: payload.reason
        });
      } else if (payload.type === "approval/resolved") {
        sessions.get(sessionId)?.approvals.delete(payload.approvalId);
      } else if (payload.type === "question/requested") {
        bucket(sessionId).questions.set(env.rpcId, {
          rpcId: env.rpcId,
          questions: Array.isArray(payload.questions) ? payload.questions : []
        });
      } else if (payload.type === "question/resolved") {
        sessions.get(sessionId)?.questions.delete(payload.questionRpcId);
      }
    },
    pending(sessionId) {
      const row = sessions.get(sessionId);
      if (!row) return { approvals: [], questions: [] };
      return {
        approvals: [...row.approvals.values()],
        questions: [...row.questions.values()]
      };
    },
    findApproval(sessionId, approvalId) {
      return sessions.get(sessionId)?.approvals.get(approvalId);
    },
    findQuestion(sessionId, rpcId) {
      return sessions.get(sessionId)?.questions.get(rpcId);
    }
  };
}
async function pipeSse(req, res, openFrames, auth, pendingTracker) {
  if (req.method !== "GET") {
    res.writeHead(405);
    res.end();
    return;
  }
  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no"
  });
  const controller = new AbortController();
  let closed = false;
  const ping = setInterval(() => {
    if (auth) auth.touch(req);
    try {
      res.write(": ping\n\n");
    } catch {
    }
  }, 1e4);
  const onClose = () => {
    if (closed) return;
    closed = true;
    controller.abort();
    clearInterval(ping);
  };
  res.on("close", onClose);
  req.on("close", onClose);
  try {
    const frames = openFrames(controller.signal);
    for await (const frame of frames) {
      if (closed) break;
      if (pendingTracker) pendingTracker.onFrame(frame);
      res.write(`data: ${JSON.stringify(frame)}

`);
    }
  } catch {
  } finally {
    onClose();
  }
  if (!closed) res.end();
}
function createFrameHub() {
  const listeners = /* @__PURE__ */ new Set();
  return {
    emit(frame) {
      if (!frame || typeof frame !== "object") return;
      for (const fn of listeners) {
        try {
          fn(frame);
        } catch {
        }
      }
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }
  };
}

// src/host/mp/lib/fs-browser.js
import { readdir, stat } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import { basename, dirname as dirname3, join as join3, posix, resolve, win32 } from "node:path";
function fullyQualifiedPath(path, platform = process.platform) {
  return platform === "win32" ? win32.isAbsolute(path) && /^(?:[A-Za-z]:[\\/]|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)/.test(path) : posix.isAbsolute(path);
}
function ancestryCrumbs(target) {
  const crumbs = [];
  let current = target;
  for (; ; ) {
    const parent = dirname3(current);
    crumbs.unshift({
      name: parent === current ? current : basename(current),
      path: current,
      hidden: false
    });
    if (parent === current) return crumbs;
    current = parent;
  }
}
function failDirectory(code, path, message) {
  return { result: { ok: false, error: { code, message, details: { path } } } };
}
async function listHostDirectory(payload, signal) {
  const home = homedir2();
  const requested = payload && typeof payload.path === "string" ? payload.path : void 0;
  if (requested !== void 0 && !fullyQualifiedPath(requested)) {
    return failDirectory("directory-unreadable", requested, `cannot list "${requested}": not a fully qualified path`);
  }
  const target = resolve(requested ?? home);
  try {
    signal?.throwIfAborted();
    const dirents = await readdir(target, { withFileTypes: true });
    signal?.throwIfAborted();
    const candidates = dirents.filter((entry) => entry.isDirectory() || entry.isSymbolicLink()).sort((a, b) => a.name.localeCompare(b.name));
    const entries = [];
    let truncated = false;
    for (const dirent of candidates) {
      signal?.throwIfAborted();
      if (entries.length >= DIR_MAX_ENTRIES) {
        truncated = true;
        break;
      }
      const child = join3(target, dirent.name);
      let enterable = dirent.isDirectory();
      if (!enterable && dirent.isSymbolicLink()) {
        try {
          enterable = (await stat(child)).isDirectory();
        } catch {
          if (signal?.aborted) {
            const reason = signal.reason;
            throw reason instanceof Error ? reason : new Error(String(reason));
          }
          continue;
        }
      }
      if (!enterable) continue;
      entries.push({ name: dirent.name, path: child, hidden: dirent.name.startsWith(".") });
    }
    return {
      result: {
        ok: true,
        value: {
          path: target,
          home,
          crumbs: ancestryCrumbs(target),
          entries,
          truncated
        }
      }
    };
  } catch (error) {
    if (signal?.aborted) {
      return { result: { ok: false, error: { code: "cancelled", message: "directory listing was aborted", details: {} } } };
    }
    const message = error instanceof Error ? error.message : String(error);
    return failDirectory("directory-unreadable", target, `cannot list ${target}: ${message}`);
  }
}

// src/host/mp/lib/upload.js
import { createHash as createHash2 } from "node:crypto";
import { existsSync, mkdirSync as mkdirSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { mkdir, readFile, rm, stat as stat2, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { basename as basename2, extname, join as join4 } from "node:path";

// src/host/mp/lib/services.js
import { randomUUID } from "node:crypto";
function svc(ctx, name2) {
  try {
    return ctx.get(name2);
  } catch {
    return void 0;
  }
}
function oldWorkspace(ws) {
  return {
    workspaceId: ws.id,
    title: ws.title,
    path: ws.path,
    sessionIds: [...ws.sessionIds || []],
    createdAt: ws.createdAt,
    updatedAt: ws.updatedAt
  };
}
function listWorkspaces(ctx) {
  const reg = svc(ctx, "workspaceRegistry");
  if (!reg || typeof reg.list !== "function") return { items: [] };
  return { items: reg.list().map(oldWorkspace) };
}
async function createWorkspace(ctx, path) {
  const reg = svc(ctx, "workspaceRegistry");
  if (!reg || typeof reg.create !== "function") throw new Error("\u5DE5\u4F5C\u533A\u670D\u52A1\u4E0D\u53EF\u7528");
  return { workspace: oldWorkspace(await reg.create(path)) };
}
async function listSessionSummaries(ctx, signal) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.list !== "function") throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  const res = await sc.list({}, signal);
  return (res.items || []).map((s) => ({
    sessionId: s.sessionId,
    updatedAt: s.updatedAt,
    running: s.running === true,
    blank: s.blank === true,
    ...s.cwd !== void 0 ? { cwd: s.cwd } : {},
    ...s.parentSessionId !== void 0 ? { parentSessionId: s.parentSessionId } : {},
    ...s.origin !== void 0 ? { origin: s.origin } : {},
    ...s.projections !== void 0 ? { projections: s.projections } : {}
  }));
}
async function sessionCwd(ctx, sessionId, signal) {
  try {
    const rows = await listSessionSummaries(ctx, signal);
    const row = rows.find((item) => item.sessionId === sessionId);
    if (row?.cwd) return row.cwd;
  } catch {
  }
  try {
    const first = listWorkspaces(ctx).items[0];
    if (first?.path) return first.path;
  } catch {
  }
  return void 0;
}
var historyCursors = /* @__PURE__ */ new Map();
async function readHistory(ctx, { sessionId, maxMessages = 30, beforeSeq }, signal) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.follow !== "function" || typeof sc.page !== "function") {
    throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  }
  const address = { kind: "session", sessionId };
  const max = Number.isFinite(maxMessages) ? maxMessages : 30;
  if (beforeSeq !== void 0 && historyCursors.has(sessionId)) {
    const page = await sc.page(
      { address, throughSeq: historyCursors.get(sessionId), beforeSeq, maxMessages: max },
      signal
    );
    return { events: page.records.map((r) => ({ event: r.event })), hasMore: page.hasMore };
  }
  const stream = sc.follow({ address, maxMessages: max }, signal);
  try {
    for await (const frame of stream) {
      if (frame && frame.type === "snapshot") {
        historyCursors.set(sessionId, frame.cursor);
        return {
          events: frame.records.map((r) => ({ event: r.event })),
          hasMore: frame.hasMore,
          projections: frame.projections
        };
      }
    }
  } finally {
    if (stream && typeof stream.return === "function") {
      try {
        await stream.return();
      } catch {
      }
    }
  }
  throw new Error("\u5386\u53F2\u8BFB\u53D6\u5931\u8D25");
}
function cleanTextPart(part) {
  if (!part || part.type !== "text") return void 0;
  return { type: "text", text: String(part.text || "") };
}
function cleanImagePart(part) {
  if (!part || part.type !== "image" || typeof part.data !== "string" || part.data === "") return void 0;
  const mediaType = part.mediaType === "image/png" || part.mediaType === "image/webp" || part.mediaType === "image/gif" ? part.mediaType : "image/jpeg";
  const clean = { type: "image", mediaType, data: part.data };
  if (typeof part.name === "string" && part.name !== "") clean.name = part.name.slice(0, 120);
  return clean;
}
async function promptSession(ctx, payload, signal) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.prompt !== "function") throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  const parts = Array.isArray(payload.content) ? payload.content : [];
  const content = [];
  for (const part of parts) content.push(cleanTextPart(part) || cleanImagePart(part));
  const filtered = content.filter(Boolean);
  return sc.prompt({
    requestId: "mp-" + Date.now().toString(36) + "-" + randomUUID().slice(0, 8),
    sessionId: payload.sessionId,
    mode: payload.mode === "steer" ? "steer" : "queue",
    content: filtered
  }, signal);
}
async function createSession(ctx, payload) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.create !== "function") throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  const req = {};
  if (typeof payload.workspaceId === "string") req.workspaceId = payload.workspaceId;
  if (typeof payload.cwd === "string") req.cwd = payload.cwd;
  if (typeof payload.sessionId === "string") req.sessionId = payload.sessionId;
  if (typeof payload.agentPreset === "string" && payload.agentPreset !== "") req.agentPreset = payload.agentPreset;
  return sc.create(req);
}
async function cancelSession(ctx, sessionId, signal) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.cancel !== "function") throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  return sc.cancel({ sessionId }, signal);
}
async function readAttachment(ctx, sessionId, attachmentId, signal) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.attachment !== "function") throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  return sc.attachment({ sessionId, attachmentId }, signal);
}
async function selectSessionModel(ctx, payload, signal) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.selectModel !== "function") throw new Error("\u4F1A\u8BDD\u670D\u52A1\u4E0D\u53EF\u7528");
  const req = { sessionId: payload.sessionId };
  if (typeof payload.provider === "string") req.provider = payload.provider;
  if (typeof payload.model === "string") req.model = payload.model;
  if (payload.reasoningEffort !== void 0) req.reasoningEffort = payload.reasoningEffort;
  return sc.selectModel(req, signal);
}
async function modelView(ctx, sessionId) {
  const sc = svc(ctx, "sessionController");
  if (!sc || typeof sc.modelCatalog !== "function") throw new Error("\u6A21\u578B\u670D\u52A1\u4E0D\u53EF\u7528");
  const catalog = await sc.modelCatalog();
  let current = catalog.default;
  try {
    const query = svc(ctx, "sessionQuery");
    if (query && typeof query.observeSession === "function" && sessionId) {
      const obs = await query.observeSession(sessionId);
      try {
        const ms = obs && obs.projections && obs.projections.values ? obs.projections.values.modelSelection : void 0;
        const sel = ms && (ms.next || ms.lastUsed) || void 0;
        if (sel && typeof sel.provider === "string" && typeof sel.model === "string") current = sel;
      } finally {
        if (obs && typeof obs[Symbol.dispose] === "function") obs[Symbol.dispose]();
      }
    }
  } catch {
  }
  return {
    current,
    groups: (catalog.groups || []).map((g) => ({
      id: g.id,
      name: g.name,
      models: (g.models || []).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        reasoning: m.reasoning
      }))
    })),
    failures: (catalog.failures || []).map((f) => ({ name: f.name || f.id, message: f.message }))
  };
}
async function listSkills(ctx, sessionId, signal) {
  const cat = svc(ctx, "sessionSkillCatalog");
  if (cat && typeof cat.list === "function") {
    const res = await cat.list({ sessionId }, signal);
    return {
      skills: (res.skills || []).map((s) => ({
        name: s.name,
        description: s.description,
        whenToUse: s.whenToUse
      }))
    };
  }
  return { skills: [] };
}
async function listPresets(ctx) {
  const ap = svc(ctx, "agentPresets");
  if (!ap || typeof ap.list !== "function") return { presets: [] };
  const arr = await ap.list();
  let defId;
  try {
    const cand = ap.defaultId ?? ap.default ?? (ap.config && ap.config.default);
    if (typeof cand === "string" && cand !== "") defId = cand;
  } catch {
  }
  return {
    presets: (arr || []).map((p) => ({
      id: p.id,
      name: p.name || p.id,
      description: p.description,
      broken: p.broken,
      ...defId !== void 0 ? { isDefault: p.id === defId } : {}
    }))
  };
}

// src/host/mp/lib/upload.js
function decodeHeaderFilename(raw) {
  if (typeof raw !== "string" || raw === "") return "file";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
function safeBasename(raw) {
  let base = basename2(String(raw || "").replace(/\\/g, "/"));
  base = base.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[/\\]/g, "");
  if (base === "" || base === "." || base === "..") base = "file";
  if (base.length > 120) {
    const ext = extname(base);
    const keep = Math.max(1, 120 - ext.length);
    base = `${base.slice(0, keep)}${ext}`;
  }
  return base;
}
function uniquePath(filePath) {
  if (!existsSync(filePath)) return filePath;
  const ext = extname(filePath);
  const stem = ext ? filePath.slice(0, -ext.length) : filePath;
  for (let i = 2; i < 100; i += 1) {
    const next = `${stem}-${i}${ext}`;
    if (!existsSync(next)) return next;
  }
  return `${stem}-${Date.now()}${ext}`;
}
function sipsToJpeg(srcPath, destPath) {
  return new Promise((resolve3) => {
    execFile("sips", ["-s", "format", "jpeg", srcPath, "--out", destPath], { timeout: 2e4 }, (error) => {
      resolve3(!error && existsSync(destPath));
    });
  });
}
function sipsThumbnail(srcPath, thumbPath) {
  return new Promise((resolve3) => {
    execFile("sips", ["-Z", "320", "-s", "format", "jpeg", srcPath, "--out", thumbPath], { timeout: 1e4 }, (error) => {
      resolve3({ status: error ? 1 : 0 });
    });
  });
}
async function sessionCwd2(ctx, sessionId, signal) {
  try {
    return await sessionCwd(ctx, sessionId, signal);
  } catch {
    return void 0;
  }
}
async function persistPhoneImages(ctx, payload) {
  if (!payload || !Array.isArray(payload.content)) return payload;
  const images = payload.content.filter((part) => part && part.type === "image" && typeof part.data === "string");
  if (images.length === 0) return payload;
  const cwd = await sessionCwd2(ctx, payload.sessionId);
  if (!cwd) return payload;
  const dir = join4(cwd, ".dsh-mobile-inbox");
  mkdirSync2(dir, { recursive: true });
  const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const paths = [];
  images.forEach((part, index) => {
    const raw = typeof part.fullData === "string" && part.fullData !== "" ? part.fullData : part.data;
    const ext = part.mediaType === "image/png" ? "png" : part.mediaType === "image/webp" ? "webp" : part.mediaType === "image/gif" ? "gif" : "jpg";
    const filePath = join4(dir, `${stamp}-${index + 1}.${ext}`);
    writeFileSync2(filePath, Buffer.from(raw, "base64"));
    paths.push(filePath);
    if (index === images.length - 1) {
      writeFileSync2(join4(dir, `latest.${ext}`), Buffer.from(raw, "base64"));
    }
  });
  const note = ["\u3010\u76F8\u5173\u7684\u6587\u4EF6\u76EE\u5F55\u3011", ...paths].join("\n");
  const rest = payload.content.filter((part) => !(part && part.type === "text" && String(part.text || "").match(/【(?:手机发来的文件|手机发来的图片|参考文件|相关的文件目录)】/))).map((part) => {
    if (!part || part.type !== "image" || typeof part.fullData !== "string") return part;
    const { fullData, ...slim } = part;
    return slim;
  });
  const texts = rest.filter((part) => part && part.type === "text");
  const others = rest.filter((part) => !(part && part.type === "text"));
  return {
    ...payload,
    content: [...texts, { type: "text", text: note }, ...others]
  };
}
var THUMB_MAX_BYTES = 40 * 1024;
function inlineImageData(part) {
  if (!part || part.type !== "image" || typeof part.data !== "string" || part.data === "") return void 0;
  if (part.data.startsWith("data:")) {
    const comma = part.data.indexOf(",");
    const header = part.data.slice(0, comma);
    const mime = /^data:image\/([a-z0-9+]+)/i.exec(header)?.[1]?.toLowerCase() ?? "jpeg";
    const b64 = comma === -1 ? "" : part.data.slice(comma + 1);
    if (b64 === "") return void 0;
    return { b64, mime };
  }
  return { b64: part.data, mime: (part.mediaType || "image/jpeg").replace("image/", "").toLowerCase() };
}
async function slimHistoryImages(events, cwd) {
  if (!Array.isArray(events) || cwd === void 0) return events;
  const cacheDir = join4(cwd, ".dsh-mobile-inbox", ".thumbs");
  const changed = [];
  let changedAny = false;
  for (const entry of events) {
    const ev = entry && (entry.event || entry);
    const data = ev && ev.data;
    if (!ev || typeof ev !== "object" || !data || !Array.isArray(data.content)) {
      changed.push(entry);
      continue;
    }
    let contentChanged = false;
    const content = [];
    for (const part of data.content) {
      const info = inlineImageData(part);
      if (info === void 0 || info.b64.length < THUMB_MAX_BYTES) {
        content.push(part);
        continue;
      }
      const key = createHash2("sha1").update(`image/${info.mime}:${info.b64}`).digest("hex");
      const thumbPath = join4(cacheDir, `${key}.jpg`);
      try {
        if (!existsSync(thumbPath)) {
          await mkdir(cacheDir, { recursive: true });
          const srcPath = join4(cacheDir, `tmp-${key}.${info.mime === "png" ? "png" : "jpg"}`);
          await writeFile(srcPath, Buffer.from(info.b64, "base64"));
          const res = await sipsThumbnail(srcPath, thumbPath);
          await rm(srcPath, { force: true });
          if (res.status !== 0 || !existsSync(thumbPath)) {
            content.push(part);
            continue;
          }
        }
        contentChanged = true;
        const thumbB64 = (await readFile(thumbPath)).toString("base64");
        content.push({ type: "image", mediaType: "image/jpeg", data: thumbB64, name: part.name });
      } catch {
        content.push(part);
      }
    }
    changedAny = changedAny || contentChanged;
    changed.push(contentChanged ? { ...entry, event: { ...ev, data: { ...data, content } } } : entry);
  }
  return changedAny ? changed : events;
}
async function handleUpload(ctx, req, res) {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end();
    return;
  }
  const sessionId = typeof req.headers["x-mp-session-id"] === "string" ? req.headers["x-mp-session-id"].trim() : "";
  if (sessionId === "") {
    json(res, 400, { ok: false, error: { code: "bad-request", message: "missing sessionId" } });
    return;
  }
  const cwd = await sessionCwd2(ctx, sessionId);
  if (!cwd) {
    json(res, 400, { ok: false, error: { code: "bad-request", message: "\u627E\u4E0D\u5230\u4F1A\u8BDD\u5DE5\u4F5C\u533A" } });
    return;
  }
  let buf;
  try {
    buf = await readRawBody(req, MAX_UPLOAD_BYTES);
  } catch {
    json(res, 400, { ok: false, error: { code: "too-large", message: "\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 20MB" } });
    return;
  }
  if (buf.length === 0) {
    json(res, 400, { ok: false, error: { code: "bad-request", message: "\u7A7A\u6587\u4EF6" } });
    return;
  }
  const rawName = decodeHeaderFilename(req.headers["x-mp-filename"]);
  const mediaType = typeof req.headers["x-mp-media-type"] === "string" ? req.headers["x-mp-media-type"].slice(0, 120) : "";
  const dir = join4(cwd, ".dsh-mobile-inbox");
  await mkdir(dir, { recursive: true });
  const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
  let dest = uniquePath(join4(dir, `${stamp}-${safeBasename(rawName)}`));
  await writeFile(dest, buf);
  const looksHeic = /\.(heic|heif)$/i.test(dest) || /image\/hei[cf]/i.test(mediaType);
  if (looksHeic) {
    const converted = uniquePath(dest.replace(/\.(heic|heif)$/i, ".jpg"));
    const ok2 = await sipsToJpeg(dest, converted);
    if (ok2) {
      await rm(dest, { force: true });
      dest = converted;
    }
  }
  let bytes = buf.length;
  try {
    bytes = (await stat2(dest)).size;
  } catch {
  }
  json(res, 200, {
    type: "server-response",
    result: { ok: true, value: { path: dest, name: basename2(dest), bytes } }
  });
}

// src/host/mp/lib/titles.js
var titleCache = /* @__PURE__ */ new Map();
var TITLE_TTL_MS = 120 * 1e3;
function cachedTitle(sessionId, now) {
  const hit = titleCache.get(sessionId);
  return hit && now - hit.at < TITLE_TTL_MS ? hit.title : void 0;
}
function noteTitle(sessionId, title) {
  if (typeof sessionId !== "string" || typeof title !== "string") return;
  const text = title.trim();
  if (text === "") return;
  titleCache.set(sessionId, { title: text, at: Date.now() });
}
async function enrichTitles(ctx, items, signal) {
  const now = Date.now();
  const need = [];
  for (const item of items) {
    if (!item || typeof item.sessionId !== "string") continue;
    const projected = item.projections && item.projections.values ? item.projections.values.title : void 0;
    if (typeof projected === "string" && projected.trim() !== "") continue;
    const hit = cachedTitle(item.sessionId, now);
    if (hit !== void 0) {
      item.title = hit;
      continue;
    }
    need.push(item);
  }
  if (need.length === 0) return items;
  try {
    const query = svc(ctx, "sessionQuery");
    if (!query || typeof query.readTitleSnapshots !== "function") return items;
    const rows = await query.readTitleSnapshots(need.map((item) => item.sessionId), signal);
    for (const row of rows || []) {
      const snap = row && row.status === "fulfilled" && row.value ? row.value.title : void 0;
      const title = snap && typeof snap.title === "string" ? snap.title.trim() : "";
      if (title === "") continue;
      const item = need.find((it) => it.sessionId === row.sessionId);
      if (!item) continue;
      titleCache.set(item.sessionId, { title, at: Date.now() });
      item.title = title;
    }
  } catch {
  }
  if (titleCache.size > 1e3) {
    for (const [id, row] of titleCache) {
      if (now - row.at >= TITLE_TTL_MS) titleCache.delete(id);
    }
  }
  return items;
}

// src/host/mp/lib/answerers.js
import { randomUUID as randomUUID2 } from "node:crypto";
var TOUCH_TTL_MS = 5 * 60 * 1e3;
var MAX_PENDING = 50;
var touches = /* @__PURE__ */ new Map();
var approvals = /* @__PURE__ */ new Map();
var questions = /* @__PURE__ */ new Map();
function touchPhone(sessionId) {
  if (typeof sessionId === "string" && sessionId !== "") touches.set(sessionId, Date.now());
}
function phonePresent(sessionId) {
  const at = touches.get(sessionId);
  return at !== void 0 && Date.now() - at < TOUCH_TTL_MS;
}
function prune(map) {
  if (map.size <= MAX_PENDING) return;
  const keys = [...map.keys()].slice(0, map.size - MAX_PENDING);
  for (const key of keys) map.delete(key);
}
function agentSessionId(req, scoped) {
  const agent = scoped && scoped.agent || req && req.agent;
  const id = agent && agent.session && agent.session.id;
  return typeof id === "string" ? id : void 0;
}
function onAbort(signal, fn) {
  if (!signal) return () => {
  };
  if (signal.aborted) {
    fn();
    return () => {
    };
  }
  signal.addEventListener("abort", fn, { once: true });
  return () => signal.removeEventListener("abort", fn);
}
function pendingSnapshot(sessionId) {
  const list = (map) => [...map.values()].filter((row) => row.sessionId === sessionId).map((row) => row.view);
  return { approvals: list(approvals), questions: list(questions) };
}
function resolveApproval(sessionId, approvalId, outcome) {
  if (outcome !== "allowed-once" && outcome !== "rejected") {
    throw new Error("\u672A\u77E5\u7684\u5BA1\u6279\u51B3\u8BAE");
  }
  const row = approvals.get(approvalId);
  if (!row || row.sessionId !== sessionId) throw new Error("\u6CA1\u6709\u5F85\u5904\u7406\u7684\u5BA1\u6279");
  approvals.delete(approvalId);
  row.settle(outcome);
  return true;
}
function resolveQuestion(sessionId, rpcId, answers) {
  const row = questions.get(rpcId);
  if (!row || row.sessionId !== sessionId) throw new Error("\u6CA1\u6709\u5F85\u5904\u7406\u7684\u63D0\u95EE");
  if (!Array.isArray(answers)) throw new Error("\u56DE\u7B54\u683C\u5F0F\u4E0D\u5BF9");
  const clean = answers.filter((a) => a && typeof a.id === "string").map((a) => ({
    id: a.id,
    selected: Array.isArray(a.selected) ? a.selected.filter((s) => typeof s === "string") : [],
    ...typeof a.custom === "string" && a.custom !== "" ? { custom: a.custom } : {}
  }));
  questions.delete(rpcId);
  row.settle({ answers: clean });
  return true;
}
function claimApproval(ctx, tracker, emit) {
  return function approvalAnswerer(req, next) {
    let sessionId;
    try {
      sessionId = agentSessionId(req, this);
      if (!sessionId || !phonePresent(sessionId)) return next();
    } catch {
      return next();
    }
    const approvalId = randomUUID2();
    let settled = false;
    const finish = (outcome2) => {
      if (settled) return;
      settled = true;
      approvals.delete(approvalId);
      emit({ type: "approval/resolved", sessionId, approvalId });
    };
    const outcome = new Promise((resolve3) => {
      approvals.set(approvalId, {
        sessionId,
        settle: (value) => {
          finish(value);
          resolve3(value);
        },
        view: {
          rpcId: approvalId,
          approvalId,
          toolName: req.toolName || "tool",
          callId: req.callId,
          reason: req.reason
        }
      });
      prune(approvals);
    });
    emit({
      type: "approval/requested",
      sessionId,
      approvalId,
      rpcId: approvalId,
      toolName: req.toolName || "tool",
      callId: req.callId,
      reason: req.reason
    });
    const detach = onAbort(req.signal, () => {
      if (settled) return;
      finish("cancelled");
    });
    return outcome.then(
      (value) => {
        detach();
        finish(value);
        return value;
      },
      () => {
        detach();
        finish("cancelled");
        return "cancelled";
      }
    );
  };
}
function claimQuestion(ctx, tracker, emit) {
  return function questionAnswerer(req, next) {
    let sessionId;
    try {
      sessionId = agentSessionId(req, this);
      if (!sessionId || !phonePresent(sessionId)) return next();
      if (!req || !Array.isArray(req.questions)) return next();
    } catch {
      return next();
    }
    const rpcId = randomUUID2();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      questions.delete(rpcId);
      emit({ type: "question/resolved", sessionId, questionRpcId: rpcId });
    };
    const answer = new Promise((resolve3) => {
      questions.set(rpcId, {
        sessionId,
        settle: (value) => {
          finish();
          resolve3(value);
        },
        view: { rpcId, questions: req.questions }
      });
      prune(questions);
    });
    emit({ type: "question/requested", sessionId, rpcId, questions: req.questions });
    const detach = onAbort(req.signal, () => {
      if (settled) return;
      finish();
    });
    return answer.then(
      (value) => {
        detach();
        finish();
        return value;
      },
      () => {
        detach();
        finish();
        return { answers: [] };
      }
    );
  };
}
function setupAnswerers(ctx, tracker, emit) {
  const disposers = [];
  try {
    const off = ctx.on("approval/request", claimApproval(ctx, tracker, emit));
    if (typeof off === "function") disposers.push(off);
  } catch {
  }
  try {
    const off = ctx.on("user-questions/request", claimQuestion(ctx, tracker, emit));
    if (typeof off === "function") disposers.push(off);
  } catch {
  }
  return () => {
    for (const off of disposers) {
      try {
        off();
      } catch {
      }
    }
  };
}

// src/host/mp/lib/rpc.js
var quotaCache = { at: 0, value: null };
async function readQuotaSnapshot(ctx, force, signal) {
  if (!force && quotaCache.value && Date.now() - quotaCache.at < QUOTA_TTL_MS) {
    return quotaCache.value;
  }
  const webServer = svc(ctx, "webServer");
  const port2 = webServer && typeof webServer.port === "number" ? webServer.port : 3080;
  const [deepseek, grok] = await Promise.all([
    fetchLoopbackJson(port2, "/dsh-deepseek-balance", signal),
    fetchLoopbackJson(port2, "/dsh-grok-oauth/usage", signal)
  ]);
  const value = { deepseek, grok };
  quotaCache = { at: Date.now(), value };
  return value;
}
function foldHistoryForMobile(entries, maxMessages) {
  const norm = (entries || []).map((entry, idx) => {
    const ev = entry && (entry.event || entry);
    return { entry, ev, seq: typeof ev?.seq === "number" ? ev.seq : idx };
  }).sort((a, b) => a.seq - b.seq);
  const MESSAGE = /* @__PURE__ */ new Set(["user/message", "assistant/message"]);
  const messageRows = norm.filter(({ ev }) => ev && MESSAGE.has(ev.type));
  const keepFrom = messageRows.length <= maxMessages ? 0 : messageRows[messageRows.length - maxMessages].seq;
  const acc = /* @__PURE__ */ new Map();
  for (const { ev } of norm) {
    if (!ev || ev.type !== "assistant/chunk") continue;
    const data = isRecord(ev.data) ? ev.data : {};
    const chunk = isRecord(data.chunk) ? data.chunk : {};
    if (chunk.type !== "text-delta" && chunk.type !== "reasoning-delta") continue;
    const key = String(data.turn ?? 0) + "." + String(data.step ?? 0);
    const cur = acc.get(key) || { text: "", reasoning: "" };
    const piece = typeof chunk.text === "string" ? chunk.text : "";
    if (chunk.type === "reasoning-delta") cur.reasoning += piece;
    else cur.text += piece;
    acc.set(key, cur);
  }
  const DROP = /* @__PURE__ */ new Set(["assistant/chunk", "request/header", "tool/result", "web/deepseek-search-llm-request", "session/title-llm-request"]);
  const events = [];
  for (const { entry, ev, seq } of norm) {
    if (seq < keepFrom) continue;
    if (!ev || DROP.has(ev.type)) continue;
    if (ev.type === "assistant/message") {
      const data = isRecord(ev.data) ? ev.data : {};
      const message = isRecord(data.message) ? data.message : data;
      const merged = mergeChunkIntoMessage(message, acc.get(String(data.turn ?? 0) + "." + String(data.step ?? 0)));
      events.push({ event: { ...ev, data: isRecord(data.message) ? { ...data, message: merged } : merged } });
      continue;
    }
    events.push(entry);
  }
  return { events, hasMore: messageRows.length > maxMessages };
}
function mergeChunkIntoMessage(message, chunked) {
  const content = Array.isArray(message.content) ? message.content.map((b) => b) : [];
  const hasText = content.some((b) => b && b.type === "text");
  const hasReasoning = content.some((b) => b && b.type === "reasoning");
  if (chunked && chunked.text !== "" && !hasText) content.unshift({ type: "text", text: chunked.text });
  if (chunked && chunked.reasoning !== "" && !hasReasoning) content.push({ type: "reasoning", text: chunked.reasoning });
  return { ...message, content };
}
function sessionCursor(row) {
  return String(row.updatedAt) + ":" + String(row.sessionId);
}
function paginateSessions(items, cursor) {
  const start = cursor ? Math.max(0, items.findIndex((row) => sessionCursor(row) === cursor) + 1) : 0;
  const page = items.slice(start, start + SESSION_PAGE);
  const last = page[page.length - 1];
  const nextCursor = last && start + page.length < items.length ? sessionCursor(last) : void 0;
  return { items: page, hasMore: Boolean(nextCursor), nextCursor };
}
function sessionsForWorkspace(items, workspaceId, workspaces) {
  if (!workspaceId) return items;
  const ws = (workspaces || []).find((row) => row.workspaceId === workspaceId);
  const owned = new Set(ws?.sessionIds || []);
  return items.filter((row) => owned.has(row.sessionId));
}
var ok = (rpcId, value) => ({ type: "server-response", rpcId, result: { ok: true, value } });
var fail = (rpcId, code, message) => ({ type: "server-response", rpcId, result: { ok: false, error: { code, message } } });
function createDispatcher(ctx) {
  return async (method, payload, rpcId, signal) => {
    const sid = payload && typeof payload.sessionId === "string" ? payload.sessionId : "";
    if (sid !== "") touchPhone(sid);
    try {
      if (method === "workspace.list") return ok(rpcId, listWorkspaces(ctx));
      if (method === "workspace.create") {
        if (!payload || typeof payload.path !== "string") return fail(rpcId, "bad-request", "\u7F3A\u5C11\u76EE\u5F55\u8DEF\u5F84");
        return ok(rpcId, await createWorkspace(ctx, payload.path));
      }
      if (method === "host.listDirectory") {
        return wrap(rpcId, await listHostDirectory(payload, signal));
      }
      if (method === "agentPreset.list") return ok(rpcId, await listPresets(ctx));
      if (method === "session.create") return ok(rpcId, await createSession(ctx, payload || {}));
      if (method === "session.history") {
        const max = Number.isFinite(payload?.maxMessages) ? payload.maxMessages : 30;
        const raw = await readHistory(ctx, {
          sessionId: payload?.sessionId,
          maxMessages: max,
          beforeSeq: typeof payload?.beforeSeq === "number" ? payload.beforeSeq : void 0
        }, signal);
        const folded = foldHistoryForMobile(raw.events, max);
        const cwd = await sessionCwd2(ctx, payload?.sessionId, signal);
        folded.events = await slimHistoryImages(folded.events, cwd);
        return {
          type: "server-response",
          rpcId,
          result: { ok: true, value: { events: folded.events, hasMore: folded.hasMore, projections: raw.projections } }
        };
      }
      if (method === "session.prompt") {
        const next = await persistPhoneImages(ctx, payload, signal);
        const res = await promptSession(ctx, next, signal);
        return ok(rpcId, res && typeof res === "object" ? res : { accepted: true });
      }
      if (method === "session.cancel") return ok(rpcId, await cancelSession(ctx, sid, signal));
      if (method === "session.attachment") {
        return ok(rpcId, await readAttachment(ctx, sid, payload?.attachmentId, signal));
      }
      if (method === "session.models") return ok(rpcId, await modelView(ctx, sid));
      if (method === "session.selectModel") {
        const res = await selectSessionModel(ctx, payload || {}, signal);
        return ok(rpcId, res && typeof res === "object" ? res : { selected: payload });
      }
      if (method === "mobile.pending") return ok(rpcId, pendingSnapshot(sid));
      if (method === "mobile.respond") {
        const kind = payload && payload.type;
        if (kind === "approval") {
          resolveApproval(sid, payload.approvalId, payload.outcome);
          return ok(rpcId, { resolved: true });
        }
        if (kind === "question") {
          resolveQuestion(sid, payload.rpcId, payload.answers);
          return ok(rpcId, { resolved: true });
        }
        return fail(rpcId, "bad-request", "unknown respond type");
      }
      if (method === "skill.list") return ok(rpcId, await listSkills(ctx, sid, signal));
      if (method === "command.list") {
        const commands = svc(ctx, "commands");
        const agent = sid && commands ? svc(ctx, "agents")?.get(sid) : void 0;
        if (!agent || !commands || typeof commands.list !== "function") return ok(rpcId, { items: [] });
        const items = commands.list(agent).map((row) => ({
          name: row.name,
          description: row.description,
          hint: row.input && typeof row.input.hint === "string" ? row.input.hint : void 0
        }));
        return ok(rpcId, { items });
      }
      if (method === "command.execute") {
        const line = payload && typeof payload.line === "string" ? payload.line : "";
        const commands = svc(ctx, "commands");
        const agent = sid && commands ? svc(ctx, "agents")?.get(sid) : void 0;
        if (!agent || !commands || typeof commands.execute !== "function") {
          return fail(rpcId, "unavailable", "\u5BBF\u4E3B\u547D\u4EE4\u670D\u52A1\u4E0D\u53EF\u7528");
        }
        const execution = await commands.execute(agent, line, [], signal);
        if (execution === void 0) return fail(rpcId, "unknown-command", "\u672A\u77E5\u547D\u4EE4");
        return ok(rpcId, { matched: true, result: execution.result });
      }
      if (method === "quota.read") {
        return ok(rpcId, await readQuotaSnapshot(ctx, payload?.force === true, signal));
      }
      if (method === "host.restart") {
        try {
          const webServer = svc(ctx, "webServer");
          const port2 = webServer && typeof webServer.port === "number" ? webServer.port : 3080;
          const res = await fetch("http://127.0.0.1:" + port2 + "/dsh-web-restart", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ confirm: true }),
            signal
          });
          const value = await res.json();
          return { type: "server-response", rpcId, result: { ok: res.ok, value } };
        } catch (err) {
          return fail(rpcId, "restart-failed", err instanceof Error ? err.message : String(err));
        }
      }
      if (method === "session.list") {
        const all = await listSessionSummaries(ctx, signal);
        const sorted = [...all].sort((a, b) => b.updatedAt - a.updatedAt);
        const workspaceId = payload && typeof payload.workspaceId === "string" ? payload.workspaceId : "";
        const items = sessionsForWorkspace(sorted, workspaceId, listWorkspaces(ctx).items);
        const cursor = payload && typeof payload.cursor === "string" ? payload.cursor : void 0;
        const page = paginateSessions(items, cursor);
        await enrichTitles(ctx, page.items, signal);
        return ok(rpcId, page);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return fail(rpcId, "internal", message);
    }
    throw new Error("unhandled " + method);
  };
}

// src/host/mp/lib/routes.js
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { basename as basename3, extname as extname2, join as join5, resolve as resolve2 } from "node:path";
function handleStaticFile(filePath, req, res) {
  try {
    const ext = extname2(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const body = readFileSync2(filePath);
    const headers = { "content-type": contentType, "cache-control": "no-store" };
    if (basename3(filePath) === "sw.js") headers["service-worker-allowed"] = PREFIX + "/";
    res.writeHead(200, headers);
    res.end(body);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not Found");
    } else {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
    }
  }
}
function unpaired(res) {
  json(res, 403, { ok: false, error: { code: "unpaired", message: "\u6B64\u8BBE\u5907\u672A\u914D\u5BF9\uFF1A\u8BF7\u5728\u7535\u8111\u7AEF\u91CD\u65B0\u751F\u6210\u914D\u5BF9\u94FE\u63A5\u3002" } });
}
function gate(auth, req, res) {
  if (auth.requirePairing && !auth.touch(req)) {
    unpaired(res);
    return false;
  }
  return true;
}
function subscribeFrames(ctx, hub, { hostOnly = false } = {}) {
  let queue = null;
  const offs = [];
  const track = (off) => {
    if (typeof off === "function") offs.push(off);
  };
  try {
    if (!hostOnly) {
      track(ctx.on("session/event", (session, event) => {
        if (queue && session && typeof session.id === "string") {
          queue({ type: "session/event", sessionId: session.id, event });
        }
        try {
          const data = event && event.type === "session/title" && event.data ? event.data : null;
          if (data && session && typeof session.id === "string") noteTitle(session.id, data.title);
        } catch {
        }
      }));
    }
    track(ctx.on("api-session/added", (summary) => {
      if (queue && summary && typeof summary.sessionId === "string") {
        queue({ type: "host/session-added", sessionId: summary.sessionId, summary });
      }
    }));
    track(ctx.on("api-session/removed", (sessionId) => {
      if (queue && typeof sessionId === "string") queue({ type: "host/session-removed", sessionId });
    }));
    track(ctx.on("api-session/status", (sessionId, running) => {
      if (queue && typeof sessionId === "string") {
        queue({ type: "host/session-status", sessionId, running: running === true });
      }
    }));
    track(hub.subscribe((frame) => {
      if (queue) queue(frame);
    }));
  } catch {
  }
  const stream = async function* (signal) {
    const pending = [];
    let wake = void 0;
    queue = (frame) => {
      pending.push(frame);
      if (wake) {
        const w = wake;
        wake = void 0;
        w();
      }
    };
    const onAbort2 = () => {
      if (wake) {
        const w = wake;
        wake = void 0;
        w();
      }
    };
    if (signal) signal.addEventListener("abort", onAbort2, { once: true });
    try {
      while (!signal || !signal.aborted) {
        const next = pending.shift();
        if (next === void 0) {
          await new Promise((resolve3) => {
            wake = resolve3;
          });
          continue;
        }
        yield next;
      }
    } finally {
      queue = null;
      if (signal) signal.removeEventListener("abort", onAbort2);
      for (const off of offs) {
        try {
          off();
        } catch {
        }
      }
    }
  };
  return (signal) => stream(signal);
}
function setupRoutes(ctx, auth, pendingTracker, dispatch, hub) {
  const handleSetup = (req, res) => {
    if (!isLoopback(req)) {
      res.writeHead(403);
      res.end("setup is loopback only");
      return;
    }
    handleStaticFile(join5(PUBLIC, "setup.html"), req, res);
  };
  const handleApp = (req, res) => {
    const paired = auth.requirePairing && auth.touch(req);
    const extra = paired ? auth.cookieHeadersIfPaired(req) : auth.grantWebSession ? clearCookieForRequest(req) : {};
    const body = readFileSync2(join5(PUBLIC, "app.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...extra });
    res.end(body);
  };
  const handleWeb = (req, res) => {
    const paired = !auth.requirePairing || auth.touch(req);
    const extra = paired ? auth.cookieHeadersIfPaired(req) : {};
    res.writeHead(302, { "cache-control": "no-store", ...extra, location: paired ? "/" : PREFIX + "/" });
    res.end();
  };
  const handleEvents = async (req, res) => {
    if (!gate(auth, req, res)) return;
    await pipeSse(req, res, subscribeFrames(ctx, hub), auth, pendingTracker);
  };
  const handleHostEvents = async (req, res) => {
    if (!gate(auth, req, res)) return;
    await pipeSse(req, res, subscribeFrames(ctx, hub, { hostOnly: true }), auth, pendingTracker);
  };
  const handleApi = async (req, res) => {
    const pathname = new URL(req.url || "/", "http://x").pathname;
    if (pathname === PREFIX + "/api/events.mux") {
      await handleEvents(req, res);
      return;
    }
    if (pathname === PREFIX + "/api/events.host") {
      await handleHostEvents(req, res);
      return;
    }
    if (pathname === PREFIX + "/api/mobile.upload") {
      if (!gate(auth, req, res)) return;
      await handleUpload(ctx, req, res);
      return;
    }
    if (!gate(auth, req, res)) return;
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }
    const method = pathname.slice((PREFIX + "/api/").length);
    if (!ALLOW.has(method)) {
      json(res, 403, { ok: false, error: { code: "forbidden", message: method } });
      return;
    }
    let envelope;
    try {
      envelope = await readBody(req, method === "session.prompt" ? MAX_BODY : 256 * 1024);
    } catch (error) {
      json(res, 400, { ok: false, error: { code: "bad-request", message: String(error.message || error) } });
      return;
    }
    const rpcId = typeof envelope.rpcId === "string" ? envelope.rpcId : "";
    if (rpcId === "") {
      json(res, 400, { ok: false, error: { code: "bad-request", message: "missing rpcId" } });
      return;
    }
    if (envelope.payload && typeof envelope.payload.sessionId === "string") touchPhone(envelope.payload.sessionId);
    try {
      const abort = new AbortController();
      res.on("close", () => {
        if (!res.writableEnded) abort.abort();
      });
      json(res, 200, await dispatch(method, envelope.payload, rpcId, abort.signal));
    } catch (error) {
      json(res, 200, {
        type: "server-response",
        rpcId,
        result: { ok: false, error: { code: "internal", message: error instanceof Error ? error.message : String(error) } }
      });
    }
  };
  const handleStaticRoute = (req, res) => {
    let pathname = new URL(req.url || "/", "http://x").pathname;
    if (pathname.startsWith(PREFIX + "/")) pathname = pathname.slice((PREFIX + "/").length);
    else if (pathname.startsWith(PREFIX)) pathname = pathname.slice(PREFIX.length);
    if (pathname.startsWith("/")) pathname = pathname.slice(1);
    if (pathname === "" || pathname === "index.html" || pathname === "app.html") {
      handleApp(req, res);
      return;
    }
    const target = resolve2(PUBLIC, pathname);
    if (target.startsWith(PUBLIC) && existsSync2(target)) {
      handleStaticFile(target, req, res);
      return;
    }
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  };
  const routes = [
    { kind: "exact", path: PREFIX + "/setup", handler: handleSetup },
    { kind: "exact", path: PREFIX, handler: handleApp },
    { kind: "exact", path: PREFIX + "/", handler: handleApp },
    { kind: "exact", path: PREFIX + "/web", handler: handleWeb },
    { kind: "exact", path: PREFIX + "/pair/issue", handler: (req, res) => auth.handleIssue(ctx.webServer.port, req, res) },
    { kind: "exact", path: PREFIX + "/pair/accept", handler: auth.handleAccept },
    { kind: "exact", path: PREFIX + "/pair/status", handler: auth.handleStatus },
    { kind: "exact", path: PREFIX + "/pair/stop", handler: auth.handleStop },
    { kind: "exact", path: PREFIX + "/pair/revoke", handler: auth.handleRevoke },
    { kind: "exact", path: PREFIX + "/api/events.mux", handler: handleEvents },
    { kind: "exact", path: PREFIX + "/api/events.host", handler: handleHostEvents },
    { kind: "prefix", path: PREFIX + "/api", handler: handleApi },
    { kind: "prefix", path: PREFIX, handler: handleStaticRoute }
  ];
  const stop = routes.map((route) => ctx.webServer.register(route));
  return () => {
    for (const dispose of stop) dispose();
  };
}

// src/host/mp/index.js
function warn(ctx, message) {
  try {
    console.warn(message);
  } catch {
  }
  void ctx;
}
function apply(ctx, config = {}) {
  if (config.enabled === false) return;
  const auth = new AuthManager(config);
  const hub = createFrameHub();
  const tracker = createPendingTracker();
  const dispatch = createDispatcher(ctx, tracker);
  try {
    auth.setupWebSession(ctx.get("credentials"));
  } catch {
  }
  try {
    const disposeAnswerers = setupAnswerers(ctx, tracker, hub.emit);
    ctx.effect(() => disposeAnswerers, "dsh-mobile-plus: answerers");
  } catch (error) {
    warn(ctx, "[dsh-mobile-plus] \u56DE\u7B54\u5668\u6302\u8F7D\u5931\u8D25\uFF1A" + String(error));
  }
  try {
    ctx.inject(["webServer"], (webCtx) => {
      let stop = void 0;
      try {
        stop = setupRoutes(webCtx, auth, tracker, dispatch, hub);
      } catch (error) {
        warn(ctx, "[dsh-mobile-plus] \u8DEF\u7531\u6302\u8F7D\u5931\u8D25\uFF1A" + String(error));
      }
      return () => {
        if (stop) {
          try {
            stop();
          } catch {
          }
        }
      };
    });
  } catch (error) {
    warn(ctx, "[dsh-mobile-plus] webServer \u6CE8\u5165\u5931\u8D25\uFF1A" + String(error));
  }
  try {
    let port2 = 3080;
    try {
      const found = ctx.get("webServer")?.port;
      if (typeof found === "number") port2 = found;
    } catch {
    }
    const bridge = new LanBridge(port2, 3088);
    ctx.effect(() => {
      void bridge.start().then((boundPort) => {
        if (boundPort) auth.lanPort = boundPort;
      });
      return () => bridge.stop();
    }, "dsh-mobile-plus: lan bridge");
  } catch (error) {
    warn(ctx, "[dsh-mobile-plus] \u5C40\u57DF\u7F51\u6865\u63A5\u6302\u8F7D\u5931\u8D25\uFF1A" + String(error));
  }
  try {
    if (auth.pushUrl !== "") {
      ctx.effect(() => {
        const timer = setTimeout(() => {
          void auth.autoIssuePush(port);
        }, 2e3);
        return () => clearTimeout(timer);
      }, "dsh-mobile-plus: startup token push");
    }
  } catch (error) {
    warn(ctx, "[dsh-mobile-plus] \u542F\u52A8\u4EE4\u724C\u63A8\u9001\u6302\u8F7D\u5931\u8D25\uFF1A" + String(error));
  }
}

// src/host/pill-host.ts
import { readFileSync as readFileSync3 } from "node:fs";
var ROUTE = "/api/dsh-done-pill";
var HOT_ROUTE = "/api/dsh-done-pill/shell-hot";
var MAX_ITEMS = 50;
var MAX_TEXT_CHARS = 2e4;
function eventsOf(session) {
  const candidate = session;
  if (typeof candidate.snapshotEvents === "function") {
    try {
      const snapshot = candidate.snapshotEvents();
      if (Array.isArray(snapshot)) return snapshot;
    } catch {
    }
    return [];
  }
  return session.events ?? [];
}
function readShellCdpPort() {
  try {
    const raw = readFileSync3("D:/AI/Dsh/.shell-cdp-port", "utf8").trim();
    const port2 = Number(raw);
    return Number.isInteger(port2) && port2 > 0 && port2 < 65536 ? port2 : null;
  } catch {
    return null;
  }
}
async function fetchShellTargets(port2) {
  try {
    const res = await fetch(`http://127.0.0.1:${port2}/json/list`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return null;
    const list = await res.json();
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}
async function connectShell(port2, targetId, onDead) {
  const WS = globalThis.WebSocket;
  if (typeof WS !== "function") return null;
  const ws = new WS(`ws://127.0.0.1:${port2}/devtools/page/${targetId}`);
  await new Promise((resolve3, reject) => {
    const timer = setTimeout(() => {
      try {
        ws.close();
      } catch {
      }
      reject(new Error("cdp ws handshake timeout"));
    }, 2e3);
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve3();
    });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("cdp ws error"));
    });
  });
  let seq = 0;
  function evalInShell(expression) {
    const id = ++seq;
    try {
      ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, returnByValue: false } }));
    } catch {
    }
  }
  const SHELL_HOT_PATCH = `
(function () {
  var w = window
  var mod = w.__dshPillHot || (w.__dshPillHot = { state: { over: false, rects: [] } })
  if (mod.ready) return
  mod.ready = true
  var strip = document.getElementById('drag-strip')
  if (strip !== null) {
    var style = document.createElement('style')
    style.id = 'dsh-pill-hot-style'
    style.textContent = '#drag-strip.dsh-pill-hot{pointer-events:none !important;-webkit-app-region:no-drag !important;}'
    document.head.appendChild(style)
    strip.addEventListener('mousemove', function (e) {
      var m = window.__dshPillHot
      if (!m || !m.ready) return
      var hit = (m.state.rects || []).some(function (r) {
        return e.clientX >= r.x && e.clientX < r.x + r.w && e.clientY >= r.y && e.clientY < r.y + r.h
      })
      strip.classList.toggle('dsh-pill-hot', hit)
    }, true)
  }
  mod.strip = function () { return document.getElementById('drag-strip') }
})()`;
  evalInShell(SHELL_HOT_PATCH);
  let lastSig = "";
  function applyState(state) {
    const sig = JSON.stringify(state);
    if (sig === lastSig) return;
    lastSig = sig;
    evalInShell(`(function () {
  var mod = window.__dshPillHot
  if (!mod || !mod.ready) return
  mod.state = ${sig}
  var strip = mod.strip ? mod.strip() : null
  if (strip !== null) strip.classList.toggle('dsh-pill-hot', ${state.over ? "true" : "false"})
})()`);
  }
  ws.addEventListener("close", onDead);
  ws.addEventListener("error", () => {
    try {
      ws.close();
    } catch {
    }
  });
  return {
    send(state) {
      applyState(state);
    },
    close() {
      try {
        applyState({ over: false, rects: [] });
      } catch {
      }
      try {
        ws.close();
      } catch {
      }
    }
  };
}
function createShellHotZone() {
  const SHELL_RETRY_MS = 5e3;
  let conn = null;
  let connecting = null;
  let retryAt = 0;
  let stopped = false;
  let pendingState = null;
  let flushTimer = null;
  async function ensureConn() {
    if (stopped) return null;
    if (conn !== null) return conn;
    if (connecting !== null) return connecting;
    if (Date.now() < retryAt) return null;
    connecting = (async () => {
      try {
        const port2 = readShellCdpPort();
        if (port2 === null) {
          retryAt = Date.now() + SHELL_RETRY_MS;
          return null;
        }
        const targets = await fetchShellTargets(port2);
        if (targets === null) {
          retryAt = Date.now() + SHELL_RETRY_MS;
          return null;
        }
        const page = targets.find((t) => t.type === "page" && t.url.includes("topbar.html"));
        if (page === void 0) {
          retryAt = Date.now() + SHELL_RETRY_MS;
          return null;
        }
        const established = await connectShell(port2, page.id, () => {
          conn = null;
          retryAt = Date.now() + SHELL_RETRY_MS;
        });
        if (established === null) {
          retryAt = Date.now() + SHELL_RETRY_MS;
          return null;
        }
        conn = established;
        return established;
      } catch {
        retryAt = Date.now() + SHELL_RETRY_MS;
        return null;
      } finally {
        connecting = null;
      }
    })();
    return connecting;
  }
  function flush() {
    flushTimer = null;
    const state = pendingState;
    pendingState = null;
    if (state === null || stopped) return;
    void ensureConn().then((c) => {
      c?.send(state);
    });
  }
  return {
    handle(state) {
      if (stopped) return;
      pendingState = state;
      if (flushTimer === null) flushTimer = setTimeout(flush, 80);
    },
    stop() {
      stopped = true;
      if (flushTimer !== null) clearTimeout(flushTimer);
      flushTimer = null;
      conn?.close();
      conn = null;
    }
  };
}
function blocksToText(content) {
  if (!Array.isArray(content)) return "";
  const parts = [];
  for (const block of content) {
    if (block === null || typeof block !== "object") continue;
    const type = block.type;
    if (type === "text" && typeof block.text === "string") {
      parts.push(block.text);
    } else if (type === "image") {
      parts.push("[\u56FE\u7247]");
    }
  }
  return parts.join("\n").trim();
}
function clampText(text) {
  return text.length <= MAX_TEXT_CHARS ? text : `${text.slice(0, MAX_TEXT_CHARS)}\u2026`;
}
function workspaceTitleOf(cwd) {
  return cwd.replace(/[/\\]+$/, "").split(/[/\\]/).pop() ?? "";
}
function applyDonePill(ctx) {
  const hotZone = createShellHotZone();
  const titles = /* @__PURE__ */ new Map();
  const items = [];
  const runningTurns = /* @__PURE__ */ new Map();
  const lastQuestions = /* @__PURE__ */ new Map();
  const seqBase = Date.now();
  let counter = 0;
  function titleOf(session) {
    const cached = titles.get(session.id);
    if (cached !== void 0 && cached !== "") return cached;
    const events = eventsOf(session);
    for (let i = events.length - 1; i >= 0; i--) {
      const data = events[i]?.data;
      if (events[i]?.type === "session/title" && typeof data?.title === "string" && data.title !== "") {
        titles.set(session.id, data.title);
        return data.title;
      }
    }
    const cwd = session.header?.cwd;
    if (typeof cwd === "string" && cwd !== "") {
      const base = workspaceTitleOf(cwd);
      if (base !== "") return base;
    }
    return session.id;
  }
  function extractTurnTexts(events, turn) {
    const answerParts = [];
    let question = "";
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      if (event === void 0) continue;
      if (event.type === "assistant/message") {
        if (event.data?.turn === turn) {
          const text = blocksToText(event.data.message?.content);
          if (text !== "") answerParts.push(text);
        }
        continue;
      }
      if (event.type === "user/message" && event.data?.source?.kind === "user") {
        question = clampText(blocksToText(event.data.content));
        break;
      }
    }
    return { question, answer: clampText(answerParts.reverse().join("\n\n")) };
  }
  ctx.on("session/event", ((session, event) => {
    try {
      if (event.type === "session/title") {
        if (typeof event.data?.title === "string" && event.data.title !== "") {
          titles.set(session.id, event.data.title);
        }
        return;
      }
      if (event.type === "user/message") {
        if (event.data?.source?.kind === "user") {
          const text = clampText(blocksToText(event.data.content));
          if (text !== "") {
            lastQuestions.set(session.id, text);
            const running = runningTurns.get(session.id);
            if (running !== void 0) runningTurns.set(session.id, { ...running, question: text });
          }
        }
        return;
      }
      if (event.type === "turn/start") {
        if (session.header?.origin === "subagent") return;
        runningTurns.set(session.id, { since: Date.now(), question: lastQuestions.get(session.id) ?? "", title: titleOf(session) });
        return;
      }
      if (event.type !== "turn/end") return;
      runningTurns.delete(session.id);
      lastQuestions.delete(session.id);
      if (session.header?.origin === "subagent") return;
      const reasonKind = typeof event.data?.reason?.kind === "string" ? event.data.reason.kind : "";
      if (reasonKind === "aborted") return;
      const turn = typeof event.data?.turn === "number" ? event.data.turn : -1;
      const events = eventsOf(session);
      const { question, answer } = extractTurnTexts(events, turn);
      if (question === "" && answer === "") return;
      counter += 1;
      const seq = seqBase + counter;
      items.push({
        seq,
        id: String(seq),
        sessionId: session.id,
        title: titleOf(session),
        question,
        answer,
        endedAt: Date.now(),
        turn,
        reasonKind
      });
      if (items.length > MAX_ITEMS) items.splice(0, items.length - MAX_ITEMS);
    } catch (error) {
      ctx.logger?.warn?.(`[dsh-done-pill] turn/end handling failed for ${session.id}: ${String(error)}`);
    }
  }), { global: true });
  const webServer = ctx.get("webServer");
  if (webServer === void 0) return;
  ctx.effect(() => {
    try {
      return webServer.register({
        kind: "exact",
        path: ROUTE,
        handler: (req, res) => {
          if (req.method !== "GET") {
            res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, message: "method not allowed" }));
            return;
          }
          let since = 0;
          try {
            const url = new URL(req.url ?? "/", "http://localhost");
            const raw = url.searchParams.get("since");
            if (raw !== null && /^\d+$/.test(raw)) since = Number(raw);
          } catch {
          }
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
          res.end(JSON.stringify({
            ok: true,
            version: seqBase + counter,
            items: items.filter((item) => item.seq > since),
            running: [...runningTurns.entries()].map(([sessionId, info]) => ({
              sessionId,
              since: info.since,
              question: info.question,
              title: info.title
            }))
          }));
        }
      });
    } catch (error) {
      ctx.logger?.warn?.(`[dsh-done-pill] route ${ROUTE} already registered (webui done-pill \u6A21\u5757\u5171\u5B58\uFF1F): ${String(error)}`);
      return void 0;
    }
  }, "dsh-done-pill: done-pill route");
  ctx.effect(() => {
    try {
      return webServer.register({
        kind: "exact",
        path: HOT_ROUTE,
        handler: (req, res) => {
          if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, message: "method not allowed" }));
            return;
          }
          let body = "";
          let tooLarge = false;
          req.on("data", (chunk) => {
            body += chunk.toString();
            if (body.length > 4096) {
              tooLarge = true;
              req.destroy();
            }
          });
          req.on("end", () => {
            if (tooLarge) return;
            try {
              const parsed = JSON.parse(body || "{}");
              const rects = Array.isArray(parsed.rects) ? parsed.rects.filter((r) => r !== null && typeof r === "object" && Number.isFinite(r.x) && Number.isFinite(r.y) && Number.isFinite(r.w) && Number.isFinite(r.h) && r.w > 0 && r.h > 0).map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })).slice(0, 8) : [];
              hotZone.handle({ over: parsed.over === true, rects });
            } catch {
            }
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
            res.end(JSON.stringify({ ok: true }));
          });
        }
      });
    } catch (error) {
      ctx.logger?.warn?.(`[dsh-done-pill] route ${HOT_ROUTE} already registered: ${String(error)}`);
      return void 0;
    }
  }, "dsh-done-pill: shell-hot route");
  ctx.effect(() => () => hotZone.stop(), "dsh-done-pill: shell-hot zone lifecycle");
  console.log(`[dsh-done-pill] done-pill mounted: ${ROUTE} + ${HOT_ROUTE} (global session/event listener active)`);
}

// src/host/index.js
var name = "dsh-companion";
var inject = ["webServer"];
function warn2(ctx, message) {
  try {
    if (typeof ctx.logger?.warn === "function") ctx.logger.warn(message);
    else console.warn(message);
  } catch {
  }
}
function apply2(ctx, config = {}) {
  try {
    apply(ctx, config);
  } catch (error) {
    warn2(ctx, "[dsh-companion] \u624B\u673A\u8FDC\u7A0B\u6302\u8F7D\u5931\u8D25\uFF1A" + String(error));
  }
  try {
    applyDonePill(ctx);
  } catch (error) {
    warn2(ctx, "[dsh-companion] \u5BF9\u8BDD\u80F6\u56CA\u6302\u8F7D\u5931\u8D25\uFF1A" + String(error));
  }
}
export {
  apply2 as apply,
  inject,
  name
};
/**
 * QR Code generator — extracted verbatim from qrcode.react 4.2.0
 * (lib/esm/index.js, lines 33-761), which embeds:
 * @license QR Code generator library (TypeScript)
 * Copyright (c) Project Nayuki. SPDX-License-Identifier: MIT
 *
 * No dependencies; used by the host side of dsh-mobile-plus to render
 * pairing QR codes as SVG for the desktop panel and mobile page.
 */
/**
 * @license QR Code generator library (TypeScript)
 * Copyright (c) Project Nayuki.
 * SPDX-License-Identifier: MIT
 */
