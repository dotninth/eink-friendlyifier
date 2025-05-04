// ==UserScript==
// @name         E-Ink Friendlyifier + Scroll Buttons
// @namespace    dotninth_eink_friendlyifier
// @version      1.0
// @description  Adapts websites for e-ink screens and adds instant Page Up/Down scroll buttons.
// @author       Dominik Lokkhart
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  // --- Configuration ---
  const scrollFactor = 0.8;
  const buttonOpacity = 0.5;
  const sideGapPx = 15;
  const bottomGapPx = 15;
  const buttonsGapPx = 10;
  const buttonSizePx = 40;
  const fontSizePx = 24;
  const buttonZIndex = 999998;

  // --- E-Ink CSS ---
  const eInkCss = `
      /* Global Styles - Force high contrast */
      :root {
        color: #000000 !important;
        background-color: #ffffff !important;
      }
      * {
        color: inherit !important;
        background-color: inherit !important;
        border-color: #555555 !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      body,
      div,
      p,
      span,
      li,
      td,
      th,
      section,
      article,
      main,
      header,
      footer {
        background-color: #ffffff !important;
      }

      /* Image Handling */
      img,
      svg,
      video,
      canvas,
      embed,
      object {
        background-color: transparent !important;
        background: none !important;
      }

      /* Link Styling */
      a,
      a *,
      a:visited,
      a:visited * {
        color: #0000ee !important;
        text-decoration: underline !important;
        background-color: transparent !important;
      }
      a:hover,
      a:hover * {
        color: #dd0000 !important;
      }

      /* Form Element Styling */
      input,
      select,
      textarea,
      button {
        color: #000000 !important;
        background-color: #ffffff !important;
        border: 1px solid #555555 !important;
        box-shadow: none !important;
      }
      input:focus,
      select:focus,
      textarea:focus,
      button:focus,
      input:hover,
      select:hover,
      textarea:hover,
      button:hover {
        border-color: #000000 !important;
        outline: none !important;
      }
      input[type="button"],
      input[type="submit"],
      input[type="reset"],
      input[type="image"],
      button {
        border: 1px solid #555555 !important;
      }
      input[type="button"]:hover,
      input[type="submit"]:hover,
      input[type="reset"]:hover,
      input[type="image"]:hover,
      button:hover,
      input[type="button"]:focus,
      input[type="submit"]:focus,
      input[type="reset"]:focus,
      input[type="image"]:focus,
      button:focus {
        border-color: #000000 !important;
        background-color: #eeeeee !important;
      }
      input[type="checkbox"],
      input[type="radio"] {
        background-color: #ffffff !important;
        border: 1px solid #555555 !important;
      }
      ::placeholder {
        color: #777777 !important;
        opacity: 1;
      }

      /* --- Exclude Scroll Buttons --- */
      #scrollBtnPageUp,
      #scrollBtnPageDown {
        background-color: transparent !important;
        border-color: #000000 !important;
        color: #000000 !important;
      }
    `;

  // --- Scroll Button CSS ---
  const buttonCss = `
    #scrollBtnPageUp, #scrollBtnPageDown {
      position: fixed !important;
      right: ${sideGapPx}px !important;
      width: ${buttonSizePx}px !important;
      height: ${buttonSizePx}px !important;
      font-size: ${fontSizePx}px !important;
      font-weight: bold !important;
      color: #000000 !important;
      background: none !important;
      background-color: transparent !important;
      border: 1px solid #000000 !important;
      border-radius: 4px !important;
      opacity: ${buttonOpacity} !important;
      cursor: pointer !important; z-index: ${buttonZIndex} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: none !important;
      text-shadow: none !important;
      padding: 0 !important;
      line-height: ${buttonSizePx}px !important;
      user-select: none !important;
      transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
    }

    #scrollBtnPageUp:hover, #scrollBtnPageDown:hover {
     opacity: ${Math.min(1, buttonOpacity + 0.3)} !important;
     background-color: rgba(200, 200, 200, 0.15) !important;
    }

    #scrollBtnPageUp {
      bottom: calc(${bottomGapPx}px + ${buttonSizePx}px + ${buttonsGapPx}px) !important;
    }

    #scrollBtnPageDown {
      bottom: ${bottomGapPx}px !important;
    }
`;

  // --- Helper Functions ---
  function injectCss(css, id) {
    let styleElement = null;
    if (id) {
      styleElement = document.getElementById(id);
    }
    if (!styleElement) {
      if (typeof GM_addStyle === "function") {
        GM_addStyle(css);
        console.log(
          `E-Ink Friendlyifier: Injected CSS ${id ? `with ID '${id}'` : ""} using GM_addStyle.`,
        );
        return;
      }
      styleElement = document.createElement("style");
      if (id) {
        styleElement.id = id;
      }
      styleElement.setAttribute("type", "text/css");
      const head = document.head || document.getElementsByTagName("head")[0];
      if (head) {
        head.appendChild(styleElement);
      } else {
        console.error("E-Ink Friendlyifier: Could not find document head.");
        return;
      }
    }
    styleElement.textContent = css;
    console.log(
      `E-Ink Friendlyifier: Injected CSS ${id ? `with ID '${id}'` : ""} using manual <style> tag.`,
    );
  }

  function createScrollButtons() {
    if (!document.body) {
      console.warn("E-Ink Friendlyifier: document.body not ready.");
      return;
    }
    injectCss(buttonCss, "eink-scroll-button-styles");

    const addButton = (id, text, pressAction) => {
      let button = document.getElementById(id);
      if (button) {
        console.log(`E-Ink Friendlyifier: Button ${id} already exists.`);
        return;
      }
      button = document.createElement("button");
      button.id = id;
      button.textContent = text;
      document.body.appendChild(button);
      button.addEventListener("click", pressAction);
    };

    const vh = document.documentElement.clientHeight;

    addButton("scrollBtnPageUp", "▲", () => {
      window.scrollBy(0, -scrollFactor * vh);
    });

    addButton("scrollBtnPageDown", "▼", () => {
      window.scrollBy(0, scrollFactor * vh);
    });

    console.log("E-Ink Friendlyifier: Scroll buttons (instant click) created.");
  }

  // --- Main Execution ---
  injectCss(eInkCss, "eink-core-styles");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createScrollButtons);
  } else {
    createScrollButtons();
  }
})();
