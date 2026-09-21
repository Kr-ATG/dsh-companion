window.__ModuleLoader__.load({ id: "dsh-companion", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply2,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/pill.tsx
var import_react3 = require("react");
var import_react_dom2 = require("react-dom");

// src/client/stores.ts
var MODE_KEY = "dsh.donePill.mode";
function createModeStore(key) {
  let value = "card";
  try {
    const raw = localStorage.getItem(key);
    value = raw === "float" ? "float" : "card";
  } catch {
  }
  const listeners = /* @__PURE__ */ new Set();
  return {
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      try {
        localStorage.setItem(key, next);
      } catch {
      }
      for (const fn of [...listeners]) fn(next);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }
  };
}
var modeStore = createModeStore(MODE_KEY);
var ENABLED_KEY = "dsh.donePill.enabled";
function createEnabledStore() {
  let value = true;
  try {
    const raw = localStorage.getItem(ENABLED_KEY);
    if (raw === "0" || raw === "false") value = false;
  } catch {
  }
  const listeners = /* @__PURE__ */ new Set();
  return {
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      try {
        localStorage.setItem(ENABLED_KEY, next ? "1" : "0");
      } catch {
      }
      for (const fn of [...listeners]) fn(next);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }
  };
}
var enabledStore = createEnabledStore();
var APPEARANCE_KEY = "dsh.donePill.appearance";
var FONT_OPTIONS = [
  { id: "system", label: "\u8DDF\u968F\u7CFB\u7EDF", stack: "" },
  { id: "yahei", label: "\u96C5\u9ED1", stack: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
  { id: "songti", label: "\u5B8B\u4F53 \xB7 \u886C\u7EBF", stack: "SimSun, 'Songti SC', serif" },
  { id: "kaiti", label: "\u6977\u4F53 \xB7 \u624B\u5199\u611F", stack: "KaiTi, 'Kaiti SC', cursive" },
  { id: "simhei", label: "\u9ED1\u4F53 \xB7 \u539A\u91CD", stack: "SimHei, sans-serif" },
  { id: "mono", label: "\u7B49\u5BBD \xB7 \u4EE3\u7801", stack: "Consolas, 'Courier New', monospace" },
  { id: "cute", label: "\u53EF\u7231 \xB7 \u5706\u6DA6", stack: "'Yuanti SC', 'YouYuan', '\u5E7C\u5706', 'HYWenHei-85W', 'Microsoft YaHei', sans-serif" },
  { id: "comic", label: "\u53EF\u7231 \xB7 \u6F2B\u753B", stack: "'Comic Sans MS', 'Comic Neue', 'Segoe UI', cursive" }
];
function fontStackOf(id) {
  return FONT_OPTIONS.find((option) => option.id === id)?.stack ?? "";
}
function createAppearanceStore(key) {
  let value = { scale: 1, font: "system" };
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      value = {
        scale: typeof parsed?.scale === "number" && Number.isFinite(parsed.scale) ? Math.min(1.6, Math.max(0.65, parsed.scale)) : 1,
        font: typeof parsed?.font === "string" ? parsed.font : "system"
      };
    }
  } catch {
  }
  const listeners = /* @__PURE__ */ new Set();
  return {
    get: () => value,
    set(next) {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
      }
      for (const fn of [...listeners]) fn(next);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }
  };
}
var appearanceStore = createAppearanceStore(APPEARANCE_KEY);

// src/client/sidebar-card.tsx
var import_react2 = require("react");
var import_react_dom = require("react-dom");

// src/client/idle-robot.tsx
var import_react = require("react");

