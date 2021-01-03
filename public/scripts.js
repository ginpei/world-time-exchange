import { tzDatabase } from "./timezone-names.js";
import dayjs from "./vendor/day.js";
import dayjsPluginLocalizedFormat from "./vendor/dayjs_plugin_localizedFormat.js";
import dayjsPluginTimezone from "./vendor/dayjs_plugin_timezone.js";
import dayjsPluginUtc from "./vendor/dayjs_plugin_utc.js";
import { html, render } from "./vendor/lit-html.js";

/** @typedef {import("dayjs").Dayjs} Dayjs */
/** @typedef {import("./timezone-names").TzData} TzData */

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
dayjs.extend(dayjsPluginLocalizedFormat);

const tzAvailableDatabase = tzDatabase
  .filter((v) => v.status === "Canonical" && !v.name.startsWith("Etc/"))
  .sort((v, u) => compareTz(v, u));

/** @type {State} */
const state = {
  departDate: "2021-01-01",
  departTime: "00:00",
  departTzName: "America/Vancouver",
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
          ${DepartTimeSection()}
        </fieldset>
        <fieldset class="HomePage-clockFrame">
          <legend class="HomePage-clockFrameHeading">To</legend>
          ${DestTimeSection()}
        </fieldset>
      </div>
    </div>
  `;
}

function DepartTimeSection() {
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
    <section class="DepartTimeSection clock-container">
      <label class="clock-label">
        <span class="clock-labelText">Date:</span>
        <input .value=${state.departDate} @input=${onDateInput} type="date" />
      </label>
      <label class="clock-label">
        <span class="clock-labelText">Time:</span>
        <input .value=${state.departTime} @input=${onTimeInput} type="time" />
      </label>
      <label class="clock-label">
        <span class="clock-labelText">Timezone:</span>
        ${TimezoneInput({
          onChange: onTzNameChange,
          value: state.departTzName,
          options: tzAvailableDatabase,
        })}
      </label>
      <p>
        <button @click=${onNowClick}>Now</button>
      </p>
    </section>
  `;
}

function DestTimeSection() {
  const day = getTime();

  /**
   * @param {string} tzName
   */
  const onTzNameChange = (tzName) => {
    setState({ destTzName: tzName });
  };

  return html`
    <section class="DestTimeSection clock-container">
      <label class="clock-label">
        <span class="clock-labelText">Date:</span>
        ${day.format("L")}
      </label>
      <label class="clock-label">
        <span class="clock-labelText">Time:</span>
        ${day.format("LT")}
      </label>
      <label class="clock-label">
        <span class="clock-labelText">Timezone:</span>
        ${TimezoneInput({
          onChange: onTzNameChange,
          value: state.destTzName,
          options: tzAvailableDatabase,
        })}
      </label>
      <p>${formatTime(day)}</p>
    </section>
  `;
}

/**
 * @param {{
 *   onChange: (tzName: string) => void;
 *   options: TzData[];
 *   value: string;
 * }} props
 */
function TimezoneInput(props) {
  const id = `TimezoneInput-${Math.random().toFixed(22).slice(2)}`;

  /**
   * @param {FocusEvent} event
   */
  const onTimezoneBlur = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    const tzName = el.value;
    if (props.options.some((v) => v.name === tzName)) {
      props.onChange(tzName);
    }
    el.value = props.value;
  };

  /**
   * @param {FocusEvent} event
   */
  const onTimezoneFocus = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    el.value = "";
  };

  /**
   * @param {InputEvent} event
   */
  const onTimezoneInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    const tzName = el.value;
    if (props.options.some((v) => v.name === tzName)) {
      props.onChange(tzName);
    }
  };

  return html`
    <input
      .value=${props.value}
      @blur=${onTimezoneBlur}
      @focus=${onTimezoneFocus}
      @input=${onTimezoneInput}
      class="TimezoneInput"
      list=${id}
      pattern=${props.options.map((v) => v.name).join("|")}
      required
    />
    <datalist id=${id}>
      ${props.options.map(
        (tz) => html`<option value=${tz.name}>
          ${tz.offset}
          ${tz.offset === tz.offsetDst ? "" : `(${tz.offsetDst} DST)`}
        </option>`
      )}
    </datalist>
  `;
}

/**
 * @param {TzData} tz1
 * @param {TzData} tz2
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
