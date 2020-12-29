/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @type {import("dayjs/plugin/utc")} */
// @ts-ignore
const utc = window.window.dayjs_plugin_utc;

if (!utc) {
  throw new Error(
    'Add `<script src="https://unpkg.com/dayjs@1.9.8/plugin/utc.js"></script>`'
  );
}

export default utc;