// src/vendor/open-bot-motion.js
var OpenBotMotion = (function() {
  "use strict";
  var CHARCOAL = "#222126";
  var EYE = "#ffffff";
  var LOOP = 20.783;
  var Easings = {
    linear: function(p) {
      return p;
    },
    easeInOutQuad: function(p) {
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    },
    easeOutCubic: function(p) {
      return 1 - Math.pow(1 - p, 3);
    },
    easeInCubic: function(p) {
      return p * p * p;
    },
    easeInOutCubic: function(p) {
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    },
    springBouncy: function(p) {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      var c4 = 2 * Math.PI / 3;
      return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
    }
  };
  function clamp2(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function PoseTimeline(keyframes, options) {
    this.options = Object.assign({
      shortestArc: true,
      shortestArcAngles: ["yaw", "pitch", "roll"]
    }, options || {});
    var self = this;
    this.keyframes = keyframes.map(function(kf2) {
      return {
        t: kf2.t,
        label: kf2.label || "",
        ease: kf2.ease || "easeInOutQuad",
        shortestArc: kf2.shortestArc !== void 0 ? kf2.shortestArc : self.options.shortestArc,
        pose: Object.assign({}, kf2.pose)
      };
    }).sort(function(a, b) {
      return a.t - b.t;
    });
    if (this.options.shortestArc) {
      var angleKeys = this.options.shortestArcAngles;
      for (var k2 = 0; k2 < angleKeys.length; k2++) {
        var key = angleKeys[k2];
        var prevVal = null;
        for (var i = 0; i < this.keyframes.length; i++) {
          var kf = this.keyframes[i];
          if (kf.pose && typeof kf.pose[key] === "number") {
            if (prevVal !== null && kf.shortestArc !== false) {
              var diff = kf.pose[key] - prevVal;
              if (Math.abs(Math.abs(diff) - Math.PI) > 1e-4) {
                var shortDiff = ((diff + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
                kf.pose[key] = prevVal + shortDiff;
              }
            }
            prevVal = kf.pose[key];
          }
        }
      }
    }
  }
  PoseTimeline.prototype.evaluate = function(t) {
    var kfs = this.keyframes;
    if (t <= kfs[0].t) {
      return { pose: Object.assign({}, kfs[0].pose), label: kfs[0].label || "" };
    }
    if (t >= kfs[kfs.length - 1].t) {
      var last = kfs[kfs.length - 1];
      return { pose: Object.assign({}, last.pose), label: last.label || "" };
    }
    for (var i = 0; i < kfs.length - 1; i++) {
      var k0 = kfs[i];
      var k1 = kfs[i + 1];
      if (t >= k0.t && t <= k1.t) {
        var dur = k1.t - k0.t;
        var p = dur > 0 ? (t - k0.t) / dur : 1;
        var easeFn = Easings[k1.ease || "easeInOutQuad"] || Easings.easeInOutQuad;
        var ep = easeFn(clamp2(p, 0, 1));
        var res = {};
        var p0 = k0.pose;
        var p1 = k1.pose;
        var allKeys = new Set(Object.keys(p0).concat(Object.keys(p1)));
        allKeys.forEach(function(key) {
          var isScaleKey = key.indexOf("scale") !== -1 || key.indexOf("Scale") !== -1;
          var defVal = isScaleKey ? 1 : 0;
          var v0 = p0[key] !== void 0 ? p0[key] : p1[key] !== void 0 ? p1[key] : defVal;
          var v1 = p1[key] !== void 0 ? p1[key] : p0[key] !== void 0 ? p0[key] : defVal;
          if (typeof v1 === "number" && typeof v0 === "number") {
            res[key] = lerp(v0, v1, ep);
          } else if (key === "visible") {
            res[key] = Boolean(v0 || v1);
          } else {
            res[key] = p >= 0.5 ? v1 : v0;
          }
        });
        return { pose: res, label: k1.label || k0.label || "" };
      }
    }
    return { pose: Object.assign({}, kfs[0].pose), label: "" };
  };
  function BlinkTrack(blinks) {
    this.blinks = blinks || [];
  }
  BlinkTrack.prototype.evaluate = function(t) {
    for (var i = 0; i < this.blinks.length; i++) {
      var b = this.blinks[i];
      if (t >= b.start && t <= b.start + b.duration) {
        var p = (t - b.start) / b.duration;
        return (b.maxSquint || 0.95) * Math.sin(p * Math.PI);
      }
    }
    return 0;
  };
  function DotGridRig(spacing, baseRadius) {
    this.spacing = spacing !== void 0 ? spacing : 38;
    this.baseRadius = baseRadius !== void 0 ? baseRadius : 10.1;
  }
  DotGridRig.prototype.evaluate = function(t, botScale, botVisible) {
    var dots = [];
    var phase = t * Math.PI * 2 * 0.9 + 0.66;
    var cubeHalf = botVisible ? 68 * (botScale || 0) : 0;
    for (var row = -1; row <= 1; row++) {
      for (var col = -1; col <= 1; col++) {
        var diag = col + 1 + (row + 1);
        var wave = Math.cos(phase - diag * 0.65);
        var r = this.baseRadius + 3.25 * wave;
        var x = col * this.spacing;
        var y = row * this.spacing;
        var distBox = Math.max(Math.abs(x), Math.abs(y));
        var visible = true;
        if (botVisible && botScale > 0.05) {
          if (distBox < cubeHalf - 4) {
            visible = false;
            r = 0;
          } else if (distBox < cubeHalf + 10) {
            var fade = (distBox - (cubeHalf - 4)) / 14;
            r *= Math.max(0, Math.min(1, fade));
            if (r < 0.5) visible = false;
          }
        }
        dots.push({ x, y, r, visible });
      }
    }
    return dots;
  };
  function SvgProjector(options) {
    options = options || {};
    this.fov = (options.fov || 28) * Math.PI / 180;
    this.focalLength = 1 / Math.tan(this.fov / 2);
    this.camPos = options.cameraPosition || [-0.32, 0.4, 2.7];
    this.camTarget = options.cameraTarget || [0, 0, 0];
    this.viewportSize = options.viewportSize || 280;
    var c = this.camPos;
    var tgt = this.camTarget;
    var dist = Math.hypot(tgt[0] - c[0], tgt[1] - c[1], tgt[2] - c[2]);
    this.fwd = [(tgt[0] - c[0]) / dist, (tgt[1] - c[1]) / dist, (tgt[2] - c[2]) / dist];
    var up = [0, 1, 0];
    var rx = this.fwd[1] * up[2] - this.fwd[2] * up[1];
    var ry = this.fwd[2] * up[0] - this.fwd[0] * up[2];
    var rz = this.fwd[0] * up[1] - this.fwd[1] * up[0];
    var rlen = Math.hypot(rx, ry, rz);
    this.right = [rx / rlen, ry / rlen, rz / rlen];
    var ux = this.right[1] * this.fwd[2] - this.right[2] * this.fwd[1];
    var uy = this.right[2] * this.fwd[0] - this.right[0] * this.fwd[2];
    var uz = this.right[0] * this.fwd[1] - this.right[1] * this.fwd[0];
    this.camUp = [ux, uy, uz];
    this.halfSize = this.viewportSize / 2;
  }
  SvgProjector.prototype.projectWorldPoint = function(wx, wy, wz) {
    var dx = wx - this.camPos[0];
    var dy = wy - this.camPos[1];
    var dz = wz - this.camPos[2];
    var xc = dx * this.right[0] + dy * this.right[1] + dz * this.right[2];
    var yc = dx * this.camUp[0] + dy * this.camUp[1] + dz * this.camUp[2];
    var zc = dx * this.fwd[0] + dy * this.fwd[1] + dz * this.fwd[2];
    if (zc <= 1e-3) return null;
    var xs = xc / zc * this.focalLength * this.halfSize;
    var ys = -(yc / zc) * this.focalLength * this.halfSize;
    return { x: xs, y: ys, z: zc };
  };
  SvgProjector.getConvexHull = function(pts) {
    if (pts.length <= 1) return pts.slice();
    var sorted = pts.slice().sort(function(a, b) {
      return Math.abs(a.x - b.x) < 1e-5 ? a.y - b.y : a.x - b.x;
    });
    var cross = function(o, a, b) {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    };
    var lower = [];
    for (var i = 0; i < sorted.length; i++) {
      var p = sorted[i];
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 1e-5) {
        lower.pop();
      }
      lower.push(p);
    }
    var upper = [];
    for (var j = sorted.length - 1; j >= 0; j--) {
      var q = sorted[j];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 1e-5) {
        upper.pop();
      }
      upper.push(q);
    }
    lower.pop();
    upper.pop();
    var hull = lower.concat(upper);
    var area = 0;
    for (var k2 = 0; k2 < hull.length; k2++) {
      var next = (k2 + 1) % hull.length;
      area += hull[k2].x * hull[next].y - hull[next].x * hull[k2].y;
    }
    if (area < 0) hull.reverse();
    return hull;
  };
  SvgProjector.prototype.projectRoundedCube = function(pose, cubeW, cubeRadius) {
    cubeW = cubeW !== void 0 ? cubeW : 1;
    cubeRadius = cubeRadius !== void 0 ? cubeRadius : 0.35;
    if (!pose || pose.visible === false || pose.scale !== void 0 && pose.scale <= 1e-3) {
      return { visible: false, bodyPath: "", eyes: [] };
    }
    var s = (pose.scale !== void 0 ? pose.scale : 1) * 0.6;
    var scX = pose.scaleX !== void 0 ? pose.scaleX : 1;
    var scY = pose.scaleY !== void 0 ? pose.scaleY : 1;
    var scZ = pose.scaleZ !== void 0 ? pose.scaleZ : 1;
    var hw = cubeW / 2 * s * scX;
    var hh = cubeW / 2 * s * scY;
    var hd = cubeW / 2 * s * scZ;
    var r = cubeRadius * s * Math.min(scX, scY);
    var ihw = Math.max(1e-3, hw - r);
    var ihh = Math.max(1e-3, hh - r);
    var ihd = Math.max(1e-3, hd - r);
    var pitch = pose.pitch || 0;
    var yaw = pose.yaw || 0;
    var roll = pose.roll || 0;
    var cx = Math.cos(pitch), sx = Math.sin(pitch);
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var cz = Math.cos(roll), sz = Math.sin(roll);
    var r00 = cz * cy;
    var r01 = cz * sy * sx - sz * cx;
    var r02 = cz * sy * cx + sz * sx;
    var r10 = sz * cy;
    var r11 = sz * sy * sx + cz * cx;
    var r12 = sz * sy * cx - cz * sx;
    var r20 = -sy;
    var r21 = cy * sx;
    var r22 = cy * cx;
    var bx = pose.x || 0;
    var by = pose.y || 0;
    var bz = pose.z || 0;
    var signs = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1]
    ];
    var projPts = [];
    var avgZ = 0;
    for (var idx = 0; idx < signs.length; idx++) {
      var sgn = signs[idx];
      var vx = sgn[0] * ihw;
      var vy = sgn[1] * ihh;
      var vz = sgn[2] * ihd;
      var wx = bx + (r00 * vx + r01 * vy + r02 * vz);
      var wy = by + (r10 * vx + r11 * vy + r12 * vz);
      var wz = bz + (r20 * vx + r21 * vy + r22 * vz);
      var p = this.projectWorldPoint(wx, wy, wz);
      if (!p) continue;
      projPts.push(p);
      avgZ += p.z;
    }
    if (projPts.length < 4) {
      return { visible: false, bodyPath: "", eyes: [] };
    }
    avgZ /= projPts.length;
    var rScreen = r / avgZ * this.focalLength * this.halfSize;
    var hull = SvgProjector.getConvexHull(projPts);
    if (hull.length < 3) {
      return { visible: false, bodyPath: "", eyes: [] };
    }
    var m = hull.length;
    var segments = [];
    for (var k2 = 0; k2 < m; k2++) {
      var p0 = hull[k2];
      var p1 = hull[(k2 + 1) % m];
      var dx = p1.x - p0.x;
      var dy = p1.y - p0.y;
      var len = Math.hypot(dx, dy);
      if (len < 1e-5) continue;
      var nx = dy / len;
      var ny = -dx / len;
      var a = { x: p0.x + rScreen * nx, y: p0.y + rScreen * ny };
      var b = { x: p1.x + rScreen * nx, y: p1.y + rScreen * ny };
      segments.push({ a, b, corner: p1 });
    }
    var bodyPath = "";
    if (segments.length >= 3) {
      var d = [];
      for (var si = 0; si < segments.length; si++) {
        var seg = segments[si];
        var nextSeg = segments[(si + 1) % segments.length];
        if (si === 0) {
          d.push("M " + seg.a.x.toFixed(2) + " " + seg.a.y.toFixed(2));
        }
        d.push("L " + seg.b.x.toFixed(2) + " " + seg.b.y.toFixed(2));
        d.push("A " + rScreen.toFixed(2) + " " + rScreen.toFixed(2) + " 0 0 1 " + nextSeg.a.x.toFixed(2) + " " + nextSeg.a.y.toFixed(2));
      }
      d.push("Z");
      bodyPath = d.join(" ");
    }
    var eyes = [];
    var fnx = r02;
    var fny = r12;
    var fnz = r22;
    var viewDot = -(fnx * this.fwd[0] + fny * this.fwd[1] + fnz * this.fwd[2]);
    var viewFade = 1;
    if (viewDot <= 0) {
      viewFade = 0;
    } else if (viewDot < 0.15) {
      var u = viewDot / 0.15;
      viewFade = u * u * (3 - 2 * u);
    }
    var showEyes = pose.showEyes !== false && viewFade > 1e-3;
    if (showEyes) {
      var zFace = (pose.zFace !== void 0 ? pose.zFace : 0.508) * s * scZ;
      var self = this;
      var computeFeaturePoint = function(fx2, fy2) {
        var wx2 = bx + (r00 * fx2 + r01 * fy2 + r02 * zFace);
        var wy2 = by + (r10 * fx2 + r11 * fy2 + r12 * zFace);
        var wz2 = bz + (r20 * fx2 + r21 * fy2 + r22 * zFace);
        return self.projectWorldPoint(wx2, wy2, wz2);
      };
      var getAngle = function(baseP, upP, slant) {
        if (!baseP || !upP) return 0;
        var adx = upP.x - baseP.x;
        var ady = upP.y - baseP.y;
        var baseAngle = Math.atan2(adx, -ady) * (180 / Math.PI);
        return baseAngle - slant * 180 / Math.PI;
      };
      var rawFeatures = null;
      if (Array.isArray(pose.faceFeatures) && pose.faceFeatures.length > 0) {
        rawFeatures = pose.faceFeatures;
      } else if (Array.isArray(pose.features) && pose.features.length > 0) {
        rawFeatures = pose.features;
      } else {
        var baseGap = (pose.eyeGap !== void 0 ? pose.eyeGap : 0.27) * s * scX;
        var eyeX = (pose.eyeShiftX || 0) * s * scX;
        var baseEyeY = (0.01 - (pose.bulge || 0) * 0.02 + (pose.eyeShiftY || 0)) * s * scY;
        var eyeYL = baseEyeY + (pose.eyeShiftYL || 0) * s * scY;
        var eyeYR = baseEyeY + (pose.eyeShiftYR || 0) * s * scY;
        var slantL = pose.eyeSlantL !== void 0 ? pose.eyeSlantL : pose.eyeSlant || 0;
        var slantR = pose.eyeSlantR !== void 0 ? pose.eyeSlantR : -(pose.eyeSlant || 0);
        var sxL = pose.eyeScaleXL !== void 0 ? pose.eyeScaleXL : pose.eyeScaleX !== void 0 ? pose.eyeScaleX : 1;
        var sxR = pose.eyeScaleXR !== void 0 ? pose.eyeScaleXR : pose.eyeScaleX !== void 0 ? pose.eyeScaleX : 1;
        var syL = pose.eyeScaleYL !== void 0 ? pose.eyeScaleYL : pose.eyeScaleY !== void 0 ? pose.eyeScaleY : 1;
        var syR = pose.eyeScaleYR !== void 0 ? pose.eyeScaleYR : pose.eyeScaleY !== void 0 ? pose.eyeScaleY : 1;
        var eyeSxL = (1 + (pose.bulge || 0) * 0.45) * sxL;
        var eyeSxR = (1 + (pose.bulge || 0) * 0.45) * sxR;
        var eyeSyL = (1 + (pose.bulge || 0) * 0.65) * syL;
        var eyeSyR = (1 + (pose.bulge || 0) * 0.65) * syR;
        var squint = pose.squint || 0;
        if (squint > 0.01) {
          eyeSyL = eyeSyL * (1 - squint) + 0.02 * squint;
          eyeSxL = eyeSxL * (1 - squint) + 0.85 * squint;
          eyeSyR = eyeSyR * (1 - squint) + 0.02 * squint;
          eyeSxR = eyeSxR * (1 - squint) + 0.85 * squint;
        }
        rawFeatures = [
          {
            id: "eyeL",
            type: "pill",
            x: -baseGap / 2 + eyeX,
            y: eyeYL,
            slant: slantL,
            scaleX: eyeSxL,
            scaleY: eyeSyL,
            baseW: 0.125,
            baseH: 0.21,
            color: pose.eyeColor || "#ffffff"
          },
          {
            id: "eyeR",
            type: "pill",
            x: baseGap / 2 + eyeX,
            y: eyeYR,
            slant: slantR,
            scaleX: eyeSxR,
            scaleY: eyeSyR,
            baseW: 0.125,
            baseH: 0.21,
            color: pose.eyeColor || "#ffffff"
          }
        ];
      }
      var faceForeshorten = Math.max(0.85, Math.hypot(r00, r10));
      var squashFade = 0.2 + 0.8 * viewFade;
      for (var fi = 0; fi < rawFeatures.length; fi++) {
        var feat = rawFeatures[fi];
        var fx = feat.x !== void 0 ? feat.x : 0;
        var fy = feat.y !== void 0 ? feat.y : 0;
        var projP = computeFeaturePoint(fx, fy);
        if (!projP) continue;
        var projUp = computeFeaturePoint(fx, fy + 0.1 * s * scY);
        var fslant = feat.slant || 0;
        var angle = getAngle(projP, projUp, fslant);
        var factor = projP.z > 0.01 ? this.focalLength / projP.z * this.halfSize : this.focalLength / avgZ * this.halfSize;
        var baseW = feat.baseW !== void 0 ? feat.baseW : 0.125;
        var baseH = feat.baseH !== void 0 ? feat.baseH : 0.21;
        var scFeatX = feat.scaleX !== void 0 ? feat.scaleX : 1;
        var scFeatY = feat.scaleY !== void 0 ? feat.scaleY : 1;
        var ew = Math.max(0.2, baseW * s * scX * scFeatX * faceForeshorten * factor * squashFade);
        var eh = Math.max(0.2, baseH * s * scY * scFeatY * factor);
        var erx = feat.rx !== void 0 ? feat.rx : Math.min(ew, eh) / 2;
        var ery = feat.ry !== void 0 ? feat.ry : Math.min(ew, eh) / 2;
        var featOpacity = (feat.opacity !== void 0 ? feat.opacity : 1) * viewFade;
        eyes.push({
          id: feat.id || "feat-" + fi,
          type: feat.type || "pill",
          cx: projP.x,
          cy: projP.y,
          z: projP.z,
          w: ew,
          h: eh,
          rx: erx,
          ry: ery,
          angle,
          opacity: featOpacity,
          color: feat.color || pose.eyeColor || "#ffffff"
        });
      }
    }
    return {
      visible: true,
      bodyPath,
      eyes,
      bodyColor: pose.bodyColor,
      eyeColor: pose.eyeColor
    };
  };
  var pBot1Start = { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: -0.02, roll: 0.01, eyeShiftX: 0.015, eyeShiftY: -0.01, eyeScaleX: 1, eyeScaleY: 1, eyeScaleXL: 1, eyeScaleXR: 1, eyeGap: 0.26, bulge: 0, jumpY: 0 };
  var pBot1Left = { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.28, pitch: -0.03, roll: 0.02, eyeShiftX: -0.08, eyeShiftY: 0.01, eyeScaleX: 0.95, eyeScaleY: 1, eyeScaleXL: 0.94, eyeScaleXR: 1, eyeGap: 0.22, bulge: 0, jumpY: 0 };
  var pBot1DeepLeft = { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.42, pitch: -0.05, roll: 0.04, eyeShiftX: -0.108, eyeShiftY: 0.03, eyeScaleX: 0.95, eyeScaleY: 1, eyeScaleXL: 0.92, eyeScaleXR: 1, eyeGap: 0.2, bulge: 0, jumpY: 0 };
  var pBot1Right = { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.36, pitch: -0.04, roll: -0.03, eyeShiftX: 0.075, eyeShiftY: 0.02, eyeScaleX: 0.95, eyeScaleY: 1, eyeScaleXL: 1, eyeScaleXR: 0.94, eyeGap: 0.22, bulge: 0, jumpY: 0 };
  var pBot1FarRight = { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.44, pitch: -0.05, roll: -0.04, eyeShiftX: 0.095, eyeShiftY: 0.025, eyeScaleX: 0.95, eyeScaleY: 1, eyeScaleXL: 1, eyeScaleXR: 0.92, eyeGap: 0.2, bulge: 0, jumpY: 0 };
  var pBot1MidFocus = { scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeScaleXL: 1, eyeScaleXR: 1, eyeGap: 0.26, bulge: 0, jumpY: 0 };
  var pBot1Stretch = { scale: 1, scaleX: 0.97, scaleY: 1.04, yaw: 0.38, pitch: -0.06, roll: 0, eyeShiftX: 0.075, eyeShiftY: 0.04, eyeScaleX: 0.95, eyeScaleY: 1, eyeScaleXL: 1, eyeScaleXR: 0.94, eyeGap: 0.22, bulge: 0, jumpY: 0.012 };
  var pBot1Tilt = { scale: 1, scaleX: 0.97, scaleY: 1.04, yaw: 0.4, pitch: -0.06, roll: 0.32, eyeShiftX: 0.085, eyeShiftY: 0.035, eyeScaleX: 0.95, eyeScaleY: 1, eyeScaleXL: 1, eyeScaleXR: 0.94, eyeGap: 0.21, bulge: 0, jumpY: 0.012 };
  var bot1Timeline = new PoseTimeline([
    { t: 0, label: "sentry-scan-left-1", pose: pBot1Start },
    { t: 1.65, label: "sentry-scan-left-1", ease: "linear", pose: pBot1Start },
    { t: 2.15, label: "sentry-sweep-right-1", ease: "easeInOutQuad", pose: pBot1Right },
    { t: 3.6, label: "sentry-sweep-right-1", ease: "linear", pose: pBot1Right },
    { t: 3.88, label: "sentry-scan-left-2", ease: "easeInOutQuad", pose: pBot1Left },
    { t: 4.65, label: "sentry-scan-left-2", ease: "linear", pose: pBot1Left },
    { t: 5.3, label: "sentry-sweep-right-2", ease: "easeInOutQuad", pose: pBot1Right },
    { t: 6.6, label: "sentry-sweep-right-2", ease: "linear", pose: pBot1Right },
    { t: 7.1, label: "sentry-sweep-far-right", ease: "easeInOutQuad", pose: pBot1FarRight },
    { t: 8.4, label: "sentry-sweep-far-right", ease: "linear", pose: pBot1FarRight },
    { t: 8.75, label: "sentry-deep-left-1", ease: "easeInOutQuad", pose: pBot1DeepLeft },
    { t: 9.35, label: "sentry-deep-left-1", ease: "linear", pose: pBot1DeepLeft },
    { t: 9.9, label: "sentry-sweep-right-3", ease: "easeInOutQuad", pose: pBot1Right },
    { t: 11.2, label: "sentry-sweep-right-3", ease: "linear", pose: pBot1Right },
    { t: 11.55, label: "sentry-center-focus", ease: "easeInOutQuad", pose: pBot1MidFocus },
    { t: 14.1, label: "sentry-center-focus", ease: "linear", pose: pBot1MidFocus },
    { t: 14.45, label: "sentry-deep-left-2", ease: "easeInOutQuad", pose: pBot1DeepLeft },
    { t: 15.15, label: "sentry-deep-left-2", ease: "linear", pose: pBot1DeepLeft },
    { t: 15.65, label: "sentry-sweep-right-4", ease: "easeInOutQuad", pose: pBot1Right },
    { t: 16.8, label: "sentry-sweep-right-4", ease: "linear", pose: pBot1Right },
    { t: 17.05, label: "sentry-stretch", ease: "easeInOutQuad", pose: pBot1Stretch },
    { t: 17.35, label: "sentry-curious-tilt", ease: "easeInOutQuad", pose: pBot1Tilt },
    { t: 18.7, label: "sentry-curious-tilt", ease: "linear", pose: pBot1Tilt },
    { t: 19.05, label: "sentry-right-settle", ease: "easeInOutQuad", pose: pBot1Right },
    { t: 19.45, label: "sentry-scan-left-3", ease: "easeInOutQuad", pose: pBot1Left },
    { t: 20.2, label: "sentry-deep-left-3", ease: "easeInOutQuad", pose: pBot1DeepLeft },
    { t: 20.783, label: "sentry-scan-left-1", ease: "easeInOutQuad", pose: pBot1Start }
  ]);
  var bot1Blinks = new BlinkTrack([
    { start: 1.85, duration: 0.18, maxSquint: 0.98 },
    { start: 5.65, duration: 0.17, maxSquint: 0.98 },
    { start: 8.8, duration: 0.18, maxSquint: 0.98 },
    { start: 11.4, duration: 0.18, maxSquint: 0.98 },
    { start: 11.68, duration: 0.19, maxSquint: 0.98 },
    { start: 16.1, duration: 0.18, maxSquint: 0.98 },
    { start: 18.96, duration: 0.18, maxSquint: 0.98 }
  ]);
  function getBot1State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var res = bot1Timeline.evaluate(t);
    var pose = res.pose;
    var squint = bot1Blinks.evaluate(t);
    var bot = {
      visible: true,
      scale: pose.scale,
      scaleX: pose.scaleX,
      scaleY: pose.scaleY,
      x: 0,
      y: pose.jumpY || 0,
      yaw: pose.yaw,
      pitch: pose.pitch,
      roll: pose.roll,
      eyeShiftX: pose.eyeShiftX,
      eyeShiftY: pose.eyeShiftY,
      eyeScaleX: pose.eyeScaleX,
      eyeScaleY: pose.eyeScaleY,
      eyeScaleXL: pose.eyeScaleXL !== void 0 ? pose.eyeScaleXL : 1,
      eyeScaleXR: pose.eyeScaleXR !== void 0 ? pose.eyeScaleXR : 1,
      eyeGap: pose.eyeGap !== void 0 ? pose.eyeGap : 0.23,
      bulge: pose.bulge || 0,
      squint,
      bodyColor: 2236710,
      eyeColor: 16777215
    };
    return { botId: 1, type: "bot1", label: res.label, bot, dots: [] };
  }
  var bot2Apexes = [1.07, 4.78, 8.57, 12.2, 15.9, 19.62];
  var BOT2_FLIP_HALF = 0.42;
  function makeBot2RelaxedPose(cycle) {
    return {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      yaw: 0.05,
      pitch: 0.02,
      roll: 0.17 + cycle * 2 * Math.PI,
      eyeShiftX: 0.04,
      eyeShiftY: 0.22,
      eyeShiftYL: 0,
      eyeShiftYR: 0,
      eyeScaleXL: 1,
      eyeScaleYL: 1,
      eyeScaleXR: 1,
      eyeScaleYR: 1,
      eyeSlantL: 0,
      eyeSlantR: 0.1,
      eyeGap: 0.22,
      bulge: 0,
      jumpY: 0,
      showEyes: true
    };
  }
  function makeBot2MidPose(cycle) {
    return {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      yaw: 0.85,
      pitch: 0.35,
      roll: 0.17 + (cycle * 2 + 1) * Math.PI,
      eyeShiftX: 0.04,
      eyeShiftY: 0.22,
      eyeShiftYL: 0,
      eyeShiftYR: 0,
      eyeScaleXL: 0.85,
      eyeScaleYL: 0.85,
      eyeScaleXR: 0.85,
      eyeScaleYR: 0.85,
      eyeSlantL: 0,
      eyeSlantR: 0,
      eyeGap: 0.22,
      bulge: 0,
      jumpY: 0.075,
      showEyes: false
    };
  }
  function makeBot2SquintPose(cycle) {
    return {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      yaw: 0.05,
      pitch: 0.02,
      roll: 0.17 + cycle * 2 * Math.PI,
      eyeShiftX: 0.04,
      eyeShiftY: 0.22,
      eyeShiftYL: -0.015,
      eyeShiftYR: 0.02,
      eyeScaleXL: 0.6,
      eyeScaleXR: 0.6,
      eyeScaleYL: 0.85,
      eyeScaleYR: 0.85,
      eyeSlantL: 0.56,
      eyeSlantR: -0.51,
      eyeGap: 0.22,
      bulge: 0,
      jumpY: 0,
      showEyes: true
    };
  }
  var bot2Keyframes = [
    { t: 0, label: "standby-relaxed-0", pose: makeBot2RelaxedPose(0) }
  ];
  for (var bi = 0; bi < bot2Apexes.length; bi++) {
    var apex = bot2Apexes[bi];
    var tTakeoff = apex - BOT2_FLIP_HALF;
    var tMid = apex;
    var tLand = apex + BOT2_FLIP_HALF;
    var tSquintSnap = tLand + 0.08;
    bot2Keyframes.push({ t: tTakeoff, label: "takeoff-" + bi, ease: "linear", pose: makeBot2RelaxedPose(bi) });
    bot2Keyframes.push({ t: tMid, label: "spin-flip-mid-" + (bi + 1), ease: "easeInOutQuad", pose: makeBot2MidPose(bi) });
    bot2Keyframes.push({ t: tLand, label: "spin-flip-land-" + (bi + 1), ease: "easeInOutQuad", pose: makeBot2SquintPose(bi + 1) });
    bot2Keyframes.push({ t: tSquintSnap, label: "attitude-squint-" + (bi + 1), ease: "linear", pose: makeBot2SquintPose(bi + 1) });
    if (bi < bot2Apexes.length - 1) {
      var nextApex = bot2Apexes[bi + 1];
      var nextTakeoff = nextApex - BOT2_FLIP_HALF;
      var tSquintHoldEnd = nextTakeoff - 0.65;
      var tRelaxEnd = nextTakeoff - 0.35;
      bot2Keyframes.push({ t: tSquintHoldEnd, label: "attitude-hold-" + (bi + 1), ease: "linear", pose: makeBot2SquintPose(bi + 1) });
      bot2Keyframes.push({ t: tRelaxEnd, label: "attitude-relax-" + (bi + 1), ease: "easeInOutQuad", pose: makeBot2RelaxedPose(bi + 1) });
    } else {
      bot2Keyframes.push({ t: 20.45, label: "attitude-hold-6", ease: "linear", pose: makeBot2SquintPose(6) });
      bot2Keyframes.push({ t: 20.783, label: "attitude-relax-end", ease: "easeInOutQuad", pose: makeBot2RelaxedPose(6) });
    }
  }
  var bot2Timeline = new PoseTimeline(bot2Keyframes);
  var bot2Blinks = new BlinkTrack([]);
  function getBot2State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var res = bot2Timeline.evaluate(t);
    var pose = res.pose;
    var squint = bot2Blinks.evaluate(t);
    var squintWeight = Math.max(0, Math.min(1, (pose.eyeSlantL || 0) / 0.56));
    var omegaShake = 2.2 * Math.PI * 2;
    var headShakeYaw = Math.sin(t * omegaShake) * 0.038 * squintWeight;
    var headShakeRoll = Math.cos(t * omegaShake) * 0.024 * squintWeight;
    var headShakeEyeX = Math.sin(t * omegaShake) * 0.01 * squintWeight;
    var headShakeEyeY = Math.abs(Math.sin(t * omegaShake)) * 5e-3 * squintWeight;
    var bot = {
      visible: true,
      scale: pose.scale,
      scaleX: pose.scaleX,
      scaleY: pose.scaleY,
      x: 0,
      y: pose.jumpY || 0,
      yaw: (pose.yaw || 0) + headShakeYaw,
      pitch: pose.pitch,
      roll: (pose.roll || 0) + headShakeRoll,
      eyeShiftX: (pose.eyeShiftX || 0) + headShakeEyeX,
      eyeShiftY: (pose.eyeShiftY || 0) + headShakeEyeY,
      eyeShiftYL: pose.eyeShiftYL,
      eyeShiftYR: pose.eyeShiftYR,
      eyeScaleX: pose.eyeScaleX,
      eyeScaleY: pose.eyeScaleY,
      eyeScaleXL: pose.eyeScaleXL,
      eyeScaleXR: pose.eyeScaleXR,
      eyeScaleYL: pose.eyeScaleYL,
      eyeScaleYR: pose.eyeScaleYR,
      eyeSlantL: pose.eyeSlantL,
      eyeSlantR: pose.eyeSlantR,
      eyeGap: pose.eyeGap !== void 0 ? pose.eyeGap : 0.22,
      bulge: pose.bulge || 0,
      squint,
      showEyes: pose.showEyes,
      bodyColor: 2236710,
      eyeColor: 16777215
    };
    return { botId: 2, type: "bot2", label: res.label, bot, dots: [] };
  }
  var BOT3_PALETTE_12 = [
    [58, 53, 206],
    // 0.0s 钴蓝
    [60, 84, 208],
    // 0.5s 浅钴蓝
    [201, 34, 153],
    // 1.0s 洋红
    [201, 222, 65],
    // 1.5s 柠黄
    [68, 229, 198],
    // 2.0s 青绿
    [66, 162, 209],
    // 2.5s 天蓝
    [69, 238, 80],
    // 3.0s 亮绿
    [200, 41, 71],
    // 3.5s 绯红
    [125, 38, 208],
    // 4.0s 紫色
    [100, 42, 209],
    // 4.5s 蓝紫
    [154, 36, 211],
    // 5.0s 亮紫
    [199, 35, 104]
    // 5.5s 玫红
  ];
  function getBot3ColorHex(t) {
    var cycle = (t % 6 + 6) % 6 / 6;
    var n = BOT3_PALETTE_12.length;
    var p = cycle * n;
    var i0 = Math.floor(p) % n;
    var i1 = (i0 + 1) % n;
    var f = p - Math.floor(p);
    var s = f * f * (3 - 2 * f);
    var r = Math.round(BOT3_PALETTE_12[i0][0] * (1 - s) + BOT3_PALETTE_12[i1][0] * s);
    var g = Math.round(BOT3_PALETTE_12[i0][1] * (1 - s) + BOT3_PALETTE_12[i1][1] * s);
    var b = Math.round(BOT3_PALETTE_12[i0][2] * (1 - s) + BOT3_PALETTE_12[i1][2] * s);
    return r << 16 | g << 8 | b;
  }
  var bot3Timeline = new PoseTimeline([
    { t: 0, label: "chameleon-normal", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 1.2, label: "chameleon-normal", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 1.5, label: "chameleon-slit-1", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 1.7, label: "chameleon-slit-1", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 1.95, label: "chameleon-dot-1", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.4, eyeScaleY: 0.4, eyeScaleXL: 0.4, eyeScaleXR: 0.4, eyeScaleYL: 0.4, eyeScaleYR: 0.4, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 2.15, label: "chameleon-dot-1", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.4, eyeScaleY: 0.4, eyeScaleXL: 0.4, eyeScaleXR: 0.4, eyeScaleYL: 0.4, eyeScaleYR: 0.4, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 2.45, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 2.75, label: "chameleon-slit-2", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 3.15, label: "chameleon-slit-2", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 3.5, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 4.8, label: "chameleon-slit-3", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 5.3, label: "chameleon-slit-3", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 5.7, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 8.6, label: "chameleon-normal", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 8.9, label: "chameleon-corner-glance-1", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.15, pitch: -0.04, roll: -0.1, eyeShiftX: -0.16, eyeShiftY: 0.11, eyeGap: 0.36, eyeScaleX: 0.52, eyeScaleY: 0.52, eyeScaleXL: 0.5, eyeScaleXR: 0.55, eyeScaleYL: 0.5, eyeScaleYR: 0.55, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 9.2, label: "chameleon-corner-glance-1", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.15, pitch: -0.04, roll: -0.1, eyeShiftX: -0.16, eyeShiftY: 0.11, eyeGap: 0.36, eyeScaleX: 0.52, eyeScaleY: 0.52, eyeScaleXL: 0.5, eyeScaleXR: 0.55, eyeScaleYL: 0.5, eyeScaleYR: 0.55, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 9.5, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 11.2, label: "chameleon-normal", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 11.5, label: "chameleon-asym", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.5, eyeScaleY: 0.62, eyeScaleXL: 0.4, eyeScaleXR: 0.6, eyeScaleYL: 0.4, eyeScaleYR: 0.85, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 11.8, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 14.6, label: "chameleon-normal", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 14.85, label: "chameleon-corner-glance-2", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.15, pitch: -0.04, roll: -0.1, eyeShiftX: -0.16, eyeShiftY: 0.11, eyeGap: 0.36, eyeScaleX: 0.52, eyeScaleY: 0.52, eyeScaleXL: 0.5, eyeScaleXR: 0.55, eyeScaleYL: 0.5, eyeScaleYR: 0.55, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 15.05, label: "chameleon-corner-glance-2", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.15, pitch: -0.04, roll: -0.1, eyeShiftX: -0.16, eyeShiftY: 0.11, eyeGap: 0.36, eyeScaleX: 0.52, eyeScaleY: 0.52, eyeScaleXL: 0.5, eyeScaleXR: 0.55, eyeScaleYL: 0.5, eyeScaleYR: 0.55, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 15.18, label: "chameleon-dazed", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.02, pitch: 0.01, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.75, eyeScaleY: 0.45, eyeScaleXL: 0.75, eyeScaleXR: 0.75, eyeScaleYL: 0.45, eyeScaleYR: 0.45, eyeSlantL: 0.1, eyeSlantR: -0.1, bulge: 0, jumpY: 0 } },
    { t: 16.14, label: "chameleon-dazed", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.02, pitch: 0.01, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.75, eyeScaleY: 0.45, eyeScaleXL: 0.75, eyeScaleXR: 0.75, eyeScaleYL: 0.45, eyeScaleYR: 0.45, eyeSlantL: 0.1, eyeSlantR: -0.1, bulge: 0, jumpY: 0 } },
    { t: 16.4, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 17, label: "chameleon-slit-4", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 17.6, label: "chameleon-slit-4", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.52, eyeScaleY: 0.82, eyeScaleXL: 0.52, eyeScaleXR: 0.52, eyeScaleYL: 0.82, eyeScaleYR: 0.82, eyeSlantL: 0.58, eyeSlantR: -0.58, bulge: 0, jumpY: 0 } },
    { t: 18, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 19.8, label: "chameleon-normal", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 20, label: "chameleon-corner-glance-3", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.15, pitch: -0.04, roll: -0.1, eyeShiftX: -0.16, eyeShiftY: 0.11, eyeGap: 0.36, eyeScaleX: 0.52, eyeScaleY: 0.52, eyeScaleXL: 0.5, eyeScaleXR: 0.55, eyeScaleYL: 0.5, eyeScaleYR: 0.55, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 20.25, label: "chameleon-corner-glance-3", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: -0.15, pitch: -0.04, roll: -0.1, eyeShiftX: -0.16, eyeShiftY: 0.11, eyeGap: 0.36, eyeScaleX: 0.52, eyeScaleY: 0.52, eyeScaleXL: 0.5, eyeScaleXR: 0.55, eyeScaleYL: 0.5, eyeScaleYR: 0.55, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 20.5, label: "chameleon-normal", ease: "easeInOutQuad", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } },
    { t: 20.783, label: "chameleon-normal", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, yaw: 0.05, pitch: 0.02, roll: -0.1, eyeShiftX: 0.02, eyeShiftY: 0.09, eyeGap: 0.27, eyeScaleX: 0.9, eyeScaleY: 1.05, eyeScaleXL: 0.9, eyeScaleXR: 0.9, eyeScaleYL: 1.05, eyeScaleYR: 1.05, eyeSlantL: 0, eyeSlantR: 0, bulge: 0, jumpY: 0 } }
  ]);
  var bot3Blinks = new BlinkTrack([
    { start: 1.85, duration: 0.18, maxSquint: 0.95 },
    { start: 5.65, duration: 0.17, maxSquint: 0.95 },
    { start: 8.8, duration: 0.18, maxSquint: 0.95 },
    { start: 11.4, duration: 0.18, maxSquint: 0.95 },
    { start: 11.7, duration: 0.18, maxSquint: 0.95 },
    { start: 16.12, duration: 0.18, maxSquint: 0.95 },
    { start: 18.96, duration: 0.18, maxSquint: 0.95 }
  ]);
  function getBot3State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var colorHex = getBot3ColorHex(t);
    var res = bot3Timeline.evaluate(t);
    var pose = res.pose;
    var squint = bot3Blinks.evaluate(t);
    var N_DANCE_CYCLES = 21;
    var omegaSway = 2 * Math.PI * N_DANCE_CYCLES / LOOP;
    var omegaBounce = 4 * omegaSway;
    var bouncePhase = t * omegaBounce % (2 * Math.PI);
    var bounceShape = Math.pow(Math.sin(bouncePhase / 2), 2);
    var bounceY = (bounceShape - 0.48) * 0.052;
    var squashNorm = (bounceShape - 0.48) * 2;
    var danceScaleX = (pose.scaleX || 1) * (1 + squashNorm * 0.068);
    var danceScaleY = (pose.scaleY || 1) * (1 - squashNorm * 0.068);
    var swayX = Math.sin(t * omegaSway) * 0.15;
    var swayRoll = -Math.sin(t * omegaSway) * 0.2 + Math.cos(t * omegaBounce) * 0.035;
    var bot = {
      visible: true,
      scale: pose.scale || 1,
      scaleX: danceScaleX,
      scaleY: danceScaleY,
      x: (pose.x || 0) + swayX,
      y: (pose.jumpY || 0) + bounceY,
      jumpY: (pose.jumpY || 0) + bounceY,
      yaw: pose.yaw || 0,
      pitch: pose.pitch || 0,
      roll: (pose.roll || 0) + swayRoll,
      eyeShiftX: pose.eyeShiftX !== void 0 ? pose.eyeShiftX : 0.02,
      eyeShiftY: pose.eyeShiftY !== void 0 ? pose.eyeShiftY : 0.09 - bounceY * 0.25,
      eyeScaleX: pose.eyeScaleX,
      eyeScaleY: pose.eyeScaleY,
      eyeScaleXL: pose.eyeScaleXL !== void 0 ? pose.eyeScaleXL : pose.eyeScaleX !== void 0 ? pose.eyeScaleX : 0.9,
      eyeScaleXR: pose.eyeScaleXR !== void 0 ? pose.eyeScaleXR : pose.eyeScaleX !== void 0 ? pose.eyeScaleX : 0.9,
      eyeScaleYL: pose.eyeScaleYL !== void 0 ? pose.eyeScaleYL : pose.eyeScaleY !== void 0 ? pose.eyeScaleY : 1.05,
      eyeScaleYR: pose.eyeScaleYR !== void 0 ? pose.eyeScaleYR : pose.eyeScaleY !== void 0 ? pose.eyeScaleY : 1.05,
      eyeSlantL: pose.eyeSlantL !== void 0 ? pose.eyeSlantL : pose.eyeSlant || 0,
      eyeSlantR: pose.eyeSlantR !== void 0 ? pose.eyeSlantR : -(pose.eyeSlant || 0),
      eyeGap: pose.eyeGap !== void 0 ? pose.eyeGap : 0.27,
      bulge: pose.bulge || 0,
      squint,
      bodyColor: colorHex,
      eyeColor: 2236710
    };
    return { botId: 3, type: "bot3", label: res.label, bot, dots: [] };
  }
  var BOT4_T_ROW = LOOP / 16;
  var pBot4Pose = function(yaw, eyeShiftX) {
    return {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      yaw,
      pitch: 0,
      roll: 0,
      eyeShiftX,
      eyeShiftY: 0,
      bulge: 0,
      jumpY: 0
    };
  };
  var bot4Keyframes = [
    { t: 0, label: "raster-0-right", pose: pBot4Pose(0.26, 0.042) }
  ];
  for (var k = 0; k < 16; k++) {
    var tBase = k * BOT4_T_ROW;
    var tSnapStart = tBase + 0.12;
    var tLeftLand = tBase + 0.24;
    var tLeftEnd = tBase + 0.52;
    var tCenterLand = tBase + 0.6;
    var tCenterEnd = tBase + 0.88;
    var tRightLand = tBase + 0.96;
    bot4Keyframes.push({ t: tSnapStart, label: "raster-" + k + "-hold-right", ease: "linear", pose: pBot4Pose(0.26, 0.042) });
    bot4Keyframes.push({ t: tLeftLand, label: "raster-" + k + "-snap-left", ease: "easeInOutQuad", pose: pBot4Pose(-0.26, -0.042) });
    bot4Keyframes.push({ t: tLeftEnd, label: "raster-" + k + "-hold-left", ease: "linear", pose: pBot4Pose(-0.26, -0.042) });
    bot4Keyframes.push({ t: tCenterLand, label: "raster-" + k + "-step-center", ease: "easeInOutQuad", pose: pBot4Pose(0, 0) });
    bot4Keyframes.push({ t: tCenterEnd, label: "raster-" + k + "-hold-center", ease: "linear", pose: pBot4Pose(0, 0) });
    bot4Keyframes.push({ t: tRightLand, label: "raster-" + k + "-step-right", ease: "easeInOutQuad", pose: pBot4Pose(0.26, 0.042) });
    if (k < 15) {
      bot4Keyframes.push({ t: (k + 1) * BOT4_T_ROW, label: "raster-" + (k + 1) + "-init", ease: "linear", pose: pBot4Pose(0.26, 0.042) });
    }
  }
  bot4Keyframes.push({ t: LOOP, label: "raster-end", ease: "linear", pose: pBot4Pose(0.26, 0.042) });
  var bot4Timeline = new PoseTimeline(bot4Keyframes);
  function getBot4State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var res = bot4Timeline.evaluate(t);
    var pose = res.pose;
    var bot = {
      visible: true,
      scale: pose.scale,
      scaleX: pose.scaleX,
      scaleY: pose.scaleY,
      x: 0,
      y: 0,
      yaw: pose.yaw,
      pitch: pose.pitch,
      roll: pose.roll,
      eyeShiftX: pose.eyeShiftX,
      eyeShiftY: pose.eyeShiftY,
      eyeScaleX: 0.96,
      eyeScaleY: 0.96,
      eyeGap: 0.22,
      bulge: 0,
      squint: 0,
      bodyColor: 2236710,
      eyeColor: 16777215
    };
    return { botId: 4, type: "bot4", label: res.label, bot, dots: [] };
  }
  var bot5Timeline = new PoseTimeline([
    { t: 0, label: "tucked", pose: { scaleX: 1, scaleY: 1, visible: false, scale: 0, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 2.22, label: "tucked", pose: { scaleX: 1, scaleY: 1, visible: false, scale: 0, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 2.45, label: "bouncy-pop-spin", ease: "easeInOutQuad", pose: { scaleX: 1, scaleY: 1, visible: true, scale: 1.08, yaw: -Math.PI * 0.55, pitch: -0.02, roll: 0.04, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0.06 } },
    { t: 2.68, label: "bouncy-pop-spin", ease: "easeInOutQuad", pose: { scaleX: 1, scaleY: 1, visible: true, scale: 1.03, yaw: -Math.PI * 1.03, pitch: -0.04, roll: 0.02, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0.02 } },
    { t: 2.92, label: "spin-reappear", ease: "easeInOutQuad", pose: { scaleX: 1, scaleY: 1, visible: true, scale: 1, yaw: -Math.PI * 1.58, pitch: -0.05, roll: -0.03, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 3.06, label: "land-settle", ease: "easeOutCubic", pose: { scaleX: 1, scaleY: 1, visible: true, scale: 1, yaw: -Math.PI * 2 + 0.31, pitch: -0.05, roll: -0.05, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 3.28, label: "eye-bulge", ease: "easeInOutQuad", pose: { scaleX: 1, scaleY: 1, visible: true, scale: 1, yaw: -Math.PI * 2 + 0.31, pitch: -0.05, roll: -0.05, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 1, squint: 0, jumpY: 0 } },
    { t: 3.48, label: "look-right-settle", ease: "easeInOutQuad", pose: { scaleX: 1, scaleY: 1, visible: true, scale: 1, yaw: -Math.PI * 2 + 0.31, pitch: -0.05, roll: -0.05, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 3.64, label: "look-right-settle", ease: "linear", pose: { scale: 1, scaleX: 1, scaleY: 1, visible: true, scale: 1, yaw: -Math.PI * 2 + 0.31, pitch: -0.05, roll: -0.05, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 3.94, label: "turn-to-lookup", ease: "easeInOutQuad", pose: { visible: true, scale: 1, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 - 0.78, pitch: -0.21, roll: 0, eyeShiftX: -0.1, eyeShiftY: 0.035, eyeScaleX: 0.95, eyeScaleY: 0.88, eyeGap: 0.22, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 4.28, label: "lookup-still-blink-2", ease: "linear", pose: { visible: true, scale: 1, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 - 0.78, pitch: -0.21, roll: 0, eyeShiftX: -0.1, eyeShiftY: 0.035, eyeScaleX: 0.95, eyeScaleY: 0.88, eyeGap: 0.22, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 4.75, label: "transition-to-right", ease: "easeInOutQuad", pose: { visible: true, scale: 1, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 + 0.31, pitch: -0.05, roll: -0.05, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 6.12, label: "look-right-curious", ease: "linear", pose: { visible: true, scale: 1, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 + 0.31, pitch: -0.05, roll: -0.05, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 6.24, label: "anticipation-squash", ease: "easeInOutQuad", pose: { visible: true, scale: 1, scaleX: 1.16, scaleY: 0.85, yaw: -Math.PI * 2 + 0.28, pitch: -0.02, roll: -0.02, eyeShiftX: -0.05, eyeShiftY: 0.025, eyeScaleX: 1.1, eyeScaleY: 0.88, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: -0.035 } },
    { t: 6.36, label: "anticipation-rebound", ease: "easeInOutQuad", pose: { visible: true, scale: 1, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 + 0.35, pitch: -0.04, roll: -0.04, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0.02 } },
    { t: 6.52, label: "exit-spin-right", ease: "easeInOutQuad", pose: { visible: true, scale: 0.94, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 + 1.45, pitch: -0.03, roll: -0.02, eyeShiftX: -0.05, eyeShiftY: 0.035, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 6.72, label: "exit-spin-right", ease: "easeInOutQuad", pose: { visible: true, scale: 0.45, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 + 2.55, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 6.88, label: "exit-spin-right", ease: "easeInOutQuad", pose: { visible: false, scale: 0, scaleX: 1, scaleY: 1, yaw: -Math.PI * 2 + 3.4, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } },
    { t: 20.783, label: "idle", ease: "linear", pose: { scaleX: 1, scaleY: 1, visible: false, scale: 0, yaw: -Math.PI * 2 + 3.4, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, eyeGap: 0.27, bulge: 0, squint: 0, jumpY: 0 } }
  ]);
  var bot5Blinks = new BlinkTrack([
    { start: 3.73, duration: 0.12, maxSquint: 0.95 },
    { start: 4.06, duration: 0.12, maxSquint: 0.95 }
  ]);
  var bot5Dots = new DotGridRig(38, 10.1);
  function getBot5State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var res = bot5Timeline.evaluate(t);
    var pose = res.pose;
    pose.squint = bot5Blinks.evaluate(t);
    pose.y = pose.jumpY || 0;
    if (t >= 4.75 && t < 6.12) {
      pose.scale += Math.sin((t - 4.75) * 2.5) * 0.012;
    }
    var dots = bot5Dots.evaluate(t, pose.scale, pose.visible);
    return {
      botId: 5,
      type: "bot5",
      label: res.label,
      dots,
      bot: {
        visible: pose.visible,
        scale: pose.scale,
        scaleX: pose.scaleX,
        scaleY: pose.scaleY,
        x: pose.x || 0,
        y: pose.y,
        yaw: pose.yaw,
        pitch: pose.pitch,
        roll: pose.roll,
        eyeShiftX: pose.eyeShiftX,
        eyeShiftY: pose.eyeShiftY,
        eyeScaleX: pose.eyeScaleX,
        eyeScaleY: pose.eyeScaleY,
        eyeGap: pose.eyeGap,
        bulge: pose.bulge,
        squint: pose.squint,
        bodyColor: 2236710,
        eyeColor: 16777215
      }
    };
  }
  var bot6Timeline = new PoseTimeline([
    { t: 0, label: "ghost-blink-1", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 0.4, label: "giant-bulge-1-start", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.05, roll: 0, eyeShiftX: 0, eyeShiftY: 0.04, bulge: 0.6, jumpY: 0 } },
    { t: 0.65, label: "giant-bulge-1-peak", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.05, roll: 0, eyeShiftX: 0, eyeShiftY: 0.08, bulge: 1.25, jumpY: 0 } },
    { t: 0.95, label: "single-solid-1", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 2.4, label: "single-solid-1", ease: "linear", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 3.1, label: "lookup-left-1", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: -0.42, pitch: -0.04, roll: 0.02, eyeShiftX: -0.06, eyeShiftY: 0.02, bulge: 0, jumpY: 0 } },
    { t: 3.35, label: "squash-prep-1", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 0.92, scaleX: 1.08, scaleY: 0.92, yaw: -0.4, pitch: -0.03, roll: 0.01, eyeShiftX: -0.055, eyeShiftY: -0.02, bulge: 0, jumpY: -0.01 } },
    { t: 3.65, label: "purple-solo-split-1", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 0, scale: 0.46, scaleX: 1, scaleY: 1, yaw: -0.38, pitch: -0.02, roll: -0.03, eyeShiftX: -0.05, eyeShiftY: 0.01, bulge: 0, jumpY: 0 } },
    { t: 3.95, label: "look-right-prep", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 0, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0.38, pitch: -0.02, roll: 0.02, eyeShiftX: 0.05, eyeShiftY: 0.01, bulge: 0, jumpY: 0 } },
    { t: 4.2, label: "cyan-solo-split-1", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 1, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0.34, pitch: 0, roll: 0, eyeShiftX: 0.04, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 4.5, label: "triple-dance-1", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 1, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 7.4, label: "triple-dance-1", ease: "linear", pose: { splitL: 1, splitR: 1, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 7.8, label: "ghost-merge-1", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 8.5, label: "single-solid-1-end", ease: "linear", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 8.5, label: "ghost-blink-2", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 8.9, label: "giant-bulge-2-start", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.05, roll: 0, eyeShiftX: 0, eyeShiftY: 0.04, bulge: 0.6, jumpY: 0 } },
    { t: 9.15, label: "giant-bulge-2-peak", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.05, roll: 0, eyeShiftX: 0, eyeShiftY: 0.08, bulge: 1.25, jumpY: 0 } },
    { t: 9.45, label: "single-solid-2", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 10.9, label: "single-solid-2", ease: "linear", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 11.6, label: "lookup-left-2", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: -0.42, pitch: -0.04, roll: 0.02, eyeShiftX: -0.06, eyeShiftY: 0.02, bulge: 0, jumpY: 0 } },
    { t: 11.85, label: "squash-prep-2", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 0.92, scaleX: 1.08, scaleY: 0.92, yaw: -0.4, pitch: -0.03, roll: 0.01, eyeShiftX: -0.055, eyeShiftY: -0.02, bulge: 0, jumpY: -0.01 } },
    { t: 12.15, label: "purple-solo-split-2", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 0, scale: 0.46, scaleX: 1, scaleY: 1, yaw: -0.38, pitch: -0.02, roll: -0.03, eyeShiftX: -0.05, eyeShiftY: 0.01, bulge: 0, jumpY: 0 } },
    { t: 12.45, label: "look-right-prep-2", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 0, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0.38, pitch: -0.02, roll: 0.02, eyeShiftX: 0.05, eyeShiftY: 0.01, bulge: 0, jumpY: 0 } },
    { t: 12.7, label: "cyan-solo-split-2", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 1, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0.34, pitch: 0, roll: 0, eyeShiftX: 0.04, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 13, label: "triple-dance-2", ease: "easeInOutQuad", pose: { splitL: 1, splitR: 1, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 15.9, label: "triple-dance-2", ease: "linear", pose: { splitL: 1, splitR: 1, scale: 0.46, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 16.3, label: "ghost-merge-2", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 17, label: "single-solid-2-end", ease: "linear", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 17, label: "ghost-blink-3", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 17.4, label: "giant-bulge-3-start", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.05, roll: 0, eyeShiftX: 0, eyeShiftY: 0.04, bulge: 0.6, jumpY: 0 } },
    { t: 17.65, label: "giant-bulge-3-peak", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.05, roll: 0, eyeShiftX: 0, eyeShiftY: 0.08, bulge: 1.25, jumpY: 0 } },
    { t: 17.95, label: "single-solid-3", ease: "easeInOutQuad", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } },
    { t: 20.783, label: "single-solid-3", ease: "linear", pose: { splitL: 0, splitR: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, bulge: 0, jumpY: 0 } }
  ]);
  var bot6Blinks = new BlinkTrack([
    { start: 0, duration: 0.25, maxSquint: 1 },
    { start: 1.05, duration: 0.12, maxSquint: 0.95 },
    { start: 2.7, duration: 0.12, maxSquint: 0.95 },
    { start: 3.2, duration: 0.14, maxSquint: 0.95 },
    { start: 8.5, duration: 0.25, maxSquint: 1 },
    { start: 9.55, duration: 0.12, maxSquint: 0.95 },
    { start: 11.2, duration: 0.12, maxSquint: 0.95 },
    { start: 11.7, duration: 0.14, maxSquint: 0.95 },
    { start: 17, duration: 0.25, maxSquint: 1 },
    { start: 18.05, duration: 0.12, maxSquint: 0.95 },
    { start: 19.5, duration: 0.12, maxSquint: 0.95 }
  ]);
  function getBot6State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var res = bot6Timeline.evaluate(t);
    var pose = res.pose;
    var squint = bot6Blinks.evaluate(t);
    var splitL = pose.splitL || 0;
    var splitR = pose.splitR || 0;
    var maxSplit = Math.max(splitL, splitR);
    var omegaV = 3.649 * Math.PI * 2;
    var omegaH = 1.82 * Math.PI * 2;
    var waveY = Math.sin(t * omegaV) * 0.015 * maxSplit;
    var waveYL = Math.sin((t + 0.12) * omegaV) * 0.015 * splitL;
    var waveYR = Math.sin((t - 0.12) * omegaV) * 0.015 * splitR;
    var swayXC = Math.sin(t * omegaH) * 0.022 * maxSplit;
    var swayXL = Math.sin((t + 0.12) * omegaH) * 0.022 * splitL;
    var swayXR = Math.sin((t - 0.12) * omegaH) * 0.022 * splitR;
    var centerShiftX = splitL > 0.01 && splitR < 0.5 ? 0.018 * splitL : splitR > 0.01 && splitL < 0.5 ? -0.018 * splitR : 0;
    var sepDist = 0.258;
    var currentScale = pose.scale;
    var botCenter = {
      visible: true,
      scale: currentScale,
      scaleX: pose.scaleX || 1,
      scaleY: pose.scaleY || 1,
      x: swayXC + centerShiftX,
      y: (pose.jumpY || 0) + waveY,
      yaw: pose.yaw || 0,
      pitch: pose.pitch || 0,
      roll: pose.roll || 0,
      eyeShiftX: pose.eyeShiftX || 0,
      eyeShiftY: pose.eyeShiftY || 0,
      eyeScaleX: 1,
      eyeScaleY: 1,
      eyeGap: 0.27,
      bulge: pose.bulge || 0,
      squint,
      bodyColor: 2236710,
      eyeColor: 16777215,
      splitL,
      splitR
    };
    var spawnXL = -(0.11 + (sepDist - 0.11) * splitL);
    var ghostL = {
      visible: splitL > 0.01,
      scale: 0.46 * splitL,
      scaleX: 1,
      scaleY: 1,
      x: spawnXL + swayXL,
      y: waveYL,
      yaw: (pose.yaw || 0) * 0.5,
      pitch: (pose.pitch || 0) * 0.5,
      roll: (pose.roll || 0) * 0.5 - 0.03 * splitL,
      eyeShiftX: 0,
      eyeShiftY: 0,
      eyeScaleX: 0.85,
      eyeScaleY: 0.85,
      eyeGap: 0.27,
      bulge: 0,
      squint,
      bodyColor: 8530380,
      eyeColor: 15256570
    };
    var spawnXR = +(0.11 + (sepDist - 0.11) * splitR);
    var ghostR = {
      visible: splitR > 0.01,
      scale: 0.46 * splitR,
      scaleX: 1,
      scaleY: 1,
      x: spawnXR + swayXR,
      y: waveYR,
      yaw: (pose.yaw || 0) * 0.5,
      pitch: (pose.pitch || 0) * 0.5,
      roll: (pose.roll || 0) * 0.5 + 0.03 * splitR,
      eyeShiftX: 0,
      eyeShiftY: 0,
      eyeScaleX: 0.85,
      eyeScaleY: 0.85,
      eyeGap: 0.27,
      bulge: 0,
      squint,
      bodyColor: 4711597,
      eyeColor: 11531740
    };
    return {
      botId: 6,
      type: "bot6",
      label: res.label,
      botCenter,
      ghostL,
      ghostR,
      splitL,
      splitR,
      dots: []
    };
  }
  var bot7Timeline = new PoseTimeline([
    { t: 0, label: "solid-upright", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 0.2, bulge: 0, jumpY: 0, squint: 0.75, showEyes: true } },
    { t: 0.06, label: "loop-blink-open", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 1.3, label: "solid-idle-1", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 1.45, label: "curious-look-left-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: -0.26, pitch: 0, roll: -0.14, eyeShiftX: -0.045, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 2, label: "curious-look-left-1", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: -0.26, pitch: 0, roll: -0.14, eyeShiftX: -0.045, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 2.12, label: "squash-prep-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.05, scaleY: 0.95, yaw: 0, pitch: 0.01, roll: 0, eyeShiftX: 0, eyeShiftY: -0.01, eyeScaleX: 1.05, eyeScaleY: 0.95, bulge: 0, jumpY: -8e-3, squint: 0, showEyes: true } },
    { t: 2.24, label: "anticipation-squash-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.22, scaleY: 0.78, yaw: 0, pitch: 0.02, roll: 0, eyeShiftX: -0.015, eyeShiftY: -0.025, eyeScaleX: 1.18, eyeScaleY: 0.75, bulge: 0, jumpY: -0.024, squint: 0, showEyes: true } },
    { t: 2.4, label: "anticipation-stretch-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.96, scaleX: 0.88, scaleY: 1.18, yaw: 0, pitch: -0.04, roll: 0.36, eyeShiftX: -0.02, eyeShiftY: 0.035, eyeScaleX: 0.92, eyeScaleY: 1.12, bulge: 0, jumpY: 0.035, squint: 0, showEyes: true } },
    { t: 2.52, label: "collapse-shrink-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.65, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0.08, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 0.95, eyeScaleY: 0.95, bulge: 0, jumpY: 0.015, squint: 0, showEyes: false } },
    { t: 2.56, label: "collapse-core-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: false } },
    { t: 2.8, label: "satellite-burst-1", ease: "linear", pose: { ringExpand: 1, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 7.04, label: "satellite-orbit-1", ease: "linear", pose: { ringExpand: 1, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 7.3, label: "suction-absorb-1", ease: "linear", pose: { ringExpand: 0, scale: 0.72, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.02, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: -5e-3, squint: 0, showEyes: false } },
    { t: 7.46, label: "expand-shoot-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 0.88, scaleY: 1.18, yaw: 0, pitch: -0.03, roll: -0.32, eyeShiftX: 0.02, eyeShiftY: 0.035, eyeScaleX: 0.95, eyeScaleY: 1.1, bulge: 0, jumpY: 0.035, squint: 0, showEyes: true } },
    { t: 7.6, label: "expand-land-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.12, scaleY: 0.9, yaw: 0, pitch: 0, roll: -0.04, eyeShiftX: -0.02, eyeShiftY: -0.01, eyeScaleX: 1.05, eyeScaleY: 0.95, bulge: 0, jumpY: -0.014, squint: 0, showEyes: true } },
    { t: 7.72, label: "settle-left-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: -0.12, pitch: 0, roll: 0, eyeShiftX: -0.035, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 7.86, label: "sleepy-prep-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.02, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 7.98, label: "sleepy-slits-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.08, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 0.88, eyeScaleY: 0.12, bulge: 0, jumpY: 0, squint: 0.95, showEyes: true } },
    { t: 8.06, label: "sleepy-slits-hold-1", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.08, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 0.88, eyeScaleY: 0.12, bulge: 0, jumpY: 0, squint: 0.95, showEyes: true } },
    { t: 8.18, label: "curious-look-right-1", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 10, label: "curious-look-right-1", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 10.12, label: "squash-prep-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.06, scaleY: 0.94, yaw: 0.08, pitch: 0.01, roll: 0, eyeShiftX: 0.01, eyeShiftY: -0.01, eyeScaleX: 1.05, eyeScaleY: 0.95, bulge: 0, jumpY: -8e-3, squint: 0, showEyes: true } },
    { t: 10.23, label: "anticipation-squash-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.22, scaleY: 0.78, yaw: 0, pitch: 0.02, roll: 0, eyeShiftX: -0.015, eyeShiftY: -0.025, eyeScaleX: 1.18, eyeScaleY: 0.75, bulge: 0, jumpY: -0.024, squint: 0, showEyes: true } },
    { t: 10.4, label: "anticipation-stretch-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.96, scaleX: 0.88, scaleY: 1.18, yaw: 0, pitch: -0.04, roll: 0.36, eyeShiftX: -0.02, eyeShiftY: 0.035, eyeScaleX: 0.92, eyeScaleY: 1.12, bulge: 0, jumpY: 0.035, squint: 0, showEyes: true } },
    { t: 10.52, label: "collapse-shrink-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.65, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0.08, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 0.95, eyeScaleY: 0.95, bulge: 0, jumpY: 0.015, squint: 0, showEyes: false } },
    { t: 10.56, label: "collapse-core-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: false } },
    { t: 10.8, label: "satellite-burst-2", ease: "linear", pose: { ringExpand: 1, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 15.04, label: "satellite-orbit-2", ease: "linear", pose: { ringExpand: 1, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 15.3, label: "suction-absorb-2", ease: "linear", pose: { ringExpand: 0, scale: 0.72, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.02, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: -5e-3, squint: 0, showEyes: false } },
    { t: 15.46, label: "expand-shoot-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 0.88, scaleY: 1.18, yaw: 0, pitch: -0.03, roll: -0.32, eyeShiftX: 0.02, eyeShiftY: 0.035, eyeScaleX: 0.95, eyeScaleY: 1.1, bulge: 0, jumpY: 0.035, squint: 0, showEyes: true } },
    { t: 15.62, label: "expand-land-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.12, scaleY: 0.9, yaw: 0, pitch: 0, roll: -0.04, eyeShiftX: -0.02, eyeShiftY: -0.01, eyeScaleX: 1.05, eyeScaleY: 0.95, bulge: 0, jumpY: -0.014, squint: 0, showEyes: true } },
    { t: 15.72, label: "settle-left-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: -0.12, pitch: 0, roll: 0, eyeShiftX: -0.035, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 15.86, label: "sleepy-prep-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.02, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 15.98, label: "sleepy-slits-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.08, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 0.88, eyeScaleY: 0.12, bulge: 0, jumpY: 0, squint: 0.95, showEyes: true } },
    { t: 16.06, label: "sleepy-slits-hold-2", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: -0.08, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 0.88, eyeScaleY: 0.12, bulge: 0, jumpY: 0, squint: 0.95, showEyes: true } },
    { t: 16.18, label: "curious-look-right-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 16.24, label: "glance-blink-prep-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 16.32, label: "glance-blink-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 0.12, bulge: 0, jumpY: 0, squint: 0.85, showEyes: true } },
    { t: 16.4, label: "glance-blink-open-2", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 17.8, label: "curious-look-right-2", ease: "linear", pose: { ringExpand: 0, scale: 1, scaleX: 1, scaleY: 1, yaw: 0.32, pitch: -0.04, roll: 0.02, eyeShiftX: 0.048, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 18.12, label: "squash-prep-3", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.06, scaleY: 0.94, yaw: 0.28, pitch: 0.01, roll: 0, eyeShiftX: 0.042, eyeShiftY: -0.01, eyeScaleX: 1.05, eyeScaleY: 0.95, bulge: 0, jumpY: -8e-3, squint: 0, showEyes: true } },
    { t: 18.22, label: "anticipation-squash-3", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 1, scaleX: 1.22, scaleY: 0.78, yaw: 0.22, pitch: 0.02, roll: 0, eyeShiftX: 0.04, eyeShiftY: -0.025, eyeScaleX: 1.18, eyeScaleY: 0.75, bulge: 0, jumpY: -0.024, squint: 0, showEyes: true } },
    { t: 18.38, label: "anticipation-stretch-3", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.96, scaleX: 0.88, scaleY: 1.18, yaw: 0, pitch: -0.04, roll: 0.36, eyeShiftX: -0.02, eyeShiftY: 0.035, eyeScaleX: 0.92, eyeScaleY: 1.12, bulge: 0, jumpY: 0.035, squint: 0, showEyes: true } },
    { t: 18.5, label: "collapse-shrink-3", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.65, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0.08, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 0.95, eyeScaleY: 0.95, bulge: 0, jumpY: 0.015, squint: 0, showEyes: false } },
    { t: 18.56, label: "collapse-core-3", ease: "easeInOutQuad", pose: { ringExpand: 0, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: false } },
    { t: 18.8, label: "satellite-burst-3", ease: "linear", pose: { ringExpand: 1, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } },
    { t: 20.783, label: "satellite-orbit-3", ease: "linear", pose: { ringExpand: 1, scale: 0.52, scaleX: 1, scaleY: 1, yaw: 0, pitch: -0.02, roll: 0, eyeShiftX: 0, eyeShiftY: 0.01, eyeScaleX: 1, eyeScaleY: 1, bulge: 0, jumpY: 0, squint: 0, showEyes: true } }
  ]);
  var SATELLITE_RING_OFFSETS = [
    { x: 0, y: -46 },
    { x: 45.4, y: -46 },
    { x: 45.4, y: 0 },
    { x: 45.4, y: 46 },
    { x: 0, y: 46 },
    { x: -45.4, y: 46 },
    { x: -45.4, y: 0 },
    { x: -45.4, y: -46 }
  ];
  var ORBIT_PERIOD = 3.6;
  var CAM_YAW_AMP = 0.45;
  var CAM_PITCH_AMP = 0.35;
  var CAM_PITCH_NEUTRAL = -0.1;
  var CAM_AZIMUTH_OFFSET = -0.118;
  var CAM_ELEVATION_OFFSET = 0.146;
  function getBot7State(time) {
    var t = (time % LOOP + LOOP) % LOOP;
    var res = bot7Timeline.evaluate(t);
    var pose = res.pose;
    var ringExpand = pose.ringExpand;
    var tOrbitStart = 3.2;
    if (t >= 17) {
      tOrbitStart = 19.2;
    } else if (t >= 9) {
      tOrbitStart = 11.2;
    }
    var tOrbit = ((t - tOrbitStart) % ORBIT_PERIOD + ORBIT_PERIOD) % ORBIT_PERIOD;
    var waveAngle = -(tOrbit / ORBIT_PERIOD) * Math.PI * 2 - Math.PI / 2;
    var targetDirX = Math.cos(waveAngle);
    var targetDirY = Math.sin(waveAngle);
    var camYaw = targetDirX * CAM_YAW_AMP * ringExpand;
    var camPitch = (CAM_PITCH_NEUTRAL - targetDirY * CAM_PITCH_AMP) * ringExpand;
    var trackingYaw = camYaw + CAM_AZIMUTH_OFFSET * ringExpand;
    var trackingPitch = camPitch - CAM_ELEVATION_OFFSET * ringExpand;
    var hoverY = Math.sin(tOrbit / ORBIT_PERIOD * 2 * Math.PI) * 6e-3 * ringExpand;
    var hoverYPx = hoverY * 500;
    var dynamicRoll = targetDirX * 0.04 * ringExpand;
    var dots = [];
    if (ringExpand > 1e-3) {
      var dotDist = (35 + 10.4 * ringExpand) / 45.4;
      for (var i = 0; i < 8; i++) {
        var off = SATELLITE_RING_OFFSETS[i];
        var dotAngle = Math.atan2(-off.y, off.x);
        var diff = Math.cos(waveAngle - dotAngle);
        var pulse2 = Math.pow(Math.max(0, diff), 6);
        var r = ringExpand * (7 + pulse2 * 4.5);
        dots.push({
          x: off.x * dotDist,
          y: off.y * dotDist - hoverYPx,
          r,
          visible: true
        });
      }
    }
    var bot = {
      visible: true,
      scale: pose.scale,
      scaleX: pose.scaleX,
      scaleY: pose.scaleY,
      x: 0,
      y: (pose.jumpY || 0) + hoverY,
      yaw: (pose.yaw || 0) + trackingYaw,
      pitch: (pose.pitch || 0) + trackingPitch,
      roll: (pose.roll || 0) + dynamicRoll,
      eyeShiftX: pose.eyeShiftX || 0,
      eyeShiftY: pose.eyeShiftY || 0,
      eyeScaleX: pose.eyeScaleX,
      eyeScaleY: pose.eyeScaleY,
      eyeGap: 0.27,
      bulge: pose.bulge,
      squint: pose.squint || 0,
      showEyes: pose.showEyes !== false,
      bodyColor: 2236710,
      eyeColor: 16777215
    };
    return { botId: 7, type: "bot7", label: res.label, bot, dots };
  }
  var BOTS = [
    { id: 1, key: "sentry", name: "Sentry", title: "\u54E8\u5175", desc: "\u9010\u884C\u4E13\u6CE8\u626B\u8BFB\u3001\u673A\u7075\u4FA7\u503E (\u4EE3\u7801\u5BA1\u89C6/\u7EC8\u7AEF\u76D1\u63A7)", stateFn: getBot1State },
    { id: 2, key: "attitude", name: "Attitude", title: "\u50B2\u5A07\u5C0F\u602A", desc: "3D\u540E\u7A7A\u7FFB\u3001\u5355\u4FA7\u6311\u7709\u4E0E\u7280\u5229\u805A\u7126 (AI\u62DF\u4EBA\u5316\u52A9\u624B/\u6210\u529F\u53CD\u9988)", stateFn: getBot2State },
    { id: 3, key: "chameleon", name: "Chameleon", title: "\u52A8\u611F\u53D8\u8272\u9F99", desc: "240bpm \u9AD8\u9891\u8857\u821E\u6447\u6446\u300112\u8272\u8F6E\u8F6C (\u97F3\u4E50\u64AD\u653E\u5668/\u52A8\u611F\u52A0\u8F7D)", stateFn: getBot3State },
    { id: 4, key: "observer", name: "Observer", title: "\u5C4F\u8BFB\u89C2\u5BDF\u8005", desc: "\u7EAF\u6C34\u5E73\u5DE6-\u4E2D-\u53F3\u6805\u683C\u9605\u8BFB\u626B\u8BFB (\u5C4F\u5E55\u626B\u63CF/\u6570\u636E\u540C\u6B65)", stateFn: getBot4State },
    { id: 5, key: "cube", name: "Cube & Grid", title: "\u65B9\u5757\u4E0E\u70B9\u9635", desc: "3x3\u547C\u5438\u70B9\u9635\u7834\u571F\u81EA\u65CB\u8DF3\u8DC3\u3001\u5927\u773C\u66B4\u80C0 (\u542F\u52A8/\u751F\u6210\u6001/\u5F39\u7A97)", stateFn: getBot5State },
    { id: 6, key: "ghost", name: "Ghost Trail", title: "\u5E7D\u7075\u5206\u8EAB", desc: "\u8EAB\u540E\u8BDE\u751F\u7D2B\u9752\u53CC\u5206\u8EAB\u3001\u86C7\u5F62\u6D6E\u6E38\u5171\u821E (\u591A\u7EBF\u7A0B\u8FD0\u7B97/\u96C6\u7FA4\u534F\u540C)", stateFn: getBot6State },
    { id: 7, key: "satellite", name: "Satellite", title: "\u73AF\u7ED5\u536B\u661F", desc: "\u6838\u5FC3\u584C\u9677\u84C4\u529B\u30018\u536B\u661F\u9006\u65F6\u9488\u516C\u8F6C\u4E0E3D\u6CE8\u89C6 (\u7F51\u7EDC\u52A0\u8F7D/\u80FD\u91CF\u7F13\u51B2)", stateFn: getBot7State }
  ];
  function resolveBotId(idOrKey) {
    if (typeof idOrKey === "number") return idOrKey;
    if (typeof idOrKey === "string") {
      var lower = idOrKey.toLowerCase().trim();
      var num = parseInt(lower.replace("#", ""), 10);
      if (!isNaN(num) && num >= 1 && num <= 7) return num;
      for (var i = 0; i < BOTS.length; i++) {
        if (BOTS[i].key === lower || BOTS[i].name.toLowerCase() === lower) {
          return BOTS[i].id;
        }
      }
    }
    return 1;
  }
  function getBotState(botId, time) {
    var id = resolveBotId(botId);
    switch (id) {
      case 1:
        return getBot1State(time);
      case 2:
        return getBot2State(time);
      case 3:
        return getBot3State(time);
      case 4:
        return getBot4State(time);
      case 5:
        return getBot5State(time);
      case 6:
        return getBot6State(time);
      case 7:
        return getBot7State(time);
      default:
        return getBot1State(time);
    }
  }
  var stageCounter = 0;
  function mount(container, options) {
    if (!container) {
      throw new Error("[OpenBotMotion] mount requires a valid DOM element.");
    }
    options = options || {};
    var activeBotId = resolveBotId(options.bot !== void 0 ? options.bot : 1);
    var size = options.size !== void 0 ? options.size : 280;
    var autoplay = options.autoplay !== void 0 ? options.autoplay : true;
    var loop = options.loop !== void 0 ? options.loop : true;
    var speed = options.speed !== void 0 ? options.speed : 1;
    var onFrame = typeof options.onFrame === "function" ? options.onFrame : null;
    container.innerHTML = "";
    var uid = ++stageCounter;
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "open-bot-motion-svg");
    svg.setAttribute("viewBox", "-140 -140 280 280");
    svg.setAttribute("width", typeof size === "number" ? size + "px" : size);
    svg.setAttribute("height", typeof size === "number" ? size + "px" : size);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    container.appendChild(svg);
    var defs = document.createElementNS(svgNS, "defs");
    svg.appendChild(defs);
    var filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "obm-gooey-" + uid);
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    filter.innerHTML = '<feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" />';
    defs.appendChild(filter);
    function createClipDef(clipId, pathId) {
      var cp = document.createElementNS(svgNS, "clipPath");
      cp.setAttribute("id", clipId);
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("id", pathId);
      cp.appendChild(p);
      defs.appendChild(cp);
      return p;
    }
    var clipPathCenter = createClipDef("obm-clip-center-" + uid, "obm-cpp-center-" + uid);
    var clipPathGhostL = createClipDef("obm-clip-ghostL-" + uid, "obm-cpp-ghostL-" + uid);
    var clipPathGhostR = createClipDef("obm-clip-ghostR-" + uid, "obm-cpp-ghostR-" + uid);
    var dotsLayer = document.createElementNS(svgNS, "g");
    dotsLayer.setAttribute("class", "dots-layer");
    svg.appendChild(dotsLayer);
    var botLayer = document.createElementNS(svgNS, "g");
    botLayer.setAttribute("class", "bot-layer");
    svg.appendChild(botLayer);
    var bodiesLayer = document.createElementNS(svgNS, "g");
    bodiesLayer.setAttribute("class", "bodies-layer");
    botLayer.appendChild(bodiesLayer);
    var eyesLayer = document.createElementNS(svgNS, "g");
    eyesLayer.setAttribute("class", "eyes-layer");
    botLayer.appendChild(eyesLayer);
    function createBotNode(clipId, defaultColor) {
      var bodyPath = document.createElementNS(svgNS, "path");
      bodyPath.setAttribute("fill", defaultColor);
      bodiesLayer.appendChild(bodyPath);
      var eyesGroup = document.createElementNS(svgNS, "g");
      eyesGroup.setAttribute("clip-path", "url(#" + clipId + ")");
      var eyeL = document.createElementNS(svgNS, "rect");
      eyeL.setAttribute("fill", "#ffffff");
      var eyeR = document.createElementNS(svgNS, "rect");
      eyeR.setAttribute("fill", "#ffffff");
      eyesGroup.appendChild(eyeL);
      eyesGroup.appendChild(eyeR);
      eyesLayer.appendChild(eyesGroup);
      return { bodyPath, eyesGroup, eyeL, eyeR, defaultColor };
    }
    var ghostLNode = createBotNode("obm-clip-ghostL-" + uid, "#8229cc");
    var ghostRNode = createBotNode("obm-clip-ghostR-" + uid, "#47e4ad");
    var centerNode = createBotNode("obm-clip-center-" + uid, CHARCOAL);
    var projector = new SvgProjector({ viewportSize: 280 });
    function colorToCss(c, def) {
      if (!c) return def;
      if (typeof c === "number") return "#" + c.toString(16).padStart(6, "0");
      return c;
    }
    function applyPose(node, clipPathEl, pose) {
      if (!node || !pose || pose.visible === false || pose.scale !== void 0 && pose.scale <= 1e-3) {
        if (node && node.bodyPath) node.bodyPath.style.display = "none";
        if (node && node.eyesGroup) node.eyesGroup.style.display = "none";
        if (clipPathEl) clipPathEl.setAttribute("d", "");
        return;
      }
      node.bodyPath.style.display = "";
      var res = projector.projectRoundedCube(pose);
      if (!res.visible || !res.bodyPath) {
        node.bodyPath.style.display = "none";
        node.eyesGroup.style.display = "none";
        if (clipPathEl) clipPathEl.setAttribute("d", "");
        return;
      }
      node.bodyPath.setAttribute("d", res.bodyPath);
      if (clipPathEl) clipPathEl.setAttribute("d", res.bodyPath);
      var bodyFill = colorToCss(pose.bodyColor, node.defaultColor);
      var eyeFill = colorToCss(pose.eyeColor, "#ffffff");
      node.bodyPath.setAttribute("fill", bodyFill);
      if (res.eyes && res.eyes.length > 0) {
        node.eyesGroup.style.display = "";
        while (node.eyesGroup.children.length < res.eyes.length) {
          node.eyesGroup.appendChild(document.createElementNS(svgNS, "rect"));
        }
        while (node.eyesGroup.children.length > res.eyes.length) {
          node.eyesGroup.removeChild(node.eyesGroup.lastChild);
        }
        for (var i = 0; i < res.eyes.length; i++) {
          var d = res.eyes[i];
          var rectEl = node.eyesGroup.children[i];
          rectEl.setAttribute("x", (-d.w / 2).toFixed(2));
          rectEl.setAttribute("y", (-d.h / 2).toFixed(2));
          rectEl.setAttribute("width", d.w.toFixed(2));
          rectEl.setAttribute("height", d.h.toFixed(2));
          rectEl.setAttribute("rx", d.rx.toFixed(2));
          rectEl.setAttribute("ry", d.ry.toFixed(2));
          rectEl.setAttribute("transform", "translate(" + d.cx.toFixed(2) + ", " + d.cy.toFixed(2) + ") rotate(" + d.angle.toFixed(2) + ")");
          rectEl.setAttribute("opacity", (d.opacity !== void 0 ? d.opacity : 1).toFixed(2));
          rectEl.setAttribute("fill", colorToCss(d.color, eyeFill));
        }
      } else {
        node.eyesGroup.style.display = "none";
      }
    }
    function renderFrame(time) {
      var st = window.poseFor ? window.poseFor(container.dataset.motion, window.previewTime ?? time) : getBotState(activeBotId, time);
      if (activeBotId === 7 && svg.lastElementChild !== dotsLayer) {
        svg.appendChild(dotsLayer);
      } else if (activeBotId !== 7 && svg.firstElementChild !== dotsLayer) {
        svg.insertBefore(dotsLayer, botLayer);
      }
      if (st && st.dots && st.dots.length > 0) {
        dotsLayer.style.display = "";
        while (dotsLayer.children.length < st.dots.length) {
          dotsLayer.appendChild(document.createElementNS(svgNS, "circle"));
        }
        while (dotsLayer.children.length > st.dots.length) {
          dotsLayer.removeChild(dotsLayer.lastElementChild);
        }
        for (var di = 0; di < st.dots.length; di++) {
          var dot = st.dots[di];
          var cEl = dotsLayer.children[di];
          if (!dot || !dot.visible || dot.r <= 0.1) {
            cEl.style.display = "none";
          } else {
            cEl.style.display = "";
            cEl.setAttribute("cx", dot.x.toFixed(2));
            cEl.setAttribute("cy", dot.y.toFixed(2));
            cEl.setAttribute("r", dot.r.toFixed(2));
            cEl.setAttribute("fill", CHARCOAL);
          }
        }
      } else {
        dotsLayer.style.display = "none";
      }
      if (activeBotId === 6) {
        applyPose(ghostLNode, clipPathGhostL, st.ghostL);
        applyPose(ghostRNode, clipPathGhostR, st.ghostR);
        applyPose(centerNode, clipPathCenter, st.botCenter);
        var maxSplit = Math.max(
          st.splitL !== void 0 ? st.splitL : st.botCenter && st.botCenter.splitL || 0,
          st.splitR !== void 0 ? st.splitR : st.botCenter && st.botCenter.splitR || 0
        );
        if (maxSplit > 0.08 && maxSplit < 0.92) {
          bodiesLayer.setAttribute("filter", "url(#obm-gooey-" + uid + ")");
        } else {
          bodiesLayer.removeAttribute("filter");
        }
      } else {
        ghostLNode.bodyPath.style.display = "none";
        ghostLNode.eyesGroup.style.display = "none";
        ghostRNode.bodyPath.style.display = "none";
        ghostRNode.eyesGroup.style.display = "none";
        bodiesLayer.removeAttribute("filter");
        if (centerNode && st && st.bot) {
          applyPose(centerNode, clipPathCenter, st.bot);
        }
      }
      if (onFrame) {
        onFrame(time, st.label, st);
      }
    }
    var currentTime = 0;
    var isPlaying = autoplay;
    var lastTimestamp = null;
    var rafId = null;
    function tick(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      var dt = (timestamp - lastTimestamp) / 1e3;
      lastTimestamp = timestamp;
      if (isPlaying) {
        currentTime += dt * speed;
        if (loop) {
          currentTime = (currentTime % LOOP + LOOP) % LOOP;
        } else if (currentTime >= LOOP) {
          currentTime = LOOP;
          isPlaying = false;
        }
      }
      renderFrame(currentTime);
      if (isPlaying || loop) {
        rafId = requestAnimationFrame(tick);
      }
    }
    renderFrame(0);
    if (autoplay) {
      rafId = requestAnimationFrame(tick);
    }
    return {
      play: function() {
        if (!isPlaying) {
          isPlaying = true;
          lastTimestamp = null;
          rafId = requestAnimationFrame(tick);
        }
      },
      pause: function() {
        isPlaying = false;
        if (rafId) cancelAnimationFrame(rafId);
      },
      seek: function(t) {
        currentTime = clamp2(t, 0, LOOP);
        renderFrame(currentTime);
      },
      setBot: function(idOrKey) {
        activeBotId = resolveBotId(idOrKey);
        renderFrame(currentTime);
      },
      setSpeed: function(s) {
        speed = Math.max(0.01, s);
      },
      setSize: function(newSize) {
        size = newSize;
        svg.setAttribute("width", typeof size === "number" ? size + "px" : size);
        svg.setAttribute("height", typeof size === "number" ? size + "px" : size);
      },
      getBotId: function() {
        return activeBotId;
      },
      getTime: function() {
        return currentTime;
      },
      isPlaying: function() {
        return isPlaying;
      },
      destroy: function() {
        if (rafId) cancelAnimationFrame(rafId);
        container.innerHTML = "";
      }
    };
  }
  return {
    version: "1.0.0",
    LOOP,
    BOTS,
    Easings,
    PoseTimeline,
    BlinkTrack,
    DotGridRig,
    SvgProjector,
    resolveBotId,
    getBotState,
    getBot1State,
    getBot2State,
    getBot3State,
    getBot4State,
    getBot5State,
    getBot6State,
    getBot7State,
    mount
  };
})();
var open_bot_motion_default = OpenBotMotion;

// src/vendor/idle-motions.js
var clamp = (x) => Math.max(0, Math.min(1, x));
var ease = (x) => {
  x = clamp(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
var pulse = (t, a, b, c, d) => ease((t - a) / (b - a)) * (1 - ease((t - c) / (d - c)));
var neutral = () => ({ visible: true, scale: 1, scaleX: 1, scaleY: 1, x: 0, y: 0, yaw: 0, pitch: 0, roll: 0, eyeShiftX: 0, eyeShiftY: 0, eyeShiftYL: 0, eyeShiftYR: 0, eyeGap: 0.24, eyeScaleXL: 1, eyeScaleXR: 1, eyeScaleYL: 1, eyeScaleYR: 1, eyeSlantL: 0, eyeSlantR: 0, squint: 0, bodyColor: 15066599, eyeColor: 1513241 });
function poseFor(id, time) {
  if (id === "cube-in") {
    const result = open_bot_motion_default.getBot5State(2.22 + Math.min(time, 1.05));
    result.bot.visible = true;
    result.bot.scale = Math.max(0.015, result.bot.scale);
    result.bot.bodyColor = 15066599;
    result.bot.eyeColor = 1513241;
    return result;
  }
  if (id === "satellite-out" || id === "satellite-in") {
    const t2 = id === "satellite-out" ? 2 + Math.min(time, 0.8) : 7.04 + Math.min(time, 0.82);
    const result = open_bot_motion_default.getBot7State(t2);
    result.bot.bodyColor = 15066599;
    result.bot.eyeColor = 1513241;
    if (id === "satellite-out") {
      const turn = ease((time - 0.2) / 0.38);
      result.bot.pitch = -Math.PI * 2 * turn;
      result.bot.yaw = 0.26 * Math.sin(Math.PI * turn);
      result.bot.scale = 1 - 0.48 * ease((time - 0.4) / 0.22);
      result.bot.y += 0.065 * Math.sin(Math.PI * turn);
      result.bot.showEyes = true;
    }
    if (result.bot.showEyes === false) {
      result.bot.showEyes = true;
      result.bot.eyeScaleY = 0.01;
    }
    return result;
  }
  if (id === "dance") return open_bot_motion_default.getBot3State(time);
  if (id === "dance-old") return open_bot_motion_default.getBot3State(time * 0.65);
  const t = time % (id === "sleep" ? 9 : 7), p = neutral();
  const close = (v) => {
    p.eyeScaleYL = 1 - 0.94 * v;
    p.eyeScaleYR = 1 - 0.94 * v;
  };
  switch (id) {
    case "blink": {
      close(pulse(t, 1.1, 1.22, 1.31, 1.52) + pulse(t, 1.8, 1.94, 2.01, 2.2));
      const wake = pulse(t, 2.35, 2.7, 3.1, 3.9);
      p.eyeScaleYL += 0.16 * wake;
      p.eyeScaleYR += 0.16 * wake;
      p.y = 0.018 * wake;
      break;
    }
    case "scan": {
      const left = pulse(t, 0.8, 1.25, 1.8, 2.3), right = pulse(t, 2.5, 3, 3.6, 4.2);
      p.eyeShiftX = 0.18 * (right - left);
      p.yaw = 0.22 * (pulse(t, 1, 1.5, 1.8, 2.5) * -1 + pulse(t, 2.7, 3.2, 3.6, 4.4));
      break;
    }
    case "tilt": {
      const first = pulse(t, 1, 1.7, 2.4, 3), second = pulse(t, 3.2, 3.8, 4.15, 4.9);
      p.roll = -0.27 * first + 0.14 * second;
      p.eyeShiftY = 0.035 * first;
      p.pitch = -0.08 * first;
      close(0.38 * pulse(t, 4.8, 4.92, 5.01, 5.18));
      break;
    }
    case "nod": {
      const hello = pulse(t, 0.8, 1.2, 1.45, 1.85) + 0.65 * pulse(t, 2, 2.3, 2.5, 2.95);
      p.pitch = 0.3 * hello;
      p.y = -0.045 * hello;
      p.scaleY = 1 - 0.07 * hello;
      p.scaleX = 1 + 0.025 * hello;
      close(0.35 * hello);
      break;
    }
    case "stretch": {
      const prep = pulse(t, 0.8, 1.2, 1.4, 1.8), up = pulse(t, 1.5, 2.3, 3.3, 4.35);
      p.scaleY = 1 - 0.16 * prep + 0.22 * up;
      p.scaleX = 1 + 0.1 * prep - 0.12 * up;
      p.y = 0.025 * up;
      close(0.72 * up);
      p.roll = 0.035 * Math.sin(t * 4) * up;
      break;
    }
    case "hop": {
      const prep = pulse(t, 0.8, 1.15, 1.3, 1.55);
      p.scaleY -= 0.23 * prep;
      p.scaleX += 0.16 * prep;
      if (t >= 1.5 && t < 2.35) {
        const u = (t - 1.5) / 0.85;
        p.y = 0.32 * Math.sin(Math.PI * u);
        p.scaleY += 0.12 * Math.sin(Math.PI * u);
        p.scaleX -= 0.07 * Math.sin(Math.PI * u);
      }
      const land = pulse(t, 2.3, 2.46, 2.51, 2.84);
      p.scaleY -= 0.2 * land;
      p.scaleX += 0.14 * land;
      if (t >= 2.8 && t < 3.25) p.y = 0.065 * Math.sin(Math.PI * (t - 2.8) / 0.45);
      const settle = pulse(t, 3.2, 3.3, 3.33, 3.6);
      p.scaleY -= 0.05 * settle;
      p.scaleX += 0.03 * settle;
      break;
    }
    case "balance": {
      const w = pulse(t, 0.7, 1.3, 3.8, 4.7);
      p.roll = 0.24 * Math.sin((t - 0.7) * 3.5) * w;
      p.x = 0.05 * Math.sin((t - 0.7) * 3.5) * w;
      p.eyeShiftX = -0.1 * Math.sin((t - 0.7) * 3.5) * w;
      break;
    }
    case "sneeze": {
      const inhale = pulse(t, 0.7, 1.5, 1.75, 2.15);
      p.scaleY += 0.13 * inhale;
      p.scaleX -= 0.065 * inhale;
      p.pitch = -0.15 * inhale;
      close(0.6 * inhale);
      const sneeze = pulse(t, 1.9, 2.05, 2.13, 2.4);
      p.scaleY -= 0.3 * sneeze;
      p.scaleX += 0.18 * sneeze;
      p.pitch += 0.4 * sneeze;
      p.y -= 0.035 * sneeze;
      close(Math.max(0.6 * inhale, sneeze));
      p.roll = 0.045 * Math.sin((t - 2.4) * 12) * pulse(t, 2.4, 2.55, 2.7, 3.2);
      const surprise = pulse(t, 3.3, 3.6, 3.95, 4.6);
      p.eyeScaleYL += 0.15 * surprise;
      p.eyeScaleYR += 0.15 * surprise;
      break;
    }
    case "sleep": {
      const drowse = pulse(t, 0.6, 1.7, 5.7, 6.2);
      close(drowse);
      p.scaleY -= 0.1 * drowse;
      p.scaleX += 0.035 * drowse;
      p.roll = 0.12 * drowse;
      p.y = -0.035 * drowse;
      const droop = pulse(t, 2.4, 3.1, 5.4, 6);
      p.pitch = 0.2 * droop;
      p.y -= 0.025 * droop;
      const wake = pulse(t, 5.95, 6.2, 6.32, 6.9);
      p.y += 0.05 * wake;
      p.scaleY += 0.06 * wake;
      p.eyeScaleYL += 0.22 * wake;
      p.eyeScaleYR += 0.22 * wake;
      break;
    }
  }
  return { botId: 1, type: "bot1", label: id, bot: p, dots: [] };
}

// src/client/idle-director.ts
var BASICS = ["blink", "scan", "tilt", "nod", "stretch", "hop", "balance", "sneeze", "sleep"];
var DURATION = { dance: 20.783, sleep: 9 };
var DEFAULT_DURATION = 7;
function clipDuration(id) {
  return DURATION[id] ?? DEFAULT_DURATION;
}
function restSeconds() {
  return 5 + Math.random() * 5;
}
function rareSeconds() {
  return 1200 + Math.random() * 1200;
}
function chooseMotion(nowSeconds, nextRareAt, previous, random = Math.random) {
  if (nowSeconds >= nextRareAt) return "dance";
  const pool = BASICS.filter((id) => id !== previous);
  if (pool.length === 0) return "blink";
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  return pool[index] ?? "blink";
}
function prefersReducedMotion() {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// src/client/idle-robot.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var VIEW_BOX = "-136 -135 232 232";
function mascotPalette() {
  const dark = typeof document !== "undefined" && document.body !== null && document.body.hasAttribute("data-ds-dark-theme");
  return dark ? { body: 14078925, eye: 2105376 } : { body: 3093559, eye: 16777215 };
}
function installPoseResolver() {
  const g = window;
  const hadPoseFor = Object.prototype.hasOwnProperty.call(g, "poseFor");
  const previousPoseFor = g.poseFor;
  const hadPreview = Object.prototype.hasOwnProperty.call(g, "previewTime");
  const previousPreview = g.previewTime;
  g.poseFor = (id, time) => {
    const state = id === void 0 || id === "" ? open_bot_motion_default.getBotState(1, time) : poseFor(id, time);
    if (state === void 0 || state === null || typeof state !== "object") return state;
    const withBot = state;
    if (id === "dance" || withBot.bot === void 0) return state;
    const palette = mascotPalette();
    return { ...state, bot: { ...withBot.bot, bodyColor: palette.body, eyeColor: palette.eye } };
  };
  return () => {
    if (hadPoseFor) g.poseFor = previousPoseFor;
    else delete g.poseFor;
    if (hadPreview) g.previewTime = previousPreview;
    else delete g.previewTime;
  };
}
function startIdleRobot(container, size = 22) {
  const g = window;
  const reduced = prefersReducedMotion();
  const restoreGlobals = installPoseResolver();
  let robot;
  try {
    robot = open_bot_motion_default.mount(container, {
      bot: 1,
      size,
      autoplay: false,
      loop: false
    });
  } catch {
    restoreGlobals();
    return () => {
    };
  }
  const svg = container.querySelector("svg");
  svg?.setAttribute("viewBox", VIEW_BOX);
  const paint = (motion, poseTime) => {
    container.dataset.motion = motion;
    g.previewTime = poseTime;
    robot?.seek(poseTime);
  };
  if (reduced) {
    paint("blink", 0);
    return () => {
      restoreGlobals();
      try {
        robot?.destroy();
      } catch {
      }
    };
  }
  let rafId;
  let stopped = false;
  let previous = "";
  let action = "";
  let actionStarted = 0;
  let nextBasicAt = 0;
  let nextRareAt = 0;
  const seconds = () => performance.now() / 1e3;
  const schedule = (from) => {
    nextBasicAt = from + restSeconds();
    nextRareAt = from + rareSeconds();
  };
  const start = (now) => {
    const chosen = chooseMotion(now, nextRareAt, previous);
    if (chosen === "dance") nextRareAt = now + rareSeconds();
    action = chosen;
    previous = chosen;
    actionStarted = now;
  };
  schedule(seconds());
  const tick = () => {
    if (stopped) return;
    const now = seconds();
    if (action === "") {
      if (now >= nextBasicAt || now >= nextRareAt) start(now);
    } else if (now - actionStarted >= clipDuration(action)) {
      action = "";
      schedule(now);
    }
    try {
      if (action === "") paint("", now);
      else paint(action, now - actionStarted);
    } catch {
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    if (rafId !== void 0) cancelAnimationFrame(rafId);
    restoreGlobals();
    try {
      robot?.destroy();
    } catch {
    }
  };
}
function IdleRobot({ size = 24, className }) {
  const host = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const node = host.current;
    if (!node) return;
    return startIdleRobot(node, size);
  }, [size]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      ref: host,
      className: className === void 0 ? "dpl-idle-bot" : "dpl-idle-bot " + className,
      "aria-hidden": true
    }
  );
}

// src/client/status-orbit.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var STATUS_INK = {
  running: "#4d6bfe",
  success: "#34c759",
  failure: "#ff4000",
  decision: "#f2ff14"
};
var RUNNING_ARC_SPAN = 0.7;
var RUNNING_VELOCITY = 2 * Math.PI / 3;
var RUNNING_PERIOD_SECONDS = 2 * Math.PI / RUNNING_VELOCITY;
function RunningArc({ size = 15, ink = STATUS_INK.running }) {
  const r = 9.5;
  const c = 10;
  const circumference = 2 * Math.PI * r;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "svg",
    {
      className: "dpl-run-arc",
      width: size,
      height: size,
      viewBox: "0 0 20 20",
      fill: "none",
      "aria-hidden": true,
      style: { flex: "none", overflow: "visible" },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "circle",
        {
          cx: c,
          cy: c,
          r,
          stroke: ink,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          strokeDasharray: `${circumference * RUNNING_ARC_SPAN} ${circumference}`,
          transform: `rotate(-90 ${c} ${c})`
        }
      )
    }
  );
}

// src/client/sidebar-card.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var POLL_MS = 3e3;
var MAX_ENTRIES = 30;
var MAX_READ_IDS = 300;
var READ_KEY = "dsh.donePill.read";
var POP_RECENT_N = 5;
var POP_RUNNING_N = 5;
var POP_W = 440;
var CLOSE_DELAY_MS = 150;
var sessionsAccessor;
var sessionsWarned = false;
function setSidebarSessionsAccessor(fn) {
  sessionsAccessor = fn;
}
function openSessionById(sessionId) {
  try {
    const runtime = sessionsAccessor?.();
    if (runtime === void 0) {
      if (!sessionsWarned) {
        sessionsWarned = true;
        console.warn("[dsh-done-pill] sessions \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u70B9\u51FB\u65E0\u6CD5\u8DF3\u8F6C\u4F1A\u8BDD\uFF08\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\uFF09");
      }
    } else {
      runtime.open(sessionId);
    }
  } catch (error) {
    console.warn("[dsh-done-pill] \u8DF3\u8F6C\u4F1A\u8BDD\u5931\u8D25\uFF1A", error);
  }
}
function loadReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.filter((v) => typeof v === "string"));
    }
  } catch {
  }
  return /* @__PURE__ */ new Set();
}
function saveReadIds(ids) {
  try {
    const arr = [...ids];
    localStorage.setItem(READ_KEY, JSON.stringify(arr.length > MAX_READ_IDS ? arr.slice(-MAX_READ_IDS) : arr));
  } catch {
  }
}
function formatTime(ts) {
  if (ts <= 0) return "";
  const d = new Date(ts);
  const now = /* @__PURE__ */ new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${mo}-${day} ${hh}:${mm}`;
}
function truncate(text, max) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}\u2026`;
}
function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1e3));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor(total % 3600 / 60);
  const ss = total % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}
