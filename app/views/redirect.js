"use strict";



//  I M P O R T S

import fm from "front-matter";
import fs from "graceful-fs";
import html from "choo/html";
import raw from "choo/html/raw";

//  U T I L S

import markdown from "@component/markdown";
import page404 from "./404";



//  E X P O R T

export default (state, emit) => { // eslint-disable-line
  const partialPath = state.route === "resources/*" ?
    `resources/${state.params.wildcard}` :
    state.params.wildcard;

  const path = `./documents/${partialPath}.md`;

  if (!fs.existsSync(path))
    return page404();

  const markdownFile = fs.readFileSync(path, "utf-8");
  const markdownFileDetails = fm(markdownFile);
  const title = markdownFileDetails.attributes.title;
  const description = markdownFileDetails.attributes.description || "";

  if (markdownFileDetails.attributes.meta) {
    const customMetadata = {};

    for (const key in markdownFileDetails.attributes.meta) {
      if (markdownFileDetails.attributes.meta.hasOwnProperty(key)) {
        customMetadata[Object.keys(markdownFileDetails.attributes.meta[key])[0]] =
          markdownFileDetails.attributes.meta[key][Object.keys(markdownFileDetails.attributes.meta[key])[0]];
      }
    }

    state.lbry = customMetadata;
  }

  // below is evil, I just inherited it -- Jeremy
  state.lbry = {
    title: title,
    description: description
  };

  // below should be refactored into components
  let pageScript = "";

  switch(true) {
    case partialPath === "developer-program":
      pageScript = renderClientScript("devprogram-scripts");
      break;

    case partialPath === "glossary":
      pageScript = renderClientScript("glossary-scripts");
      break;

    case partialPath === "overview":
      pageScript = renderClientScript("ecosystem-scripts");
      break;

    case partialPath === "playground":
      pageScript = renderClientScript("playground-scripts");
      break;

    default:
      break;
  }

  return html`
    <article class="page" itemtype="http://schema.org/BlogPosting">
      <header class="page__header">
        <div class="page__header-wrap">
          <div class="inner-wrap">
            <h1 class="page__header__title" itemprop="name headline">${title}</h1>
          </div>
        </div>
      </header>

      <section class="page__content" itemprop="articleBody">
        <div class="inner-wrap">
          ${markdown(path)}
          ${raw(pageScript)}
        </div>
      </section>
    </article>
  `;
};



//  H E L P E R

function renderClientScript(clientScriptFileName) {
  return `
    <script>
      ${fs.readFileSync((`${process.cwd()}/app/components/client/${clientScriptFileName}.js`), "utf-8")}
    </script>
  `;
}
