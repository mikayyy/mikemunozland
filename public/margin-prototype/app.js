const state = {
  page: "cover",
  decisionOne: null,
  signals: [],
  decisionThree: null,
  message: {},
};

const journalStage = document.getElementById("journal-stage");
const journalPage = document.getElementById("journal-page");
const pageContent = document.getElementById("page-content");
const pageArtifact = document.getElementById("page-artifact");
const pageEphemera = document.getElementById("page-ephemera");
const pageMarker = document.getElementById("page-marker");
const mapStage = document.getElementById("map-stage");
const mapPhase = document.getElementById("map-phase");
const mapHeading = document.getElementById("map-heading");
const mapStorySteps = ["orient", "move", "update"].map((phase) => document.getElementById(`map-${phase}-story`));
const mapTime = document.getElementById("map-time");
const mapPlace = document.getElementById("map-place");
const mapStatus = document.getElementById("map-status");
const mapDecisionTrace = document.getElementById("map-decision-trace");
const selectedRouteLabel = document.getElementById("selected-route-label");
const mapContinue = document.getElementById("map-continue");
const mapAnnouncement = document.getElementById("map-announcement");
const approachPath = document.getElementById("route-approach");
const approachProgressPath = document.getElementById("route-approach-traveled");
const toJunctionPath = document.getElementById("route-to-junction");
const traveledPath = document.getElementById("route-traveled");
const committedPath = document.getElementById("route-committed");
const ridgeProgressPath = document.getElementById("route-ridge-progress");
const returnPath = document.getElementById("route-return");
const mapMarker = document.getElementById("map-marker");
const skipTransition = document.getElementById("skip-transition");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const departureChoices = {
  start: { label: "Original route with a pace checkpoint", delay: 0 },
  reset: { label: "Trailhead reset before departure", delay: 3 },
  consult: { label: "Operations consulted before departure", delay: 9 },
  shorten: { label: "Creek connector selected", delay: 0 },
};

const signalLabels = {
  pace: "pace check", knee: "knee report", weather: "forecast", route: "creek turnoff",
  recover: "expected pace recovery", stabilize: "expected knee recovery",
  north: "storm-track assumption", trust: "client-confidence concern",
};

const tripPlan = {
  overlook: "12:10 PM",
  pickup: "3:15 PM",
  ridgeWeather: "1:00 PM",
};

let phaseTimer = null;
let animationFrame = null;
let pendingPage = null;
let activeTransition = null;
let transmissionStep = 0;
const transmissionParts = ["situation", "need", "guest"];

const pageMarkers = {
  cover: "Field Journal · 00",
  roles: "Personnel · 01",
  brief: "Laurel Ridge · 02",
  "late-start": "Trailhead · 03",
  junction: "Laurel Junction · 04",
  context: "Laurel Junction · 04a",
  call: "Route decision · 05",
  outcome: "Field result · 06",
  debrief: "Trail Debrief · 07",
};

const pageArtifacts = {
  cover: '<span class="cover-stamp">NORTHSTAR<br><b>FIELD SERIES</b><small>LAUREL RIDGE · 01</small></span>',
  roles: '<span class="personnel-tab"><i></i>FIELD PERSONNEL <b>02</b></span>',
  brief: '<span class="itinerary-slip"><b>TRIP FILE</b><span>LR / 07</span><i></i></span>',
  "late-start": '<span class="departure-stamp"><b>10:42</b><small>DEPARTURE<br>REVISED</small></span>',
  junction: '<span class="forecast-scrap"><b>FIELD FORECAST</b><i></i><small>RIDGE · 13:00</small></span>',
  context: '<span class="guide-tab">FIELD GUIDE <b>§ 04</b></span>',
  call: '<span class="operations-slip"><b>OPS</b><i></i><small>TRANSMISSION<br>IN PROGRESS</small></span>',
  outcome: '<span class="archive-stamp">FIELD RESULT <b>LR / 06</b></span>',
  debrief: '<span class="debrief-mark"><b>✓</b> REVIEWED<br><small>FIELD JOURNAL</small></span>',
};

// These are collected marks from other days in the journal, not clues for this route.
// The whole layer is hidden from assistive technology and cannot catch a click.
const sketchSun = `<svg class="pencil-sketch sketch-sun" viewBox="0 0 100 80" fill="none" aria-hidden="true"><path d="M42 21c12-3 22 6 23 18 1 14-9 23-22 22-12-1-20-11-19-23 1-8 8-15 18-17Zm-2-13-2-7m24 12 7-8M17 19l-9-6m7 27L3 39m16 20-9 7m31 4-2 8m29-16 9 7m0-31 12-1M73 20l9-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 41c7-10 21-14 34-8" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".65"/></svg>`;
const sketchStars = `<svg class="pencil-sketch sketch-stars" viewBox="0 0 130 80" fill="none" aria-hidden="true"><path d="m17 26 3 7 7 2-7 3-3 7-3-7-7-3 7-2 3-7Zm91-15 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5ZM73 53l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M28 35c18-5 36-11 74-17M25 40c18 10 27 13 47 18M79 58c16-14 20-21 27-33" stroke="currentColor" stroke-width="1" stroke-dasharray="3 5" opacity=".65"/><circle cx="49" cy="16" r="2" fill="currentColor"/><circle cx="119" cy="49" r="1.5" fill="currentColor"/></svg>`;
const sketchMug = `<svg class="pencil-sketch sketch-mug" viewBox="0 0 110 85" fill="none" aria-hidden="true"><path d="M20 34c20 3 45 2 63-1l-5 37c-13 5-38 5-52-1l-6-35Zm64 5c18-2 22 8 14 19-4 5-10 5-17 3M17 72c22 6 50 7 68 1M36 26c-6-8 7-11 0-20m22 19c-5-8 6-11 1-20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const sketchPine = `<svg class="pencil-sketch sketch-pine" viewBox="0 0 100 110" fill="none" aria-hidden="true"><path d="M49 7v91M47 17 27 32m22-13 20 13M47 29 18 51m31-21 31 23M48 46 13 70m37-22 39 23M48 63 8 87m42-23 43 25M34 98h30" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 18 32 34m14-5L23 53m24-6L20 71m28-8L17 86m35-69 17 18M52 32l24 24M51 49l29 23M52 65l32 22" stroke="currentColor" stroke-width=".9" opacity=".62"/></svg>`;