function groupByMinute(items) {
  const groups = [];
  for (const item of items) {
    const time = formatTime(item.endedAt);
    const last = groups[groups.length - 1];
    if (last !== void 0 && last.time === time) last.items.push(item);
    else groups.push({ time, items: [item] });
  }
  return groups;
}
var CARD_LAYOUT_STYLE_ID = "dsh-done-pill-card-layout";
var CARD_LAYOUT_CSS = `
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]){
  flex-wrap:wrap;
  row-gap:8px;
}
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [class*="_footerActions"],
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [class*="_footerActions"] > [data-slot]{
  display:contents;
}
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [data-dpp-card]{
  order:-1;
  flex-grow:1;
  flex-basis:100% !important;
  min-width:0;
}
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [class*="_settingsArea"]{
  order:-1;
  flex:1 1 auto;
  width:auto;
  min-width:0;
}
`;
function ensureCardLayoutCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById(CARD_LAYOUT_STYLE_ID) !== null) return;
  const style = document.createElement("style");
  style.id = CARD_LAYOUT_STYLE_ID;
  style.dataset.plugin = "dsh-done-pill";
  style.textContent = CARD_LAYOUT_CSS;
  document.head.appendChild(style);
}
var wrapStyle = (wide, fontStack, scale) => ({
  flex: wide ? "1 1 auto" : "none",
  minWidth: 0,
  width: wide ? "100%" : "auto",
  display: "flex",
  ...fontStack !== "" ? { fontFamily: fontStack } : {},
  "--dps": String(scale),
  letterSpacing: "-0.01em",
  WebkitFontSmoothing: "antialiased"
});
var barStyle = (scale) => ({
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: `calc(8px * var(--dps))`,
  width: "100%",
  minWidth: 0,
  height: `calc(38px * var(--dps))`,
  padding: `0 calc(12px * var(--dps))`,
  borderRadius: `calc(10px * var(--dps))`,
  fontSize: `calc(12.5px * var(--dps))`,
  lineHeight: `calc(20px * var(--dps))`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  cursor: "pointer"
});
var railStyle = {
  position: "relative",
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  cursor: "pointer"
};
var countBadgeStyle = {
  flex: "none",
  minWidth: 20,
  height: 20,
  padding: "0 6px",
  boxSizing: "border-box",
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--dpl-fg)",
  color: "var(--dpl-panel-bg)",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "20px",
  fontVariantNumeric: "tabular-nums"
};
var railBadgeStyle = {
  position: "absolute",
  top: -6,
  right: -6,
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  boxSizing: "border-box",
  borderRadius: 9,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--dpl-fg)",
  color: "var(--dpl-panel-bg)",
  fontSize: 10,
  fontWeight: 600,
  lineHeight: "18px",
  fontVariantNumeric: "tabular-nums"
};
var barLabelStyle = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "var(--dpl-fg-dim)"
};
var popStyle = (anchor) => {
  const width = Math.min(POP_W, Math.max(240, window.innerWidth - 16));
  const left = anchor === null ? 8 : Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8));
  return {
    position: "fixed",
    left,
    bottom: anchor === null ? 60 : anchor.bottom,
    width,
    maxHeight: "min(60vh, 480px)",
    overflowY: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 12px 10px",
    borderRadius: 16,
    border: "1px solid var(--dpl-panel-border)",
    background: "var(--dpl-panel-bg)",
    color: "var(--dpl-fg)",
    boxShadow: "var(--dpl-panel-shadow)",
    zIndex: 9500,
    animation: "dpRowIn .22s cubic-bezier(.32,.72,0,1) backwards"
  };
};
var popHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "2px 4px 8px"
};
var popBarStyle = {
  flex: "none",
  width: 3,
  height: 14,
  borderRadius: 1.5,
  background: "var(--dpl-fg-dim)"
};
var popTitleStyle = {
  flex: "none",
  fontSize: 15,
  fontWeight: 600,
  lineHeight: "22px",
  color: "var(--dpl-fg)"
};
var popMetaStyle = {
  flex: 1,
  minWidth: 0,
  textAlign: "right",
  fontSize: 12,
  lineHeight: "18px",
  color: "var(--dpl-fg-dim)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};
var popLinkStyle = {
  flex: "none",
  border: "none",
  background: "transparent",
  padding: 0,
  fontSize: 12,
  lineHeight: "18px",
  color: "var(--dpl-fg)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationColor: "var(--dpl-fg-weak)",
  cursor: "pointer"
};
var sectionLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 4px 2px",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "18px",
  color: "var(--dpl-fg-dim)"
};
var sectionDotStyle = {
  flex: "none",
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "var(--dpl-fg-dim)"
};
var rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: "none",
  background: "var(--dpl-row-bg)",
  color: "var(--dpl-fg)",
  fontSize: 13,
  lineHeight: "20px",
  textAlign: "left",
  cursor: "pointer"
};
var rowTitleStyle = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
var rowTimeStyle = {
  flex: "none",
  fontSize: 11,
  color: "var(--dpl-fg-weak)",
  fontVariantNumeric: "tabular-nums"
};
var turnTagStyle = {
  flex: "none",
  padding: "1px 7px",
  borderRadius: 999,
  border: "1px solid var(--dpl-panel-border)",
  color: "var(--dpl-fg-dim)",
  fontSize: 11,
  lineHeight: "16px",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums"
};
var groupHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 4px 3px",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "16px",
  color: "var(--dpl-fg-dim)",
  fontVariantNumeric: "tabular-nums"
};
var groupCountStyle = {
  fontWeight: 400,
  color: "var(--dpl-fg-weak)"
};
var unreadDotStyle = {
  flex: "none",
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "var(--dpl-fg)"
};
var dismissStyle = {
  flex: "none",
  width: 22,
  height: 22,
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "var(--dpl-fg-weak)",
  fontSize: 12,
  lineHeight: "22px",
  cursor: "pointer"
};
var emptyStyle = {
  padding: "16px 8px",
  textAlign: "center",
  fontSize: 12,
  lineHeight: "20px",
  color: "var(--dpl-fg-weak)"
};
function RunOrb() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dpl-run-arc-wrap", style: { flex: "none" }, "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RunningArc, { size: 15 }) });
}
function BulbIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "svg",
    {
      className: "dpp-bulb",
      width: 15,
      height: 15,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      style: { flex: "none" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { x1: "9.5", y1: "17", x2: "14.5", y2: "17" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { x1: "10.5", y1: "20", x2: "13.5", y2: "20" })
      ]
    }
  );
}
function ChevronIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "svg",
    {
      className: "dpp-chev",
      width: 12,
      height: 12,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2.4,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      style: { flex: "none" },
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m9 5 7 7-7 7" })
    }
  );
}
function SidebarBarCard(props) {
  const wide = props.wide !== false;
  const [mode, setMode] = (0, import_react2.useState)(modeStore.get());
  const [enabled, setEnabled] = (0, import_react2.useState)(enabledStore.get());
  const [appearance, setAppearance] = (0, import_react2.useState)(() => appearanceStore.get());
  const [entries, setEntries] = (0, import_react2.useState)([]);
  const [readIds, setReadIds] = (0, import_react2.useState)(() => loadReadIds());
  const [runInfo, setRunInfo] = (0, import_react2.useState)({});
  const [open, setOpen] = (0, import_react2.useState)(false);
  const [nowTick, setNowTick] = (0, import_react2.useState)(() => Date.now());
  const [hydrated, setHydrated] = (0, import_react2.useState)(false);
  const [anchor, setAnchor] = (0, import_react2.useState)(null);
  const cardRef = (0, import_react2.useRef)(null);
  const popRef = (0, import_react2.useRef)(null);
  const closeTimer = (0, import_react2.useRef)(null);
  const sinceRef = (0, import_react2.useRef)(0);
  (0, import_react2.useEffect)(() => modeStore.subscribe(setMode), []);
  (0, import_react2.useEffect)(() => enabledStore.subscribe(setEnabled), []);
  (0, import_react2.useEffect)(() => appearanceStore.subscribe(setAppearance), []);
  const active = enabled && mode === "card";
  (0, import_react2.useEffect)(() => {
    if (!active) return;
    let stopped = false;
    const merge = (incoming) => {
      if (incoming.length === 0) return;
      setEntries((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const item of incoming) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          merged.push(item);
        }
        merged.sort((a, b) => b.seq - a.seq);
        return merged.length > MAX_ENTRIES ? merged.slice(0, MAX_ENTRIES) : merged;
      });
    };
    const tick = () => {
      if (document.hidden) return;
      fetch(`/api/dsh-done-pill?since=${sinceRef.current}`, { cache: "no-store" }).then(async (res) => {
        if (!res.ok) throw new Error(`http ${res.status}`);
        return res.json();
      }).then((data) => {
        if (stopped || data?.ok !== true || !Array.isArray(data.items)) return;
        sinceRef.current = Math.max(sinceRef.current, typeof data.version === "number" ? data.version : 0);
        merge(data.items.filter((item) => item !== null && typeof item === "object" && typeof item.id === "string"));
        if (Array.isArray(data.running)) {
          const next = {};
          for (const entry of data.running) {
            if (entry !== null && typeof entry === "object" && typeof entry.sessionId === "string" && typeof entry.since === "number") {
              next[entry.sessionId] = {
                since: entry.since,
                question: typeof entry.question === "string" ? entry.question : "",
                title: typeof entry.title === "string" ? entry.title : ""
              };
            }
          }
          setRunInfo(next);
        }
        setHydrated(true);
      }).catch(() => {
      });
    };
    setReadIds(loadReadIds());
    tick();
    const timer = window.setInterval(tick, POLL_MS);
    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);
  const runningSessions = Object.entries(runInfo).map(([sessionId, info]) => ({
    id: sessionId,
    displayTitle: info.title,
    question: info.question,
    since: info.since
  })).sort((a, b) => b.since - a.since);
  const unreadCount = entries.filter((item) => !readIds.has(item.id)).length;
  const latest = entries[0];
  const latestLabel = latest !== void 0 ? latest.question !== "" ? latest.question : latest.title : "";
  const [barFx, setBarFx] = (0, import_react2.useState)(null);
  const barFxTimer = (0, import_react2.useRef)(null);
  const barFxRaf = (0, import_react2.useRef)(null);
  const prevRunningRef = (0, import_react2.useRef)(-1);
  const prevUnreadRef = (0, import_react2.useRef)(-1);
  const fireBarFx = (0, import_react2.useCallback)((kind) => {
    if (barFxTimer.current !== null) clearTimeout(barFxTimer.current);
    if (barFxRaf.current !== null) cancelAnimationFrame(barFxRaf.current);
    setBarFx(null);
    barFxRaf.current = requestAnimationFrame(() => {
      barFxRaf.current = null;
      setBarFx(kind);
      barFxTimer.current = setTimeout(() => {
        barFxTimer.current = null;
        setBarFx(null);
      }, 1e3);
    });
  }, []);
  (0, import_react2.useEffect)(() => {
    if (!hydrated) return;
    const n = runningSessions.length;
    const prev = prevRunningRef.current;
    prevRunningRef.current = n;
    if (prev === -1) return;
    if (prev === 0 && n > 0) fireBarFx("start");
  }, [hydrated, runningSessions.length, fireBarFx]);
  (0, import_react2.useEffect)(() => {
    if (!hydrated) return;
    const prev = prevUnreadRef.current;
    prevUnreadRef.current = unreadCount;
    if (prev === -1) return;
    if (unreadCount > prev) fireBarFx("done");
  }, [hydrated, unreadCount, fireBarFx]);
  (0, import_react2.useEffect)(() => () => {
    if (barFxTimer.current !== null) clearTimeout(barFxTimer.current);
    if (barFxRaf.current !== null) cancelAnimationFrame(barFxRaf.current);
  }, []);
  (0, import_react2.useEffect)(() => {
    if (!open || runningSessions.length === 0) return;
    setNowTick(Date.now());
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [open, runningSessions.length]);
  const markAllRead = (0, import_react2.useCallback)(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const item of entries) next.add(item.id);
      saveReadIds(next);
      return next.size === prev.size ? prev : next;
    });
  }, [entries]);
  const wasOpenRef = (0, import_react2.useRef)(false);
  (0, import_react2.useEffect)(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      markAllRead();
    }
  }, [open, markAllRead]);
  const dismiss = (0, import_react2.useCallback)((id) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);
  const openSession = (0, import_react2.useCallback)((sessionId, markReadId) => {
    openSessionById(sessionId);
    if (markReadId !== void 0) {
      setReadIds((prev) => {
        if (prev.has(markReadId)) return prev;
        const next = new Set(prev);
        next.add(markReadId);
        saveReadIds(next);
        return next;
      });
    }
    setOpen(false);
  }, []);
  const clearCloseTimer = (0, import_react2.useCallback)(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  (0, import_react2.useEffect)(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);
  const measureAnchor = (0, import_react2.useCallback)(() => {
    const el = cardRef.current;
    if (el === null) return;
    const rect = el.getBoundingClientRect();
    setAnchor({
      left: Math.round(rect.left),
      bottom: Math.round(Math.max(8, window.innerHeight - rect.top + 8))
    });
  }, []);
  const showPop = (0, import_react2.useCallback)(() => {
    clearCloseTimer();
    measureAnchor();
    setOpen(true);
  }, [clearCloseTimer, measureAnchor]);
  const scheduleHide = (0, import_react2.useCallback)(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);
  const togglePop = (0, import_react2.useCallback)(() => {
    clearCloseTimer();
    setOpen((prev) => {
      if (!prev) measureAnchor();
      return !prev;
    });
  }, [clearCloseTimer, measureAnchor]);
  (0, import_react2.useEffect)(() => {
    if (!open) return;
    const onResize = () => {
      measureAnchor();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [open, measureAnchor]);
  if (!active) return null;
  const firstRunning = runningSessions[0];
  const firstRunningLabel = firstRunning !== void 0 ? firstRunning.question !== "" ? firstRunning.question : firstRunning.displayTitle : "";
  let barText = "\u6682\u65E0\u65B0\u52A8\u6001";
  if (runningSessions.length > 0 && unreadCount > 0) {
    barText = `${runningSessions.length} \u8FDB\u884C\u4E2D \xB7 ${unreadCount} \u5B8C\u6210`;
  } else if (runningSessions.length > 0) {
    barText = `${runningSessions.length} \u8FDB\u884C\u4E2D \xB7 ${truncate(firstRunningLabel, 18)}`;
  } else if (unreadCount > 0 && latest !== void 0) {
    barText = `${unreadCount} \u5B8C\u6210 \xB7 ${truncate(latestLabel, 18)}`;
  }
  const totalBadge = runningSessions.length + unreadCount;
  const summaryLabel = runningSessions.length > 0 || unreadCount > 0 ? `\u5BF9\u8BDD\u52A8\u6001\uFF1A${runningSessions.length} \u4E2A\u8FDB\u884C\u4E2D\uFF0C${unreadCount} \u4E2A\u5DF2\u5B8C\u6210\u672A\u8BFB\uFF1B${truncate(firstRunningLabel !== "" ? firstRunningLabel : latestLabel, 40)}` : "\u5BF9\u8BDD\u52A8\u6001\uFF1A\u6682\u65E0\u65B0\u52A8\u6001\uFF1B\u60AC\u505C\u6216\u70B9\u6309\u67E5\u770B\u8BB0\u5F55";
  const scale = appearance.scale;
  const fontStack = fontStackOf(appearance.font);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "dsh-done-pill",
      "data-dpp-card": wide ? "wide" : "rail",
      style: wrapStyle(wide, fontStack, scale),
      onMouseEnter: showPop,
      onMouseLeave: scheduleHide,
      children: [
        wide ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            ref: cardRef,
            type: "button",
            style: barStyle(scale),
            className: `dpp-bar${barFx !== null ? ` dpp-fx-${barFx}` : ""}`,
            "data-state": runningSessions.length > 0 ? "running" : "idle",
            "aria-label": summaryLabel,
            "aria-expanded": open,
            title: "\u60AC\u505C\u67E5\u770B\u8FDB\u884C\u4E2D\u4E0E\u6700\u8FD1\u5B8C\u6210\u7684\u5BF9\u8BDD",
            onClick: togglePop,
            onFocus: showPop,
            onKeyDown: (event) => {
              if (event.key === "Escape") setOpen(false);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dpp-icon-swap", "aria-hidden": true, children: runningSessions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RunOrb, {}) : unreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BulbIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IdleRobot, { size: 16, className: "dpp-idle-bot" }) }, runningSessions.length > 0 ? "run" : unreadCount > 0 ? "done" : "idle"),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dpp-bar-label", style: barLabelStyle, children: barText }, `label:${barText}`),
              unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dpp-badge-pop", style: countBadgeStyle, children: unreadCount > 99 ? "99+" : unreadCount }, `badge:${unreadCount}`),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ChevronIcon, {})
            ]
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            ref: cardRef,
            type: "button",
            style: railStyle,
            className: `dpp-bar${barFx !== null ? ` dpp-fx-${barFx}` : ""}`,
            "data-state": runningSessions.length > 0 ? "running" : "idle",
            "aria-label": summaryLabel,
            "aria-expanded": open,
            title: "\u5BF9\u8BDD\u52A8\u6001\uFF1A\u60AC\u505C\u67E5\u770B\u8FDB\u884C\u4E2D\u4E0E\u6700\u8FD1\u5B8C\u6210",
            onClick: togglePop,
            onFocus: showPop,
            onKeyDown: (event) => {
              if (event.key === "Escape") setOpen(false);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dpp-icon-swap", "aria-hidden": true, children: runningSessions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RunOrb, {}) : totalBadge > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BulbIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IdleRobot, { size: 20, className: "dpp-idle-bot" }) }, runningSessions.length > 0 ? "run" : totalBadge > 0 ? "done" : "idle"),
              totalBadge > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dpp-badge-pop", style: railBadgeStyle, children: totalBadge > 99 ? "99+" : totalBadge }, `rail-badge:${totalBadge}`)
            ]
          }
        ),
        open && (0, import_react_dom.createPortal)(
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              ref: popRef,
              className: "dsh-done-pill",
              style: popStyle(anchor),
              role: "dialog",
              "aria-label": "\u5BF9\u8BDD\u52A8\u6001\uFF1A\u8FDB\u884C\u4E2D\u4E0E\u6700\u8FD1\u5B8C\u6210",
              onMouseEnter: showPop,
              onMouseLeave: scheduleHide,
              onKeyDown: (event) => {
                if (event.key === "Escape") setOpen(false);
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: popHeadStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: popBarStyle, "aria-hidden": true }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: popTitleStyle, children: "\u5BF9\u8BDD\u52A8\u6001" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: popMetaStyle, children: `${unreadCount} \u672A\u8BFB \xB7 ${runningSessions.length} \u8FDB\u884C\u4E2D` }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "dsh-done-pill-link",
                      style: { ...popLinkStyle, opacity: latest === void 0 ? 0.45 : 1 },
                      disabled: latest === void 0,
                      onClick: () => {
                        if (latest !== void 0) openSession(latest.sessionId);
                      },
                      children: "\u8FDB\u5165\u6700\u65B0\u4F1A\u8BDD"
                    }
                  )
                ] }),
                runningSessions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: sectionLabelStyle, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: sectionDotStyle, "aria-hidden": true }),
                    `\u8FDB\u884C\u4E2D ${runningSessions.length}`
                  ] }),
                  runningSessions.slice(0, POP_RUNNING_N).map((session) => {
                    const label = session.question !== "" ? session.question : session.displayTitle;
                    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                      "button",
                      {
                        type: "button",
                        className: "dsh-done-pill-row",
                        style: rowStyle,
                        title: `\u300C${session.displayTitle}\u300D\u6B63\u5728\u6267\u884C \u2014 \u70B9\u51FB\u6253\u5F00\u4F1A\u8BDD`,
                        onClick: () => {
                          openSession(session.id);
                        },
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RunOrb, {}),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: rowTitleStyle, children: label }),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: rowTimeStyle, children: formatElapsed(nowTick - session.since) })
                        ]
                      },
                      session.id
                    );
                  })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: sectionLabelStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: sectionDotStyle, "aria-hidden": true }),
                  `\u6700\u8FD1\u5B8C\u6210${entries.length > 0 ? ` ${entries.length}` : ""}`
                ] }),
                entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: emptyStyle, children: "\u6682\u65E0\u8BB0\u5F55 \u2014 \u4EFB\u4E00\u4F1A\u8BDD\u7684\u5BF9\u8BDD\u5B8C\u6210\u540E\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC" }) : groupByMinute(entries.slice(0, POP_RECENT_N)).map((group) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: groupHeadStyle, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: group.time === "" ? "\u672A\u77E5\u65F6\u95F4" : group.time }),
                    group.items.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: groupCountStyle, children: `${group.items.length} \u6761` })
                  ] }),
                  group.items.map((item) => {
                    const headLabel = item.question !== "" ? item.question : item.title;
                    const unread = !readIds.has(item.id);
                    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                      "div",
                      {
                        className: "dsh-done-pill-row",
                        style: { ...rowStyle, cursor: "pointer" },
                        role: "button",
                        tabIndex: 0,
                        title: `\u300C${item.title}\u300D \u2014 \u70B9\u51FB\u6253\u5F00\u4F1A\u8BDD`,
                        onClick: () => {
                          openSession(item.sessionId, item.id);
                        },
                        onKeyDown: (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openSession(item.sessionId, item.id);
                          }
                        },
                        children: [
                          unread && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: unreadDotStyle, "aria-hidden": true }),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: rowTitleStyle, children: headLabel }),
                          item.reasonKind === "error" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { flex: "none", fontSize: 12, color: "var(--dpl-warn)" }, children: "\u51FA\u9519" }),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: turnTagStyle, children: `\u56DE\u5408 ${item.turn >= 0 ? item.turn + 1 : "?"}` }),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                            "button",
                            {
                              type: "button",
                              className: "dsh-done-pill-close",
                              style: dismissStyle,
                              "aria-label": "\u79FB\u9664\u8FD9\u6761\u8BB0\u5F55\uFF08\u4E0D\u8DF3\u8F6C\u4F1A\u8BDD\uFF09",
                              onClick: (event) => {
                                event.stopPropagation();
                                dismiss(item.id);
                              },
                              children: "\u2715"
                            }
                          )
                        ]
                      },
                      item.id
                    );
                  })
                ] }, `${group.time}|${group.items[0].id}`))
              ]
            }
          ),
          document.body
        )
      ]
    }
  );
}

