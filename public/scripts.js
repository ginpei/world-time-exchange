import { tzDatabase } from "./timezone-names.js";
import dayjs from "./vendor/day.js";
import dayjsPluginTimezone from "./vendor/dayjs_plugin_timezone.js";
import dayjsPluginUtc from "./vendor/dayjs_plugin_utc.js";
import { html, render } from "./vendor/LitHtml.js";

/** @typedef {import("dayjs").Dayjs} Dayjs */

/**
 * @typedef {{
 *   departTime: Date;
 *   destTzName: string;
 * }} State
 */

// ----------------------------------------------------------------

dayjs.extend(dayjsPluginUtc);
dayjs.extend(dayjsPluginTimezone);

const tzAvailableDatabase = tzDatabase
  .filter((v) => v.status === "Canonical" && !v.name.startsWith("Etc/"))
  .sort((v, u) => compareTz(v, u));
const timezonePattern = tzAvailableDatabase.map((v) => v.name).join("|");
const timezoneOptions = tzAvailableDatabase.map(
  (tz) => html`<option value=${tz.name}>
    ${tz.offset} ${tz.offset === tz.offsetDst ? "" : `(${tz.offsetDst} DST)`}
  </option>`
);

/** @type {State} */
const state = {
  departTime: new Date(),
  destTzName: "Asia/Tokyo",
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
      <h1>Time Exchange</h1>
      <div class="HomePage-clockFrameSet">
        <fieldset class="HomePage-clockFrame">
          <legend class="HomePage-clockFrameHeading">From</legend>
          ${TimeInputSection()}
        </fieldset>
        <fieldset class="HomePage-clockFrame">
          <legend class="HomePage-clockFrameHeading">To</legend>
          ${ClockSection()}
        </fieldset>
      </div>
    </div>
  `;
}

function TimeInputSection() {
  const date = dayjs(state.departTime).format("YYYY-MM-DD");
  const time = dayjs(state.departTime).format("hh:mm");

  /**
   * @param {InputEvent} event
   */
  const onDateInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    const [y, m, d] = el.value.split("-").map((v) => Number(v));
    const newTime = dayjs(state.departTime)
      .set("year", y)
      .set("month", m)
      .set("date", d);
    setState({ departTime: newTime.toDate() });
  };

  /**
   * @param {InputEvent} event
   */
  const onTimeInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    const [hour, minute] = el.value.split(":").map((v) => Number(v));
    const newTime = dayjs(state.departTime)
      .set("hour", hour)
      .set("minute", minute);
    setState({ departTime: newTime.toDate() });
  };

  const onNowClick = () => {
    setState({ departTime: new Date() });
  };

  return html`
    <section class="TimeInputSection">
      <input .value=${date} @input=${onDateInput} type="date" />
      <input .value=${time} @input=${onTimeInput} type="time" />
      <button @click=${onNowClick}>Now</button>
    </section>
  `;
}

function ClockSection() {
  const day = getTime();

  /**
   * @param {string} tzName
   */
  const onTzNameChange = (tzName) => {
    setState({ destTzName: tzName });
  };

  return html`
    <section class="ClockSection">
      <p>${formatTime(day)}</p>
      <p>
        Timezone:
        ${TimezoneInput({ onChange: onTzNameChange, value: state.destTzName })}
      </p>
    </section>
  `;
}

/**
 * @param {{
 *   onChange: (tzName: string) => void;
 *   value: string;
 * }} props
 */
function TimezoneInput(props) {
  const id = `Clock-timezoneNames-${Math.random().toFixed(22).slice(2)}`;

  /**
   * @param {FocusEvent} event
   */
  const onTimezoneFocus = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    el.select();
  };

  /**
   * @param {InputEvent} event
   */
  const onTimezoneInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    props.onChange(el.value);
  };

  return html`
    <input
      .value=${props.value}
      @focus=${onTimezoneFocus}
      @input=${onTimezoneInput}
      class="ClockSection-timezoneInput"
      list=${id}
      pattern=${timezonePattern}
      required
    />
    <datalist id=${id}>${timezoneOptions}</datalist>
  `;
}

/**
 * @param {import("./timezone-names.js").TzData} tz1
 * @param {import("./timezone-names.js").TzData} tz2
 * @returns {number}
 */
function compareTz(tz1, tz2) {
  return tzOffsetToNumber(tz1.offset) - tzOffsetToNumber(tz2.offset);
}

/**
 * @param {string} offset e.g. `"+09:00"`. `"-08:00"`
 * @returns {number}
 */
function tzOffsetToNumber(offset) {
  // console.assert(offset.match(/^[-+]\d\d:\d\d$/), "offset format", offset);

  return Number(offset.slice(0, 3)) * 100 + Number(offset.slice(4));
}

function getTime() {
  try {
    const day = dayjs(state.departTime).tz(state.destTzName);
    return day;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Invalid time zone specified:")
    ) {
      return dayjs(state.departTime);
    }

    throw error;
  }
}

/**
 * @param {Dayjs} day
 * @returns {string}
 */
function formatTime(day) {
  return day.format("YYYY/MM/DD HH:mm:ss Z");
}