const pageEphemeraByPage = {
  cover: `<img class="ephemera-botanical flower-cover" src="/margin-prototype/assets/pressed-blue-flower.webp" alt=""><span class="pencil-note note-cover">Blue asters from the old fence<br><small>June 14</small></span><span class="specimen-tag tag-cover">pressed between pages · 06</span>`,
  roles: `<figure class="ephemera-photo photo-cabin"><img src="/margin-prototype/assets/cabin-snapshot.webp" alt=""><figcaption>first fog of June</figcaption></figure><span class="pencil-note note-roles">The cabin roof held through the rain.</span>${sketchPine}`,
  brief: `<img class="ephemera-botanical fern-brief" src="/margin-prototype/assets/pressed-fern.webp" alt=""><span class="torn-note note-brief">Return Sam's field guide<br>before Friday.</span>${sketchSun}`,
  "late-start": `<span class="pencil-note note-late">Where did the red thermos go?</span><span class="ephemera-ticket ticket-late"><b>SEED EXCHANGE</b><small>saved for another day</small><i>JUN · 14</i></span>`,
  junction: `${sketchStars}<span class="pencil-note note-junction">clear sky, last Tuesday</span><span class="pencil-swatches swatches-junction"><i></i><i></i><i></i><small>pencil tests</small></span>`,
  context: `<figure class="ephemera-photo photo-mushroom"><img src="/margin-prototype/assets/mushroom-snapshot.webp" alt=""><figcaption>behind the cabin · May</figcaption></figure><img class="ephemera-botanical fern-context" src="/margin-prototype/assets/pressed-fern.webp" alt=""><span class="specimen-tag tag-context">drying flat · 05</span>`,
  call: `${sketchMug}<span class="ephemera-ticket ticket-call"><b>POST OFFICE</b><small>send a note to Ada</small><i>THURSDAY</i></span>`,
  outcome: `<img class="ephemera-botanical fern-outcome" src="/margin-prototype/assets/pressed-fern.webp" alt=""><span class="pencil-note note-outcome">Save one of the yellow flowers for Nora.</span><span class="specimen-tag tag-outcome">collected by the old fence</span>`,
  debrief: `<span class="torn-note note-debrief">Postcard for Mae<br>goes out Monday.</span><img class="ephemera-botanical flower-debrief" src="/margin-prototype/assets/pressed-blue-flower.webp" alt="">${sketchStars}<span class="specimen-tag tag-debrief">June's last blue flowers</span>`,
};