// src/client/pill.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var MOBILE_BREAKPOINT = 768;
function isMobileViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`).matches;
}
var POLL_MS2 = 3e3;
var MORPH_DUR = ".65s";
var MAX_ENTRIES2 = 100;
var MAX_READ_IDS2 = 300;
var READ_KEY2 = "dsh.donePill.read";
var POS_KEY = "dsh.donePill.pos";
var sessionsAccessor2;
var sessionsWarned2 = false;
function loadReadIds2() {
  try {
    const raw = localStorage.getItem(READ_KEY2);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.filter((v) => typeof v === "string"));
    }
  } catch {
  }
  return /* @__PURE__ */ new Set();
}
function saveReadIds2(ids) {
  try {
    const arr = [...ids];
    localStorage.setItem(READ_KEY2, JSON.stringify(arr.length > MAX_READ_IDS2 ? arr.slice(-MAX_READ_IDS2) : arr));
  } catch {
  }
}
function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
function defaultShellTop() {
  return isMobileViewport() ? 60 : 40;
}
function clampPos(x, y, w = 160, h2 = PILL_H) {
  const margin = 0;
  const maxX = Math.max(margin, window.innerWidth - w - margin);
  const maxY = Math.max(margin, window.innerHeight - h2 - margin);
  return {
    x: Math.round(Math.min(Math.max(x, margin), maxX)),
    y: Math.round(Math.min(Math.max(y, margin), maxY))
  };
}
function loadAnchor() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.xc === "number" && Number.isFinite(parsed.xc) && typeof parsed?.yc === "number" && Number.isFinite(parsed.yc)) {
        return { xc: clamp01(parsed.xc), yc: clamp01(parsed.yc) };
      }
      if (typeof parsed?.xr === "number" && typeof parsed?.yr === "number" && Number.isFinite(parsed.xr) && Number.isFinite(parsed.yr)) {
        return { xc: clamp01((parsed.xr * window.innerWidth + 80) / window.innerWidth), yc: clamp01(parsed.yr) };
      }
      if (typeof parsed?.x === "number" && typeof parsed?.y === "number" && Number.isFinite(parsed.x) && Number.isFinite(parsed.y) && window.innerWidth > 0 && window.innerHeight > 0) {
        return {
          xc: clamp01((parsed.x + 80) / window.innerWidth),
          yc: clamp01((parsed.y + 15) / window.innerHeight)
        };
      }
    }
  } catch {
  }
  return null;
}
function saveAnchor(anchor) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(anchor));
  } catch {
  }
}
var PILL_H = 40;
function pillHeight(scale) {
  return Math.max(1, Math.round(PILL_H * scale));
}
function anchorToPos(anchor, shellWidth, shellHeight = PILL_H) {
  return clampPos(
    Math.round(anchor.xc * window.innerWidth - shellWidth / 2),
    Math.round(anchor.yc * window.innerHeight - shellHeight / 2),
    shellWidth,
    shellHeight
  );
}
var REST_KEY = "dsh.donePill.rest";
var LATE_KEY = "dsh.donePill.late";
function createReminderStore(key, defaults) {
  let value = { ...defaults };
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      value = {
        enabled: parsed?.enabled === true,
        start: typeof parsed?.start === "string" && /^\d{2}:\d{2}$/.test(parsed.start) ? parsed.start : defaults.start,
        end: typeof parsed?.end === "string" && /^\d{2}:\d{2}$/.test(parsed.end) ? parsed.end : defaults.end
      };
    }
  } catch {
  }
  const listeners = /* @__PURE__ */ new Set();
  return {
    get: () => value,
    set(next) {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
      }
      for (const fn of [...listeners]) fn(next);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    }
  };
}
var restStore = createReminderStore(REST_KEY, { enabled: false, start: "13:00", end: "14:00" });
var lateStore = createReminderStore(LATE_KEY, { enabled: true, start: "00:00", end: "07:00" });
function parseHM(hm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (match === null) return null;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (!Number.isInteger(hh) || !Number.isInteger(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}
function inTimeRange(nowMinutes, config) {
  const s = parseHM(config.start);
  const e = parseHM(config.end);
  if (s === null || e === null || s === e) return false;
  return s < e ? nowMinutes >= s && nowMinutes < e : nowMinutes >= s || nowMinutes < e;
}
var FUN_LINES = [
  // 开心话术（13 条）
  { icon: "sparkle", text: "\u4ECA\u5929\u4E5F\u662F\u5145\u6EE1\u53EF\u80FD\u7684\u4E00\u5929\uFF01" },
  { icon: "sparkle", text: "\u4F60\u89E3\u51B3\u95EE\u9898\u7684\u6837\u5B50\u771F\u7684\u5F88\u9177" },
  { icon: "sparkle", text: "\u6BCF\u4E00\u884C\u4EE3\u7801\u90FD\u5728\u9760\u8FD1\u76EE\u6807" },
  { icon: "sparkle", text: "\u4F11\u606F\u4E00\u4E0B\uFF0C\u7075\u611F\u5F80\u5F80\u5728\u653E\u677E\u65F6\u51FA\u73B0" },
  { icon: "sparkle", text: "\u5DF2\u5B8C\u6210\u7684\u6BCF\u4E00\u4E2A\u4EFB\u52A1\u90FD\u7B97\u6570" },
  { icon: "sparkle", text: "\u4FDD\u6301\u597D\u5947\uFF0C\u4E16\u754C\u4F1A\u7ED9\u4F60\u7B54\u6848" },
  { icon: "sparkle", text: "\u8FDB\u6B65\u4E0D\u5FC5\u5DE8\u5927\uFF0C\u6301\u7EED\u5C31\u5F88\u4E86\u4E0D\u8D77" },
  { icon: "sparkle", text: "\u6DF1\u547C\u5438\uFF0C\u4E00\u5207\u90FD\u4F1A\u987A\u5229\u7684" },
  { icon: "sparkle", text: "\u8BB0\u5F97\u559D\u6C34\uFF0C\u8EAB\u4F53\u662F\u9769\u547D\u7684\u672C\u94B1" },
  { icon: "sparkle", text: "\u661F\u5149\u4E0D\u95EE\u8D76\u8DEF\u4EBA\uFF0C\u65F6\u5149\u4E0D\u8D1F\u6709\u5FC3\u4EBA" },
  { icon: "sparkle", text: "\u5C0F\u6B65\u524D\u8FDB\u4E5F\u662F\u4E00\u79CD\u62B5\u8FBE" },
  { icon: "sparkle", text: "\u4F60\u7684\u52AA\u529B\uFF0C\u65F6\u95F4\u770B\u5F97\u89C1" },
  { icon: "sparkle", text: "\u7B11\u4E00\u7B11\uFF0Cbug \u90FD\u4F1A\u5C11\u4E00\u70B9" },
  // AI 名词小知识（100+ 条）
  { icon: "bulb", text: "LLM \u5927\u8BED\u8A00\u6A21\u578B\uFF1A\u901A\u8FC7\u6D77\u91CF\u6587\u672C\u8BAD\u7EC3\u3001\u80FD\u7406\u89E3\u5E76\u751F\u6210\u81EA\u7136\u8BED\u8A00\u7684 AI \u6A21\u578B" },
  { icon: "bulb", text: "Token \u8BCD\u5143\uFF1A\u6A21\u578B\u5904\u7406\u6587\u672C\u7684\u6700\u5C0F\u5355\u4F4D\uFF0C\u4E00\u4E2A\u6C49\u5B57\u901A\u5E38\u662F 1~2 \u4E2A" },
  { icon: "bulb", text: "Transformer\uFF1A2017 \u5E74\u63D0\u51FA\u7684\u6CE8\u610F\u529B\u67B6\u6784\uFF0C\u73B0\u4EE3\u5927\u6A21\u578B\u7684\u57FA\u77F3" },
  { icon: "bulb", text: "Prompt \u63D0\u793A\u8BCD\uFF1A\u4F60\u53D1\u7ED9 AI \u7684\u6307\u4EE4\uFF0C\u5199\u5F97\u8D8A\u6E05\u6670\u56DE\u7B54\u8D8A\u9760\u8C31" },
  { icon: "bulb", text: "\u5FAE\u8C03 Fine-tuning\uFF1A\u7528\u7279\u5B9A\u6570\u636E\u7EE7\u7EED\u8BAD\u7EC3\uFF0C\u8BA9\u5B83\u66F4\u64C5\u957F\u67D0\u4E2A\u9886\u57DF" },
  { icon: "bulb", text: "RAG \u68C0\u7D22\u589E\u5F3A\u751F\u6210\uFF1A\u5148\u67E5\u8D44\u6599\u518D\u56DE\u7B54\uFF0C\u8BA9\u7B54\u6848\u6709\u636E\u53EF\u4F9D" },
  { icon: "bulb", text: "\u5E7B\u89C9 Hallucination\uFF1AAI \u4E00\u672C\u6B63\u7ECF\u7F16\u9020\u4E0D\u5B58\u5728\u7684\u4E8B\u5B9E\uFF0C\u8BB0\u5F97\u6838\u5B9E" },
  { icon: "bulb", text: "\u591A\u6A21\u6001 Multimodal\uFF1A\u80FD\u540C\u65F6\u7406\u89E3\u6587\u5B57\u3001\u56FE\u7247\u3001\u97F3\u9891\u7B49\u4FE1\u606F\u7684\u6A21\u578B" },
  { icon: "bulb", text: "Agent \u667A\u80FD\u4F53\uFF1A\u80FD\u81EA\u4E3B\u89C4\u5212\u6B65\u9AA4\u3001\u8C03\u7528\u5DE5\u5177\u3001\u5B8C\u6210\u4EFB\u52A1\u7684 AI" },
  { icon: "bulb", text: "\u4E0A\u4E0B\u6587\u7A97\u53E3 Context Window\uFF1A\u6A21\u578B\u4E00\u6B21\u80FD\u300C\u770B\u5230\u300D\u7684\u6700\u5927\u6587\u672C\u957F\u5EA6" },
  { icon: "bulb", text: "\u6E29\u5EA6 Temperature\uFF1A\u63A7\u5236\u56DE\u7B54\u968F\u673A\u6027\u7684\u53C2\u6570\uFF0C\u8D8A\u4F4E\u8D8A\u4E25\u8C28" },
  { icon: "bulb", text: "Embedding \u5411\u91CF\u5D4C\u5165\uFF1A\u628A\u6587\u5B57\u53D8\u6210\u6570\u5B57\u5411\u91CF\uFF0C\u53EF\u8BA1\u7B97\u8BED\u4E49\u76F8\u4F3C\u5EA6" },
  { icon: "bulb", text: "\u601D\u7EF4\u94FE Chain-of-Thought\uFF1A\u8BA9 AI \u4E00\u6B65\u6B65\u63A8\u7406\uFF0C\u590D\u6742\u9898\u6B63\u786E\u7387\u5927\u589E" },
  { icon: "bulb", text: "\u84B8\u998F Distillation\uFF1A\u7528\u5927\u6A21\u578B\u6559\u5C0F\u6A21\u578B\uFF0C\u66F4\u5FEB\u66F4\u4FBF\u5B9C" },
  { icon: "bulb", text: "\u5BF9\u9F50 Alignment\uFF1A\u8BA9 AI \u884C\u4E3A\u7B26\u5408\u4EBA\u7C7B\u610F\u56FE\u4E0E\u4EF7\u503C\u89C2" },
  { icon: "bulb", text: "RLHF \u4EBA\u7C7B\u53CD\u9988\u5F3A\u5316\u5B66\u4E60\uFF1A\u7528\u4EBA\u7C7B\u504F\u597D\u8BAD\u7EC3\uFF0C\u56DE\u7B54\u66F4\u5408\u610F" },
  { icon: "bulb", text: "\u673A\u5668\u5B66\u4E60 ML\uFF1A\u8BA9\u8BA1\u7B97\u673A\u4ECE\u6570\u636E\u4E2D\u81EA\u52A8\u5B66\u89C4\u5F8B\uFF0C\u65E0\u9700\u663E\u5F0F\u7F16\u7A0B" },
  { icon: "bulb", text: "\u6DF1\u5EA6\u5B66\u4E60 DL\uFF1A\u7528\u591A\u5C42\u795E\u7ECF\u7F51\u7EDC\u81EA\u52A8\u62BD\u53D6\u7279\u5F81\u7684\u5206\u652F" },
  { icon: "bulb", text: "\u795E\u7ECF\u7F51\u7EDC\uFF1A\u6A21\u62DF\u4EBA\u8111\u795E\u7ECF\u5143\u8FDE\u63A5\u7684\u8BA1\u7B97\u6A21\u578B\uFF0C\u6DF1\u5EA6\u5B66\u4E60\u7684\u57FA\u77F3" },
  { icon: "bulb", text: "\u53C2\u6570 Parameter\uFF1A\u6A21\u578B\u5185\u90E8\u53EF\u5B66\u4E60\u7684\u6570\u503C\uFF0C\u51B3\u5B9A\u300C\u8BB0\u5FC6\u300D\u4E0E\u80FD\u529B" },
  { icon: "bulb", text: "\u6743\u91CD Weight\uFF1A\u795E\u7ECF\u7F51\u7EDC\u8FDE\u63A5\u7684\u5F3A\u5EA6\u6570\u503C\uFF0C\u8BAD\u7EC3\u65F6\u4E0D\u65AD\u88AB\u8C03\u6574" },
  { icon: "bulb", text: "\u8BAD\u7EC3 Training\uFF1A\u7528\u6D77\u91CF\u6570\u636E\u53CD\u590D\u8C03\u6574\u53C2\u6570\u3001\u8BA9\u6A21\u578B\u5B66\u4F1A\u4EFB\u52A1" },
  { icon: "bulb", text: "\u63A8\u7406 Inference\uFF1A\u8BAD\u7EC3\u597D\u7684\u6A21\u578B\u5BF9\u8F93\u5165\u8BA1\u7B97\u5E76\u8F93\u51FA\u7ED3\u679C" },
  { icon: "bulb", text: "\u6570\u636E\u96C6 Dataset\uFF1A\u7528\u4E8E\u8BAD\u7EC3\u4E0E\u8BC4\u4F30\u6A21\u578B\u7684\u6837\u672C\u96C6\u5408" },
  { icon: "bulb", text: "\u8BED\u6599\u5E93 Corpus\uFF1A\u5927\u89C4\u6A21\u6587\u672C\u96C6\u5408\uFF0C\u5927\u6A21\u578B\u8BAD\u7EC3\u7684\u4E3B\u8981\u539F\u6599" },
  { icon: "bulb", text: "\u6CE8\u610F\u529B\u673A\u5236 Attention\uFF1A\u8BA9\u6A21\u578B\u805A\u7126\u8F93\u5165\u4E2D\u5173\u952E\u90E8\u5206\u7684\u6280\u672F" },
  { icon: "bulb", text: "\u81EA\u6CE8\u610F\u529B Self-Attention\uFF1A\u8BA9\u6BCF\u4E2A\u8BCD\u5173\u8054\u4E0A\u4E0B\u6587\u4E2D\u7684\u6240\u6709\u8BCD" },
  { icon: "bulb", text: "\u591A\u5934\u6CE8\u610F\u529B Multi-Head\uFF1A\u5E76\u884C\u591A\u7EC4\u6CE8\u610F\u529B\uFF0C\u6355\u6349\u4E0D\u540C\u5173\u7CFB" },
  { icon: "bulb", text: "\u7F16\u7801\u5668 Encoder\uFF1A\u628A\u8F93\u5165\u7F16\u7801\u6210\u5411\u91CF\u8868\u793A\u7684\u6A21\u5757" },
  { icon: "bulb", text: "\u89E3\u7801\u5668 Decoder\uFF1A\u6839\u636E\u7F16\u7801\u4FE1\u606F\u9010\u5B57\u751F\u6210\u7684\u6A21\u5757" },
  { icon: "bulb", text: "\u4F4D\u7F6E\u7F16\u7801 Positional Encoding\uFF1A\u8BA9\u6A21\u578B\u611F\u77E5\u8BCD\u5E8F\u7684\u65B9\u6CD5" },
  { icon: "bulb", text: "\u6B8B\u5DEE\u8FDE\u63A5 Residual\uFF1A\u8DE8\u5C42\u76F4\u8FDE\u901A\u9053\uFF0C\u7F13\u89E3\u6DF1\u5C42\u7F51\u7EDC\u9000\u5316" },
  { icon: "bulb", text: "\u5F52\u4E00\u5316 Normalization\uFF1A\u7A33\u5B9A\u6570\u503C\u5206\u5E03\uFF0C\u52A0\u901F\u8BAD\u7EC3\u7684\u6280\u5DE7" },
  { icon: "bulb", text: "\u6FC0\u6D3B\u51FD\u6570 Activation\uFF1A\u5F15\u5165\u975E\u7EBF\u6027\uFF0C\u8BA9\u7F51\u7EDC\u80FD\u5B66\u590D\u6742\u5173\u7CFB" },
  { icon: "bulb", text: "\u9884\u8BAD\u7EC3 Pre-training\uFF1A\u5728\u5927\u89C4\u6A21\u8BED\u6599\u4E0A\u65E0\u76D1\u7763\u5B66\u4E60\u901A\u7528\u77E5\u8BC6" },
  { icon: "bulb", text: "\u76D1\u7763\u5FAE\u8C03 SFT\uFF1A\u7528\u95EE\u7B54\u8303\u4F8B\u6559\u6A21\u578B\u6309\u6307\u4EE4\u4F5C\u7B54" },
  { icon: "bulb", text: "\u635F\u5931\u51FD\u6570 Loss\uFF1A\u8861\u91CF\u9884\u6D4B\u4E0E\u76EE\u6807\u7684\u5DEE\u8DDD\uFF0C\u6307\u5BFC\u53C2\u6570\u66F4\u65B0" },
  { icon: "bulb", text: "\u68AF\u5EA6\u4E0B\u964D Gradient Descent\uFF1A\u6CBF\u68AF\u5EA6\u65B9\u5411\u8FED\u4EE3\u51CF\u5C0F\u8BEF\u5DEE" },
  { icon: "bulb", text: "\u5B66\u4E60\u7387 Learning Rate\uFF1A\u6BCF\u6B65\u53C2\u6570\u66F4\u65B0\u7684\u6B65\u5E45" },
  { icon: "bulb", text: "\u6279\u5927\u5C0F Batch Size\uFF1A\u4E00\u6B21\u8BAD\u7EC3\u5582\u7ED9\u6A21\u578B\u7684\u6837\u672C\u6570" },
  { icon: "bulb", text: "\u8F6E\u6B21 Epoch\uFF1A\u5B8C\u6574\u8FC7\u4E00\u904D\u8BAD\u7EC3\u6570\u636E\u7684\u6B21\u6570" },
  { icon: "bulb", text: "\u8FC7\u62DF\u5408 Overfitting\uFF1A\u6A21\u578B\u6B7B\u8BB0\u8BAD\u7EC3\u6570\u636E\u3001\u6CDB\u5316\u80FD\u529B\u5DEE" },
  { icon: "bulb", text: "\u6B20\u62DF\u5408 Underfitting\uFF1A\u6A21\u578B\u6CA1\u5B66\u5230\u8DB3\u591F\u89C4\u5F8B\uFF0C\u8BAD\u7EC3\u96C6\u90FD\u505A\u4E0D\u597D" },
  { icon: "bulb", text: "\u6B63\u5219\u5316 Regularization\uFF1A\u6291\u5236\u8FC7\u62DF\u5408\u7684\u4E00\u7CFB\u5217\u624B\u6BB5" },
  { icon: "bulb", text: "\u65E9\u505C Early Stopping\uFF1A\u9A8C\u8BC1\u96C6\u4E0D\u518D\u63D0\u5347\u5C31\u63D0\u524D\u7ED3\u675F\u8BAD\u7EC3" },
  { icon: "bulb", text: "\u91CF\u5316 Quantization\uFF1A\u538B\u7F29\u6570\u503C\u7CBE\u5EA6\uFF0C\u51CF\u5C0F\u4F53\u79EF\u52A0\u901F\u63A8\u7406" },
  { icon: "bulb", text: "\u526A\u679D Pruning\uFF1A\u79FB\u9664\u5197\u4F59\u53C2\u6570\uFF0C\u7ED9\u6A21\u578B\u7626\u8EAB" },
  { icon: "bulb", text: "\u8FC1\u79FB\u5B66\u4E60 Transfer Learning\uFF1A\u628A\u5DF2\u5B66\u77E5\u8BC6\u8FC1\u79FB\u5230\u65B0\u4EFB\u52A1" },
  { icon: "bulb", text: "\u5206\u8BCD\u5668 Tokenizer\uFF1A\u628A\u6587\u672C\u5207\u5206\u6210\u8BCD\u5143\u5E8F\u5217\u7684\u5DE5\u5177" },
  { icon: "bulb", text: "\u751F\u6210 Generation\uFF1A\u6A21\u578B\u9010\u5B57\u9884\u6D4B\u4E0B\u4E00\u4E2A\u8BCD\u5143\u7684\u8FC7\u7A0B" },
  { icon: "bulb", text: "\u81EA\u56DE\u5F52 Autoregressive\uFF1A\u7528\u5DF2\u751F\u6210\u7684\u8BCD\u9884\u6D4B\u4E0B\u4E00\u4E2A\u8BCD" },
  { icon: "bulb", text: "\u91C7\u6837 Sampling\uFF1A\u6309\u6982\u7387\u5206\u5E03\u968F\u673A\u9009\u62E9\u4E0B\u4E00\u4E2A\u8BCD" },
  { icon: "bulb", text: "Top-p \u6838\u91C7\u6837\uFF1A\u53EA\u5728\u7D2F\u8BA1\u6982\u7387\u8FBE p \u7684\u5019\u9009\u8BCD\u4E2D\u91C7\u6837" },
  { icon: "bulb", text: "Top-k \u91C7\u6837\uFF1A\u53EA\u5728\u6982\u7387\u6700\u9AD8\u7684 k \u4E2A\u8BCD\u4E2D\u91C7\u6837" },
  { icon: "bulb", text: "\u8D2A\u5FC3\u89E3\u7801 Greedy\uFF1A\u6BCF\u6B65\u90FD\u9009\u6982\u7387\u6700\u9AD8\u7684\u8BCD\uFF0C\u7A33\u5B9A\u4F46\u6613\u91CD\u590D" },
  { icon: "bulb", text: "\u675F\u641C\u7D22 Beam Search\uFF1A\u4FDD\u7559\u591A\u6761\u5019\u9009\u8DEF\u5F84\uFF0C\u517C\u987E\u8D28\u91CF\u4E0E\u591A\u6837" },
  { icon: "bulb", text: "\u505C\u6B62\u8BCD Stop Token\uFF1A\u6807\u8BB0\u751F\u6210\u7ED3\u675F\u7684\u7279\u6B8A\u8BCD\u5143" },
  { icon: "bulb", text: "\u957F\u5EA6\u60E9\u7F5A Length Penalty\uFF1A\u8C03\u8282\u8F93\u51FA\u957F\u77ED\u503E\u5411\u7684\u53C2\u6570" },
  { icon: "bulb", text: "\u63A8\u7406 Reasoning\uFF1A\u6A21\u578B\u63A8\u5BFC\u3001\u8BA1\u7B97\u3001\u591A\u6B65\u601D\u8003\u7684\u80FD\u529B" },
  { icon: "bulb", text: "\u63D0\u793A\u5DE5\u7A0B Prompt Engineering\uFF1A\u8BBE\u8BA1\u8F93\u5165\u8BA9\u6A21\u578B\u8868\u73B0\u66F4\u597D" },
  { icon: "bulb", text: "\u5C11\u6837\u672C\u63D0\u793A Few-shot\uFF1A\u7ED9\u51E0\u4E2A\u8303\u4F8B\uFF0C\u6A21\u578B\u7167\u7740\u683C\u5F0F\u505A" },
  { icon: "bulb", text: "\u96F6\u6837\u672C Zero-shot\uFF1A\u4E0D\u7ED9\u8303\u4F8B\uFF0C\u76F4\u63A5\u63D0\u95EE" },
  { icon: "bulb", text: "\u4E0A\u4E0B\u6587\u5B66\u4E60 In-Context Learning\uFF1A\u9760\u63D0\u793A\u8BCD\u4E34\u65F6\u5B66\u4F1A\u4EFB\u52A1" },
  { icon: "bulb", text: "\u81EA\u4E00\u81F4\u6027 Self-Consistency\uFF1A\u591A\u6B21\u91C7\u6837\u6295\u7968\uFF0C\u53D6\u591A\u6570\u7B54\u6848" },
  { icon: "bulb", text: "\u601D\u7EF4\u6811 Tree-of-Thoughts\uFF1A\u591A\u5206\u652F\u63A2\u7D22\u63A8\u7406\u8DEF\u5F84\u5E76\u56DE\u6EAF" },
  { icon: "bulb", text: "\u89C4\u5212 Planning\uFF1A\u628A\u590D\u6742\u4EFB\u52A1\u62C6\u89E3\u6210\u53EF\u6267\u884C\u6B65\u9AA4" },
  { icon: "bulb", text: "\u5411\u91CF\u6570\u636E\u5E93 Vector DB\uFF1A\u5B58\u50A8\u5E76\u68C0\u7D22\u9AD8\u7EF4\u5411\u91CF\u7684\u6570\u636E\u5E93" },
  { icon: "bulb", text: "\u76F8\u4F3C\u5EA6\u68C0\u7D22 Similarity Search\uFF1A\u6309\u5411\u91CF\u8DDD\u79BB\u627E\u6700\u76F8\u5173\u5185\u5BB9" },
  { icon: "bulb", text: "\u4F59\u5F26\u76F8\u4F3C\u5EA6 Cosine\uFF1A\u8861\u91CF\u4E24\u5411\u91CF\u65B9\u5411\u63A5\u8FD1\u7A0B\u5EA6\u7684\u6307\u6807" },
  { icon: "bulb", text: "\u77E5\u8BC6\u5E93 Knowledge Base\uFF1A\u4F9B\u68C0\u7D22\u5F15\u7528\u7684\u7ED3\u6784\u5316\u8D44\u6599\u96C6\u5408" },
  { icon: "bulb", text: "\u5206\u5757 Chunking\uFF1A\u628A\u957F\u6587\u6863\u5207\u6210\u4FBF\u4E8E\u68C0\u7D22\u7684\u5C0F\u6BB5" },
  { icon: "bulb", text: "\u91CD\u6392\u5E8F Rerank\uFF1A\u5BF9\u53EC\u56DE\u7ED3\u679C\u4E8C\u6B21\u6392\u5E8F\uFF0C\u63D0\u5347\u76F8\u5173\u6027" },
  { icon: "bulb", text: "\u8BED\u4E49\u641C\u7D22 Semantic Search\uFF1A\u6309\u542B\u4E49\u800C\u975E\u5173\u952E\u8BCD\u5339\u914D" },
  { icon: "bulb", text: "\u6DF7\u5408\u68C0\u7D22 Hybrid\uFF1A\u5173\u952E\u8BCD + \u5411\u91CF\u4E24\u79CD\u65B9\u5F0F\u7ED3\u5408" },
  { icon: "bulb", text: "\u5DE5\u5177\u8C03\u7528 Function Calling\uFF1A\u6A21\u578B\u6309\u9700\u8C03\u7528\u5916\u90E8\u51FD\u6570\u6216 API" },
  { icon: "bulb", text: "\u591A\u667A\u80FD\u4F53 Multi-Agent\uFF1A\u591A\u4E2A\u667A\u80FD\u4F53\u5206\u5DE5\u534F\u4F5C\u5B8C\u6210\u76EE\u6807" },
  { icon: "bulb", text: "\u8BB0\u5FC6 Memory\uFF1A\u667A\u80FD\u4F53\u8DE8\u8F6E\u6B21\u4FDD\u7559\u4E0A\u4E0B\u6587\u4E0E\u4E8B\u5B9E" },
  { icon: "bulb", text: "\u53CD\u601D Reflection\uFF1A\u8BA9\u667A\u80FD\u4F53\u81EA\u6211\u5BA1\u67E5\u5E76\u6539\u8FDB\u8F93\u51FA" },
  { icon: "bulb", text: "\u81EA\u4E3B\u6027 Autonomy\uFF1A\u667A\u80FD\u4F53\u4E0D\u4F9D\u8D56\u4EBA\u9010\u6B65\u6307\u6325\u7684\u80FD\u529B" },
  { icon: "bulb", text: "\u89C6\u89C9\u8BED\u8A00\u6A21\u578B VLM\uFF1A\u80FD\u770B\u56FE\u8BC6\u56FE\u3001\u56FE\u6587\u63A8\u7406\u7684\u6A21\u578B" },
  { icon: "bulb", text: "\u6587\u751F\u56FE Text-to-Image\uFF1A\u6839\u636E\u6587\u5B57\u63CF\u8FF0\u751F\u6210\u56FE\u7247" },
  { icon: "bulb", text: "\u6269\u6563\u6A21\u578B Diffusion\uFF1A\u9010\u6B65\u53BB\u566A\u751F\u6210\u56FE\u50CF\u7684\u4E3B\u6D41\u65B9\u6CD5" },
  { icon: "bulb", text: "\u6587\u751F\u89C6\u9891 Text-to-Video\uFF1A\u6839\u636E\u6587\u5B57\u751F\u6210\u89C6\u9891" },
  { icon: "bulb", text: "\u8BED\u97F3\u8BC6\u522B ASR\uFF1A\u628A\u8BED\u97F3\u8F6C\u6210\u6587\u5B57" },
  { icon: "bulb", text: "\u8BED\u97F3\u5408\u6210 TTS\uFF1A\u628A\u6587\u5B57\u8F6C\u6210\u8BED\u97F3" },
  { icon: "bulb", text: "OCR \u6587\u5B57\u8BC6\u522B\uFF1A\u4ECE\u56FE\u7247\u4E2D\u63D0\u53D6\u6587\u5B57" },
  { icon: "bulb", text: "\u57FA\u51C6 Benchmark\uFF1A\u6807\u51C6\u5316\u6D4B\u8BD5\u96C6\uFF0C\u7528\u6765\u8861\u91CF\u6A21\u578B\u80FD\u529B" },
  { icon: "bulb", text: "\u56F0\u60D1\u5EA6 Perplexity\uFF1A\u8861\u91CF\u8BED\u8A00\u6A21\u578B\u9884\u6D4B\u80FD\u529B\u7684\u6307\u6807" },
  { icon: "bulb", text: "BLEU\uFF1A\u673A\u5668\u7FFB\u8BD1\u8D28\u91CF\u7684\u81EA\u52A8\u8BC4\u5206\u6307\u6807" },
  { icon: "bulb", text: "ROUGE\uFF1A\u6458\u8981\u8D28\u91CF\u7684\u81EA\u52A8\u8BC4\u5206\u6307\u6807" },
  { icon: "bulb", text: "\u5B89\u5168\u6027 Safety\uFF1A\u9632\u6B62\u6A21\u578B\u8F93\u51FA\u6709\u5BB3\u3001\u8FDD\u89C4\u5185\u5BB9" },
  { icon: "bulb", text: "\u8D8A\u72F1 Jailbreak\uFF1A\u7528\u8BF1\u5BFC\u8BDD\u672F\u7A81\u7834\u6A21\u578B\u5B89\u5168\u9650\u5236" },
  { icon: "bulb", text: "\u7EA2\u961F\u6D4B\u8BD5 Red Teaming\uFF1A\u4E3B\u52A8\u653B\u51FB\u6A21\u578B\u627E\u6F0F\u6D1E" },
  { icon: "bulb", text: "\u504F\u89C1 Bias\uFF1A\u6A21\u578B\u653E\u5927\u8BAD\u7EC3\u6570\u636E\u4E2D\u7684\u523B\u677F\u5370\u8C61" },
  { icon: "bulb", text: "\u53EF\u89E3\u91CA\u6027 Interpretability\uFF1A\u7406\u89E3\u6A21\u578B\u4E3A\u4F55\u5982\u6B64\u51B3\u7B56" },
  { icon: "bulb", text: "\u6570\u636E\u6C61\u67D3 Data Contamination\uFF1A\u6D4B\u8BD5\u9898\u6DF7\u8FDB\u8BAD\u7EC3\u6570\u636E\u3001\u5206\u6570\u865A\u9AD8" },
  { icon: "bulb", text: "\u5C0F\u6A21\u578B SLM\uFF1A\u53C2\u6570\u5C11\u3001\u53EF\u672C\u5730\u8FD0\u884C\u7684\u9AD8\u6548\u6A21\u578B" },
  { icon: "bulb", text: "\u5F00\u6E90\u6A21\u578B Open-source\uFF1A\u6743\u91CD\u516C\u5F00\uFF0C\u53EF\u81EA\u7531\u4F7F\u7528\u4E0E\u5FAE\u8C03" },
  { icon: "bulb", text: "\u6D41\u5F0F\u8F93\u51FA Streaming\uFF1A\u8FB9\u751F\u6210\u8FB9\u8FD4\u56DE\uFF0C\u4F53\u9A8C\u66F4\u987A\u6ED1" },
  { icon: "bulb", text: "\u7CFB\u7EDF\u63D0\u793A\u8BCD System Prompt\uFF1A\u8BBE\u5B9A\u89D2\u8272\u4E0E\u89C4\u5219\u7684\u9876\u5C42\u6307\u4EE4" },
  { icon: "bulb", text: "\u591A\u8F6E\u5BF9\u8BDD Multi-turn\uFF1A\u5E26\u5386\u53F2\u4E0A\u4E0B\u6587\u7684\u8FDE\u7EED\u95EE\u7B54" },
  { icon: "bulb", text: "\u7F13\u5B58 Cache\uFF1A\u7F13\u5B58\u91CD\u590D\u8BF7\u6C42\uFF0C\u7701\u94B1\u53C8\u63D0\u901F" }
];
var FUN_INTERVAL_MS = 3e4;
function formatTime2(ts) {
  if (ts <= 0) return "";
  const d = new Date(ts);
  const now = /* @__PURE__ */ new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${mo}-${day} ${hh}:${mm}`;
}
function truncate2(text, max) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}\u2026`;
}
function formatElapsed2(ms) {
  const total = Math.max(0, Math.floor(ms / 1e3));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor(total % 3600 / 60);
  const ss = total % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}
function ensurePillKeyframes() {
  const existing = document.getElementById(PILL_STYLE_ID);
  if (existing !== null) {
    if (existing.getAttribute("data-css-rev") === cssRevision()) return;
    existing.remove();
  }
  const style = document.createElement("style");
  style.id = PILL_STYLE_ID;
  style.dataset.plugin = "dsh-done-pill";
  style.dataset.pluginCss = "webui/done-pill";
  style.setAttribute("data-css-rev", cssRevision());
  style.textContent = PILL_CSS;
  document.head.appendChild(style);
}
var cssRevCache;
function cssRevision() {
  if (cssRevCache !== void 0) return cssRevCache;
  let hash = 5381;
  for (let i = 0; i < PILL_CSS.length; i += 1) {
    hash = (hash << 5) + hash + PILL_CSS.charCodeAt(i) >>> 0;
  }
  cssRevCache = PILL_CSS.length.toString(36) + "-" + hash.toString(36);
  return cssRevCache;
}
var PILL_STYLE_ID = "dsh-done-pill-css";
var PILL_CSS = `
@keyframes dpLineIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
@keyframes dpMount{from{opacity:0;transform:translateY(-10px) scale(.96)}to{opacity:1;transform:none}}
@keyframes dpPop{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes dpRowIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* \u2500\u2500 \u5BF9\u8BDD\u80F6\u56CA\uFF08\u6781\u7B80\u98CE v0.6.0\uFF09\uFF1A\u7EAF\u767D\u7EB8\u9762 + \u58A8\u8272\u6587\u5B57 + \u53D1\u4E1D\u63CF\u8FB9 \u2500\u2500
   \u65E0\u6E10\u53D8\u3001\u65E0\u8F89\u5149\u3001\u65E0\u626B\u63CF\u5149\u5E26\uFF1B\u989C\u8272\u53EA\u505A\u5C42\u7EA7\uFF0C\u52A8\u6548\u53EA\u7559\u6DE1\u5165/\u4F4D\u79FB/\u7F29\u653E\u3002 */
.dsh-done-pill{
  --dpl-fg:#2f3437;
  --dpl-fg-dim:#787774;
  --dpl-fg-weak:#9b9a97;
  --dpl-accent:#2f3437;
  --dpl-accent-soft:rgba(47,52,55,.06);
  --dpl-accent-ring:rgba(47,52,55,.35);
  --dpl-warn:#9a6b15;
  --dpl-ok:#448361;
  /* \u5916\u58F3\u65E0\u63CF\u8FB9\uFF0C\u7528\u53CC\u5C42\u5F25\u6563\u9634\u5F71\u5B9A\u8FB9\uFF08v0.6.3\uFF1A\u8FB9\u6761\u6574\u4F53\u64A4\u6389\u6362\u9634\u5F71\uFF09\u3002 */
  --dpl-shell-shadow:0 1px 2px rgba(47,52,55,.10),0 6px 20px rgba(47,52,55,.09);
  --dpl-shell-shadow-hover:0 2px 6px rgba(47,52,55,.14),0 10px 28px rgba(47,52,55,.13);
  --dpl-shell-shadow-unread:0 2px 10px rgba(47,52,55,.20),0 10px 30px rgba(47,52,55,.17);
  --dpl-divider:rgba(47,52,55,.10);
  --dpl-panel-bg:#ffffff;
  --dpl-panel-border:rgba(47,52,55,.12);
  --dpl-panel-shadow:0 12px 32px rgba(47,52,55,.08),0 2px 8px rgba(47,52,55,.04);
  --dpl-row-bg:rgba(47,52,55,.04);
  --dpl-row-hover:rgba(47,52,55,.08);
  --dpl-caption-bg:rgba(47,52,55,.05);
  --dpl-caption-fg:#787774;
}
/* \u6DF1\u8272\u4E3B\u9898\uFF1A\u6696\u70AD\u5E95 + \u6696\u767D\u6587\u5B57\uFF0C\u540C\u4E00\u5957\u51E0\u4F55\u4E0E\u52A8\u753B\u3002 */
body[data-ds-dark-theme] .dsh-done-pill{
  --dpl-fg:#d6d3cd;
  --dpl-fg-dim:#a3a09a;
  --dpl-fg-weak:#7d7a73;
  --dpl-accent:#d6d3cd;
  --dpl-accent-soft:rgba(214,211,205,.08);
  --dpl-accent-ring:rgba(214,211,205,.40);
  --dpl-warn:#d9a05b;
  --dpl-ok:#7ab894;
  --dpl-shell-shadow:0 1px 2px rgba(0,0,0,.35),0 6px 20px rgba(0,0,0,.45);
  --dpl-shell-shadow-hover:0 2px 6px rgba(0,0,0,.40),0 10px 28px rgba(0,0,0,.50);
  --dpl-shell-shadow-unread:0 2px 10px rgba(0,0,0,.50),0 10px 30px rgba(0,0,0,.55);
  --dpl-divider:rgba(214,211,205,.12);
  --dpl-panel-bg:#202020;
  --dpl-panel-border:rgba(214,211,205,.10);
  --dpl-panel-shadow:0 14px 36px rgba(0,0,0,.5);
  --dpl-row-bg:rgba(214,211,205,.06);
  --dpl-row-hover:rgba(214,211,205,.11);
  --dpl-caption-bg:rgba(214,211,205,.07);
  --dpl-caption-fg:#a3a09a;
}
/* \u5916\u58F3\uFF1A\u534A\u900F\u660E\u7EAF\u767D\u5E95 + \u53D1\u4E1D\u63CF\u8FB9\uFF1Bhover \u52A0\u6DF1\u63CF\u8FB9\u5E76\u5FAE\u62AC\uFF08\u4FDD\u7559\u8F7B\u53CD\u9988\uFF09\u3002
   \u26A0 \u5E95\u8272\u5FC5\u987B\u4E2D\u6027\u767D\uFF1A\u6696\u7EB8\u767D\uFF08253,253,250\uFF09\u53E0\u5728\u7EAF\u767D\u9875\u9762\u4E0A\u4F1A\u6CDB\u9EC4\uFF08\u5B9E\u6D4B\u7FFB\u8F66\uFF09\u3002 */
.dsh-done-pill-shell{
  background:rgba(255,255,255,.94);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  color:var(--dpl-fg);
  box-shadow:var(--dpl-shell-shadow);
  animation:dpMount .5s cubic-bezier(.32,.72,0,1) backwards;
}
body[data-ds-dark-theme] .dsh-done-pill-shell{
  background:rgba(32,32,32,.92);
}
.dsh-done-pill-shell:hover{box-shadow:var(--dpl-shell-shadow-hover);transform:translateY(-1px)}
.dsh-done-pill-shell:active{transform:translateY(0) scale(.99)}
/* \u672A\u8BFB\u6001\uFF1A\u4E3B\u6587\u5B57\u52A0\u91CD + \u9634\u5F71\u52A0\u91CD\uFF08\u65E0\u63CF\u8FB9\uFF0C\u4E0D\u53D1\u5149\uFF09\u3002 */
.dsh-done-pill-shell[data-unread="1"]{
  font-weight:550;letter-spacing:-.005em;
  box-shadow:var(--dpl-shell-shadow-unread);
}
/* \u63D0\u9192\u82AF\u7247\uFF1A\u5F31\u5316\u7684\u6696\u8D6D\u8272\u8BED\u4E49\u70B9\uFF08\u6781\u7B80\u91CC\u4EC5\u5B58\u7684\u5C11\u91CF\u5F69\u8272\uFF09\u3002 */
.dpl-reminder-pill{
  display:inline-flex;align-items:center;
  background:color-mix(in srgb,var(--dpl-warn) 8%,transparent);
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dpl-warn) 22%,transparent);
  border-radius:999px;padding:2px 9px;
}
/* \u5F85\u673A\u673A\u5668\u4EBA\uFF08OpenBotMotion\uFF09\uFF1A\u5BB9\u5668\u7531 CSS \u5B9A\u5C3A\u5BF8\uFF0C\u5F15\u64CE\u628A SVG \u6309 100% \u94FA\u8FDB\u53BB\u3002
   \u5F15\u64CE\u81EA\u5E26 viewBox \u7559\u767D\u8FC7\u5927\uFF0Cidle-robot.tsx \u4F1A\u628A\u5B83\u6536\u7A84\u5230\u5B9E\u6D4B\u59FF\u6001\u8FB9\u754C\u3002 */
