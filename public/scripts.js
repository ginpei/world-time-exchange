import { tzDatabase } from "./timezone-names.js";
import dayjs from "./vendor/day.js";
import dayjsPluginTimezone from "./vendor/dayjs_plugin_timezone.js";
import dayjsPluginUtc from "./vendor/dayjs_plugin_utc.js";
import { html, render } from "./vendor/LitHtml.js";

/** @typedef {import("dayjs").Dayjs} Dayjs */

/**
 * @typedef {{
 *   departDate: string;
 *   departTime: string;
 *   departTzName: string;
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
  departDate: "2021-01-01",
  departTime: "00:00",
  departTzName: "Europe/London",
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
  /**
   * @param {InputEvent} event
   */
  const onDateInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    setState({ departDate: el.value });
  };

  /**
   * @param {InputEvent} event
   */
  const onTimeInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    setState({ departTime: el.value });
  };

  /**
   * @param {string} tzName
   */
  const onTzNameChange = (tzName) => {
    setState({ departTzName: tzName });
  };

  const onNowClick = () => {
    // setState({ departTime: new Date() });
    throw new Error("Not implemented yet");
  };

  return html`
    <section class="TimeInputSection">
      <input .value=${state.departDate} @input=${onDateInput} type="date" />
      <input .value=${state.departTime} @input=${onTimeInput} type="time" />
      <p>
        Timezone:
        ${TimezoneInput({
          onChange: onTzNameChange,
          value: state.departTzName,
        })}
      </p>
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
  const sDateTime = `${state.departDate} ${state.departTime}`;
  try {
    const day = dayjs.tz(sDateTime, state.departTzName).tz(state.destTzName);
    return day;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Invalid time zone specified:")
    ) {
      return dayjs(sDateTime);
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