const pages = {
  cover: {
    html: `
      ${tapeHeading("A Northstar field experience", "The Margin", "h1")}
      <p class="lead">Every plan carries a margin. What you preserve determines what you can do when conditions change.</p>
      <p>Play as Eli, a trip leader. Notice what is known, test what is assumed, and make a route call you can explain to the group and operations.</p>
      <button class="primary" type="button" data-direct="roles">Open the field journal</button>
      <p class="meta">Fictional field scenario · three decisions · one evolving route</p>`,
  },
  roles: {
    html: `
      ${tapeHeading("Choose your perspective", "Where you stand changes what you can see.")}
      <div class="character-grid">
        <article class="character-card">
          <figure class="journal-photo portrait-photo"><img src="/margin-prototype/assets/eli-portrait.webp" alt="Portrait of Eli Torres outdoors near the Laurel Ridge trail" loading="lazy" decoding="async"></figure>
          <p class="role">Associate Trip Leader</p><h3>Eli Torres</h3>
          <p>Make decisions in the field as the group, route, and conditions change.</p>
          <button class="primary" type="button" data-direct="brief">Take the trail</button>
        </article>
        <article class="character-card">
          <figure class="journal-photo portrait-photo"><img src="/margin-prototype/assets/maya-portrait.webp" alt="Portrait of Maya Chen outside the base operations cabin" loading="lazy" decoding="async"></figure>
          <p class="role">Guest Experience Coordinator</p><h3>Maya Chen</h3>
          <p>Coordinate information and support field decisions from base operations.</p>
          <span class="status">Concept path—not included in this prototype</span>
        </article>
      </div>`,
  },
  brief: {
    html: `
      ${tapeHeading("Trip brief", "Laurel Ridge Team Outing")}
      <div class="brief-layout">
        <div>
          <div class="brief-list">
            <div><strong>Group</strong><span>10 corporate guests</span></div>
            <div><strong>Route</strong><span>7-mile Laurel Ridge Loop</span></div>
            <div><strong>Key moment</strong><span>Overlook lunch and remarks by ${tripPlan.overlook}</span></div>
            <div><strong>Return</strong><span>Fixed shuttle pickup at ${tripPlan.pickup}</span></div>
          </div>
          <p class="lead">The inbound shuttle arrives 35 minutes late. The pickup and Jordan's evening reservation have not moved.</p>
          <p class="brief-rule">Field guide: Eli may recommend an approved route change in the field. Operations coordinates transport; a medical need, closed route, or unworkable return plan goes to the supervisor.</p>
          <button class="primary" type="button" data-transition="late-start" data-map="trailhead">See the departure</button>
        </div>
        <aside class="note-card">
          <figure class="journal-photo brief-photo"><img src="/margin-prototype/assets/jordan-portrait.webp" alt="Portrait of Jordan Lee at the trailhead" loading="lazy" decoding="async"></figure>
          <p>“The team has been through a lot of organizational change. I'm hoping the overlook gives me the right moment to recognize them.”</p>
          <p class="meta">Jordan Lee · Event organizer</p>
        </aside>
      </div>`,
  },
  "late-start": {
    html: `
      ${tapeHeading("Decision 1 · The late start", "The group expects to depart in five minutes. What is your next move?")}
      <p class="arrival-note"><span class="arrival-label">10:42 · At the trailhead</span> Jordan gathers the team by the route sign. A guest asks whether the ${tripPlan.overlook} overlook lunch still works. The driver confirms the ${tripPlan.pickup} pickup. Eli can use a few minutes to check the plan before departure.</p>
      <div class="choice-grid" role="radiogroup" aria-label="Choose Eli's next move">
        ${choice("start", "Start the original route", "Use the first trail marker as a checkpoint for pace and comfort.", "one")}
        ${choice("reset", "Run a brief trailhead reset", "Confirm guest comfort, weather timing, route options, and event priorities.", "one")}
        ${choice("consult", "Consult operations", "Send the current information and wait for a supervisor's recommendation.", "one")}
        ${choice("shorten", "Select the shorter route", "Preserve the return schedule and reduce exposure to changing conditions.", "one")}
      </div>
      <div id="field-note" class="field-note" tabindex="-1" aria-live="polite" hidden></div>
      <button id="page-continue" class="primary" type="button" data-transition="junction" data-map="junction" disabled>Continue toward Laurel Junction</button>`,
  },
  junction: {
    html: () => `
      ${tapeHeading("Decision 2 · Laurel Junction", state.decisionOne === "shorten" ? "Which three signals matter most before confirming the shorter route?" : "Which three signals most change the reliability of the original plan?")}
      <p class="arrival-note"><span class="arrival-label">${tripTime(11 * 60 + 52)} · At the junction</span> A participant reports more knee pain on uneven ground. Eli's pace check projects the overlook at ${tripTime(12 * 60 + 35, true)}, versus the ${tripPlan.overlook} plan. The forecast now puts possible ridge storms as early as ${tripPlan.ridgeWeather}. ${departureTrace()}</p>
      <p class="instruction">Select three items you would use to make the route call. Favor evidence that changes the plan or preserves an option.</p>
      <div class="signal-grid">
        ${signal("pace", "strong", `At this pace, the group reaches the overlook around ${tripTime(12 * 60 + 35)}; the plan was ${tripPlan.overlook}.`)}
        ${signal("knee", "strong", "The participant reports greater knee discomfort than at departure.")}
        ${signal("weather", "strong", `The forecast now puts possible ridge storms as early as ${tripPlan.ridgeWeather}.`)}
        ${signal("route", "option", "The creek connector remains available here, before the exposed ridge.")}
        ${signal("recover", "assumption", "The group should regain time on the flatter approach.")}
        ${signal("stabilize", "assumption", "The participant's discomfort should stabilize after a rest.")}
        ${signal("north", "assumption", "The storm band should remain north of the ridge.")}
        ${signal("trust", "assumption", "Changing the route could damage the client's confidence.")}
      </div>
      <p id="signal-count" class="selection-count" aria-live="polite">0 of 3 selected</p>
      <div class="decision-actions">
        <button id="signal-commit" class="primary" type="button" disabled>Commit these signals</button>
        <button id="page-continue" class="primary" type="button" data-direct="context" hidden>Turn to the next field note</button>
      </div>
      <div id="field-note" class="field-note" tabindex="-1" aria-live="polite" hidden></div>
      `,
  },
  context: {
    html: () => `
      ${tapeHeading("Field note · Still at Laurel Junction", "The place hasn't changed. The decision has.")}
      <div class="context-layout">
        <div>
          <p class="arrival-label">${tripTime(11 * 60 + 55)} · Route turnoff</p>
          <p>Jordan watches the group gather at the junction. “I still need a few minutes with everyone together. The view was the plan, but the message is why we're here.”</p>
          <p>${signalTrace()}</p>
          <button class="primary" type="button" data-direct="call">Make the route call</button>
        </div>
        <aside class="context-artifact">
          <p class="eyebrow">Field guide · Decision authority</p>
      <p>Eli may recommend either approved route and tell operations what changes. A medical need, closed route, or return plan that no longer works requires supervisor direction.</p>
          <div class="route-doodle" aria-hidden="true"><span>Junction</span><i></i><span>Overlook / creek connector</span></div>
        </aside>
      </div>`,
  },
  call: {
    html: () => `
      ${tapeHeading("Decision 3 · Make the call", "What do you recommend?")}
      <div class="choice-grid" role="radiogroup" aria-label="Choose Eli's recommendation">
        ${choice("proceed", state.decisionOne === "shorten" ? "Switch to the original climb" : "Proceed", "Continue toward the overlook after a short rest with a firm turnaround time.", "three")}
        ${choice("modify", state.decisionOne === "shorten" ? "Confirm the creek connector" : "Modify", state.decisionOne === "shorten" ? "Keep the shorter route and identify a place for lunch and remarks." : "Take the creek connector and identify an alternate lunch location.", "three")}
        ${choice("pause", "Pause", "Request an updated weather check before selecting a route.", "three")}
        ${choice("escalate", "Escalate", "Ask the supervisor to select the route.", "three")}
      </div>
      <fieldset id="transmission" class="transmission" disabled>
        <legend>Build Eli's update to operations and guests</legend>
        <p id="transmission-lock" class="transmission-lock">Choose a route above to begin the update.</p>
        <div class="transmission-progress" aria-label="Transmission progress">
          <span data-progress-part="situation"><b>1</b> Situation</span>
          <span data-progress-part="need"><b>2</b> Support</span>
          <span data-progress-part="guest"><b>3</b> To guests</span>
        </div>
        ${transmissionSlide("situation", "Situation", "What has changed from the original plan?", [
          ["clear", "Overlook 25+ minutes late; knee discomfort increasing; ridge storms possible by 1:00."],
          ["partial", "Weather uncertain and the group is moving slowly."],
          ["vague", "Things have changed since departure."],
        ], false)}
        ${transmissionSlide("need", "Support", "What does operations need to coordinate?", [
          ["clear", "Confirm receipt and keep the 3:15 pickup; I'll report any return change."],
          ["permission", "Please approve the route decision."],
          ["none", "No action needed."],
        ])}
        ${transmissionSlide("guest", "To guests", "How will you explain the call to the group?", [
          ["clear", "Explain the route and what it protects."],
          ["vague", "Say that plans may change later."],
          ["overpromise", "Promise that the original event is unchanged."],
        ])}
        <section id="transmission-review" class="transmission-review" aria-labelledby="transmission-review-title" hidden>
          <p class="transmission-kicker">Ready to send</p>
          <h3 id="transmission-review-title" tabindex="-1">Review your three choices</h3>
          <div class="transmission-review-list">
            <div><strong>Situation</strong><p data-review-part="situation"></p><button type="button" data-edit-part="situation">Edit</button></div>
            <div><strong>Support</strong><p data-review-part="need"></p><button type="button" data-edit-part="need">Edit</button></div>
            <div><strong>To guests</strong><p data-review-part="guest"></p><button type="button" data-edit-part="guest">Edit</button></div>
          </div>
        </section>
        <div class="transmission-controls">
          <button id="transmission-back" class="secondary" type="button" hidden>Back</button>
          <span id="transmission-position" aria-live="polite">Part 1 of 3</span>
          <button id="transmission-next" class="primary" type="button" disabled>Next: Support</button>
        </div>
      </fieldset>
      <div id="message-preview" class="message-preview" aria-live="polite" hidden></div>
      <button id="call-commit" class="primary" type="button" disabled hidden>Commit the decision</button>
      <div id="field-note" class="field-note" tabindex="-1" aria-live="polite" hidden></div>
      <button id="page-continue" class="primary" type="button" data-transition="outcome" data-map="outcome" hidden>Follow the route</button>`,
  },
  outcome: { html: "" },
  debrief: { html: "" },
};

function tapeHeading(label, title, level = "h2") {
  return `<header class="tape-heading"><p class="eyebrow">${label}</p><${level} id="page-title">${title}</${level}></header>`;
}

function choice(value, title, description, decision) {
  return `<button class="choice" type="button" role="radio" aria-checked="false" data-decision="${decision}" data-value="${value}"><strong>${title}</strong><span>${description}</span></button>`;
}

function signal(id, weight, text) {
  return `<button class="signal" type="button" aria-pressed="false" data-signal="${id}" data-weight="${weight}">${text}</button>`;
}

function tripTime(baseMinutes, suffix = false) {
  const minutes = baseMinutes + (departureChoices[state.decisionOne]?.delay || 0);
  const hour24 = Math.floor(minutes / 60) % 24;
  const hour12 = hour24 % 12 || 12;
  const clock = `${hour12}:${String(minutes % 60).padStart(2, "0")}`;
  return suffix ? `${clock} ${hour24 < 12 ? "AM" : "PM"}` : clock;
}

function departureTrace() {
  const traces = {
    start: "The first pace check has now tested the original schedule.",
    reset: "The departure reset gave Eli a clearer picture of what Jordan hopes to preserve.",
    consult: "The wait for an operations reply used part of the remaining weather window.",
    shorten: "The selected creek connector branches here. The group has traveled the shared trail; the new conditions invite a fresh check of that choice.",
  };
  return traces[state.decisionOne] || "";
}

