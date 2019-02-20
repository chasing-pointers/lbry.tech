"use strict";



//  I M P O R T S

import asyncHtml from "choo-async/html";
import dedent from "dedent";
import got from "got";

//  U T I L S

import headerBlockchain from "@component/api/header-blockchain";
import headerSdk from "@component/api/header-sdk";
import redirects from "@data/redirects.json";

const blockchainApi = "https://cdn.jsdelivr.net/gh/lbryio/lbrycrd@master/contrib/devtools/generated/api_v1.json";
const cache = new Map();
const sdkApi = process.env.NODE_ENV === "development" ?
  "https://cdn.jsdelivr.net/gh/lbryio/lbry@generate_examples/docs/api.json" : // TODO: Remove when `generate_examples` is merged into master
  "https://cdn.jsdelivr.net/gh/lbryio/lbry@master/docs/api.json";



//  E X P O R T

export default async(state) => {
  // below is evil, I just inherited it -- Jeremy
  const apilabel = state.params.wildcard == "sdk" ? "SDK" : state.params.wildcard.charAt(0).toLocaleUpperCase() + state.params.wildcard.substring(1);

  state.lbry = {
    title: apilabel + " API Documentation",
    description: "See API documentation, signatures, and sample calls for the LBRY " + apilabel + " APIs."
  };

  try {
    const apiResponse = await parseApiFile(state.params.wildcard);

    return asyncHtml`
      <div class="__slate">
        <aside class="api-toc">
          <div class="api-toc__search">
            <input class="api-toc__search-field" id="input-search" placeholder="Search" type="search"/>
            <div class="api-toc__search-clear" id="clear-search" title="Clear search query">&times;</div>
            <ul class="api-toc__search-results"></ul>
          </div>

          <ul class="api-toc__items" id="toc" role="navigation">${createApiSidebar(apiResponse)}</ul>
        </aside>
        <section class="api-content">
          <div class="api-documentation" id="toc-content">
            <div></div>
            <nav class="api-content__items">
              <button class="api-content__item" id="toggle-curl" type="button">curl</button>
              <button class="api-content__item" id="toggle-lbrynet" type="button">lbrynet</button>
              <button class="api-content__item" id="toggle-python" type="button">python</button>
            </nav>

            ${createApiHeader(state.params.wildcard)}
            ${createApiContent(apiResponse)}
          </div>
        </section>
      </div>

      <script src="/assets/scripts/plugins/jets.js"></script>
      <script src="/assets/scripts/api.js"></script>

      <script>
        document.getElementById("toggle-curl").click();
      </script>
    `;
  }

  catch(error) {
    const redirectUrl = redirects[state.href];

    return asyncHtml`
      <article class="page" itemtype="http://schema.org/BlogPosting">
        <header class="page__header">
          <div class="page__header-wrap">
            <div class="inner-wrap">
              <h1 class="page__header__title" itemprop="name headline">404</h1>
            </div>
          </div>
        </header>

        <section class="page__content page__markup" itemprop="articleBody">
          <div class="inner-wrap">
            <p>Redirecting you to <strong>${redirectUrl}</strong></p>
          </div>
        </section>
      </article>

      <script>
        setTimeout(() => {
          window.location.href = "${redirectUrl}";
        }, 2000);
      </script>
    `;
  }
};



//  H E L P E R S

function createApiContent(apiDetails) {
  const apiContent = [];

  for (const apiDetail of apiDetails) {
    let apiDetailsReturns = "";

    if (apiDetail.returns)
      apiDetailsReturns = JSON.parse(JSON.stringify(apiDetail.returns));

    apiContent.push(`
      <div class="api-content__body">
        <h2 id="${apiDetail.name}">${apiDetail.name}</h2>
        <p>${apiDetail.description}</p>

        ${apiDetail.arguments.length ? `<h3>Arguments</h3><ul class="api-content__body-arguments">${renderArguments(apiDetail.arguments).join("")}</ul>` : ""}

        ${!apiDetail.examples || !apiDetail.examples.length ? (`<h3>Returns</h3><pre><code>${dedent(apiDetailsReturns)}</code></pre>`) : ""}
      </div>

      <div class="api-content__example">
        ${apiDetail.examples && apiDetail.examples.length ? renderExamples(apiDetail.examples).join("") : `<pre><code>// example(s) for ${apiDetail.name} to come later</code></pre>`}
      </div>
    `);
  }

  return apiContent;
}

function createApiHeader(slug) {
  switch(slug) {
    case "blockchain":
      return headerBlockchain();

    case "sdk":
      return headerSdk();

    default:
      break;
  }
}

function createApiSidebar(apiDetails) {
  const apiSidebar = [];

  for (const apiDetail of apiDetails) {
    apiSidebar.push(`
      <li class="api-toc__item">
        <a href="#${apiDetail.name}" title="Go to ${apiDetail.name} section">
          ${apiDetail.name}
        </a>
      </li>
    `);
  }

  return apiSidebar;
}

async function parseApiFile(urlSlug) {
  let apiFileLink;

  switch(true) {
    case (urlSlug === "blockchain"):
      apiFileLink = blockchainApi;
      break;

    case (urlSlug === "sdk"):
      apiFileLink = sdkApi;
      break;

    default:
      break;
  }

  if (!apiFileLink)
    return Promise.reject(new Error("Failed to fetch API docs"));

  const response = await got(apiFileLink, { cache: cache, json: true });

  try {
    return response.body;
  } catch(error) {
    return "Issue loading API documentation";
  }
}

function renderArguments(args) {
  const argumentContent = [];

  for (const arg of args) {
    argumentContent.push(`
      <li class="api-content__body-argument">
        <div class="left">
          <strong>${arg.name}</strong><br/>
          ${arg.is_required === true ? "" : "<span>optional</span>" }<span>${arg.type}</span>
        </div>

        <div class="right">${typeof arg.description === "string" ? arg.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""}</div>
      </li>
    `);
  }

  return argumentContent;
}

function renderExamples(args) {
  const exampleContent = [];

  for (const arg of args) {
    exampleContent.push(`
      <h3>${arg.title}</h3><br/>
      <pre data-api-example-type="curl"><code>${arg.curl}</code></pre>
      <pre data-api-example-type="lbrynet"><code>${arg.lbrynet}</code></pre>
      <pre data-api-example-type="python"><code>${arg.python}</code></pre>

      <h3>Output</h3><br/>
      <pre><code>${arg.output}</code></pre>
    `);
  }

  return exampleContent;
}
