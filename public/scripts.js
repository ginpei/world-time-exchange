import { timezoneNames } from "./timezone-names.js";
import dayjs from "./vendor/day.js";
import dayjsPluginTimezone from "./vendor/dayjs_plugin_timezone.js";
import dayjsPluginUtc from "./vendor/dayjs_plugin_utc.js";
import { html, render } from "./vendor/LitHtml.js";

/** @typedef {import("dayjs").Dayjs} Dayjs */

/**
 * @typedef {{
 *   time: Date;
 *   timezone: string;
 * }} State
 */

// ----------------------------------------------------------------

dayjs.extend(dayjsPluginUtc);
dayjs.extend(dayjsPluginTimezone);

/** @type {State} */
const state = {
  time: new Date(),
  timezone: "Asia/Tokyo",
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
      ${TimeInputSection()} ${ClockSection()}
    </div>
  `;
}

function TimeInputSection() {
  const date = dayjs(state.time).format("YYYY-MM-DD");
  const time = dayjs(state.time).format("hh:mm");

  /**
   * @param {InputEvent} event
   */
  const onDateInput = (event) => {
    const el = event.currentTarget;
    if (!el || !(el instanceof HTMLInputElement)) {
      throw new Error("Wrong element");
    }

    const [y, m, d] = el.value.split("-").map((v) => Number(v));
    const newTime = dayjs(state.time)
      .set("year", y)
      .set("month", m)
      .set("date", d);
    setState({ time: newTime.toDate() });
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
    const newTime = dayjs(state.time).set("hour", hour).set("minute", minute);
    setState({ time: newTime.toDate() });
  };

  const onNowClick = () => {
    setState({ time: new Date() });
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
  const id = `Clock-timezoneNames-${Math.random().toFixed(22).slice(2)}`;

  const timezonePattern = timezoneNames.join("|");

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

    const timezone = el.value;
    setState({ timezone });
  };

  return html`
    <section class="ClockSection">
      <p>${formatTime(day)}</p>
      <p>
        Timezone:
        <input
          .value=${state.timezone}
          @focus=${onTimezoneFocus}
          @input=${onTimezoneInput}
          class="ClockSection-timezoneInput"
          list=${id}
          pattern=${timezonePattern}
          required
        />
        <datalist id=${id}>
          ${timezoneNames.map(
            (timezoneName) => html`<option value=${timezoneName}></option>`
          )}
        </datalist>
      </p>
    </section>
  `;
}

function getTime() {
  try {
    const day = dayjs(state.time).tz(state.timezone);
    return day;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Invalid time zone specified:")
    ) {
      return dayjs(state.time);
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