function signalTrace() {
  const strong = state.signals.filter((signal) => ["pace", "knee", "weather"].includes(signal));
  return strong.length >= 2
    ? "Eli's field log pairs a guest report or current projection with the route still available. He has enough to recommend a route, though the forecast remains uncertain."
    : "Eli's field log still leans on what might improve. Before recommending a route, he needs to separate those hopes from what the group has observed.";
}

function transmissionSlide(group, label, prompt, options, hidden = true) {
  return `<section class="transmission-slide" data-transmission-part="${group}" aria-labelledby="transmission-${group}-title"${hidden ? " hidden" : ""}>
    <p class="transmission-kicker">${label}</p>
    <h3 id="transmission-${group}-title" tabindex="-1">${prompt}</h3>
    <div class="transmission-options" role="radiogroup" aria-label="${label}">${options.map(([value, text]) => `<button class="phrase" type="button" role="radio" aria-checked="false" data-message-group="${group}" data-value="${value}">${text}</button>`).join("")}</div>
  </section>`;
}

function recommendationText() {
  return {
    modify: "I recommend the creek connector, with lunch and Jordan's remarks at the clearing.",
    proceed: "I recommend the original ridge route, with a firm turnaround check before the exposed section.",
    pause: "I recommend a brief hold for a fresh weather check before choosing a route.",
    escalate: "I am asking the supervisor to choose the route while the group waits at the junction.",
  }[state.decisionThree] || "";
}

function guestText() {
  if (state.message.guest === "vague") return "Plans may change. I'll let you know later.";
  if (state.message.guest === "overpromise") return "Everything is on schedule and the original event is unchanged.";
  return {
    modify: "We're taking the creek connector so we can stay together and still hear Jordan's remarks.",
    proceed: "We're continuing toward the overlook, with a firm turnaround if pace or weather changes.",
    pause: "We're holding briefly for a weather update before choosing the route.",
    escalate: "I've asked our supervisor to choose the route; I'll update you when we hear back.",
  }[state.decisionThree] || "";
}

function selectedPhrase(group) {
  return pageContent.querySelector(`[data-message-group="${group}"][data-value="${state.message[group]}"]`)?.textContent || "";
}

function updateMessagePreview() {
  const preview = document.getElementById("message-preview");
  if (!preview) return;
  const complete = state.decisionThree && ["situation", "need", "guest"].every((key) => state.message[key]);
  preview.hidden = !complete || transmissionStep !== transmissionParts.length;
  if (preview.hidden) return;
  preview.replaceChildren();
  const operations = document.createElement("p");
  const operationsLabel = document.createElement("strong");
  operationsLabel.textContent = "To operations";
  operations.append(operationsLabel, document.createTextNode(`${selectedPhrase("situation")} ${recommendationText()} ${selectedPhrase("need")}`));
  const guests = document.createElement("p");
  const guestsLabel = document.createElement("strong");
  guestsLabel.textContent = "To guests";
  guests.append(guestsLabel, document.createTextNode(guestText()));
  preview.append(operations, guests);
}

function communicationQuality() {
  return ["situation", "need", "guest"].filter((key) => state.message[key] === "clear").length;
}

function signalFeedback() {
  const strong = ["pace", "knee", "weather"].filter((id) => state.signals.includes(id));
  const assumptionCount = state.signals.filter((id) => ["recover", "stabilize", "north", "trust"].includes(id)).length;
  const missed = [
    ["pace", "The pace projection is later than the planned overlook time."],
    ["knee", "The participant's report is a current condition, not a prediction about recovery."],
    ["weather", "The updated forecast narrows the ridge window, even though it is not a certainty."],
  ].find(([id]) => !state.signals.includes(id));
  if (strong.length >= 2) {
    const option = state.signals.includes("route") ? " The connector preserves an option; it does not itself prove the ridge unsafe." : "";
    return `You gave weight to current evidence and projections. ${missed ? missed[1] : "Those changes need to be considered together."}${option}`;
  }
  return `${assumptionCount ? "Several selections depend on improvement that has not happened yet." : "The route option matters, but it is not a condition that changes the ridge plan."} ${missed?.[1] || "Compare the documented changes before choosing a route."}`;
}

function routeFeedback() {
  return {
    modify: "The creek route preserves a gathering and avoids the exposed ridge.",
    proceed: "The overlook protects the original promise, but now depends on pace, comfort, and weather cooperating.",
    pause: "A weather check can help, but an open-ended hold consumes the same route window you are trying to protect.",
    escalate: "Sharing the situation helps; asking a supervisor to choose an approved route transfers a call Eli can make.",
  }[state.decisionThree] || "";
}

const notesOne = {
  start: "You preserved momentum and set a pace checkpoint. It helps only if you act on the result while the connector remains available.",
  reset: "You used three minutes to test comfort, timing, and Jordan's purpose. That information can preserve more options than the delay costs.",
  consult: "You created shared awareness, but waited nine minutes for direction on an approved route Eli can recommend.",
  shorten: "You protected time and reduced exposure, but committed to a major change before confirming what the group most needed to preserve.",
};

const transitions = {
  trailhead: {
    key: "trailhead", path: approachPath, progress: approachProgressPath,
    title: "To the trailhead",
    start: { x: 52, y: 199 }, end: { x: 112, y: 212 },
    orient: ["The original plan", `Lunch and Jordan's remarks were planned at the overlook by ${tripPlan.overlook}; pickup is fixed at ${tripPlan.pickup}. A creek connector branches from Laurel Junction.`, "10:35 AM", "Operations area", "Shuttle 35 minutes late"],
    move: ["The day begins late", "Eli and the group travel from operations to the Laurel Ridge trailhead."],
    update: ["A late start at the trailhead", "The group is ready to depart. Both routes share the trail to Laurel Junction; there the creek connector cuts across the longer ridge bend.", "10:42 AM", "Trailhead", "Decision 1 · Departure"],
    announcement: "At the trailhead after a late arrival. Decision 1 is next.",
  },
  junction: {
    key: "junction", path: toJunctionPath, progress: traveledPath,
    title: "Toward Laurel Junction",
    start: { x: 112, y: 212 }, end: { x: 392, y: 240 },
    orient: ["Leaving the trailhead", "The group follows the shared trail to Laurel Junction. Eli will watch pace and guest comfort as the terrain changes.", "10:47 AM", "Trailhead", "Departure choice recorded"],
    move: ["The trail begins to answer back", "The group travels toward Laurel Junction as pace, comfort, and weather change."],
    update: ["New signals at Laurel Junction", `Pace now projects a later overlook arrival than the ${tripPlan.overlook} plan. Eli also has a guest report and a forecast update; the connector branches here.`, "11:52 AM", "Laurel Junction", "Decision 2 · Weigh the signals"],
    announcement: "At Laurel Junction. Eli has a pace check, a guest report, a new forecast, and the shorter creek connector to consider.",
  },
};