.dpl-idle-bot{flex:none;position:relative;width:calc(22px * var(--dps));height:calc(22px * var(--dps));display:inline-flex;align-items:center;justify-content:center;overflow:visible}
.dpl-idle-bot svg{display:block;width:100%;height:100%;overflow:visible}
/* \u5361\u7247\u5F62\u6001\u7684\u673A\u5668\u4EBA\uFF1A\u5C0F\u6A2A\u6761\u7528 16px\u3001rail \u56FE\u6807\u94AE\u7528 20px\uFF08\u5BB9\u5668\u5C3A\u5BF8\u663E\u5F0F\u7ED9\u8DB3\uFF0C
   \u5426\u5219\u5F15\u64CE\u7684 SVG \u6CA1\u6709\u76D2\u5B50\u53EF\u94FA\uFF09\u3002 */
.dpp-idle-bot{width:16px;height:16px}
.dpp-idle-bot svg{display:block;width:100%;height:100%;overflow:visible}
[data-dpp-card="rail"] .dpp-idle-bot{width:20px;height:20px}
/* \u8FD0\u884C\u4E2D\u7B14\u753B\uFF08\u79FB\u690D\u81EA dsh-notch \u7684 StatusOrbit\uFF09\uFF1A\u4E00\u6BB5 70% \u5706\u5468\u7684\u84DD\u8272\u5B9E\u8272\u7B14\u753B\uFF0C
   \u5706\u5934\u7EBF\u5E3D\uFF0C\u5300\u901F\u81EA\u8F6C\u3002\u89D2\u901F\u5EA6 2\u03C0/3 rad/s = \u4E00\u5708 3 \u79D2\uFF08\u4E0A\u6E38 DecisionSpin.runningVelocity\uFF09\u3002
   \u26A0 \u7528 SVG \u5706\u5F27\u800C\u4E0D\u662F conic-gradient\uFF1A\u4E0A\u6E38\u662F\u300C\u4E00\u7B14\u300D\u7684\u89C2\u611F\uFF0C\u9700\u8981 stroke-linecap:round
   \u7684\u5706\u5934\u7AEF\u70B9\uFF0C\u6E10\u53D8\u73AF\u753B\u4E0D\u51FA\u6765\u3002 */
