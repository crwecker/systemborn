var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// netlify/functions/react-router-server.js
import { createRequestHandler } from "@react-router/node";

// build/server/index.js
var server_exports = {};
__export(server_exports, {
  assets: () => serverManifest,
  assetsBuildDirectory: () => assetsBuildDirectory,
  basename: () => basename,
  entry: () => entry,
  future: () => future,
  isSpaMode: () => isSpaMode,
  prerender: () => prerender,
  publicPath: () => publicPath,
  routeDiscovery: () => routeDiscovery,
  routes: () => routes,
  ssr: () => ssr
});
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, Meta, Links, Outlet, ScrollRestoration, Scripts, data } from "react-router";

// node_modules/isbot/index.mjs
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : String(i);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");
  return _classApplyDescriptorGet(receiver, descriptor);
}
function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
  _classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}
function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }
  return privateMap.get(receiver);
}
function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}
function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
  }
}
function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  return fn;
}
function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}
function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);
  privateMap.set(obj, value);
}
function _classPrivateMethodInitSpec(obj, privateSet) {
  _checkPrivateRedeclaration(obj, privateSet);
  privateSet.add(obj);
}
var list = [
  " daum[ /]",
  " deusu/",
  " yadirectfetcher",
  "(?:^| )site",
  "(?:^|[^g])news",
  "@[a-z]",
  "\\(at\\)[a-z]",
  "\\(github\\.com/",
  "\\[at\\][a-z]",
  "^12345",
  "^<",
  "^[\\w \\.\\-\\(\\)]+(/v?\\d+(\\.\\d+)?(\\.\\d{1,10})?)?$",
  "^[^ ]{50,}$",
  "^active",
  "^ad muncher",
  "^amaya",
  "^anglesharp/",
  "^anonymous",
  "^avsdevicesdk/",
  "^axios/",
  "^bidtellect/",
  "^biglotron",
  "^btwebclient/",
  "^castro",
  "^clamav[ /]",
  "^client/",
  "^cobweb/",
  "^coccoc",
  "^custom",
  "^ddg[_-]android",
  "^discourse",
  "^dispatch/\\d",
  "^downcast/",
  "^duckduckgo",
  "^facebook",
  "^fdm[ /]\\d",
  "^getright/",
  "^gozilla/",
  "^hatena",
  "^hobbit",
  "^hotzonu",
  "^hwcdn/",
  "^jeode/",
  "^jetty/",
  "^jigsaw",
  "^linkdex",
  "^lwp[-: ]",
  "^metauri",
  "^microsoft bits",
  "^movabletype",
  "^mozilla/\\d\\.\\d \\(compatible;?\\)$",
  "^mozilla/\\d\\.\\d \\w*$",
  "^navermailapp",
  "^netsurf",
  "^offline explorer",
  "^php",
  "^postman",
  "^postrank",
  "^python",
  "^read",
  "^reed",
  "^restsharp/",
  "^snapchat",
  "^space bison",
  "^svn",
  "^swcd ",
  "^taringa",
  "^test certificate info",
  "^thumbor/",
  "^tumblr/",
  "^user-agent:mozilla",
  "^valid",
  "^venus/fedoraplanet",
  "^w3c",
  "^webbandit/",
  "^webcopier",
  "^wget",
  "^whatsapp",
  "^xenu link sleuth",
  "^yahoo",
  "^yandex",
  "^zdm/\\d",
  "^zoom marketplace/",
  "^{{.*}}$",
  "adbeat\\.com",
  "appinsights",
  "archive",
  "ask jeeves/teoma",
  "bit\\.ly/",
  "bluecoat drtr",
  "bot",
  "browsex",
  "burpcollaborator",
  "capture",
  "catch",
  "check",
  "chrome-lighthouse",
  "chromeframe",
  "cloud",
  "crawl",
  "cryptoapi",
  "dareboost",
  "datanyze",
  "dataprovider",
  "dejaclick",
  "dmbrowser",
  "download",
  "evc-batch/",
  "feed",
  "firephp",
  "freesafeip",
  "gomezagent",
  "google",
  "headlesschrome/",
  "http",
  "httrack",
  "hubspot marketing grader",
  "hydra",
  "ibisbrowser",
  "images",
  "inspect",
  "iplabel",
  "ips-agent",
  "java",
  "library",
  "mail\\.ru/",
  "manager",
  "monitor",
  "morningscore/",
  "neustar wpm",
  "nutch",
  "offbyone",
  "optimize",
  "pageburst",
  "pagespeed",
  "perl",
  "phantom",
  "pingdom",
  "powermarks",
  "preview",
  "proxy",
  "ptst[ /]\\d",
  "reader",
  "rexx;",
  "rigor",
  "rss",
  "scan",
  "scrape",
  "search",
  "serp ?reputation ?management",
  "server",
  "sogou",
  "sparkler/",
  "speedcurve",
  "spider",
  "splash",
  "statuscake",
  "stumbleupon\\.com",
  "supercleaner",
  "synapse",
  "synthetic",
  "torrent",
  "tracemyfile",
  "transcoder",
  "trendsmapresolver",
  "twingly recon",
  "url",
  "virtuoso",
  "wappalyzer",
  "webglance",
  "webkit2png",
  "websitemetadataretriever",
  "whatcms/",
  "wordpress",
  "zgrab"
];
function amend(list2) {
  try {
    new RegExp("(?<! cu)bot").test("dangerbot");
  } catch (error) {
    return list2;
  }
  [
    // Addresses: Cubot device
    ["bot", "(?<! cu)bot"],
    // Addresses: Android webview
    ["google", "(?<! (?:channel/|google/))google(?!(app|/google| pixel))"],
    // Addresses: libhttp browser
    ["http", "(?<!(?:lib))http"],
    // Addresses: java based browsers
    ["java", "java(?!;)"],
    // Addresses: Yandex Search App
    ["search", "(?<! ya(?:yandex)?)search"]
  ].forEach(function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2), search = _ref2[0], replace = _ref2[1];
    var index = list2.lastIndexOf(search);
    if (~index) {
      list2.splice(index, 1, replace);
    }
  });
  return list2;
}
amend(list);
var flags = "i";
var _list = /* @__PURE__ */ new WeakMap();
var _pattern = /* @__PURE__ */ new WeakMap();
var _update = /* @__PURE__ */ new WeakSet();
var _index = /* @__PURE__ */ new WeakSet();
var Isbot = /* @__PURE__ */ function() {
  function Isbot2(patterns) {
    var _this = this;
    _classCallCheck(this, Isbot2);
    _classPrivateMethodInitSpec(this, _index);
    _classPrivateMethodInitSpec(this, _update);
    _classPrivateFieldInitSpec(this, _list, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _pattern, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _list, patterns || list.slice());
    _classPrivateMethodGet(this, _update, _update2).call(this);
    var isbot2 = function isbot3(ua) {
      return _this.test(ua);
    };
    return Object.defineProperties(isbot2, Object.entries(Object.getOwnPropertyDescriptors(Isbot2.prototype)).reduce(function(accumulator, _ref) {
      var _ref2 = _slicedToArray(_ref, 2), prop = _ref2[0], descriptor = _ref2[1];
      if (typeof descriptor.value === "function") {
        Object.assign(accumulator, _defineProperty({}, prop, {
          value: _this[prop].bind(_this)
        }));
      }
      if (typeof descriptor.get === "function") {
        Object.assign(accumulator, _defineProperty({}, prop, {
          get: function get() {
            return _this[prop];
          }
        }));
      }
      return accumulator;
    }, {}));
  }
  _createClass(Isbot2, [{
    key: "pattern",
    get: (
      /**
       * Get a clone of the pattern
       * @type RegExp
       */
      function get() {
        return new RegExp(_classPrivateFieldGet(this, _pattern));
      }
    )
    /**
     * Match given string against out pattern
     * @param  {string} ua User Agent string
     * @returns {boolean}
     */
  }, {
    key: "test",
    value: function test(ua) {
      return Boolean(ua) && _classPrivateFieldGet(this, _pattern).test(ua);
    }
  }, {
    key: "isbot",
    value: function isbot2(ua) {
      return Boolean(ua) && _classPrivateFieldGet(this, _pattern).test(ua);
    }
    /**
     * Get the match for strings' known crawler pattern
     * @param  {string} ua User Agent string
     * @returns {string|null}
     */
  }, {
    key: "find",
    value: function find() {
      var ua = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      var match = ua.match(_classPrivateFieldGet(this, _pattern));
      return match && match[0];
    }
    /**
     * Get the patterns that match user agent string if any
     * @param  {string} ua User Agent string
     * @returns {string[]}
     */
  }, {
    key: "matches",
    value: function matches() {
      var ua = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return _classPrivateFieldGet(this, _list).filter(function(entry2) {
        return new RegExp(entry2, flags).test(ua);
      });
    }
    /**
     * Clear all patterns that match user agent
     * @param  {string} ua User Agent string
     * @returns {void}
     */
  }, {
    key: "clear",
    value: function clear() {
      var ua = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      this.exclude(this.matches(ua));
    }
    /**
     * Extent patterns for known crawlers
     * @param  {string[]} filters
     * @returns {void}
     */
  }, {
    key: "extend",
    value: function extend() {
      var _this2 = this;
      var filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      [].push.apply(_classPrivateFieldGet(this, _list), filters.filter(function(rule) {
        return _classPrivateMethodGet(_this2, _index, _index2).call(_this2, rule) === -1;
      }).map(function(filter) {
        return filter.toLowerCase();
      }));
      _classPrivateMethodGet(this, _update, _update2).call(this);
    }
    /**
     * Exclude patterns from bot pattern rule
     * @param  {string[]} filters
     * @returns {void}
     */
  }, {
    key: "exclude",
    value: function exclude() {
      var filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      var length = filters.length;
      while (length--) {
        var index = _classPrivateMethodGet(this, _index, _index2).call(this, filters[length]);
        if (index > -1) {
          _classPrivateFieldGet(this, _list).splice(index, 1);
        }
      }
      _classPrivateMethodGet(this, _update, _update2).call(this);
    }
    /**
     * Create a new Isbot instance using given list or self's list
     * @param  {string[]} [list]
     * @returns {Isbot}
     */
  }, {
    key: "spawn",
    value: function spawn(list2) {
      return new Isbot2(list2 || _classPrivateFieldGet(this, _list));
    }
  }]);
  return Isbot2;
}();
function _update2() {
  _classPrivateFieldSet(this, _pattern, new RegExp(_classPrivateFieldGet(this, _list).join("|"), flags));
}
function _index2(rule) {
  return _classPrivateFieldGet(this, _list).indexOf(rule.toLowerCase());
}
var isbot = new Isbot();