function junctionTransition() {
  const transition = {
    ...transitions.junction,
    orient: [...transitions.junction.orient],
    update: [...transitions.junction.update],
  };
  transition.orient[2] = tripTime(10 * 60 + 47, true);
  transition.update[2] = tripTime(11 * 60 + 52, true);
  if (state.decisionOne === "shorten") {
    transition.orient[1] = "Eli selected the creek connector at departure. Both routes share the trail to Laurel Junction, where the shortcut crosses the valley.";
    transition.update[1] = "The selected creek connector begins here. Eli has a pace check, a guest report, and a new forecast before confirming or revising that choice.";
  } else if (state.decisionOne === "consult") {
    transition.orient[1] = "Operations asks Eli to continue to Laurel Junction and reassess with current conditions. The wait has used part of the route window.";
  } else if (state.decisionOne === "reset") {
    transition.orient[1] = "After a brief reset, Eli takes the shared trail toward Laurel Junction with a clearer sense of guest priorities.";
  } else {
    transition.orient[1] = "Eli starts on the shared trail, using the first marker to check pace and comfort. The creek connector branches at Laurel Junction.";
  }
  return transition;
}

function renderPage(name) {
  state.page = name;
  if (name === "call") transmissionStep = 0;
  journalPage.dataset.page = name;
  pageArtifact.innerHTML = pageArtifacts[name] || "";
  pageEphemera.innerHTML = pageEphemeraByPage[name] || "";
  pageMarker.textContent = pageMarkers[name] || "Field Journal";
  if (name === "outcome") pages.outcome.html = outcomeHtml();
  if (name === "debrief") pages.debrief.html = debriefHtml();
  pageContent.innerHTML = typeof pages[name].html === "function" ? pages[name].html() : pages[name].html;
  journalStage.hidden = false;
  mapStage.hidden = true;
  journalPage.classList.remove("is-leaving");
  journalPage.classList.add("is-entering");
  window.setTimeout(() => journalPage.classList.remove("is-entering"), 560);
  bindPageInteractions();
  const heading = pageContent.querySelector("h1, h2");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus();
}

function bindPageInteractions() {
  pageContent.querySelectorAll("[data-direct]").forEach((button) => {
    button.addEventListener("click", () => turnDirect(button.dataset.direct));
  });
  pageContent.querySelectorAll("[data-transition]").forEach((button) => {
    button.addEventListener("click", () => beginMapTransition(button.dataset.transition, button.dataset.map));
  });

  pageContent.querySelectorAll('[data-decision="one"]').forEach((button) => {
    button.addEventListener("click", () => {
      state.decisionOne = button.dataset.value;
      setRadioSelection('[data-decision="one"]', button);
      showNote(notesOne[state.decisionOne], false);
      document.getElementById("page-continue").disabled = false;
    });
  });

  const signalButtons = [...pageContent.querySelectorAll("[data-signal]")];
  signalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.getAttribute("aria-pressed") === "true";
      if (!selected && state.signals.length >= 3) return;
      button.setAttribute("aria-pressed", String(!selected));
      state.signals = signalButtons.filter((item) => item.getAttribute("aria-pressed") === "true").map((item) => item.dataset.signal);
      const count = document.getElementById("signal-count");
      const commit = document.getElementById("signal-commit");
      if (count) count.textContent = `${state.signals.length} of 3 selected`;
      if (commit) commit.disabled = state.signals.length !== 3;
    });
  });

  document.getElementById("signal-commit")?.addEventListener("click", () => {
    showNote(signalFeedback());
    signalButtons.forEach((button) => { button.disabled = true; });
    document.getElementById("signal-commit").disabled = true;
    document.getElementById("page-continue").hidden = false;
  });

  pageContent.querySelectorAll('[data-decision="three"]').forEach((button) => {
    button.addEventListener("click", () => {
      state.decisionThree = button.dataset.value;
      setRadioSelection('[data-decision="three"]', button);
      document.getElementById("transmission").disabled = false;
      document.getElementById("transmission-lock").hidden = true;
      showTransmissionStep(transmissionStep, false);
    });
  });

  pageContent.querySelectorAll("[data-message-group]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.messageGroup;
      setRadioSelection(`[data-message-group="${group}"]`, button);
      state.message[group] = button.dataset.value;
      showTransmissionStep(transmissionStep, false);
    });
  });

  document.getElementById("transmission-back")?.addEventListener("click", () => {
    if (transmissionStep > 0) showTransmissionStep(transmissionStep - 1);
  });
  document.getElementById("transmission-next")?.addEventListener("click", () => {
    if (transmissionStep < transmissionParts.length && state.message[transmissionParts[transmissionStep]]) {
      showTransmissionStep(transmissionStep + 1);
    }
  });
  pageContent.querySelectorAll("[data-edit-part]").forEach((button) => {
    button.addEventListener("click", () => showTransmissionStep(transmissionParts.indexOf(button.dataset.editPart)));
  });

  document.getElementById("call-commit")?.addEventListener("click", () => {
    if (transmissionStep !== transmissionParts.length || !transmissionParts.every((part) => state.message[part])) return;
    const messageNote = communicationQuality() === 3
      ? "Your update names the plan, tells operations what to coordinate, and gives guests a clear reason."
      : "Your route call needs a clearer situation, support request, or explanation to guests.";
    showNote(`${routeFeedback()} ${messageNote}`);
    pageContent.querySelectorAll('[data-decision="three"], [data-message-group]').forEach((button) => { button.disabled = true; });
    document.getElementById("transmission").disabled = true;
    document.getElementById("call-commit").disabled = true;
    document.getElementById("page-continue").hidden = false;
  });

  if (state.page === "call") showTransmissionStep(0, false);

  document.getElementById("restart")?.addEventListener("click", restart);
  pageContent.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    group.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const radios = [...group.querySelectorAll('[role="radio"]')].filter((radio) => !radio.disabled);
      if (!radios.length) return;
      const current = radios.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0
        : event.key === "End" ? radios.length - 1
          : (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + radios.length) % radios.length;
      event.preventDefault();
      radios[next].focus();
      radios[next].click();
    });
  });
}

function setRadioSelection(selector, selected) {
  pageContent.querySelectorAll(selector).forEach((button) => button.setAttribute("aria-checked", String(button === selected)));
}

function showNote(text, focusNote = true) {
  const note = document.getElementById("field-note");
  note.textContent = text;
  note.hidden = false;
  if (focusNote) note.focus();
}

function showTransmissionStep(step, moveFocus = true) {
  transmissionStep = step;
  pageContent.querySelectorAll("[data-transmission-part]").forEach((panel, index) => {
    panel.hidden = index !== step;
  });
  const review = document.getElementById("transmission-review");
  review.hidden = step !== transmissionParts.length;
  pageContent.querySelectorAll("[data-progress-part]").forEach((item, index) => {
    item.dataset.state = step === transmissionParts.length || index < step ? "complete" : index === step ? "active" : "upcoming";
  });
  const back = document.getElementById("transmission-back");
  const next = document.getElementById("transmission-next");
  const commit = document.getElementById("call-commit");
  back.hidden = step === 0;
  next.hidden = step === transmissionParts.length;
  if (step < transmissionParts.length) {
    next.disabled = !state.message[transmissionParts[step]];
    next.textContent = step === transmissionParts.length - 1 ? "Review transmission" : `Next: ${step === 0 ? "Support" : "To guests"}`;
  }
  document.getElementById("transmission-position").textContent = step === transmissionParts.length ? "Review before sending" : `Part ${step + 1} of 3`;
  commit.hidden = step !== transmissionParts.length;
  commit.disabled = !state.decisionThree || !transmissionParts.every((part) => state.message[part]);
  if (step === transmissionParts.length) {
    pageContent.querySelectorAll("[data-review-part]").forEach((item) => {
      item.textContent = selectedPhrase(item.dataset.reviewPart);
    });
  }
  updateMessagePreview();
  if (moveFocus) {
    const heading = step === transmissionParts.length ? review.querySelector("h3") : pageContent.querySelector(`[data-transmission-part="${transmissionParts[step]}"] h3`);
    heading?.focus();
  }
}

