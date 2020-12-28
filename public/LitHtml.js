/* eslint-disable import/no-unresolved */
/* eslint-disable prefer-destructuring */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as original from "https://unpkg.com/lit-html@1.3.0/lit-html.js?module";

/** @type {import("lit-html")["html"]} */
export const html = original.html;

/** @type {import("lit-html")["render"]} */
export const render = original.render;
