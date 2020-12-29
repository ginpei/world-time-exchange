/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @type {import("dayjs/plugin/timezone")} */
// @ts-ignore
const timezone = window.window.dayjs_plugin_timezone;

if (!timezone) {
  throw new Error(
    'Add `<script src="https://unpkg.com/dayjs@1.9.8/plugin/timezone.js"></script>`'
  );
}

export default timezone;
