"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(server_exports);
var import_remix_adapter = require("@netlify/remix-adapter");

// server-entry-module:@remix-run/dev/server-build
var server_build_exports = {};
__export(server_build_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  future: () => future,
  publicPath: () => publicPath,
  routes: () => routes
});

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_node_stream = require("node:stream"), import_node = require("@remix-run/node"), import_react = require("@remix-run/react"), import_isbot = require("isbot"), import_server = require("react-dom/server"), import_jsx_runtime = require("react/jsx-runtime"), ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return (0, import_isbot.isbot)(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_react.RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = !0;
          let body = new import_node_stream.PassThrough(), stream = (0, import_node.createReadableStreamFromReadable)(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_react.RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = !0;
          let body = new import_node_stream.PassThrough(), stream = (0, import_node.createReadableStreamFromReadable)(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links
});
var import_react2 = require("@remix-run/react");

// app/styles/tailwind.css
var tailwind_default = "/build/_assets/tailwind-SXC5U573.css";

// app/root.tsx
var import_jsx_runtime2 = require("react/jsx-runtime"), links = () => [
  { rel: "stylesheet", href: tailwind_default }
];
function App() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("html", { lang: "en", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("head", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Meta, {}),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Links, {}),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: "System Born - Find Your Next LitRPG Adventure" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("body", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("nav", { className: "bg-white shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex justify-between h-16", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-shrink-0 flex items-center", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-2xl font-bold text-gray-900", children: "System Born" }) }) }) }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Outlet, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.ScrollRestoration, {}),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Scripts, {}),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.LiveReload, {})
    ] })
  ] });
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader
});
var import_node2 = require("@remix-run/node"), import_react3 = require("@remix-run/react");

// app/services/royalroad.server.ts
var import_jsdom = require("jsdom"), ROYALROAD_BASE_URL = "https://www.royalroad.com";
async function getPopularBooks() {
  try {
    let html = await (await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated`)).text(), fictionElements = new import_jsdom.JSDOM(html).window.document.querySelectorAll(".fiction-list-item");
    return Array.from(fictionElements).map((element) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      let titleElement = element.querySelector(".fiction-title"), authorElement = element.querySelector(".author"), tagsElements = element.querySelectorAll(".tags a"), imageElement = element.querySelector("img"), descriptionElement = element.querySelector(".description"), statsElements = element.querySelectorAll(".stats .col-sm-6"), stats = {};
      return statsElements.forEach((stat) => {
        var _a2, _b2, _c2;
        let label = (_b2 = (_a2 = stat.querySelector("label")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b2.trim().toLowerCase(), value = (_c2 = stat.textContent) == null ? void 0 : _c2.replace(label || "", "").trim();
        label && value && (stats[label] = value);
      }), {
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
          followers: parseInt(((_d = stats.followers) == null ? void 0 : _d.replace(/,/g, "")) || "0", 10),
          pages: parseInt(((_e = stats.pages) == null ? void 0 : _e.replace(/,/g, "")) || "0", 10),
          views: {
            total: parseInt(((_f = stats["total views"]) == null ? void 0 : _f.replace(/,/g, "")) || "0", 10),
            average: 0
          },
          score: {
            total: parseFloat(((_g = stats.rating) == null ? void 0 : _g.split(" ")[0]) || "0"),
            average: parseFloat(((_h = stats.rating) == null ? void 0 : _h.split(" ")[0]) || "0")
          }
        }
      };
    });
  } catch (error) {
    return console.error("Error fetching popular books:", error), [];
  }
}

// app/routes/_index.tsx
var import_jsx_runtime3 = require("react/jsx-runtime"), loader = async () => {
  try {
    let books = await getPopularBooks();
    return (0, import_node2.json)({ books });
  } catch (error) {
    return console.error("Error fetching books:", error), (0, import_node2.json)({ books: [] });
  }
};
function Index() {
  let { books } = (0, import_react3.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { className: "text-4xl font-bold text-gray-900", children: "Discover Your Next LitRPG Adventure" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "mt-4 text-xl text-gray-600", children: "Explore popular LitRPG, GameLit, and Progression Fantasy stories" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: books.map((book, index) => {
      var _a;
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "book-card", children: [
        book.image && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "img",
          {
            src: book.image,
            alt: `Cover of ${book.title}`,
            className: "w-full h-48 object-cover rounded-md mb-4"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: book.title }),
        book.author && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "text-gray-600 mb-3", children: [
          "by ",
          book.author.name
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "mb-4", children: book.tags.map((tag, tagIndex) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tag-pill", children: tag }, tagIndex)) }),
        book.description && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-gray-700 line-clamp-3", children: book.description }),
        book.stats && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-4 text-sm text-gray-600", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "mr-3", children: [
            "\u2B50 ",
            ((_a = book.stats.score) == null ? void 0 : _a.average.toFixed(1)) || "N/A"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "mr-3", children: [
            "\u{1F4D6} ",
            book.stats.pages || 0,
            " pages"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
            "\u{1F465} ",
            book.stats.followers || 0,
            " followers"
          ] })
        ] })
      ] }, index);
    }) })
  ] });
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-E5OB6DND.js", imports: ["/build/_shared/chunk-SW26BZ7Z.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-7FZIFRVZ.js", imports: void 0, hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: "_index", index: void 0, caseSensitive: void 0, module: "/build/routes/_index-42GALFSF.js", imports: void 0, hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 } }, version: "84f081c3", hmr: void 0, url: "/build/manifest-84F081C3.js" };

// server-entry-module:@remix-run/dev/server-build
var assetsBuildDirectory = "public/build", future = { v2_dev: !1, unstable_postcss: !1, unstable_tailwind: !1, v2_errorBoundary: !1, v2_headers: !1, v2_meta: !1, v2_normalizeFormMethod: !1, v2_routeConvention: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: "_index",
    index: void 0,
    caseSensitive: void 0,
    module: index_exports
  }
};

// server.ts
var handler = (0, import_remix_adapter.createRequestHandler)({
  build: server_build_exports,
  mode: "production"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
