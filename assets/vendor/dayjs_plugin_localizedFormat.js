/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @type {import("dayjs/plugin/localizedFormat")} */
// @ts-ignore
const localizedFormat = window.window.dayjs_plugin_localizedFormat;

if (!localizedFormat) {
  throw new Error(
    'Add `<script src="https://unpkg.com/dayjs@1.9.8/plugin/localizedFormat.js"></script>`'
  );
}

export default localizedFormat;