.dpl-run-arc-wrap{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center}
.dpl-run-arc{display:block;animation:dpOrbitSpin 3s linear infinite;transform-origin:50% 50%}
@keyframes dpOrbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
/* \u706F\u6CE1\u5FBD\u7AE0\uFF1A\u65E0\u5E95\u65E0\u73AF\u7684\u5355\u8272\u7EBF\u7A3F\uFF0Chover \u8F7B\u5FAE\u653E\u5927\uFF08\u5FAE\u4EA4\u4E92\uFF09\u3002 */
.dpl-bulb-badge{color:var(--dpl-fg-dim);transition:transform .25s cubic-bezier(.32,.72,0,1)}
.dsh-done-pill-main:hover .dpl-bulb-badge{transform:scale(1.08)}
/* \u4FE1\u606F\u5206\u5C42\uFF1A\u6838\u5FC3\u8BCD\u6DE1\u58A8\u5C0F\u7B7E\uFF08\u89C6\u89C9\u951A\u70B9\uFF09\uFF0C\u91CA\u4E49\u6B21\u7EA7\u8272\u3001\u4F18\u5148\u622A\u65AD\u3002 */
.dpl-info-tag{flex:none;font-weight:600;font-size:12px;line-height:20px;padding:0 8px;border-radius:4px;background:var(--dpl-accent-soft);color:var(--dpl-fg);white-space:nowrap}
.dpl-main-desc{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dpl-fg-dim)}
.dpl-main-desc--plain{color:inherit}
/* \u4E3B\u4F53\u6309\u94AE\uFF1A\u7BAD\u5934 hover \u53F3\u79FB 2px\uFF08\u5FAE\u4EA4\u4E92\uFF09\u3002 */
.dsh-done-pill-main .dpl-chev{
  width:calc(18px * var(--dps));height:calc(18px * var(--dps));border-radius:50%;
  display:inline-flex;align-items:center;justify-content:center;
  color:var(--dpl-fg-weak);background:transparent;
  transition:transform .22s cubic-bezier(.32,.72,0,1),color .2s ease;
}
.dsh-done-pill-main:hover .dpl-chev{transform:translateX(2px);color:var(--dpl-fg)}
.dsh-done-pill-row{animation:dpRowIn .32s cubic-bezier(.32,.72,0,1) backwards}
@media (prefers-reduced-motion:reduce){
  .dsh-done-pill-shell,.dpl-run-arc,.dsh-done-pill-row{animation:none !important}
  .dsh-done-pill-shell,.dsh-done-pill-main .dpl-chev,.dsh-done-pill-row{transition:none !important}
  [data-dpp-card],.dpp-bar,.dpp-bar .dpp-chev,.dpp-bar .dpp-bulb,.dpp-bar-label,.dpp-icon-swap,.dpp-badge-pop{animation:none !important;transition:none !important}
}
/* \u9762\u677F\u5185\u53EF\u70B9\u884C\uFF08\u4EFB\u52A1\u884C / \u5B8C\u6210\u8BB0\u5F55\u5361\uFF09\uFF1Ahover \u6D45\u58A8\u5E95 + \u5DE6\u4FA7 2px \u58A8\u6761\u3002 */
.dsh-done-pill-row{transition:background .12s ease,box-shadow .12s ease}
.dsh-done-pill-row:hover{background:var(--dpl-row-hover);box-shadow:inset 2px 0 0 var(--dpl-fg)}
.dsh-done-pill-row:focus-visible{outline:2px solid var(--dpl-fg);outline-offset:-2px}
.dsh-done-pill-close{transition:background .12s ease,color .12s ease}
.dsh-done-pill-close:hover{background:var(--dpl-accent-soft);color:var(--dpl-fg)}
/* \u5934\u90E8\u300C\u70B9\u51FB\u5361\u7247\u8FDB\u5165\u4F1A\u8BDD\u300D\u94FE\u63A5\uFF1Ahover \u4E0B\u5212\u7EBF\u3002 */
.dsh-done-pill-link{transition:color .12s ease}
.dsh-done-pill-link:hover{text-decoration:underline}
.dsh-done-pill-link:disabled{color:var(--dpl-fg-weak);cursor:default;text-decoration:none}
/* \u2500\u2500 \u5DE6\u4E0B\u89D2\u5C0F\u6A2A\u6761\uFF08\u5361\u7247\u5F62\u6001 .dpp-bar\uFF0C\u89C1 sidebar-card.tsx\uFF09\uFF1A
   hover \u8FDB\u51FA + \u4EFB\u52A1\u5F00\u59CB/\u5B8C\u6210\u7684\u72B6\u6001\u8FC7\u6E21\u52A8\u6548\u3002
   \u26A0 \u8868\u9762\u5C5E\u6027\uFF08\u5E95\u8272/\u63CF\u8FB9/\u6295\u5F71/\u6587\u5B57\u8272\uFF09\u5FC5\u987B\u7559\u5728\u7C7B\u4E0A\u800C\u4E0D\u662F\u5185\u8054\uFF1A
   \u5185\u8054\u6837\u5F0F\u4F18\u5148\u7EA7\u9AD8\u4E8E :hover \u89C4\u5219\uFF0C\u5199\u5185\u8054\u4F1A\u8BA9 hover \u53CD\u9988\u6574\u4E2A\u5931\u6548\u3002
   hover \u79FB\u51FA\u4E0D\u9700\u8981\u5355\u72EC\u89C4\u5219\u2014\u2014transition \u81EA\u52A8\u53CD\u5411\u64AD\u653E\u3002 \u2500\u2500 */
.dpp-bar{
  border:1px solid var(--dpl-panel-border);
  background:var(--dpl-panel-bg);
  color:var(--dpl-fg);
  box-shadow:var(--dpl-shell-shadow);
  transition:transform .28s cubic-bezier(.32,.72,0,1),box-shadow .28s cubic-bezier(.32,.72,0,1),
    border-color .28s ease,background-color .28s ease;
}
.dpp-bar:hover{
  transform:translateY(-2px);
  box-shadow:var(--dpl-shell-shadow-hover);
  border-color:color-mix(in srgb,var(--dpl-fg) 20%,transparent);
  background:color-mix(in srgb,var(--dpl-panel-bg) 94%,var(--dpl-fg));
}
.dpp-bar:active{transform:translateY(0) scale(.985)}
.dpp-bar:focus-visible{outline:2px solid var(--dpl-fg);outline-offset:2px}
/* \u7BAD\u5934 hover \u53F3\u79FB\u3001\u706F\u6CE1 hover \u5FAE\u503E\u653E\u5927\uFF08\u4E0E\u60AC\u6D6E\u80F6\u56CA dpl-chev \u540C\u8282\u594F\u7684\u5FAE\u4EA4\u4E92\uFF09\u3002 */
.dpp-bar .dpp-chev{transition:transform .28s cubic-bezier(.32,.72,0,1),color .2s ease}
.dpp-bar:hover .dpp-chev{transform:translateX(2px);color:var(--dpl-fg)}
.dpp-bar .dpp-bulb{transition:transform .28s cubic-bezier(.32,.72,0,1)}
.dpp-bar:hover .dpp-bulb{transform:scale(1.15) rotate(-8deg)}
/* \u5361\u7247\u6302\u8F7D\u5165\u573A\uFF1A\u53EA\u6DE1\u5165\u4E0D\u4F4D\u79FB\u2014\u2014\u5F39\u7A97 portal \u6302\u5728\u672C\u5BB9\u5668\u5185\u7528 fixed \u5B9A\u4F4D\uFF0C
   \u7956\u5148\u7559 transform \u4F1A\u628A fixed \u53D8\u6210\u76F8\u5BF9\u5B9A\u4F4D\uFF08\u5F39\u7A97\u9519\u4F4D\uFF09\u3002 */
@keyframes dppCardIn{from{opacity:0}to{opacity:1}}
[data-dpp-card]{animation:dppCardIn .45s ease backwards}
/* \u8FDB\u884C\u4E2D\u5E38\u6001\uFF1A\u6709\u6761\u76EE\u65F6\u547C\u5438\u8F89\u5149\uFF08hover / \u4E00\u6B21\u6027\u52A8\u753B\u671F\u95F4\u8BA9\u4F4D\uFF0C\u907F\u514D\u62A2\u901A\u9053\uFF09\u3002 */
@keyframes dppBreath{0%,100%{box-shadow:var(--dpl-shell-shadow)}50%{box-shadow:var(--dpl-shell-shadow-unread)}}
.dpp-bar[data-state="running"]:not(:hover):not(.dpp-fx-start):not(.dpp-fx-done){
  animation:dppBreath 2.6s ease-in-out infinite;
}
/* \u72B6\u6001\u8FC7\u6E21\u4E00\u6B21\u6027\u52A8\u753B\uFF1A\u4EFB\u52A1\u5F00\u59CB = \u5F39\u6027 pop\uFF1B\u6709\u65B0\u5B8C\u6210 = \u8F7B\u5F39\u8DF3 + \u7EFF\u8272\u9AD8\u4EAE\u626B\u8FC7\u3002
   \u7531\u7EC4\u4EF6\u5728\u8BA1\u6570\u53D8\u5316\u65F6\u6302 .dpp-fx-* \u7C7B\u3001\u52A8\u753B\u7A97\u53E3\u7ED3\u675F\u540E\u6458\u9664\uFF08\u89C1 sidebar-card\uFF09\u3002 */