function turnDirect(nextPage) {
  journalPage.classList.add("is-leaving");
  window.setTimeout(() => renderPage(nextPage), reducedMotion.matches ? 20 : 420);
}

function beginMapTransition(nextPage, transitionKey) {
  pendingPage = nextPage;
  activeTransition = transitionKey === "outcome" ? outcomeTransition() : transitionKey === "junction" ? junctionTransition() : transitions[transitionKey];
  journalPage.classList.add("is-leaving");
  window.setTimeout(showMapTransition, reducedMotion.matches ? 20 : 420);
}

function showMapTransition() {
  journalStage.hidden = true;
  mapStage.hidden = false;
  mapStage.classList.add("is-entering");
  mapStage.dataset.transition = activeTransition.key;
  mapStage.dataset.outcome = activeTransition.key === "outcome" ? state.decisionThree : "";
  mapStage.dataset.departure = state.decisionOne || "none";
  selectedRouteLabel.textContent = activeTransition.key === "outcome" ? "Earlier selection" : "Selected at departure";
  mapHeading.textContent = activeTransition.title;
  ["orient", "move", "update"].forEach((phase, index) => {
    const step = mapStorySteps[index];
    step.querySelector("strong").textContent = activeTransition[phase][0];
    step.querySelector("span").textContent = activeTransition[phase][1];
    step.classList.remove("is-visible", "is-instant");
    step.setAttribute("aria-hidden", "true");
  });
  renderMapDecisionTrace();
  mapDecisionTrace.hidden = true;
  setMapProgress(approachProgressPath, activeTransition.key === "trailhead" ? 0 : 1);
  setMapProgress(traveledPath, activeTransition.key === "trailhead" ? 0 : activeTransition.key === "junction" ? 0 : 1);
  setMapProgress(committedPath, 0);
  setMapProgress(ridgeProgressPath, 0);
  setMapProgress(returnPath, 0);
  positionMarker(activeTransition.start);
  if (activeTransition.key === "outcome") placeOutcomeCondition(activeTransition);
  document.getElementById("outcome-condition").style.display = activeTransition.key === "outcome" ? "" : "none";
  document.getElementById("junction-condition").style.display = activeTransition.key === "trailhead" ? "none" : "";
  mapContinue.hidden = true;
  skipTransition.hidden = false;
  setMapPhase("orient");
  mapHeading.setAttribute("tabindex", "-1");
  mapHeading.focus();
  if (reducedMotion.matches) {
    completeMapMotion(true);
  } else {
    clearTimeout(phaseTimer);
    phaseTimer = window.setTimeout(startMapMotion, 1150);
  }
}

function setMapPhase(phase, instant = false) {
  mapStage.dataset.phase = phase;
  const details = activeTransition[phase];
  mapPhase.textContent = phase === "orient" ? "Route update · Orient" : phase === "move" ? "Route update · Moving" : "Route update · At the next point";
  revealMapStory(phase, instant);
  if (phase !== "move") {
    mapTime.textContent = details[2];
    mapPlace.textContent = details[3];
    mapStatus.textContent = details[4];
  }
  if (phase === "update") {
    const routes = activeTransition.key === "trailhead"
      ? "The shared trail leads to Laurel Junction; the creek connector and ridge route split there."
      : activeTransition.key === "junction"
        ? "From here, the creek connector leads to the clearing; the ridge route bends to the overlook."
        : "The route marker shows the group's new location; the original and alternate routes remain visible for comparison.";
    document.getElementById("mobile-map-summary").textContent = `Current location: ${details[3]}. ${routes}`;
  }
}

function revealMapStory(phase, instant = false) {
  const step = mapStorySteps[["orient", "move", "update"].indexOf(phase)];
  if (instant) step.classList.add("is-instant");
  step.classList.add("is-visible");
  step.setAttribute("aria-hidden", "false");
}

function renderMapDecisionTrace() {
  mapDecisionTrace.replaceChildren();
  if (activeTransition.key === "trailhead") return;
  const departure = document.createElement("p");
  departure.textContent = `Trailhead choice · ${departureChoices[state.decisionOne]?.label || "Not recorded"}`;
  mapDecisionTrace.append(departure);
  if (activeTransition.key === "outcome") {
    const signals = document.createElement("p");
    signals.textContent = `Eli's field log · ${state.signals.map((signal) => signalLabels[signal]).filter(Boolean).join(", ") || "No signals recorded"}`;
    mapDecisionTrace.append(signals);
  }
}

function startMapMotion() {
  setMapPhase("move");
  const transition = activeTransition;
  const duration = transition.key === "trailhead" ? 1550 : 2300;
  const started = performance.now();
  const routeLength = transition.path.getTotalLength();

  function frame(now) {
    const elapsed = Math.min(1, (now - started) / duration);
    // Smoothly accelerate and decelerate so the marker reads as walking, not sliding.
    const eased = elapsed < .5 ? 4 * elapsed ** 3 : 1 - (-2 * elapsed + 2) ** 3 / 2;
    const point = transition.path.getPointAtLength(routeLength * (transition.fraction || 1) * eased);
    positionMarker(point);
    if (transition.progress) setMapProgress(transition.progress, (transition.fraction || 1) * eased);
    if (elapsed < 1) animationFrame = requestAnimationFrame(frame);
    else completeMapMotion();
  }
  animationFrame = requestAnimationFrame(frame);
}

