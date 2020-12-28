import { html, render } from "./LitHtml.js";

/**
 * @typedef {{
 *   count: number;
 *   message: string;
 * }} State
 */

// ----------------------------------------------------------------

/** @type {State} */
const state = {
  count: 0,
  message: "Hello World!",
};

main();

// ----------------------------------------------------------------

function main() {
  update();
}

function update() {
  const elContainer = document.querySelector("#app");
  if (!elContainer) {
    throw new Error("Element `#app` not found");
  }

  render(HomePage(), elContainer);
}

/**
 * @param {Partial<State>} updates
 */
function setState(updates) {
  Object.assign(state, updates);
  update();
}

function HomePage() {
  return html`
    <div class="ui-container">
      <h1>${state.message}</h1>
      ${Counter()}
    </div>
  `;
}

function Counter() {
  const onIncrementClick = () => {
    setState({ count: state.count + 1 });
  };

  return html`
    <div class="Counter">
      <p>Count: ${state.count}</p>
      <p>
        <button @click=${onIncrementClick}>+1</button>
      </p>
    </div>
  `;
}