@keyframes dppFxStart{0%{transform:scale(.92);opacity:.55}55%{transform:scale(1.04);opacity:1}100%{transform:scale(1)}}
@keyframes dppFxDone{
  0%{transform:translateY(0);box-shadow:var(--dpl-shell-shadow)}
  25%{transform:translateY(-3px);box-shadow:0 0 0 3px color-mix(in srgb,var(--dpl-ok) 38%,transparent),var(--dpl-shell-shadow-unread)}
  60%{transform:translateY(0)}
  100%{transform:translateY(0);box-shadow:var(--dpl-shell-shadow)}
}
.dpp-bar.dpp-fx-start{animation:dppFxStart .55s cubic-bezier(.32,.72,0,1)}
.dpp-bar.dpp-fx-done{animation:dppFxDone .85s cubic-bezier(.32,.72,0,1)}
/* \u6761\u4E0A\u6587\u6848 / \u56FE\u6807 / \u5FBD\u6807\u968F\u5185\u5BB9\u5207\u6362\u6DE1\u5165\u5F39\u8DF3\uFF08\u7EC4\u4EF6\u7528 key \u53D8\u5316\u91CD\u6302\u8F7D\u89E6\u53D1\uFF09\u3002 */
@keyframes dppSwapIn{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
.dpp-bar-label{animation:dpLineIn .3s cubic-bezier(.32,.72,0,1) backwards}
.dpp-icon-swap{display:inline-flex;animation:dppSwapIn .45s cubic-bezier(.32,.72,0,1) backwards}
.dpp-badge-pop{animation:dpPop .35s cubic-bezier(.32,.72,0,1)}
/* \u9762\u677F\u6EDA\u52A8\u6761\uFF1A\u6700\u7EC6\u7EC6\u6761\uFF083px\u3001\u65E0\u8F68\u9053\u3001\u65E0\u4E0A\u4E0B\u7BAD\u5934\u6309\u94AE\uFF09\u2014\u2014\u4F5C\u7528\u4E8E\u9762\u677F\u672C\u8EAB
   \u4E0E\u5185\u90E8\u6240\u6709\u53EF\u6EDA\u52A8\u5143\u7D20\uFF08\u8BB0\u5F55\u5361\u5185\u7684 <pre> \u5168\u6587\u7B49\uFF09\u3002
   \u26A0 \u4E0D\u80FD\u540C\u65F6\u5199\u6807\u51C6 scrollbar-width/scrollbar-color\uFF1A\u73B0\u4EE3 Chromium \u4E00\u65E6
   \u8BBE\u7F6E\u6807\u51C6\u6EDA\u52A8\u6761\u5C5E\u6027\u5C31\u4F1A\u6574\u4F53\u5FFD\u7565 ::-webkit-scrollbar \u6837\u5F0F\uFF0C\u9000\u56DE\u539F\u751F
   \uFF08\u5E26\u4E0A\u4E0B\u7BAD\u5934\uFF09\u3002\u6B64\u5904\u53EA\u8D70 webkit \u4F2A\u5143\u7D20\u8DEF\u5F84\u3002 */
.dsh-done-pill [role="dialog"]::-webkit-scrollbar,
.dsh-done-pill [role="dialog"] *::-webkit-scrollbar{width:3px;height:3px}
.dsh-done-pill [role="dialog"]::-webkit-scrollbar-thumb,
.dsh-done-pill [role="dialog"] *::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dpl-fg) 25%,transparent);border-radius:1.5px}
.dsh-done-pill [role="dialog"]::-webkit-scrollbar-track,
.dsh-done-pill [role="dialog"] *::-webkit-scrollbar-track{background:transparent}
.dsh-done-pill [role="dialog"]::-webkit-scrollbar-button,
.dsh-done-pill [role="dialog"] *::-webkit-scrollbar-button{display:none;height:0;width:0}
`;
var wrapStyle2 = (dragging, pos, scale, fontStack) => ({
  position: "fixed",
  // pos 恒为整数像素（挂载后由 useLayoutEffect 把居中模式换算成整数坐标）：
  // translateX(-50%) 居中会落在半像素上，文字亚像素渲染发糊。
  // null 仅存在于首帧（绘制前即被 useLayoutEffect 修正）。
  ...pos === null ? { top: defaultShellTop(), left: "50%", transform: "translateX(-50%)" } : { top: pos.y, left: pos.x },
  zIndex: 9400,
  cursor: dragging ? "grabbing" : "grab",
  userSelect: "none",
  touchAction: "none",
  ...fontStack !== "" ? { fontFamily: fontStack } : {},
  "--dps": String(scale),
  letterSpacing: "-0.01em",
  WebkitFontSmoothing: "antialiased",
  // 上下内衬各 8px：面板贴着 padding box 定位（下方 top:100% / 上方
  // bottom:100%），胶囊与面板之间的视觉缝隙落在容器内，鼠标滑过去不会触发
  // mouseleave。marginTop 抵消上内衬——外壳本体仍精确落在 pos.y，拖拽与
  // 锚点换算都以**外壳**矩形为基准（见 onPointerDown 用 shellRef 取 rect）。
  paddingTop: "calc(8px * var(--dps))",
  paddingBottom: "calc(8px * var(--dps))",
  marginTop: "calc(-8px * var(--dps))",
  // 核心动画：left 与外壳 width 同节奏（MORPH_DUR）过渡。位置按目标宽
  // 一步算准（见 syncPosition），Δw 的过渡期里左缘滑动的量恒为
  // ∓Δw/2，与右缘对称——胶囊呈「两侧拉伸 / 两侧收窄」，而不是先单边
  // 伸缩、再瞬移回中。拖拽中必须关闭，否则位置被过渡拖着走、毫无跟手性。
  ...dragging ? {} : { transition: `left ${MORPH_DUR} cubic-bezier(.32,.72,0,1)` }
});
var SHELL_MAX_W = 960;
function effectiveShellWidth(target, el) {
  const maxW = Math.min(SHELL_MAX_W, window.innerWidth - 48);
  if (target !== null && target > 0) return Math.min(target, maxW);
  return el !== null ? el.getBoundingClientRect().width : 160;
}
var pillShellStyle = (width) => ({
  boxSizing: "border-box",
  position: "relative",
  display: "flex",
  alignItems: "stretch",
  height: `calc(${PILL_H}px * var(--dps))`,
  maxWidth: `min(${SHELL_MAX_W}px, calc(100vw - 48px))`,
  ...width !== null ? { width } : {},
  borderRadius: "calc(12px * var(--dps))",
  fontSize: "calc(13.5px * var(--dps))",
  lineHeight: "calc(20px * var(--dps))",
  whiteSpace: "nowrap",
  overflow: "hidden",
  // 宽度伸缩与位置滑动/文字淡入同节奏（MORPH_DUR）；颜色类过渡也写在内联，
  // 否则内联 transition 会整条覆盖样式表里的 transition。
  transition: `width ${MORPH_DUR} cubic-bezier(.32,.72,0,1), box-shadow .22s cubic-bezier(.32,.72,0,1), color .14s ease, transform .22s cubic-bezier(.32,.72,0,1)`
});
var pillMainStyle = {
  display: "flex",
  alignItems: "center",
  gap: "calc(10px * var(--dps))",
  minWidth: 0,
  padding: "0 calc(18px * var(--dps)) 0 calc(15px * var(--dps))",
  border: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  fontWeight: "inherit",
  cursor: "inherit",
  overflow: "hidden"
};
var checkBadgeStyle = {
  flex: "none",
  width: "calc(7px * var(--dps))",
  height: "calc(7px * var(--dps))",
  borderRadius: "50%",
  display: "inline-flex",
  background: "var(--dpl-fg)",
  animation: "dpPop .35s cubic-bezier(.32,.72,0,1)"
};
var bulbBadgeStyle = {
  flex: "none",
  position: "relative",
  width: "calc(22px * var(--dps))",
  height: "calc(22px * var(--dps))",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
};
var reminderBadgeStyle = {
  flex: "none",
  display: "flex",
  alignItems: "center",
  gap: "calc(7px * var(--dps))",
  padding: "0 calc(20px * var(--dps)) 0 calc(17px * var(--dps))",
  color: "var(--dpl-warn)",
  fontSize: "calc(13.5px * var(--dps))",
  lineHeight: "calc(20px * var(--dps))",
  fontWeight: 500
};
function MoonIcon(props) {
  const size = props.size ?? 18;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, style: { flex: "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M21 14.5A9.2 9.2 0 1 1 9.5 3a7.2 7.2 0 0 0 11.5 11.5Z", fill: "currentColor" }) });
}
function CoffeeIcon(props) {
  const size = props.size ?? 18;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      style: { flex: "none" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M17 8h1a4 4 0 1 1 0 8h-1" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: "7", y1: "2", x2: "7", y2: "5" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: "12", y1: "2", x2: "12", y2: "5" })
      ]
    }
  );
}
function BulbBadge(props) {
  const icon = Math.max(11, Math.round(13.5 * props.scale));
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dpl-bulb-badge", style: bulbBadgeStyle, "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "svg",
    {
      width: icon,
      height: icon,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: { flex: "none" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: "9.5", y1: "17", x2: "14.5", y2: "17" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: "10.5", y1: "20", x2: "13.5", y2: "20" })
      ]
    }
  ) });
}
function ChevronIcon2(props) {
  const size = props.size ?? 13;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2.4,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      style: { flex: "none" },
      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "m9 5 7 7-7 7" })
    }
  );
}
var pillDividerStyle = {
  flex: "none",
  width: "calc(17px * var(--dps))",
  alignSelf: "stretch",
  // ⚠ 必须是 background-image（linear-gradient 充当 1px 竖线）：
  //  background 简写里的颜色会铺满整个元素，position/size 只对图片生效——
  //  写成纯色会把整条分隔 span 染成灰柱（v0.6.0 实测翻车）。
  background: "linear-gradient(var(--dpl-divider), var(--dpl-divider)) center / 1px 60% no-repeat"
};
var shellChildStyle = { flex: "none" };
var DONE_PANEL_W = 600;
var RUN_PANEL_W = 320;
var floatPanelStyle = (open, shiftX, up, width, maxHeight, gap, padding, radius) => ({
  position: "absolute",
  ...up ? { bottom: "100%" } : { top: "100%" },
  left: shiftX,
  width: `min(${width}px, calc(100vw - 24px))`,
  maxHeight,
  overflowY: "auto",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap,
  padding,
  borderRadius: radius,
  border: "1px solid var(--dpl-panel-border)",
  background: "var(--dpl-panel-bg)",
  color: "var(--dpl-fg)",
  boxShadow: "var(--dpl-panel-shadow)",
  opacity: open ? 1 : 0,
  transform: `translateY(${open ? 0 : up ? 8 : -8}px) scale(${open ? 1 : 0.98})`,
  visibility: open ? "visible" : "hidden",
  pointerEvents: open ? "auto" : "none",
  // 收起时 visibility 延迟到过渡结束再隐藏，滑出动画才完整可见。
  transition: open ? "opacity .26s cubic-bezier(.32,.72,0,1), transform .26s cubic-bezier(.32,.72,0,1), visibility 0s" : "opacity .18s ease, transform .18s ease, visibility 0s linear .18s"
});
var panelStyle = (open, shiftX, up) => floatPanelStyle(open, shiftX, up, DONE_PANEL_W, "min(66vh, 640px)", 0, 0, 20);
var runPanelStyle = (open, shiftX, up) => floatPanelStyle(open, shiftX, up, RUN_PANEL_W, "min(60vh, 480px)", 4, 12, 16);
var runningBlockStyle = (hasRunning) => ({
  flex: "none",
  display: "flex",
  alignItems: "center",
  gap: "calc(8px * var(--dps))",
  padding: "0 calc(12px * var(--dps)) 0 calc(14px * var(--dps))",
  border: "none",
  background: "transparent",
  color: hasRunning ? "var(--dpl-fg)" : "var(--dpl-fg-weak)",
  font: "inherit",
  fontWeight: hasRunning ? 500 : 400,
  cursor: "pointer"
});
var runOrbStyle = { flex: "none" };
var panelDotStyle = {
  flex: "none",
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "var(--dpl-fg-dim)"
};
var runRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "none",
  background: "var(--dpl-row-bg)",
  color: "var(--dpl-fg)",
  fontSize: 13,
  lineHeight: "20px",
  textAlign: "left",
  cursor: "pointer"
};
var runRowTitleStyle = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
var runRowTimeStyle = {
  flex: "none",
  fontSize: 11,
  color: "var(--dpl-fg-weak)",
  fontVariantNumeric: "tabular-nums"
};
var headStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "20px 24px 14px"
};
var headBarStyle = {
  flex: "none",
  width: 3,
  height: 15,
  borderRadius: 1.5,
  background: "var(--dpl-fg-dim)"
};
var headTitleStyle = {
  flex: "none",
  fontSize: 17,
  fontWeight: 600,
  lineHeight: "24px",
  color: "var(--dpl-fg)"
};
var headMetaStyle = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  whiteSpace: "nowrap",
  textAlign: "right",
  fontSize: 13,
  lineHeight: "20px",
  color: "var(--dpl-fg-dim)"
};
var headLinkStyle = {
  flex: "none",
  border: "none",
  background: "transparent",
  padding: 0,
  margin: 0,
  fontSize: 13,
  lineHeight: "20px",
  color: "var(--dpl-fg)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationColor: "var(--dpl-fg-weak)",
  cursor: "pointer"
};
var cardStyle = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  cursor: "pointer",
  background: "var(--dpl-row-bg)",
  textAlign: "left"
};
var cardHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0
};
var unreadDotStyle2 = {
  flex: "none",
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "var(--dpl-fg)"
};
var sessionTitleStyle = {
  flex: "none",
  maxWidth: 340,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--dpl-fg)"
};
var metaStyle = {
  flex: 1,
  minWidth: 0,
  textAlign: "right",
  fontSize: 12,
  color: "var(--dpl-fg-weak)",
  whiteSpace: "nowrap"
};
var closeStyle = {
  flex: "none",
  width: 22,
  height: 22,
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "var(--dpl-fg-weak)",
  fontSize: 13,
  lineHeight: "22px",
  cursor: "pointer"
};
var answerStyle = {
  margin: 0,
  maxHeight: 240,
  overflowY: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: 12.5,
  lineHeight: "20px",
  color: "var(--dpl-fg-dim)",
  borderTop: "1px solid var(--dpl-divider)",
  paddingTop: 8,
  // 字体族显式跟随容器：<pre> 默认 monospace，会无视胶囊字体设置。
  fontFamily: "inherit"
};
var errorTagStyle = {
  flex: "none",
  fontSize: 12,
  lineHeight: "20px",
  color: "var(--dpl-warn)"
};
var emptyStyle2 = {
  padding: "14px 8px",
  textAlign: "center",
  fontSize: 12,
  color: "var(--dpl-fg-weak)"
};
var emptyStateStyle = {
  position: "relative",
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "26px 20px 30px",
  color: "var(--dpl-fg-weak)"
};
var captionPillStyle = {
  position: "relative",
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "0 12px",
  color: "var(--dpl-caption-fg)",
  fontSize: 13.5,
  lineHeight: "22px",
  whiteSpace: "nowrap"
};
function EmptyIllustration() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "svg",
    {
      width: 200,
      height: 112,
      viewBox: "0 0 200 112",
      "aria-hidden": true,
      style: { flex: "none" },
      preserveAspectRatio: "xMidYMid meet",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("rect", { x: "20", y: "12", width: "104", height: "64", rx: "16", opacity: "0.45" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M42 76 L38 90 L54 78", opacity: "0.45" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("rect", { x: "76", y: "34", width: "104", height: "64", rx: "16", fill: "var(--dpl-panel-bg)" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "110", cy: "66", r: "3", fill: "currentColor", stroke: "none", opacity: "0.8" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "128", cy: "66", r: "3", fill: "currentColor", stroke: "none", opacity: "0.55" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "146", cy: "66", r: "3", fill: "currentColor", stroke: "none", opacity: "0.3" })
      ]
    }
  );
}
var listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "2px 20px 24px"
};
var rowStyle2 = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "16px 0",
  borderBottom: "1px solid var(--dsw-alias-border-l2)"
};
var rowTextStyle = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  paddingRight: 48
};
var rowTitleStyle2 = { fontSize: 14, fontWeight: 400, lineHeight: "22px", color: "var(--dsw-alias-label-primary)" };
var rowDescStyle = { fontSize: 12, fontWeight: 400, lineHeight: "18px", color: "var(--dsw-alias-label-tertiary)" };
function switchStyle(on) {
  return {
    position: "relative",
    flex: "none",
    width: 40,
    height: 22,
    padding: 0,
    border: "none",
    borderRadius: 11,
    cursor: "pointer",
    // 开启态用品牌蓝（不能用反色的 brand-primary）；关闭态描边底 + 灰钮。
    background: on ? "var(--dsw-alias-state-business-primary)" : "var(--dsw-alias-bg-module-platform)",
    transition: "background .15s"
  };
}
function knobStyle(on) {
  return {
    position: "absolute",
    top: 2,
    left: on ? 20 : 2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: on ? "#ffffff" : "var(--dsw-alias-label-tertiary)",
    transition: "left .15s, background .15s"
  };
}
function DonePillRow() {
  const [on, setOn] = (0, import_react3.useState)(enabledStore.get());
  (0, import_react3.useEffect)(() => enabledStore.subscribe(setOn), []);
  function toggle() {
    enabledStore.set(!enabledStore.get());
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowStyle2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowTextStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowTitleStyle2, children: "\u5BF9\u8BDD\u5B8C\u6210\u80F6\u56CA" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowDescStyle, children: "\u603B\u5F00\u5173\uFF1A\u5173\u95ED\u540E\u5361\u7247\u4E0E\u60AC\u6D6E\u4E24\u79CD\u5F62\u6001\u90FD\u9690\u85CF" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": on,
        "aria-label": "\u5BF9\u8BDD\u5B8C\u6210\u80F6\u56CA",
        onClick: toggle,
        style: switchStyle(on),
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: knobStyle(on) })
      }
    )
  ] });
}
var timeInputStyle = {
  flex: "none",
  width: 96,
  height: 32,
  padding: "0 8px",
  fontSize: 13,
  lineHeight: "22px",
  borderRadius: 8,
  border: "1px solid var(--dsw-alias-border-l2)",
  background: "var(--dsw-alias-bg-layer-1)",
  color: "var(--dsw-alias-label-primary)"
};
var timeDashStyle = {
  flex: "none",
  color: "var(--dsw-alias-label-tertiary)",
  fontSize: 13
};
function ReminderRow(props) {
  const { titleText, descText, store } = props;
  const [config, setConfig] = (0, import_react3.useState)(() => store.get());
  (0, import_react3.useEffect)(() => store.subscribe(setConfig), []);
  function update(patch) {
    store.set({ ...store.get(), ...patch });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowStyle2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowTextStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowTitleStyle2, children: titleText }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowDescStyle, children: descText })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        type: "time",
        value: config.start,
        disabled: !config.enabled,
        "aria-label": `${titleText}\u5F00\u59CB\u65F6\u95F4`,
        onChange: (event) => {
          if (event.target.value !== "") update({ start: event.target.value });
        },
        style: { ...timeInputStyle, opacity: config.enabled ? 1 : 0.45 }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: timeDashStyle, children: "\u2014" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        type: "time",
        value: config.end,
        disabled: !config.enabled,
        "aria-label": `${titleText}\u7ED3\u675F\u65F6\u95F4`,
        onChange: (event) => {
          if (event.target.value !== "") update({ end: event.target.value });
        },
        style: { ...timeInputStyle, opacity: config.enabled ? 1 : 0.45 }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": config.enabled,
        "aria-label": titleText,
        onClick: () => {
          update({ enabled: !config.enabled });
        },
        style: { ...switchStyle(config.enabled), marginLeft: 8 },
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: knobStyle(config.enabled) })
      }
    )
  ] });
}
var selectInputStyle = {
  flex: "none",
  width: 132,
  height: 32,
  padding: "0 8px",
  fontSize: 13,
  borderRadius: 8,
  border: "1px solid var(--dsw-alias-border-l2)",
  background: "var(--dsw-alias-bg-layer-1)",
  color: "var(--dsw-alias-label-primary)",
  appearance: "none",
  cursor: "pointer"
};
var sizeSliderStyle = {
  flex: "none",
  width: 160,
  accentColor: "var(--dsw-alias-state-business-primary)",
  cursor: "pointer"
};
var sliderValueStyle = {
  flex: "none",
  width: 44,
  textAlign: "right",
  fontSize: 13,
  color: "var(--dsw-alias-label-secondary)",
  fontVariantNumeric: "tabular-nums"
};
function PillScaleRow() {
  const [config, setConfig] = (0, import_react3.useState)(() => appearanceStore.get());
  (0, import_react3.useEffect)(() => appearanceStore.subscribe(setConfig), []);
  const percent = Math.round(config.scale * 100);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowStyle2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowTextStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowTitleStyle2, children: "\u80F6\u56CA\u5927\u5C0F" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowDescStyle, children: "\u6574\u4F53\u7F29\u653E\u80F6\u56CA\uFF0C\u5B57\u4F53\u4E0E\u56FE\u6807\u7B49\u6BD4\u8DDF\u968F\uFF0865% \u2013 160%\uFF09" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        type: "range",
        min: 65,
        max: 160,
        step: 5,
        value: percent,
        "aria-label": "\u80F6\u56CA\u5927\u5C0F",
        onChange: (event) => {
          appearanceStore.set({ ...appearanceStore.get(), scale: Number(event.target.value) / 100 });
        },
        style: sizeSliderStyle
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: sliderValueStyle, children: `${percent}%` })
  ] });
}
function PillFontRow() {
  const [config, setConfig] = (0, import_react3.useState)(() => appearanceStore.get());
  (0, import_react3.useEffect)(() => appearanceStore.subscribe(setConfig), []);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowStyle2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowTextStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowTitleStyle2, children: "\u80F6\u56CA\u5B57\u4F53" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowDescStyle, children: "\u80F6\u56CA\u4E0E\u9762\u677F\u6587\u5B57\u7684\u5B57\u4F53\u98CE\u683C" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "select",
      {
        value: config.font,
        "aria-label": "\u80F6\u56CA\u5B57\u4F53",
        onChange: (event) => {
          appearanceStore.set({ ...appearanceStore.get(), font: event.target.value });
        },
        style: selectInputStyle,
        children: FONT_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: option.id, children: option.label }, option.id))
      }
    )
  ] });
}
var segWrapStyle = {
  flex: "none",
  display: "flex",
  gap: 2,
  padding: 2,
  borderRadius: 9,
  background: "var(--dsw-alias-bg-module-platform)"
};
function segOptionStyle(activeOption) {
  return {
    border: "none",
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: 7,
    fontSize: 13,
    lineHeight: "20px",
    fontWeight: activeOption ? 600 : 400,
    background: activeOption ? "var(--dsw-alias-bg-layer-1)" : "transparent",
    color: activeOption ? "var(--dsw-alias-label-primary)" : "var(--dsw-alias-label-secondary)",
    boxShadow: activeOption ? "0 1px 2px rgba(0,0,0,.08)" : "none"
  };
}
function PillModeRow() {
  const [pillMode, setPillMode] = (0, import_react3.useState)(() => modeStore.get());
  (0, import_react3.useEffect)(() => modeStore.subscribe(setPillMode), []);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowStyle2, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: rowTextStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowTitleStyle2, children: "\u80F6\u56CA\u5F62\u6001" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: rowDescStyle, children: "\u5361\u7247\uFF1A\u5DE6\u4E0B\u89D2\u8BBE\u7F6E\u4E0A\u65B9\u7684\u5C0F\u6A2A\u6761\uFF0C\u60AC\u505C\u67E5\u770B\u8FDB\u884C\u4E2D\u4E0E\u6700\u8FD1\u5B8C\u6210\uFF1B\u60AC\u6D6E\uFF1A\u9876\u90E8\u53EF\u62D6\u62FD\u6D6E\u7A97" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { role: "radiogroup", "aria-label": "\u80F6\u56CA\u5F62\u6001", style: segWrapStyle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          role: "radio",
          "aria-checked": pillMode === "card",
          onClick: () => {
            modeStore.set("card");
          },
          style: segOptionStyle(pillMode === "card"),
          children: "\u5361\u7247"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          role: "radio",
          "aria-checked": pillMode === "float",
          onClick: () => {
            modeStore.set("float");
          },
          style: segOptionStyle(pillMode === "float"),
          children: "\u60AC\u6D6E"
        }
      )
    ] })
  ] });
}
function DonePill(props) {
  const [entries, setEntries] = (0, import_react3.useState)([]);
  const [readIds, setReadIds] = (0, import_react3.useState)(() => loadReadIds2());
  const [hovered, setHovered] = (0, import_react3.useState)(false);
  const [hoveredRunning, setHoveredRunning] = (0, import_react3.useState)(false);
  const [enabled, setEnabled] = (0, import_react3.useState)(enabledStore.get());
  const [pillMode, setPillMode] = (0, import_react3.useState)(() => modeStore.get());
  const [pos, setPos] = (0, import_react3.useState)(() => {
    const anchor = loadAnchor();
    return anchor === null ? null : anchorToPos(anchor, 160, pillHeight(appearanceStore.get().scale));
  });
  const [dragging, setDragging] = (0, import_react3.useState)(false);
  const [runInfo, setRunInfo] = (0, import_react3.useState)({});
  const [nowTick, setNowTick] = (0, import_react3.useState)(() => Date.now());
  const [reminderTick, setReminderTick] = (0, import_react3.useState)(0);
  const [restConfig, setRestConfig] = (0, import_react3.useState)(() => restStore.get());
  const [lateConfig, setLateConfig] = (0, import_react3.useState)(() => lateStore.get());
  const [appearance, setAppearance] = (0, import_react3.useState)(() => appearanceStore.get());
  const scale = appearance.scale;
  const scaleRef = (0, import_react3.useRef)(scale);
  scaleRef.current = scale;
  const [funIdx, setFunIdx] = (0, import_react3.useState)(() => Math.floor(Math.random() * FUN_LINES.length));
  const [shellWidth, setShellWidth] = (0, import_react3.useState)(null);
  const shellRef = (0, import_react3.useRef)(null);
  const shellWidthRef = (0, import_react3.useRef)(null);
  const [decoWidth, setDecoWidth] = (0, import_react3.useState)(80);
  const labelRef = (0, import_react3.useRef)(null);
  const sinceRef = (0, import_react3.useRef)(0);
  const wrapRef = (0, import_react3.useRef)(null);
  const dragRef = (0, import_react3.useRef)(null);
  const [runBlockLeft, setRunBlockLeft] = (0, import_react3.useState)(0);
  const runBlockRef = (0, import_react3.useRef)(null);
  const [viewportH, setViewportH] = (0, import_react3.useState)(() => window.innerHeight || 900);
  (0, import_react3.useEffect)(() => enabledStore.subscribe(setEnabled), []);
  (0, import_react3.useEffect)(() => modeStore.subscribe(setPillMode), []);
  (0, import_react3.useEffect)(() => restStore.subscribe(setRestConfig), []);
  (0, import_react3.useEffect)(() => lateStore.subscribe(setLateConfig), []);
  (0, import_react3.useEffect)(() => appearanceStore.subscribe(setAppearance), []);
  (0, import_react3.useLayoutEffect)(() => {
    ensurePillKeyframes();
  }, []);
  (0, import_react3.useEffect)(() => {
    setReminderTick((t) => t + 1);
    const timer = window.setInterval(() => {
      setReminderTick((t) => t + 1);
    }, 1e4);
    return () => {
      window.clearInterval(timer);
    };
  }, []);
  const nowMinutes = (() => {
    const d = /* @__PURE__ */ new Date();
    void reminderTick;
    return d.getHours() * 60 + d.getMinutes();
  })();
  const lateActive = lateConfig.enabled && inTimeRange(nowMinutes, lateConfig);
  const restActive = !lateActive && restConfig.enabled && inTimeRange(nowMinutes, restConfig);
  const anchorRef = (0, import_react3.useRef)(loadAnchor());
  const autoCenterRef = (0, import_react3.useRef)(anchorRef.current === null);
  const syncPosition = (0, import_react3.useCallback)(() => {
    const w = effectiveShellWidth(shellWidthRef.current, shellRef.current);
    if (w <= 0) return;
    const h2 = pillHeight(scaleRef.current);
    if (autoCenterRef.current) {
      const x = Math.max(8, Math.round((window.innerWidth - w) / 2));
      setPos((prev) => {
        const next2 = { x, y: prev?.y ?? defaultShellTop() };
        return prev !== null && prev.x === next2.x && prev.y === next2.y ? prev : next2;
      });
      return;
    }
    const anchor = anchorRef.current;
    if (anchor === null) return;
    const next = anchorToPos(anchor, w, h2);
    setPos((prev) => prev !== null && prev.x === next.x && prev.y === next.y ? prev : next);
  }, []);
  (0, import_react3.useEffect)(() => {
    const onResize = () => {
      if (window.innerHeight > 0) setViewportH(window.innerHeight);
      syncPosition();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [syncPosition]);
  const mergeEntries = (0, import_react3.useCallback)((incoming) => {
    if (incoming.length === 0) return;
    setEntries((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      for (const item of incoming) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
      merged.sort((a, b) => b.seq - a.seq);
      return merged.length > MAX_ENTRIES2 ? merged.slice(0, MAX_ENTRIES2) : merged;
    });
  }, []);
  (0, import_react3.useEffect)(() => {
    let stopped = false;
    const tick = () => {
      if (document.hidden) return;
      fetch(`/api/dsh-done-pill?since=${sinceRef.current}`, { cache: "no-store" }).then(async (res) => {
        if (!res.ok) throw new Error(`http ${res.status}`);
        return res.json();
      }).then((data) => {
        if (stopped || data?.ok !== true || !Array.isArray(data.items)) return;
        sinceRef.current = Math.max(sinceRef.current, typeof data.version === "number" ? data.version : 0);
        mergeEntries(data.items.filter((item) => item !== null && typeof item === "object" && typeof item.id === "string"));
        if (Array.isArray(data.running)) {
          const next = {};
          for (const entry of data.running) {
            if (entry !== null && typeof entry === "object" && typeof entry.sessionId === "string" && typeof entry.since === "number") {
              next[entry.sessionId] = {
                since: entry.since,
                question: typeof entry.question === "string" ? entry.question : "",
                title: typeof entry.title === "string" ? entry.title : ""
              };
            }
          }
          setRunInfo(next);
        }
      }).catch(() => {
      });
    };
    tick();
    const timer = window.setInterval(tick, POLL_MS2);
    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mergeEntries]);
  const unreadCount = (0, import_react3.useMemo)(() => entries.filter((item) => !readIds.has(item.id)).length, [entries, readIds]);
  const latest = entries[0];
  const funIdle = unreadCount === 0;
  (0, import_react3.useEffect)(() => {
    if (!funIdle) return;
    const timer = window.setInterval(() => {
      setFunIdx((prev) => {
        let next = Math.floor(Math.random() * FUN_LINES.length);
        if (next === prev) next = (next + 1) % FUN_LINES.length;
        return next;
      });
    }, FUN_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [funIdle]);
  const runningSessions = (0, import_react3.useMemo)(() => Object.entries(runInfo).map(([sessionId, info]) => ({ id: sessionId, displayTitle: info.title, since: info.since })).sort((a, b) => b.since - a.since), [runInfo]);
  const runningSessionsRef = (0, import_react3.useRef)(runningSessions);
  runningSessionsRef.current = runningSessions;
  const markAllRead = (0, import_react3.useCallback)(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const item of entries) next.add(item.id);
      saveReadIds2(next);
      return next.size === prev.size ? prev : next;
    });
  }, [entries]);
  const wasHoveredRef = (0, import_react3.useRef)(false);
  (0, import_react3.useEffect)(() => {
    if (hovered) {
      wasHoveredRef.current = true;
      return;
    }
    if (wasHoveredRef.current) {
      wasHoveredRef.current = false;
      markAllRead();
    }
  }, [hovered, markAllRead]);
  (0, import_react3.useEffect)(() => {
    if (!hoveredRunning || runningSessions.length === 0) return;
    setNowTick(Date.now());
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [hoveredRunning, runningSessions.length]);
  const dismiss = (0, import_react3.useCallback)((id) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds2(next);
      return next;
    });
  }, []);
  const openSession = (0, import_react3.useCallback)((sessionId, markReadId) => {
    try {
      const runtime = sessionsAccessor2?.();
      if (runtime === void 0) {
        if (!sessionsWarned2) {
          sessionsWarned2 = true;
          console.warn("[dsh-done-pill] sessions \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u70B9\u51FB\u65E0\u6CD5\u8DF3\u8F6C\u4F1A\u8BDD\uFF08\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\uFF09");
        }
      } else {
        runtime.open(sessionId);
      }
    } catch (error) {
      console.warn("[dsh-done-pill] \u8DF3\u8F6C\u4F1A\u8BDD\u5931\u8D25\uFF1A", error);
    }
    if (markReadId !== void 0) {
      setReadIds((prev) => {
        if (prev.has(markReadId)) return prev;
        const next = new Set(prev);
        next.add(markReadId);
        saveReadIds2(next);
        return next;
      });
    }
    setHovered(false);
  }, []);
  const onPointerDown = (0, import_react3.useCallback)((event) => {
    if (event.button !== 0) return;
    const el = wrapRef.current;
    if (el === null) return;
    const rect = (shellRef.current ?? el).getBoundingClientRect();
    const zone = event.target instanceof Element ? event.target.closest("[data-dp-zone]")?.getAttribute("data-dp-zone") ?? "" : "";
    dragRef.current = { px: event.clientX, py: event.clientY, ox: rect.left, oy: rect.top, moved: false, zone };
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
    }
  }, []);
  const onPointerMove = (0, import_react3.useCallback)((event) => {
    const drag = dragRef.current;
    if (drag === null) return;
    const dx = event.clientX - drag.px;
    const dy = event.clientY - drag.py;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
      setHovered(false);
      setHoveredRunning(false);
    }
    const w = effectiveShellWidth(shellWidthRef.current, shellRef.current);
    setPos(clampPos(drag.ox + dx, drag.oy + dy, w, pillHeight(scaleRef.current)));
  }, []);
  const onPointerCancel = (0, import_react3.useCallback)(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);
  const onPointerUp = (0, import_react3.useCallback)(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag === null) return;
    if (drag.moved) {
      autoCenterRef.current = false;
      setDragging(false);
      setPos((current) => {
        if (current !== null) {
          const el = shellRef.current;
          const w = el !== null ? el.getBoundingClientRect().width : 160;
          const h2 = pillHeight(scaleRef.current);
          const anchor = {
            xc: clamp01((current.x + w / 2) / Math.max(1, window.innerWidth)),
            yc: clamp01((current.y + h2 / 2) / Math.max(1, window.innerHeight))
          };
          anchorRef.current = anchor;
          saveAnchor(anchor);
        }
        return current;
      });
      return;
    }
    if (drag.zone === "run") {
      const first = runningSessionsRef.current[0];
      if (first !== void 0) openSession(first.id);
      return;
    }
    if (latest !== void 0) openSession(latest.sessionId, unreadCount > 0 ? latest.id : void 0);
  }, [latest, openSession, unreadCount]);
  const latestTitle = latest !== void 0 ? latest.title : "";
  const latestLabel = latest !== void 0 ? latest.question !== "" ? latest.question : latestTitle : "";
  const nowDate = /* @__PURE__ */ new Date();
  let reminderLabel = null;
  let reminderIcon = "moon";
  if (lateActive) {
    reminderIcon = "moon";
    const hour = nowDate.getHours();
    reminderLabel = hour <= 4 ? `\u51CC\u6668 ${hour} \u70B9 ${nowDate.getMinutes()} \u5206` : `${hour >= 22 ? "\u591C\u6DF1\u4E86" : `\u5DF2 ${hour} \u70B9`}`;
  } else if (restActive) {
    reminderIcon = "coffee";
    reminderLabel = `\u4F11\u606F\u65F6\u95F4\uFF08${restConfig.start}-${restConfig.end}\uFF09\uFF0C\u8BE5\u4F11\u606F\u4E00\u4E0B\u4E86`;
  }
  const funLine = FUN_LINES[funIdx % FUN_LINES.length] ?? FUN_LINES[0];
  const pillLabel = unreadCount > 0 && latest !== void 0 ? `${unreadCount} \u4E2A\u5BF9\u8BDD\u5B8C\u6210 \xB7 ${truncate2(latestLabel, 56)}` : funLine.text;
  const clampPanelLeft = (panelW, left) => {
    if (pos === null) return left;
    const minLeft = Math.round(8 - pos.x);
    const maxLeft = Math.max(minLeft, Math.round(window.innerWidth - 12 - pos.x - panelW));
    return Math.min(Math.max(left, minLeft), maxLeft);
  };
  const doneShift = clampPanelLeft(DONE_PANEL_W, Math.round(((shellWidth ?? 0) - DONE_PANEL_W) / 2));
  const runShift = clampPanelLeft(RUN_PANEL_W, runBlockLeft);
  const panelUp = pos !== null && pos.y + pillHeight(scale) > viewportH * 0.55;
  const displayText = pillLabel;
  const hasUnreadMain = unreadCount > 0 && latest !== void 0;
  let infoTag = null;
  let infoDesc = displayText;
  if (hasUnreadMain) {
    infoTag = `${unreadCount} \u6761\u5B8C\u6210`;
    infoDesc = truncate2(latestLabel, 56);
  } else if (funLine.icon === "bulb") {
    const sep = funLine.text.search(/[:：]/);
    if (sep > 0) {
      infoTag = funLine.text.slice(0, sep).trim();
      infoDesc = funLine.text.slice(sep + 1).trim();
    }
  }
  (0, import_react3.useLayoutEffect)(() => {
    const el = shellRef.current;
    if (el === null) return;
    let total = 0;
    for (const child of el.children) total += child.getBoundingClientRect().width;
    const cap = Math.min(SHELL_MAX_W, window.innerWidth - 48);
    const target = Math.min(Math.round(total), cap);
    if (target > 0 && target !== shellWidthRef.current) {
      shellWidthRef.current = target;
      setShellWidth(target);
    }
    const labelEl = labelRef.current;
    if (labelEl !== null) {
      const deco = Math.round(total - labelEl.getBoundingClientRect().width);
      if (deco > 0 && Math.abs(deco - decoWidth) >= 1) setDecoWidth(deco);
    }
    const runEl = runBlockRef.current;
    if (runEl !== null) {
      const runLeft = runEl.offsetLeft;
      setRunBlockLeft((prev) => Math.abs(runLeft - prev) >= 1 ? runLeft : prev);
    }
    if (dragRef.current !== null) return;
    syncPosition();
  });
  if (!enabled || pillMode !== "float") return null;
  return (0, import_react_dom2.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "div",
      {
        ref: wrapRef,
        className: "dsh-done-pill",
        style: wrapStyle2(dragging, pos, appearance.scale, fontStackOf(appearance.font)),
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onLostPointerCapture: onPointerCancel,
        onMouseEnter: () => {
          if (dragRef.current === null) setHovered(true);
        },
        onMouseLeave: () => {
          setHovered(false);
          setHoveredRunning(false);
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "div",
            {
              ref: shellRef,
              className: "dsh-done-pill-shell",
              "data-unread": unreadCount > 0 ? "1" : "0",
              "data-dragging": dragging ? "1" : "0",
              style: pillShellStyle(shellWidth),
              children: [
                reminderLabel !== null && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                    "span",
                    {
                      style: { ...reminderBadgeStyle, ...shellChildStyle },
                      title: reminderLabel,
                      "data-dp-zone": "badge",
                      children: [
                        reminderIcon === "moon" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MoonIcon, { size: Math.max(14, Math.round(18 * appearance.scale)) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CoffeeIcon, { size: Math.max(14, Math.round(18 * appearance.scale)) }),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dpl-reminder-pill", children: reminderLabel })
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: pillDividerStyle, "aria-hidden": true })
                ] }),
                runningSessions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                    "button",
                    {
                      ref: runBlockRef,
                      type: "button",
                      "data-dp-zone": "run",
                      style: { ...runningBlockStyle(true), ...shellChildStyle, cursor: "inherit" },
                      "aria-label": `\u6B63\u5728\u6267\u884C\u4E2D\u7684\u4EFB\u52A1 ${runningSessions.length} \u4E2A\uFF1B\u60AC\u505C\u6216\u805A\u7126\u67E5\u770B\u5217\u8868`,
                      title: "\u6B63\u5728\u6267\u884C\u4E2D\u7684\u4EFB\u52A1",
                      onMouseEnter: () => {
                        setHoveredRunning(true);
                        setHovered(false);
                      },
                      onFocus: () => {
                        setHoveredRunning(true);
                        setHovered(false);
                      },
                      onBlur: () => {
                        setHoveredRunning(false);
                      },
                      onKeyDown: (event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        const first = runningSessions[0];
                        if (first !== void 0) openSession(first.id);
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dpl-run-arc-wrap", style: runOrbStyle, "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RunningArc, { size: Math.max(11, Math.round(15 * appearance.scale)) }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: runningSessions.length })
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: pillDividerStyle, "aria-hidden": true })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: "dsh-done-pill-main",
                    "data-dp-zone": "main",
                    onKeyDown: (event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      if (latest !== void 0) openSession(latest.sessionId, unreadCount > 0 ? latest.id : void 0);
                    },
                    onFocus: () => {
                      setHovered(true);
                      setHoveredRunning(false);
                    },
                    onBlur: () => {
                      setHovered(false);
                    },
                    style: { ...pillMainStyle, ...shellChildStyle, cursor: "inherit" },
                    "aria-label": latest !== void 0 ? `\u6253\u5F00\u4F1A\u8BDD\u300C${latestTitle}\u300D\uFF08${unreadCount} \u6761\u5BF9\u8BDD\u5B8C\u6210\u672A\u8BFB\uFF09\uFF1B\u62D6\u52A8\u53EF\u79FB\u52A8\u4F4D\u7F6E` : reminderLabel !== null ? `${reminderLabel}\uFF1B\u62D6\u52A8\u53EF\u79FB\u52A8\u4F4D\u7F6E` : "\u5BF9\u8BDD\u5B8C\u6210\u80F6\u56CA\uFF08\u6682\u65E0\u8BB0\u5F55\uFF09\uFF1B\u62D6\u52A8\u53EF\u79FB\u52A8\u4F4D\u7F6E",
                    onMouseEnter: () => {
                      setHovered(true);
                      setHoveredRunning(false);
                    },
                    children: [
                      unreadCount > 0 && latest !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: checkBadgeStyle, "aria-hidden": true }) : (
                        // 图标：有记录可点（已读态）时用线稿灯泡；完全空闲时才让
                        // OpenBotMotion 机器人接管——它是唯一会持续吃帧的元素，只在
                        // 「无事发生」时才值得开。
                        latest !== void 0 || runningSessions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(BulbBadge, { scale: appearance.scale }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(IdleRobot, { size: Math.max(14, Math.round(16 * appearance.scale)) })
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                        "span",
                        {
                          ref: labelRef,
                          style: {
                            // maxWidth 让超长文案以省略号收尾：外壳只有 overflow:hidden 时
                            // 文字是被**硬切**的（末字截一半，没有「…」）。装饰宽实测得来，
                            // 带提醒徽章/运行中计数时也算得准。
                            maxWidth: `calc(min(${SHELL_MAX_W}px, 100vw - 48px) - ${decoWidth}px)`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                            overflow: "hidden",
                            opacity: 0,
                            animation: `dpLineIn ${MORPH_DUR} ease forwards`
                          },
                          children: [
                            infoTag !== null && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dpl-info-tag", children: infoTag }),
                            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: infoTag !== null ? "dpl-main-desc" : "dpl-main-desc dpl-main-desc--plain", children: infoDesc })
                          ]
                        },
                        displayText
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dpl-chev", style: { flex: "none", display: "inline-flex" }, "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ChevronIcon2, { size: Math.max(10, Math.round(11.5 * appearance.scale)) }) })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "div",
            {
              style: runPanelStyle(hoveredRunning, runShift, panelUp),
              role: "dialog",
              "aria-label": "\u6B63\u5728\u6267\u884C\u4E2D\u7684\u4EFB\u52A1",
              "aria-hidden": !hoveredRunning,
              onPointerDown: (event) => {
                event.stopPropagation();
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dp-panel-head", style: headStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: headBarStyle, "aria-hidden": true }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: headTitleStyle, children: "\u6B63\u5728\u6267\u884C\u4E2D" }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: headMetaStyle, children: `${runningSessions.length} \u4E2A\u4EFB\u52A1 \xB7 \u70B9\u51FB\u8FDB\u5165\u4F1A\u8BDD` })
                ] }),
                runningSessions.map((session) => {
                  const info = runInfo[session.id];
                  const label = info !== void 0 && info.question !== "" ? info.question : session.displayTitle;
                  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: "dsh-done-pill-row",
                      style: runRowStyle,
                      title: info !== void 0 && info.question !== "" ? `\u300C${session.displayTitle}\u300D\u6B63\u5728\u6267\u884C\uFF1A${info.question}` : `\u70B9\u51FB\u6253\u5F00\u4F1A\u8BDD\uFF1A${session.displayTitle}`,
                      onPointerDown: (event) => {
                        event.stopPropagation();
                      },
                      onClick: () => {
                        openSession(session.id);
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: panelDotStyle, "aria-hidden": true }),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: runRowTitleStyle, children: label }),
                        info !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: runRowTimeStyle, children: formatElapsed2(nowTick - info.since) })
                      ]
                    },
                    session.id
                  );
                }),
                runningSessions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: emptyStyle2, children: "\u6CA1\u6709\u6B63\u5728\u8FD0\u884C\u7684\u4EFB\u52A1" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "div",
            {
              style: panelStyle(hovered, doneShift, panelUp),
              role: "dialog",
              "aria-label": "\u5BF9\u8BDD\u5B8C\u6210\u8BB0\u5F55",
              "aria-hidden": !hovered,
              onPointerDown: (event) => {
                event.stopPropagation();
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dp-panel-head", style: headStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: headBarStyle, "aria-hidden": true }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: headTitleStyle, children: "\u5BF9\u8BDD\u5B8C\u6210\u8BB0\u5F55" }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: headMetaStyle, children: [
                    `${entries.length} \u6761 \xB7`,
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      "button",
                      {
                        type: "button",
                        className: "dsh-done-pill-link",
                        style: headLinkStyle,
                        disabled: entries.length === 0,
                        onPointerDown: (event) => {
                          event.stopPropagation();
                        },
                        onClick: (event) => {
                          event.stopPropagation();
                          if (latest !== void 0) openSession(latest.sessionId);
                        },
                        children: "\u70B9\u51FB\u5361\u7247\u8FDB\u5165\u4F1A\u8BDD"
                      }
                    )
                  ] })
                ] }),
                entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: emptyStateStyle, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EmptyIllustration, {}),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: captionPillStyle, children: "\u6682\u65E0\u8BB0\u5F55 \u2014 \u4EFB\u4E00\u4F1A\u8BDD\u7684\u5BF9\u8BDD\u5B8C\u6210\u540E\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC" })
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: listStyle, children: entries.map((item) => {
                  const title = item.title;
                  const unread = !readIds.has(item.id);
                  const headLabel = item.question !== "" ? item.question : item.title;
                  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                    "div",
                    {
                      className: "dsh-done-pill-row",
                      style: cardStyle,
                      role: "button",
                      tabIndex: 0,
                      title: `\u300C${title}\u300D${item.question !== "" ? `\u95EE\uFF1A${item.question}` : ""} \u2014 \u70B9\u51FB\u6253\u5F00\u4F1A\u8BDD`,
                      onPointerDown: (event) => {
                        event.stopPropagation();
                      },
                      onClick: () => {
                        openSession(item.sessionId, item.id);
                      },
                      onKeyDown: (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openSession(item.sessionId, item.id);
                        }
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: cardHeadStyle, children: [
                          unread && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: unreadDotStyle2, "aria-hidden": true }),
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: sessionTitleStyle, children: headLabel }),
                          item.reasonKind === "error" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: errorTagStyle, children: "\u51FA\u9519\u7ED3\u675F" }),
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: metaStyle, children: `\u56DE\u5408 ${item.turn >= 0 ? item.turn + 1 : "?"} \xB7 ${formatTime2(item.endedAt)}` }),
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                            "button",
                            {
                              type: "button",
                              className: "dsh-done-pill-close",
                              style: closeStyle,
                              "aria-label": "\u79FB\u9664\u8FD9\u6761\u8BB0\u5F55\uFF08\u4E0D\u8DF3\u8F6C\u4F1A\u8BDD\uFF09",
                              onPointerDown: (event) => {
                                event.stopPropagation();
                              },
                              onClick: (event) => {
                                event.stopPropagation();
                                dismiss(item.id);
                              },
                              children: "\u2715"
                            }
                          )
                        ] }),
                        item.answer !== "" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("pre", { style: answerStyle, children: item.answer })
                      ]
                    },
                    item.id
                  );
                }) })
              ]
            }
          )
        ]
      }
    ),
    document.body
  );
}
function applyDonePill(ctx) {
  ensurePillKeyframes();
  ensureCardLayoutCss();
  sessionsAccessor2 = () => {
    try {
      return ctx.get("sessions");
    } catch {
      return void 0;
    }
  };
  setSidebarSessionsAccessor(() => {
    try {
      return ctx.get("sessions");
    } catch {
      return void 0;
    }
  });
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay",
    id: "dsh-done-pill",
    order: 90
  }, DonePill));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "dsh-done-pill-card",
    order: 10
  }, SidebarBarCard));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "dsh-done-pill-mode",
    order: 30,
    label: "\u80F6\u56CA\u5F62\u6001"
  }, PillModeRow));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "dsh-done-pill",
    order: 31,
    label: "\u5BF9\u8BDD\u5B8C\u6210\u80F6\u56CA"
  }, DonePillRow));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "dsh-done-pill-rest",
    order: 32,
    label: "\u4F11\u606F\u65F6\u95F4\u63D0\u9192"
  }, () => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    ReminderRow,
    {
      titleText: "\u4F11\u606F\u65F6\u95F4\u63D0\u9192",
      descText: "\u8BBE\u5B9A\u65F6\u95F4\u6BB5\u5185\u80F6\u56CA\u6301\u7EED\u63D0\u793A\u4F11\u606F\uFF1B\u7ED3\u675F\u65F6\u95F4\u65E9\u4E8E\u5F00\u59CB\u65F6\u95F4\u8868\u793A\u8DE8\u5348\u591C",
      store: restStore
    }
  )));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "dsh-done-pill-late",
    order: 33,
    label: "\u51CC\u6668\u6CE8\u610F\u4F11\u606F"
  }, () => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    ReminderRow,
    {
      titleText: "\u51CC\u6668\u6CE8\u610F\u4F11\u606F",
      descText: "\u51CC\u6668\u65F6\u6BB5\u5185\u80F6\u56CA\u6301\u7EED\u63D0\u793A\u6CE8\u610F\u4F11\u606F\uFF08\u9ED8\u8BA4 00:00-07:00\uFF09",
      store: lateStore
    }
  )));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "dsh-done-pill-scale",
    order: 34,
    label: "\u80F6\u56CA\u5927\u5C0F"
  }, PillScaleRow));
  ctx.slots.inject("settings.general.item", () => ctx.slots.register({
    name: "settings.general.item",
    id: "dsh-done-pill-font",
    order: 35,
    label: "\u80F6\u56CA\u5B57\u4F53"
  }, PillFontRow));
}

// src/client/mp-client.js
var React = __toESM(require("react"), 1);
var import_react_dom3 = require("react-dom");
var MP_CSS = [
  "/* dsh-mobile-plus \u2014 sidebar foot trigger + pairing panel (port of dsh-remote-web-ui remote.module.css) */",
  ".mp-trigger{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;border-radius:50%;padding:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color 120ms ease,color 120ms ease,box-shadow 120ms ease}",
  /* Host foot is a column (footer.action above Settings). Pull the icon
     onto the Settings row, right side, while the sidebar is expanded. */
  '[class*="_footArea"]:has(.mp-trigger-wide):not(:has(.dshsp-master-toggle-root)){flex-direction:row;align-items:center;gap:4px}',
  '[class*="_footArea"]:has(.mp-trigger-wide):not(:has(.dshsp-master-toggle-root)) [class*="_settingsArea"]{flex:1 1 auto;width:auto;min-width:0}',
  '[class*="_footArea"]:has(.mp-trigger-wide):not(:has(.dshsp-master-toggle-root)) [class*="_footerActions"]{order:2;flex:none;width:auto;align-items:center;justify-content:flex-end}',
  ".mp-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
  ".mp-trigger:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}",
  ".mp-trigger:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2),0 0 0 4px var(--dsw-alias-brand-primary)}",
  ".mp-trigger:disabled{opacity:.5;cursor:default}",
  ".mp-trigger svg{display:block;flex:none}",
  ".mp-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center}",
  ".mp-mask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}",
  ".mp-panel{position:relative;z-index:1;display:flex;flex-direction:column;gap:14px;width:600px;max-width:calc(100vw - 48px);max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:24px;border-radius:24px;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}",
  ".mp-header{display:flex;align-items:flex-start;gap:12px}",
  ".mp-heading{flex:1;min-width:0}",
  ".mp-title{margin:0;font-size:18px;font-weight:600;line-height:26px}",
  ".mp-subtitle{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px}",
  ".mp-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:50%;padding:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color 120ms ease,color 120ms ease,box-shadow 120ms ease}",
  ".mp-close:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-close:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}",
  ".mp-close:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2),0 0 0 4px var(--dsw-alias-brand-primary)}",
  ".mp-close:disabled{opacity:.5;cursor:default}",
  ".mp-card{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-1)}",
  ".mp-card-header{display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px}",
  ".mp-card-title{font-weight:500}",
  ".mp-badges{display:inline-flex;align-items:center;gap:6px;flex:none}",
  ".mp-badge{display:inline-flex;flex:none;align-items:center;gap:6px;min-width:0;padding:2px 10px;border-radius:999px;font-size:12px;line-height:18px;white-space:nowrap}",
  '.mp-badge::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}',
  ".mp-badge-waiting{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-badge-connected{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-badge-disconnected{color:var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-badge-stopped{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-badge-public{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-qr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;width:100%}",
  ".mp-qr-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-base)}",
  ".mp-qr-card-header{display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;text-align:center}",
  ".mp-qr-card-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
  ".mp-qr-card-desc{font-size:12px;color:var(--dsw-alias-label-secondary)}",
  ".mp-card-origin{display:inline-block;max-width:100%;padding:2px 8px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}",
  ".mp-qr-card .mp-qr{width:160px;height:160px;display:block;border-radius:8px}",
  ".mp-qr-card .mp-copy-link{width:100%;justify-content:center}",
  ".mp-qr-wrap{display:flex;align-items:center;justify-content:center;padding:12px;border-radius:12px;background:var(--dsw-alias-bg-base)}",
  ".mp-qr{display:block;width:184px;height:184px}",
  ".mp-expired{margin:0;color:var(--dsw-alias-state-error-primary);font-size:13px}",
  ".mp-expiry{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px}",
  ".mp-pair-code-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;box-sizing:border-box;padding:10px 14px;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-base);animation:mpBannerIn .32s ease}",
  "@keyframes mpBannerIn{from{opacity:0;transform:translateY(5px) scale(.99)}to{opacity:1;transform:none}}",
  ".mp-pair-code-info{display:flex;flex-direction:column;gap:2px}",
  ".mp-pair-code-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary)}",
  ".mp-pair-code-desc{font-size:11px;color:var(--dsw-alias-label-tertiary)}",
  ".mp-pair-code-display{display:flex;align-items:center;gap:8px;flex:none}",
  ".mp-pair-code-val{font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:18px;font-weight:700;letter-spacing:2px;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover);padding:2px 8px;border-radius:6px}",
  ".mp-hint{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px}",
  ".mp-link{display:block;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-caption);font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px}",
  ".mp-pair-links{display:flex;flex-direction:column;gap:8px}",
  ".mp-pair-link-row{display:flex;align-items:center;gap:10px;min-width:0;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}",
  ".mp-pair-link-text{min-width:0;flex:1}",
  ".mp-pair-link-label{display:block;margin-bottom:3px;color:var(--dsw-alias-label-secondary);font-size:12px}",
  ".mp-copy-link{display:inline-flex;flex:none;align-items:center;gap:5px;min-height:30px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-button-elevated-fill);color:var(--dsw-alias-label-primary);font-size:13px;cursor:pointer;white-space:nowrap;transition:background-color 120ms ease,border-color 120ms ease,box-shadow 120ms ease}",
  ".mp-copy-link:hover:not(:disabled){background:var(--dsw-alias-button-floating-hover)}",
  ".mp-copy-link:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}",
  ".mp-copy-link:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2),0 0 0 4px var(--dsw-alias-brand-primary)}",
  ".mp-copy-link:disabled{opacity:.55;cursor:default}",
  ".mp-one-time-hint{margin:0;color:var(--dsw-alias-label-caption);font-size:12px}",
  ".mp-stopped-hint{margin:0;color:var(--dsw-alias-state-error-primary);font-size:13px}",
  ".mp-addresses{margin:12px 0 0;padding:0;border:none}",
  ".mp-addresses legend{padding:0;color:var(--dsw-alias-label-secondary);font-size:13px}",
  ".mp-address{display:flex;align-items:center;gap:8px;margin-top:6px;padding:4px 6px;border-radius:6px;color:var(--dsw-alias-label-primary);font-size:13px;font-variant-numeric:tabular-nums;cursor:pointer;transition:background-color 120ms ease}",
  ".mp-address:hover{background:var(--dsw-alias-interactive-bg-hover)}",
  ".mp-address input:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2),0 0 0 4px var(--dsw-alias-brand-primary);border-radius:50%}",
  ".mp-address-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px}",
  ".mp-address-hint{margin:6px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px}",
  ".mp-actions{display:flex;gap:8px}",
  ".mp-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-button-elevated-fill);color:var(--dsw-alias-label-primary);font-size:13px;cursor:pointer;white-space:nowrap;transition:background-color 120ms ease,border-color 120ms ease,box-shadow 120ms ease}",
  ".mp-action:hover:not(:disabled){background:var(--dsw-alias-button-floating-hover)}",
  ".mp-action:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}",
  ".mp-action:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2),0 0 0 4px var(--dsw-alias-brand-primary)}",
  ".mp-action:disabled{opacity:.5;cursor:default}",
  ".mp-devices{display:flex;flex-direction:column;gap:8px;padding:12px 16px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-1)}",
  ".mp-devices-title{margin:0;font-size:13px;font-weight:500;line-height:20px}",
  ".mp-devices-empty{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px}",
  ".mp-device-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}",
  ".mp-device-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}",
  ".mp-device-meta{min-width:0;display:flex;flex-direction:column;gap:2px}",
  ".mp-device-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500}",
  ".mp-device-presence{font-size:12px;line-height:18px}",
  ".mp-device-online{color:var(--dsw-alias-state-success-primary)}",
  ".mp-device-offline{color:var(--dsw-alias-label-secondary)}",
  ".mp-device-seen{color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}",
  ".mp-device-revoke{flex:none;border:none;border-radius:8px;padding:6px 10px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;transition:background-color 120ms ease,color 120ms ease}",
  ".mp-device-revoke:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
  ".mp-device-revoke:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2),0 0 0 4px var(--dsw-alias-brand-primary)}",
  ".mp-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:13px}",
  ".mp-note{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
  "@media (prefers-reduced-motion: reduce){.mp-trigger,.mp-close,.mp-copy-link,.mp-action,.mp-address,.mp-device-revoke{transition:none}}"
].join("");
if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="dsh-mobile-plus/ui.css"]') === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-mobile-plus";
  tag.dataset.pluginCss = "dsh-mobile-plus/ui.css";
  tag.textContent = MP_CSS;
  document.head.appendChild(tag);
}
var h = React.createElement;
function IconClose16({ size = 14 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    h("path", { d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" })
  );
}
function IconCopy16({ size = 14 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    h("rect", { x: 5.5, y: 5.5, width: 8, height: 8, rx: 1.8, stroke: "currentColor", strokeWidth: 1.3 }),
    h("path", { d: "M10.5 3.5v-.2A1.8 1.8 0 0 0 8.7 1.5H4.3a1.8 1.8 0 0 0-1.8 1.8v4.4a1.8 1.8 0 0 0 1.8 1.8h.2", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" })
  );
}
function IconRefresh16({ size = 14 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    h("path", { d: "M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.9v2.6h-2.6", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function IconStop16({ size = 14 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": "true" },
    h("rect", { x: 4, y: 4, width: 8, height: 8, rx: 1.6, fill: "currentColor" })
  );
}
function RemoteLogo({ size = 18 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
    h("rect", { x: 3.2, y: 1.55, width: 7.4, height: 12.9, rx: 1.7, stroke: "currentColor", strokeWidth: 1.3 }),
    h("path", { d: "M5.55 3.2h2.7", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" }),
    h("path", { d: "M5.75 12.85h2.3", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" }),
    h("path", { d: "M12.35 5.1c1.4 1.05 1.4 4.75 0 5.8", stroke: "currentColor", strokeWidth: 1.25, strokeLinecap: "round" }),
    h("path", { d: "M11.3 6.35c.78.7.78 2.6 0 3.3", stroke: "currentColor", strokeWidth: 1.25, strokeLinecap: "round" })
  );
}
function deviceNameFromUserAgent(userAgent) {
  if (userAgent === void 0 || userAgent === null || String(userAgent).trim() === "") return void 0;
  const os = /Windows NT/i.test(userAgent) ? "Windows" : /Android/i.test(userAgent) ? "Android" : /iPhone|iPad|iPod/i.test(userAgent) ? "iOS" : /Macintosh|Mac OS X/i.test(userAgent) ? "macOS" : /Linux/i.test(userAgent) ? "Linux" : void 0;
  const browser = /Edg(?:A|iOS)?\//i.test(userAgent) ? "Edge" : /(?:OPR|Opera)\//i.test(userAgent) ? "Opera" : /(?:Chrome|CriOS)\//i.test(userAgent) ? "Chrome" : /(?:Firefox|FxiOS)\//i.test(userAgent) ? "Firefox" : /Safari\//i.test(userAgent) && /Version\//i.test(userAgent) ? "Safari" : void 0;
  if (os !== void 0 && browser !== void 0) return `${os} \xB7 ${browser}`;
  return os ?? browser;
}
function formatClock(epochMs) {
  const date = new Date(epochMs);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
function formatLastSeen(epochMs) {
  const date = new Date(epochMs);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} ${formatClock(epochMs)}`;
}
async function copyText(text) {
  if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
async function issuePair() {
  const res = await fetch("/mp/pair/issue", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.code || "issue failed");
  return data;
}
async function pairStatus() {
  try {
    const res = await fetch("/mp/pair/status", { credentials: "same-origin" });
    const data = await res.json();
    return {
      deviceCount: typeof data.deviceCount === "number" ? data.deviceCount : 0,
      onlineCount: typeof data.onlineCount === "number" ? data.onlineCount : 0,
      devices: Array.isArray(data.devices) ? data.devices : [],
      paired: data.paired === true
    };
  } catch {
    return { deviceCount: 0, onlineCount: 0, devices: [], paired: false };
  }
}
async function stopPair() {
  const res = await fetch("/mp/pair/stop", { method: "POST" });
  if (!res.ok) throw new Error(`stop failed with ${res.status}`);
}
async function revokePair(deviceId) {
  const res = await fetch("/mp/pair/revoke", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ deviceId })
  });
  if (res.status === 404) return;
  if (!res.ok) throw new Error(`revoke failed with ${res.status}`);
}
function statusOf(status, stopped) {
  if (stopped) return { text: "\u5DF2\u505C\u6B62\u8FDC\u7A0B\u8BBF\u95EE", tone: "stopped" };
  if (status.deviceCount > 0) {
    return status.onlineCount > 0 ? { text: `\u5DF2\u8FDE\u63A5 ${status.onlineCount} \u53F0\u8BBE\u5907`, tone: "connected" } : { text: "\u5DF2\u914D\u5BF9\u8BBE\u5907\u79BB\u7EBF", tone: "disconnected" };
  }
  return { text: "\u7B49\u5F85\u8BBE\u5907\u8FDE\u63A5", tone: "waiting" };
}
function MpPanel(props) {
  const {
    issue,
    status,
    stopped,
    expired,
    copied,
    busy,
    error,
    onClose,
    onRefresh,
    onStop,
    onCopy,
    onRevoke
  } = props;
  const badge = statusOf(status, stopped);
  const hasPublic = typeof issue.publicBaseUrl === "string" && issue.publicBaseUrl !== "";
  const hasLan = typeof issue.lanUrl === "string" && issue.lanUrl !== "";
  const publicOrigin = (() => {
    try {
      return new URL(issue.url).origin;
    } catch {
      return issue.publicBaseUrl || "";
    }
  })();
  const lanOrigin = (() => {
    try {
      return new URL(issue.lanUrl || issue.localUrl).origin;
    } catch {
      return issue.lanIp || "";
    }
  })();
  return h(
    "div",
    { className: "mp-panel", role: "dialog", "aria-modal": "true", "aria-label": "\u624B\u673A\u8FDC\u7A0B" },
    h(
      "div",
      { className: "mp-header" },
      h(
        "div",
        { className: "mp-heading" },
        h("h2", { className: "mp-title" }, ["\u624B\u673A\u8FDC\u7A0B"]),
        h("p", { className: "mp-subtitle" }, ["\u72EC\u7ACB\u63D2\u4EF6 \xB7 \u652F\u6301\u6587\u5B57\u4E0E\u6587\u4EF6\u4F20\u8F93"])
      ),
      h(
        "button",
        { type: "button", className: "mp-close", "aria-label": "\u5173\u95ED\u624B\u673A\u8FDC\u7A0B\u9762\u677F", onClick: onClose },
        h(IconClose16, { size: 14 })
      )
    ),
    h(
      "div",
      { className: "mp-card" },
      h(
        "div",
        { className: "mp-card-header" },
        h("span", { className: "mp-card-title" }, ["\u626B\u7801\u914D\u5BF9\u624B\u673A"]),
        h(
          "span",
          { className: "mp-badges" },
          hasPublic && hasLan ? h("span", { className: "mp-badge mp-badge-public" }, ["\u53CC\u901A\u9053\u5DF2\u5C31\u7EEA"]) : hasPublic ? h("span", { className: "mp-badge mp-badge-public" }, ["\u516C\u7F51\u5C31\u7EEA"]) : h("span", { className: "mp-badge mp-badge-public" }, ["\u5C40\u57DF\u7F51\u5C31\u7EEA"]),
          h("span", { className: `mp-badge mp-badge-${badge.tone}` }, [badge.text])
        )
      ),
      h(
        "div",
        { className: "mp-qr-grid" },
        hasPublic ? h(
          "div",
          { className: "mp-qr-card" },
          h(
            "div",
            { className: "mp-qr-card-header" },
            h("span", { className: "mp-qr-card-title" }, ["\u{1F310} \u516C\u7F51\u8FDC\u7A0B"]),
            h("span", { className: "mp-qr-card-desc" }, ["\u9002\u5408\u5916\u51FA / 4G / \u9152\u5E97"]),
            h("code", { className: "mp-card-origin", title: publicOrigin }, [publicOrigin])
          ),
          h("img", { className: "mp-qr", src: issue.qr, alt: "\u516C\u7F51\u8FDC\u7A0B\u914D\u5BF9\u4E8C\u7EF4\u7801" }),
          h("button", {
            type: "button",
            className: "mp-copy-link",
            disabled: copied === "public",
            onClick: () => onCopy("public", issue.url)
          }, [
            h(IconCopy16, { size: 14 }),
            copied === "public" ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u516C\u7F51\u94FE\u63A5"
          ])
        ) : null,
        hasLan ? h(
          "div",
          { className: "mp-qr-card" },
          h(
            "div",
            { className: "mp-qr-card-header" },
            h("span", { className: "mp-qr-card-title" }, ["\u{1F7E2} \u5C40\u57DF\u7F51\u6781\u901F"]),
            h("span", { className: "mp-qr-card-desc" }, ["\u9002\u5408\u540C Wi-Fi / \u70ED\u70B9"]),
            h("code", { className: "mp-card-origin", title: lanOrigin }, [lanOrigin])
          ),
          h("img", { className: "mp-qr", src: issue.qrLan || issue.qrLocal, alt: "\u5C40\u57DF\u7F51\u6781\u901F\u914D\u5BF9\u4E8C\u7EF4\u7801" }),
          h("button", {
            type: "button",
            className: "mp-copy-link",
            disabled: copied === "lan",
            onClick: () => onCopy("lan", issue.lanUrl || issue.localUrl)
          }, [
            h(IconCopy16, { size: 14 }),
            copied === "lan" ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u5C40\u57DF\u7F51\u94FE\u63A5"
          ])
        ) : null
      ),
      issue.fixedPairCode ? h(
        "div",
        { className: "mp-pair-code-banner" },
        h(
          "div",
          { className: "mp-pair-code-info" },
          h("span", { className: "mp-pair-code-title" }, ["\u56FA\u5B9A\u914D\u5BF9\u7801\uFF08\u957F\u671F\u6709\u6548\uFF09"]),
          h("span", { className: "mp-pair-code-desc" }, ["\u91CD\u542F\u670D\u52A1\u4E0D\u7528\u6362\u7801\uFF1B\u624B\u673A\u8F93\u4E00\u6B21\u540E\u81EA\u52A8\u8BB0\u4F4F\u5E76\u9759\u9ED8\u91CD\u914D"])
        ),
        h(
          "div",
          { className: "mp-pair-code-display" },
          h("code", { className: "mp-pair-code-val" }, [issue.fixedPairCode]),
          h("button", {
            type: "button",
            className: "mp-copy-link",
            style: { padding: "0 10px", minHeight: "28px", fontSize: "12px" },
            disabled: copied === "fixed",
            onClick: () => onCopy("fixed", issue.fixedPairCode)
          }, [
            h(IconCopy16, { size: 12 }),
            copied === "fixed" ? "\u5DF2\u590D\u5236" : "\u590D\u5236"
          ])
        )
      ) : issue.code && !expired && !stopped ? h(
        "div",
        { className: "mp-pair-code-banner" },
        h(
          "div",
          { className: "mp-pair-code-info" },
          h("span", { className: "mp-pair-code-title" }, ["\u624B\u673A\u5DF2\u6253\u5F00\u9875\u9762\uFF1F\u8F93\u5165 6 \u4F4D\u914D\u5BF9\u7801"]),
          h("span", { className: "mp-pair-code-desc" }, ["\u5728\u624B\u673A\u8BBE\u5907\u914D\u5BF9\u9875\u76F4\u63A5\u8F93\u5165\u6B64\u6570\u5B57\uFF0C\u65E0\u9700\u590D\u5236\u957F\u94FE\u63A5"])
        ),
        h(
          "div",
          { className: "mp-pair-code-display" },
          h("code", { className: "mp-pair-code-val" }, [
            issue.code.length === 6 ? `${issue.code.slice(0, 3)} ${issue.code.slice(3)}` : issue.code
          ]),
          h("button", {
            type: "button",
            className: "mp-copy-link",
            style: { padding: "0 10px", minHeight: "28px", fontSize: "12px" },
            disabled: copied === "code",
            onClick: () => onCopy("code", issue.code)
          }, [
            h(IconCopy16, { size: 12 }),
            copied === "code" ? "\u5DF2\u590D\u5236" : "\u590D\u5236"
          ])
        )
      ) : null,
      expired ? h("p", { className: "mp-expired" }, ["\u4E8C\u7EF4\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5237\u65B0"]) : issue.fixedPairCode ? null : h("p", { className: "mp-expiry" }, [`\u4E8C\u7EF4\u7801\u6709\u6548\u81F3 ${formatClock(issue.expiresAt)} \xB7 \u4E00\u6B21\u6027\u4EE4\u724C`])
    ),
    h(
      "div",
      { className: "mp-pair-links" },
      h(
        "div",
        { className: "mp-pair-link-row" },
        h(
          "div",
          { className: "mp-pair-link-text" },
          h("span", { className: "mp-pair-link-label" }, ["\u7535\u8111\u672C\u673A\u8C03\u8BD5\u94FE\u63A5"]),
          h("code", { className: "mp-link", title: issue.localUrl }, [issue.localUrl])
        ),
        h(
          "button",
          { type: "button", className: "mp-copy-link", disabled: copied === "desktop", onClick: () => onCopy("desktop", issue.localUrl) },
          h(IconCopy16, { size: 14 }),
          [copied === "desktop" ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u7535\u8111\u94FE\u63A5"]
        )
      )
    ),
    stopped ? h("p", { className: "mp-stopped-hint" }, ['\u5DF2\u505C\u6B62\u8FDC\u7A0B\u8BBF\u95EE\u3002\u70B9\u51FB"\u5237\u65B0\u4E8C\u7EF4\u7801"\u91CD\u65B0\u5F00\u542F\u3002']) : null,
    h(
      "div",
      { className: "mp-actions" },
      h(
        "button",
        { type: "button", className: "mp-action", disabled: busy || stopped, onClick: onStop },
        h(IconStop16, { size: 14 }),
        ["\u505C\u6B62"]
      ),
      h(
        "button",
        { type: "button", className: "mp-action", disabled: busy, onClick: onRefresh },
        h(IconRefresh16, { size: 14 }),
        ["\u5237\u65B0\u4E8C\u7EF4\u7801"]
      )
    ),
    h(
      "section",
      { className: "mp-devices", "aria-label": "\u5DF2\u6388\u6743\u8BBE\u5907" },
      h("h3", { className: "mp-devices-title" }, ["\u5DF2\u6388\u6743\u8BBE\u5907"]),
      status.devices.length === 0 ? h("p", { className: "mp-devices-empty" }, ["\u8FD8\u6CA1\u6709\u5DF2\u914D\u5BF9\u7684\u8BBE\u5907\u3002\u626B\u7801\u6216\u6253\u5F00\u94FE\u63A5\u540E\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002"]) : h(
        "ul",
        { className: "mp-device-list" },
        status.devices.map((device) => h(
          "li",
          { key: device.id, className: "mp-device-row" },
          h(
            "div",
            { className: "mp-device-meta" },
            h("span", { className: "mp-device-name" }, [deviceNameFromUserAgent(device.userAgent) ?? "\u672A\u77E5\u8BBE\u5907"]),
            h(
              "span",
              { className: `mp-device-presence ${device.online ? "mp-device-online" : "mp-device-offline"}` },
              [device.online ? "\u5728\u7EBF" : "\u79BB\u7EBF"]
            ),
            h("span", { className: "mp-device-seen" }, [`\u6700\u8FD1\u6D3B\u52A8 ${formatLastSeen(device.lastSeenAt)}`])
          ),
          h("button", {
            type: "button",
            className: "mp-device-revoke",
            "aria-label": "\u53D6\u6D88\u914D\u5BF9\u6B64\u8BBE\u5907",
            onClick: () => {
              onRevoke(device.id);
            }
          }, ["\u53D6\u6D88\u914D\u5BF9"])
        ))
      )
    ),
    error ? h("p", { className: "mp-error" }, [error]) : null,
    h("p", { className: "mp-note" }, ["\u624B\u673A\u7AEF\u53D1\u9001\u7684\u6587\u4EF6\u4F1A\u5199\u5165\u5DE5\u4F5C\u533A\u7684 .dsh-mobile-inbox/\uFF0C\u4F1A\u8BDD\u91CC\u53EA\u5E26\u672C\u673A\u8DEF\u5F84"])
  );
}
function MpEntry({ wide }) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [issue, setIssue] = React.useState(null);
  const [stopped, setStopped] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [status, setStatus] = React.useState({ deviceCount: 0, onlineCount: 0, devices: [], paired: false });
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState("");
  const mint = React.useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const data = await issuePair();
      setIssue(data);
      setStopped(false);
      setExpired(Date.now() > data.expiresAt);
    } catch (err) {
      setError(String(err?.message || err));
      setIssue(null);
    } finally {
      setBusy(false);
    }
  }, []);
  const openPanel = React.useCallback(() => {
    setOpen(true);
    void mint();
  }, [mint]);
  const closePanel = React.useCallback(() => setOpen(false), []);
  const handleCopy = React.useCallback((key, url) => {
    void copyText(url).then((ok) => {
      if (!ok) return;
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1500);
    });
  }, []);
  const handleStop = React.useCallback(() => {
    void stopPair().catch(() => {
    });
    setStopped(true);
    setStatus((previous) => ({ ...previous, deviceCount: 0, onlineCount: 0, devices: [] }));
  }, []);
  const handleRevoke = React.useCallback((deviceId) => {
    void revokePair(deviceId).catch(() => {
    });
    setStatus((previous) => ({
      ...previous,
      devices: previous.devices.filter((device) => device.id !== deviceId),
      deviceCount: Math.max(0, previous.deviceCount - 1)
    }));
  }, []);
  React.useEffect(() => {
    if (!open) return void 0;
    const timer = window.setInterval(() => {
      void pairStatus().then(setStatus);
    }, 3e3);
    void pairStatus().then(setStatus);
    return () => {
      window.clearInterval(timer);
    };
  }, [open]);
  React.useEffect(() => {
    if (issue === null) return void 0;
    if (expired) return void 0;
    const delay = issue.expiresAt - Date.now();
    if (delay <= 0) {
      setExpired(true);
      return void 0;
    }
    const timer = window.setTimeout(() => setExpired(true), delay);
    return () => {
      window.clearTimeout(timer);
    };
  }, [issue, expired]);
  const overlay = open ? h(
    "div",
    { className: "mp-overlay", role: "presentation" },
    h("div", { className: "mp-mask", "aria-hidden": "true", onClick: closePanel }),
    issue ? h(MpPanel, {
      issue,
      status,
      stopped,
      expired,
      copied,
      busy,
      error,
      onClose: closePanel,
      onRefresh: mint,
      onStop: handleStop,
      onCopy: handleCopy,
      onRevoke: handleRevoke
    }) : h(
      "div",
      { className: "mp-panel", role: "dialog", "aria-modal": "true", "aria-label": "\u624B\u673A\u8FDC\u7A0B" },
      h(
        "div",
        { className: "mp-header" },
        h(
          "div",
          { className: "mp-heading" },
          h("h2", { className: "mp-title" }, ["\u624B\u673A\u8FDC\u7A0B"]),
          h("p", { className: "mp-subtitle" }, ["\u72EC\u7ACB\u63D2\u4EF6 \xB7 \u652F\u6301\u6587\u5B57\u4E0E\u6587\u4EF6"])
        ),
        h(
          "button",
          { type: "button", className: "mp-close", "aria-label": "\u5173\u95ED\u624B\u673A\u8FDC\u7A0B\u9762\u677F", onClick: closePanel },
          h(IconClose16, { size: 14 })
        )
      ),
      error ? h("p", { className: "mp-error" }, [error]) : null,
      h(
        "div",
        { className: "mp-actions" },
        h(
          "button",
          { type: "button", className: "mp-action", disabled: busy, onClick: mint },
          h(IconRefresh16, { size: 14 }),
          [busy ? "\u751F\u6210\u4E2D\u2026" : "\u751F\u6210\u914D\u5BF9\u94FE\u63A5"]
        )
      )
    )
  ) : null;
  return h(
    "div",
    { className: "mp-entry", style: { display: "contents" } },
    h("button", {
      type: "button",
      className: wide === false ? "mp-trigger" : "mp-trigger mp-trigger-wide",
      "aria-label": "\u624B\u673A\u8FDC\u7A0B",
      "aria-expanded": open,
      title: "\u624B\u673A\u8FDC\u7A0B",
      onClick: openPanel
    }, h(RemoteLogo, { size: 18 })),
    overlay && typeof document !== "undefined" && document.body && typeof import_react_dom3.createPortal === "function" ? (0, import_react_dom3.createPortal)(overlay, document.body) : overlay
  );
}
function apply(ctx) {
  ctx.slots.inject("sidebar.footer.action", () => {
    let dispose;
    try {
      dispose = ctx.slots.register({ name: "sidebar.footer.action", id: "dsh-mobile-plus" }, MpEntry);
    } catch {
      dispose = void 0;
    }
    return () => {
      if (dispose) dispose();
    };
  });
}