function setMapProgress(path, fraction) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length * (1 - fraction)}`;
}

function positionMarker(point) {
  mapMarker.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
}

function transitionEndPoint(transition) {
  return transition.path
    ? transition.path.getPointAtLength(transition.path.getTotalLength() * (transition.fraction || 1))
    : transition.end;
}

function placeOutcomeCondition(transition) {
  const point = transitionEndPoint(transition);
  const condition = document.getElementById("outcome-condition");
  const isLowPoint = point.y > 420;
  const left = isLowPoint ? Math.min(point.x + 80, 720) : Math.max(34, Math.min(point.x - 120, 720));
  const top = isLowPoint ? point.y - 160 : Math.max(355, Math.min(point.y + 110, 435));
  const anchorX = point.x - left;
  condition.setAttribute("transform", `translate(${left.toFixed(1)} ${top.toFixed(1)})`);
  const lineStart = isLowPoint ? "M0 50" : `M${anchorX.toFixed(1)} 0`;
  condition.querySelector("path").setAttribute("d", `${lineStart} L${anchorX.toFixed(1)} ${(point.y - top).toFixed(1)}`);
}

function completeMapMotion(instant = false) {
  clearTimeout(phaseTimer);
  cancelAnimationFrame(animationFrame);
  const transition = activeTransition;
  if (transition.progress) setMapProgress(transition.progress, transition.fraction || 1);
  const endPoint = transitionEndPoint(transition);
  positionMarker(endPoint);
  if (instant) mapStorySteps[0].classList.add("is-instant");
  revealMapStory("move", instant);
  setMapPhase("update", instant);
  mapAnnouncement.textContent = transition.announcement;
  mapDecisionTrace.hidden = activeTransition.key === "trailhead";
  skipTransition.hidden = true;
  mapContinue.hidden = false;
  if (transition.condition) {
    document.getElementById("condition-title").textContent = transition.condition[0];
    document.getElementById("condition-line-one").textContent = transition.condition[1];
    document.getElementById("condition-line-two").textContent = transition.condition[2];
  }
  mapContinue.focus();
}

function finishMapTransition() {
  mapStage.classList.remove("is-entering");
  renderPage(pendingPage);
  pendingPage = null;
  activeTransition = null;
}

skipTransition.addEventListener("click", () => completeMapMotion(true));
mapContinue.addEventListener("click", finishMapTransition);

function outcomeTransition() {
  const choices = {
    modify: {
      path: committedPath, progress: committedPath, end: { x: 742, y: 292 },
      orient: ["Two routes remain", "The original route follows the ridge spur toward the overlook. The creek connector crosses toward the lower clearing.", "11:55 AM", "Laurel Junction", "Route decision committed"],
      move: ["The group takes the creek connector", "Eli leads the group across the shorter link to the creek clearing."],
      update: ["The route bends toward the purpose", "The group reaches the creek clearing. Lunch and Jordan's remarks remain possible, even without the overlook.", "12:28 PM", "Creek clearing", "Margin preserved"],
      condition: ["Creek clearing", "The group stays together", "Lunch and remarks preserved"],
      announcement: "The group takes the shorter creek connector to the clearing. The longer ridge route toward the overlook remains visible but is no longer the plan.",
    },
    proceed: {
      path: ridgeProgressPath, progress: ridgeProgressPath, end: { x: 560, y: 525 },
      orient: ["Two routes remain", "The original route curves around the ridge spur to the overlook before continuing on the far side. The creek connector leads into the lower drainage.", "11:55 AM", "Laurel Junction", "Route decision committed"],
      move: ["The group follows the ridge bend", "Eli keeps the original route as the trail approaches the exposed overlook."],
      update: ["The route narrows", "The group reaches the overlook as weather and time close in. The creek-connector turnoff is now behind them.", "12:32 PM", "Overlook", "Margin narrowing"],
      condition: ["Overlook", "Storm window closing", "Turnaround becoming urgent"],
      announcement: "The group reaches the exposed overlook by the longer ridge bend. The creek connector is behind them and turnaround is urgent.",
    },
    pause: {
      path: returnPath, progress: returnPath, end: { x: 112, y: 212 },
      orient: ["The group waits", "Eli holds the group at Laurel Junction while the weather window continues to narrow.", "11:55 AM", "Laurel Junction", "Route decision delayed"],
      move: ["The window closes", "Eli turns the group back toward the trailhead."],
      update: ["The remaining window closes", "The group returns to the trailhead. The shorter experience that had been available is lost.", "12:40 PM", "Trailhead", "Opportunity lost"],
      condition: ["Return to trailhead", "Weather window lost", "No lunch gathering on trail"],
      announcement: "The group retraces the route from Laurel Junction toward the trailhead after the weather window narrows.",
    },
    escalate: {
      path: committedPath, progress: committedPath, end: { x: 742, y: 292 },
      orient: ["The group waits for direction", "Eli sends the route choice to a supervisor while the group remains at Laurel Junction.", "11:55 AM", "Laurel Junction", "Decision transferred"],
      move: ["A later turn toward the creek", "The supervisor recommends the creek connector and the group begins moving again."],
      update: ["The group adjusts safely", "The creek clearing remains possible, but the wait compresses the gathering and makes the change feel reactive.", "12:43 PM", "Creek clearing", "Less margin remains"],
      condition: ["Creek clearing", "Group arrives later", "Lunch and remarks compressed"],
      announcement: "After a delay, the group follows the shorter creek connector to the clearing. The gathering is compressed.",
    },
  };
  const choice = choices[state.decisionThree] || choices.pause;
  const transition = {
    key: "outcome", title: "After the route call", start: { x: 392, y: 240 },
    ...choice, orient: [...choice.orient], update: [...choice.update],
  };
  transition.orient[2] = tripTime(11 * 60 + 55, true);
  const arrivalTimes = { modify: 12 * 60 + 28, proceed: 12 * 60 + 32, pause: 12 * 60 + 40, escalate: 12 * 60 + 43 };
  transition.update[2] = tripTime(arrivalTimes[state.decisionThree] || arrivalTimes.pause, true);
  if (state.decisionOne === "shorten") {
    if (state.decisionThree === "modify") {
      transition.orient[1] = "Eli confirms the shorter creek connector selected at departure, now with a clearing for Jordan's remarks.";
    } else if (state.decisionThree === "proceed") {
      transition.orient[1] = "Eli reverses the earlier creek-connector choice and takes the longer ridge bend toward the overlook.";
    } else {
      transition.orient[1] = "The shorter creek connector was selected at departure, but the group waits at the junction before that route is confirmed or changed.";
    }
  }
  if (state.decisionThree === "proceed" && journeyEvidence().prepared && journeyEvidence().clearUpdate) {
    transition.update[0] = "A firm turnaround";
    transition.update[1] = "The group reaches the overlook. Eli uses the earlier pace and forecast checks to keep the stop brief and turn back before the storm window.";
    transition.update[4] = "Limited margin, but a clear trigger";
    transition.condition = ["Overlook", "Brief stop", "Turnaround honored"];
    transition.announcement = "The group reaches the overlook, then turns back promptly using the earlier checks and stated turnaround trigger.";
  }
  return transition;
}

function journeyEvidence() {
  const reliableSignals = ["pace", "knee", "weather"].filter((id) => state.signals.includes(id));
  const assumptions = ["recover", "stabilize", "north", "trust"].filter((id) => state.signals.includes(id));
  const earlyCheck = ["start", "reset"].includes(state.decisionOne);
  return {
    reliableSignals,
    assumptions,
    earlyCheck,
    prepared: earlyCheck && reliableSignals.length >= 2,
    clearUpdate: communicationQuality() === 3,
  };
}

function outcomeHtml() {
  const evidence = journeyEvidence();
  const outcomes = {
    modify: {
      title: "The purpose survives the plan",
      description: "The group gathers beside the creek. Jordan gives the speech with everyone present, and the participant remains included.",
      consequence: evidence.clearUpdate
        ? evidence.prepared ? "Eli's early check and clear update let operations and guests adjust without a scramble." : "Eli's clear update helps operations and guests adjust, though the change comes late."
        : "The route works, but operations must clarify the vague update, leaving less time for the gathering.",
      photo: "/margin-prototype/assets/outcome-creek-gathering.webp",
      photoAlt: "The group gathered for Jordan's remarks beside the creek",
      artifact: `<div class="note-card"><p>“This wasn't the view we planned, but it was the moment I wanted.”</p><p class="meta">Jordan Lee</p></div>`,
    },
    escalate: {
      title: "The group adjusts safely",
      description: "The supervisor recommends the creek connector. The group remains safe, but the delay compresses lunch and the change feels reactive.",
      consequence: state.decisionOne === "consult" ? "A second wait for direction further shortens Jordan's time with the team." : "The approved alternate was available when Eli reached the junction.",
      photo: "/margin-prototype/assets/outcome-shortened-outing.webp", photoAlt: "The group taking a shortened lunch stop beside the creek", artifact: "",
    },
    pause: {
      title: "The remaining window closes",
      description: "The weather check does not remove uncertainty. Without a point at which to make the route call, Eli waits until the shorter outing is no longer viable and returns to the trailhead.",
      consequence: evidence.prepared ? "Eli had already gathered enough to recommend the connector, but did not use it in time." : "The group remains safe, but loses the gathering Jordan hoped to preserve.",
      photo: "/margin-prototype/assets/outcome-trailhead-return.webp", photoAlt: "The group returning toward the trailhead shuttle", artifact: "",
    },
    proceed: evidence.prepared && evidence.clearUpdate ? {
      title: "A narrow recovery",
      description: "The group reaches the overlook, but Eli uses the pace and weather checks to honor the firm turnaround. They return before the storm; Jordan's gathering is brief and the original plan is only partly preserved.",
      consequence: "Earlier checks and a clear update kept a fragile choice from becoming a near miss.",
      photo: "/margin-prototype/assets/outcome-short-overlook.webp", photoAlt: "The group making a brief stop at the ridge overlook", artifact: "",
    } : {
      title: "The assumptions do not hold",
      description: "Weather reaches the exposed terrain sooner than expected. During the hurried return, the participant loses footing and Eli stabilizes them.",
      consequence: "The group returns late and shaken. No injury occurs.",
      photo: "/margin-prototype/assets/outcome-near-miss.webp",
      photoAlt: "One guest steadying another on the wet rocky ridge trail",
      artifact: `<div class="review-card"><p>“The trip started late and our concerns didn't seem to change the plan. We were rushed back when the weather changed, and one person nearly fell. I wouldn't book another group event.”</p><p class="meta">Public review · 1 star</p></div>`,
    },
  };
  const outcome = outcomes[state.decisionThree] || outcomes.pause;
  return `${tapeHeading("Outcome", outcome.title)}<div class="outcome-layout"><div><p class="lead">${outcome.description}</p><p>${outcome.consequence}</p>${outcome.artifact}<button class="primary" type="button" data-direct="debrief">Open the Trail Debrief</button></div><figure class="journal-photo outcome-photo"><img src="${outcome.photo}" alt="${outcome.photoAlt}" loading="lazy" decoding="async"></figure></div>`;
}