// build/server/index.js
import { renderToPipeableStream } from "react-dom/server";
import { createElement } from "react";
import { JSDOM } from "jsdom";
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, routerContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: request.url
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, routerContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: request.url
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
var entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
var styles = "/assets/tailwind-pZb04NcJ.css";
var links = () => [{
  rel: "stylesheet",
  href: styles
}];
var root = withComponentProps(function App() {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("title", {
        children: "System Born - Find Your Next LitRPG Adventure"
      })]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx("nav", {
        className: "bg-white shadow-sm",
        children: /* @__PURE__ */ jsx("div", {
          className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
          children: /* @__PURE__ */ jsx("div", {
            className: "flex justify-between h-16",
            children: /* @__PURE__ */ jsx("div", {
              className: "flex",
              children: /* @__PURE__ */ jsx("div", {
                className: "flex-shrink-0 flex items-center",
                children: /* @__PURE__ */ jsx("span", {
                  className: "text-2xl font-bold text-gray-900",
                  children: "System Born"
                })
              })
            })
          })
        })
      }), /* @__PURE__ */ jsx("main", {
        className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",
        children: /* @__PURE__ */ jsx(Outlet, {})
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
});
var route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
var ROYALROAD_BASE_URL = "https://www.royalroad.com";
async function getPopularBooks() {
  try {
    const response = await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated`);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const fictionElements = doc.querySelectorAll(".fiction-list-item");
    return Array.from(fictionElements).map((element) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const titleElement = element.querySelector(".fiction-title");
      const authorElement = element.querySelector(".author");
      const tagsElements = element.querySelectorAll(".tags a");
      const imageElement = element.querySelector("img");
      const descriptionElement = element.querySelector(".description");
      const statsElements = element.querySelectorAll(".stats .col-sm-6");
      const stats = {};
      statsElements.forEach((stat) => {
        var _a2, _b2, _c2;
        const label = (_b2 = (_a2 = stat.querySelector("label")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b2.trim().toLowerCase();
        const value = (_c2 = stat.textContent) == null ? void 0 : _c2.replace(label || "", "").trim();
        if (label && value) {
          stats[label] = value;
        }
      });
      return {
        title: ((_a = titleElement == null ? void 0 : titleElement.textContent) == null ? void 0 : _a.trim()) || "",
        author: {
          name: ((_b = authorElement == null ? void 0 : authorElement.textContent) == null ? void 0 : _b.trim()) || ""
        },
        tags: Array.from(tagsElements).map((tag) => {
          var _a2;
          return ((_a2 = tag.textContent) == null ? void 0 : _a2.trim()) || "";
        }),
        image: (imageElement == null ? void 0 : imageElement.getAttribute("src")) || "",
        description: ((_c = descriptionElement == null ? void 0 : descriptionElement.textContent) == null ? void 0 : _c.trim()) || "",
        stats: {
          followers: parseInt(((_d = stats["followers"]) == null ? void 0 : _d.replace(/,/g, "")) || "0", 10),
          pages: parseInt(((_e = stats["pages"]) == null ? void 0 : _e.replace(/,/g, "")) || "0", 10),
          views: {
            total: parseInt(((_f = stats["total views"]) == null ? void 0 : _f.replace(/,/g, "")) || "0", 10),
            average: 0
          },
          score: {
            total: parseFloat(((_g = stats["rating"]) == null ? void 0 : _g.split(" ")[0]) || "0"),
            average: parseFloat(((_h = stats["rating"]) == null ? void 0 : _h.split(" ")[0]) || "0")
          }
        }
      };
    });
  } catch (error) {
    console.error("Error fetching popular books:", error);
    return [];
  }
}
var loader = async ({
  request
}) => {
  try {
    const books = await getPopularBooks();
    return data({
      books
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return data({
      books: []
    });
  }
};
var _index3 = withComponentProps(function Index() {
  const {
    books
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-4xl font-bold text-gray-900",
        children: "Discover Your Next LitRPG Adventure"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-4 text-xl text-gray-600",
        children: "Explore popular LitRPG, GameLit, and Progression Fantasy stories"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      children: books.map((book, index) => {
        var _a;
        return /* @__PURE__ */ jsxs("div", {
          className: "book-card",
          children: [book.image && /* @__PURE__ */ jsx("img", {
            src: book.image,
            alt: `Cover of ${book.title}`,
            className: "w-full h-48 object-cover rounded-md mb-4"
          }), /* @__PURE__ */ jsx("h2", {
            className: "text-xl font-semibold text-gray-900 mb-2",
            children: book.title
          }), book.author && /* @__PURE__ */ jsxs("p", {
            className: "text-gray-600 mb-3",
            children: ["by ", book.author.name]
          }), /* @__PURE__ */ jsx("div", {
            className: "mb-4",
            children: book.tags.map((tag, tagIndex) => /* @__PURE__ */ jsx("span", {
              className: "tag-pill",
              children: tag
            }, tagIndex))
          }), book.description && /* @__PURE__ */ jsx("p", {
            className: "text-gray-700 line-clamp-3",
            children: book.description
          }), book.stats && /* @__PURE__ */ jsxs("div", {
            className: "mt-4 text-sm text-gray-600",
            children: [/* @__PURE__ */ jsxs("span", {
              className: "mr-3",
              children: ["\u2B50 ", ((_a = book.stats.score) == null ? void 0 : _a.average.toFixed(1)) || "N/A"]
            }), /* @__PURE__ */ jsxs("span", {
              className: "mr-3",
              children: ["\u{1F4D6} ", book.stats.pages || 0, " pages"]
            }), /* @__PURE__ */ jsxs("span", {
              children: ["\u{1F465} ", book.stats.followers || 0, " followers"]
            })]
          })]
        }, index);
      })
    })]
  });
});
var route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _index3,
  loader
}, Symbol.toStringTag, { value: "Module" }));
var serverManifest = { "entry": { "module": "/assets/entry.client-B17cVDRo.js", "imports": ["/assets/chunk-DQRVZFIR-D0kGGdEZ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-DuGV1_w9.js", "imports": ["/assets/chunk-DQRVZFIR-D0kGGdEZ.js", "/assets/with-props-Bgw30hHZ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": "/", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/_index-L22bVo82.js", "imports": ["/assets/with-props-Bgw30hHZ.js", "/assets/chunk-DQRVZFIR-D0kGGdEZ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-b31bf443.js", "version": "b31bf443", "sri": void 0 };
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
var publicPath = "/";
var entry = { module: entryServer };
var routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: "/",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  }
};

// netlify/functions/react-router-server.js
var requestHandler = createRequestHandler({
  build: server_exports,
  getLoadContext: async (_req, ctx) => ctx
});
var handler = async (event, context) => {
  try {
    let url;
    if (event.rawUrl) {
      url = event.rawUrl;
    } else if (event.headers?.host) {
      const protocol = event.headers["x-forwarded-proto"] || "https";
      const path = event.path || "/";
      const queryString = event.queryStringParameters ? "?" + new URLSearchParams(event.queryStringParameters).toString() : "";
      url = `${protocol}://${event.headers.host}${path}${queryString}`;
    } else {
      url = "http://localhost:8888/";
    }
    const request = new Request(url, {
      method: event.httpMethod || "GET",
      headers: new Headers(event.headers || {}),
      body: event.body && event.httpMethod !== "GET" ? event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body : void 0
    });
    const response = await requestHandler(request, context);
    if (response instanceof Response) {
      const body = await response.text();
      return {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body
      };
    }
    return response;
  } catch (error) {
    console.error("Serverless function error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: `Internal Server Error: ${error.message}`
    };
  }
};
export {
  handler
};
