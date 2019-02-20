"use strict"; /* global document, history, send, window */



document.getElementById("get-started").onclick = event => {
  event.preventDefault();

  send({
    message: "auth me with github"
  });
};

if (window.location.search.includes("?code=")) {
  document.querySelector("developer-program").innerHTML = `
    <form>
      <input-submit>
        <input id="walletAddress" placeholder="Your LBRY wallet address" type="text"/>
        <input id="oauthCode" type="hidden" value="${window.location.search.split("?code=").pop()}"/>
        <button id="creditsAcquire" title="Get LBRY credits" type="button">Get credits</button>
      </input-submit>
    </form>

    <h4>Need An Address?</h4>
    <p>To receive your LBC, you'll need a wallet address. While graphical wallets are available, the recommended path for engineers is to:</p>

    <ol>
      <li>Download <a href="https://github.com/lbryio/lbry/releases">the LBRY SDK</a>.</li>
      <li>Launch the command-line utility (<code>./lbrynet start</code>).</li>
      <li>Run <code>./lbrynet address list</code> and copy the <code>id</code> field.</li>
    </ol>
  `;

  history.replaceState({}, "", window.location.pathname); // clean up URL bar
}

if (document.getElementById("creditsAcquire")) {
  document.getElementById("creditsAcquire").onclick = () => {
    send({
      address: document.getElementById("walletAddress").value,
      code: document.getElementById("oauthCode").value,
      message: "verify github auth"
    });

    document.querySelector("developer-program").innerHTML = "<p><em>Awaiting response from LBRY server...</em></p>";
  };
}
