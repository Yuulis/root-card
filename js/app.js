"use strict";

const App = (() => {
  const STORAGE_KEY = "rootcard-settings";

  const defaults = {
    types: ["integer_sqrt", "simplify", "add_sub", "expand"],
    problemsPerSheet: 8,
    totalCards: 32,
    printMode: "both",
  };

  let currentProblems = [];

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaults, ...JSON.parse(raw) };
    } catch (_) {}
    return { ...defaults };
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  function getSettings() {
    const checkboxes = document.querySelectorAll('input[name="problem-type"]:checked');
    const types = Array.from(checkboxes).map((cb) => cb.value);
    const problemsPerSheet = parseInt(document.getElementById("problems-per-sheet").value, 10);
    const totalCards = parseInt(document.getElementById("total-cards").value, 10);
    const printMode = document.querySelector('input[name="print-mode"]:checked')?.value ?? "both";
    return { types, problemsPerSheet, totalCards, printMode };
  }

  function applySettings(settings) {
    document.querySelectorAll('input[name="problem-type"]').forEach((cb) => {
      cb.checked = settings.types.includes(cb.value);
    });
    document.getElementById("problems-per-sheet").value = settings.problemsPerSheet;
    document.getElementById("total-cards").value = settings.totalCards;
    document.querySelectorAll('input[name="print-mode"]').forEach((r) => {
      r.checked = r.value === settings.printMode;
    });
  }

  function generate() {
    const settings = getSettings();

    if (settings.types.length === 0) {
      alert("問題の種類を1つ以上選択してください。");
      return;
    }

    if (settings.totalCards < 1) {
      alert("合計問題数は1以上にしてください。");
      return;
    }

    saveSettings(settings);

    currentProblems = ProblemGenerators.generateProblems(settings.types, settings.totalCards);
    const preview = document.getElementById("preview");
    const printArea = document.getElementById("print-area");

    CardRenderer.renderPreview(preview, currentProblems, settings.problemsPerSheet);
    CardRenderer.renderPrintArea(printArea, currentProblems, settings.problemsPerSheet);

    document.getElementById("btn-print").disabled = false;
    preview.scrollIntoView({ behavior: "smooth" });
  }

  function init() {
    const settings = loadSettings();
    applySettings(settings);

    document.getElementById("btn-generate").addEventListener("click", generate);

    document.getElementById("btn-print").addEventListener("click", () => {
      const { printMode } = getSettings();
      document.body.classList.add("print-" + printMode);
      const cleanup = () => {
        document.body.classList.remove("print-both", "print-question", "print-answer");
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);
      window.print();
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  return { generate };
})();
