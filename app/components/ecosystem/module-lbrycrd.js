"use strict";



//  U T I L

import markdown from "~component/markdown";



//  E X P O R T

export default () => `
  <div class="ecosystem__module lbrycrd">
    <span class="__close" data-action="close">&times;</span>

    <h2 class="__title">
      <span data-action="open" data-target="lbrycrd">
        Blockchain
        <em>The foundation of the LBRY protocol.</em>
      </span>

      <div>
        <span><a href="https://github.com/lbryio/lbrycrd">lbrycrd</a></span>
        <span><a href="https://github.com/lbryio/torba">torba</a></span>
        <span><a href="https://github.com/lbryio/lbryumx">lbryumx</a></span>
      </div>
    </h2>

    <div class="ecosystem__module__details">
      ${markdown("./documents/partials/overview/lbrycrd.md")}
    </div>
  </div>
`;
