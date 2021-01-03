/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @type {import("dayjs")} */
// @ts-ignore
// eslint-disable-next-line prefer-destructuring
const dayjs = window.dayjs;

if (!dayjs) {
  throw new Error(
    'Add `<script src="https://unpkg.com/dayjs@1.9.8/dayjs.min.js"></script>`'
  );
}

export default dayjs;
