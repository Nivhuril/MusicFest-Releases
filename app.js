"use strict";

const el = {
  headerVersion: document.getElementById("header-version"),
  protocolInline: document.getElementById("protocol-inline"),
  downloadVersion: document.getElementById("download-version"),
  downloadMeta: document.getElementById("download-meta"),
  downloadBtn: document.getElementById("download-btn"),
  downloadApkBtn: document.getElementById("download-apk-btn"),
  downloadNote: document.getElementById("download-note"),
  protocolNote: document.getElementById("protocol-note"),
  notesList: document.getElementById("notes-list"),
  schedule: document.getElementById("schedule"),
  historyCard: document.getElementById("history-card"),
  history: document.getElementById("history"),
  integrity: document.getElementById("integrity"),
  integrityApk: document.getElementById("integrity-apk"),
  androidCard: document.getElementById("android-card"),
  androidNote: document.getElementById("android-note"),
  footerGame: document.getElementById("footer-game"),
  footerUpdated: document.getElementById("footer-updated"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatSizeMb(sizeMb) {
  const value = Number(sizeMb);
  if (!Number.isFinite(value) || value <= 0) return "";
  return value >= 1024 ? `${(value / 1024).toFixed(1)} ГБ` : `${value} МБ`;
}

function renderNotes(listElement, notes) {
  listElement.innerHTML = "";
  if (!Array.isArray(notes) || notes.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "Нет описания изменений.";
    listElement.appendChild(li);
    return;
  }

  for (const note of notes) {
    const li = document.createElement("li");
    li.textContent = note;
    listElement.appendChild(li);
  }
}

function renderSchedule(entries) {
  el.schedule.innerHTML = "";

  if (!Array.isArray(entries) || entries.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Расписание пока не опубликовано. Следите за обновлениями.";
    el.schedule.appendChild(p);
    return;
  }

  const now = new Date();
  const sorted = [...entries]
    .filter((entry) => entry && entry.date)
    .sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));

  const list = document.createElement("ul");
  list.className = "schedule-list";

  for (const entry of sorted) {
    const when = new Date(`${entry.date}T${entry.time || "00:00"}:00`);
    const isPast = !Number.isNaN(when.getTime()) && when < now;

    const item = document.createElement("li");
    item.className = "schedule-item";

    const whenText = [formatDate(entry.date), entry.time, entry.tz]
      .filter(Boolean)
      .join(" · ");

    item.innerHTML =
      `<div class="schedule-when">${escapeHtml(whenText)}${isPast ? " (прошло)" : ""}</div>` +
      `<div class="schedule-title">${escapeHtml(entry.title || "Встреча")}</div>` +
      (entry.host ? `<div class="schedule-sub">Ведущий: ${escapeHtml(entry.host)}</div>` : "") +
      (entry.note ? `<div class="schedule-sub">${escapeHtml(entry.note)}</div>` : "");

    list.appendChild(item);
  }

  el.schedule.appendChild(list);
}

function renderHistory(entries) {
  el.history.innerHTML = "";

  if (!Array.isArray(entries) || entries.length === 0) {
    el.historyCard.hidden = true;
    return;
  }

  for (const entry of entries) {
    const details = document.createElement("details");
    details.className = "history-item";

    const summary = document.createElement("summary");
    summary.textContent = `v${entry.version}` + (entry.date ? ` — ${formatDate(entry.date)}` : "");
    details.appendChild(summary);

    const notes = document.createElement("ul");
    notes.className = "notes";
    renderNotes(notes, entry.notes);
    details.appendChild(notes);

    el.history.appendChild(details);
  }

  el.historyCard.hidden = false;
}

function setDownloadButton(button, url, label) {
  const trimmed = (url || "").trim();
  if (trimmed) {
    button.href = trimmed;
    button.textContent = label;
    button.removeAttribute("aria-disabled");
    button.hidden = false;
    return true;
  }

  button.href = "#";
  button.setAttribute("aria-disabled", "true");
  return false;
}

function renderAndroid(entry) {
  const hasApk = Boolean(entry && (entry.downloadUrl || "").trim());

  el.androidCard.hidden = !hasApk;
  if (!hasApk) {
    el.downloadApkBtn.hidden = true;
    el.integrityApk.textContent = "";
    return;
  }

  setDownloadButton(el.downloadApkBtn, entry.downloadUrl, "Скачать для Android");

  const metaParts = [formatSizeMb(entry.sizeMb)].filter(Boolean);
  el.androidNote.textContent = metaParts.length
    ? `APK: ${metaParts.join(" · ")}. Версия та же, что у Windows — можно играть вместе.`
    : "Версия та же, что у Windows — можно играть вместе.";

  el.integrityApk.textContent = entry.sha256 ? `SHA-256 APK: ${entry.sha256}` : "";
}

function renderManifest(manifest) {
  const latest = manifest.latest || {};
  const protocol = manifest.protocol || "";

  const versionLabel = latest.version ? `v${latest.version}` : "v?";
  document.title = `MusicFest ${versionLabel} — скачать`;
  el.headerVersion.textContent = versionLabel;
  el.downloadVersion.textContent = versionLabel;

  const metaParts = [formatDate(latest.date), formatSizeMb(latest.sizeMb)].filter(Boolean);
  el.downloadMeta.textContent = metaParts.join(" · ");

  if (setDownloadButton(el.downloadBtn, latest.downloadUrl, "Скачать для Windows")) {
    el.downloadNote.textContent =
      "Архив Windows: распаковать целиком (MusicFest.exe + MusicFest_Data).";
  } else {
    el.downloadNote.textContent = "Ссылка на архив появится после публикации сборки.";
  }

  renderAndroid(manifest.android);

  if (protocol) {
    el.protocolInline.textContent = protocol;
    el.protocolNote.className = "protocol-note ok";
    el.protocolNote.textContent =
      `Совместимы все сборки серии ${protocol}.x. Несовпадение major.minor — обновитесь, игра не пустит на сервер.`;
  } else {
    el.protocolNote.textContent = "";
  }

  renderNotes(el.notesList, latest.notes);
  renderSchedule(manifest.schedule);
  renderHistory(manifest.history);

  el.integrity.textContent = latest.sha256 ? `SHA-256 архива: ${latest.sha256}` : "";

  el.footerGame.textContent = manifest.game || "MusicFest";
  el.footerUpdated.textContent = latest.date ? `обновлено ${formatDate(latest.date)}` : "";
}

function renderError(message) {
  el.downloadVersion.textContent = "v?";
  el.downloadMeta.textContent = "";
  el.downloadBtn.setAttribute("aria-disabled", "true");
  el.downloadApkBtn.hidden = true;
  el.androidCard.hidden = true;
  el.downloadNote.textContent = message;
  el.notesList.innerHTML = `<li class="muted">${escapeHtml(message)}</li>`;
  el.schedule.innerHTML = `<p class="muted">${escapeHtml(message)}</p>`;
}

async function main() {
  try {
    const response = await fetch(`releases.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    renderManifest(manifest);
  } catch (error) {
    console.error("Не удалось загрузить releases.json:", error);
    renderError(
      "Не удалось загрузить данные о релизе. Откройте страницу с сервера " +
      "(файл releases.json должен лежать рядом), а не как локальный файл."
    );
  }
}

main();