function debriefHtml() {
  const evidence = journeyEvidence();
  let profile = "Signal spotter";
  let summary = "The route choice mattered; the quality and timing of the evidence and update shaped what it preserved.";
  if (state.decisionThree === "modify" && evidence.reliableSignals.length >= 2 && evidence.clearUpdate) {
    profile = "Calibrated navigator";
    summary = "You adapted the plan without abandoning its purpose, acted within the role, and created shared awareness.";
  } else if (state.decisionThree === "proceed") {
    profile = evidence.prepared && evidence.clearUpdate ? "Bounded navigator" : "Momentum-first";
    summary = evidence.prepared && evidence.clearUpdate
      ? "You kept the original route but used a clear turnaround trigger to prevent a near miss. The gathering was compressed."
      : "You protected progress and the original promise, but the plan came to depend on too many favorable assumptions.";
  } else if (["pause", "escalate"].includes(state.decisionThree)) {
    profile = "Caution-first";
    summary = "You protected the group, but transferred or delayed a decision that may have remained within Eli's authority.";
  }
  const departure = {
    start: "You started with a pace checkpoint. Its value depended on acting while the route could still change.",
    reset: "Your trailhead reset spent three minutes to clarify comfort and Jordan's purpose.",
    consult: "Consulting operations created shared awareness but used nine minutes before the first route check.",
    shorten: "You selected the connector early, before confirming which part of Jordan's event mattered most.",
  }[state.decisionOne] || "";
  const evidenceNames = evidence.reliableSignals.map((id) => signalLabels[id]);
  const namedEvidence = evidenceNames.length === 3 ? `${evidenceNames[0]}, ${evidenceNames[1]}, and ${evidenceNames[2]}` : evidenceNames.join(" and ");
  const evidenceLine = evidence.reliableSignals.length >= 2
    ? `You used the ${namedEvidence} as decision inputs${state.signals.includes("route") ? ", while keeping the connector available" : ""}.`
    : `Your field log leaned on ${evidence.assumptions.map((id) => signalLabels[id]).join(" and ") || "an available route"}; compare those hopes with the current report and projections.`;
  const nextMove = evidence.reliableSignals.length < 2
    ? "At the next junction, compare actual pace, guest reports, and the forecast with the original plan before recommending a route."
    : !evidence.clearUpdate
      ? "When the plan changes, name the route, ask operations to confirm coordination, and explain the reason to guests."
      : ["pause", "escalate"].includes(state.decisionThree)
        ? "When an approved option is still viable, set a short decision trigger and make the call within your role."
        : state.decisionThree === "modify"
          ? "Carry this pattern forward: compare changes with the plan, protect the group's purpose, and keep operations and guests informed."
          : "Keep a clear turnaround trigger even when the route and the event still seem possible.";
  return `${tapeHeading("Trail Debrief", "How you managed the margin")}<p class="profile-name">${profile}</p><p class="debrief-summary">${summary}</p><div class="trail-trace"><div><strong>At departure</strong><p>${departure}</p></div><div><strong>At the junction</strong><p>${evidenceLine}</p></div><div><strong>Your route call</strong><p>${routeFeedback()}</p></div><div><strong>Next time</strong><p>${nextMove}</p></div></div><div class="field-aid"><strong>Field aid · A usable route update</strong><p>Name the change and separate facts from assumptions. Compare the time, guest need, and route options. Recommend within your authority; escalate a medical need, closed route, or unworkable return. Tell operations and guests what happens next.</p></div><p class="margin-line">Margin is not a score. It is the room your decisions preserve for whatever happens next.</p><button id="restart" class="secondary" type="button">Replay the experience</button>`;
}

function restart() {
  state.decisionOne = null;
  state.signals = [];
  state.decisionThree = null;
  state.message = {};
  clearTimeout(phaseTimer);
  cancelAnimationFrame(animationFrame);
  positionMarker({ x: 52, y: 199 });
  renderPage("cover");
}

renderPage("cover");
