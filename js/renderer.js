"use strict";

const CardRenderer = (() => {
  function createProblemRow(problem) {
    const row = document.createElement("div");
    row.className = "problem-row";

    const num = document.createElement("div");
    num.className = "problem-num";
    num.textContent = problem.id;

    const q = document.createElement("div");
    q.className = "problem-cell problem-q";
    q.innerHTML = problem.questionHtml;

    const a = document.createElement("div");
    a.className = "problem-cell problem-a";
    a.innerHTML = problem.answerHtml;

    row.appendChild(num);
    row.appendChild(q);
    row.appendChild(a);
    return row;
  }

  function createQuizColumn(problems) {
    const col = document.createElement("div");
    col.className = "quiz-column";

    const header = document.createElement("div");
    header.className = "column-header";
    header.innerHTML =
      '<div class="col-num">No.</div>' +
      '<div class="col-q">問題</div>' +
      '<div class="col-a">解答</div>';
    col.appendChild(header);

    for (const p of problems) {
      col.appendChild(createProblemRow(p));
    }
    return col;
  }

  function createQuizSheet(leftProblems, rightProblems, problemsPerSheet) {
    const sheet = document.createElement("div");
    sheet.className = "quiz-sheet";
    sheet.dataset.problemsPerSheet = problemsPerSheet;

    sheet.appendChild(createQuizColumn(leftProblems));
    sheet.appendChild(createQuizColumn(rightProblems));
    return sheet;
  }

  function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  function splitColumns(problems) {
    const mid = Math.ceil(problems.length / 2);
    return [problems.slice(0, mid), problems.slice(mid)];
  }

  function renderPreview(container, problems, problemsPerSheet) {
    container.innerHTML = "";
    if (problems.length === 0) return;

    const chunks = chunkArray(problems, problemsPerSheet);
    chunks.forEach((chunk, i) => {
      const label = document.createElement("h3");
      label.className = "sheet-label";
      label.textContent = `シート ${i + 1}`;
      container.appendChild(label);

      const [left, right] = splitColumns(chunk);
      container.appendChild(createQuizSheet(left, right, problemsPerSheet));
    });
  }

  function renderPrintArea(container, problems, problemsPerSheet) {
    container.innerHTML = "";
    if (problems.length === 0) return;

    const chunks = chunkArray(problems, problemsPerSheet);
    for (const chunk of chunks) {
      const [left, right] = splitColumns(chunk);
      container.appendChild(createQuizSheet(left, right, problemsPerSheet));
    }
  }

  return { renderPreview, renderPrintArea };
})();