// src/client/shell-hot.ts
var HOT_ROUTE = "/api/dsh-done-pill/shell-hot";
var RECT_POLL_MS = 200;
var COOLDOWN_MS = 5e3;
var STRIP_H = 28;
function startShellHotReporter() {
  let stopped = false;
  let lastCursor = null;
  let lastPost = null;
  let coolingUntil = 0;
  function shellRect() {
    const el = document.querySelector(".dsh-done-pill-shell");
    if (el === null) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) };
  }
  async function post(state) {
    if (Date.now() < coolingUntil) return;
    try {
      const res = await fetch(HOT_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      coolingUntil = 0;
    } catch {
      coolingUntil = Date.now() + COOLDOWN_MS;
    }
  }
  function tick() {
    if (stopped) return;
    const rect = shellRect();
    let over = false;
    if (rect !== null && lastCursor !== null) {
      over = lastCursor.x >= rect.x && lastCursor.x < rect.x + rect.w && lastCursor.y >= rect.y && lastCursor.y < rect.y + rect.h;
    }
    const overlapStrip = rect !== null && rect.y < STRIP_H && rect.y + rect.h > 0;
    const rects = rect !== null && (over || overlapStrip) ? [rect] : [];
    const next = JSON.stringify({ over, rects });
    if (next === lastPost) return;
    lastPost = next;
    void post({ over, rects });
  }
  function onMouseMove(event) {
    lastCursor = { x: event.clientX, y: event.clientY };
    tick();
  }
  function onMouseLeave() {
    lastCursor = null;
    tick();
  }
  document.addEventListener("mousemove", onMouseMove, { capture: true, passive: true });
  document.addEventListener("mouseleave", onMouseLeave, { capture: true, passive: true });
  const timer = window.setInterval(tick, RECT_POLL_MS);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    document.removeEventListener("mousemove", onMouseMove, { capture: true });
    document.removeEventListener("mouseleave", onMouseLeave, { capture: true });
    const cleared = JSON.stringify({ over: false, rects: [] });
    if (lastPost !== null && lastPost !== cleared) void post({ over: false, rects: [] });
    lastPost = cleared;
  };
}

// src/client/index.ts
var inject = ["slots"];
function guarded(ctx, label, mount) {
  try {
    mount();
  } catch (error) {
    console.warn(`[dsh-companion] ${label} \u6302\u8F7D\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`);
  }
}
function apply2(ctx) {
  guarded(ctx, "done pill", () => applyDonePill(ctx));
  guarded(ctx, "mobile entry", () => apply(ctx));
  guarded(ctx, "shell hot reporter", () => {
    startShellHotReporter();
  });
}
return module.exports; } });
//# sourceMappingURL=client.js.map
