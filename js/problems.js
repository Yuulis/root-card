"use strict";

const ProblemGenerators = (() => {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const M = {
    n:    (v)        => `<mn>${v}</mn>`,
    o:    (v)        => `<mo>${v}</mo>`,
    sqrt: (inner)    => `<msqrt>${inner}</msqrt>`,
    row:  (...items) => `<mrow>${items.join('')}</mrow>`,
    sup:  (base, exp) => `<msup>${base}${exp}</msup>`,
    wrap: (inner)    => `<math>${inner}</math>`,
  };

  function sq(n) { return M.sqrt(M.n(n)); }

  function simplifyRadical(n) {
    let outer = 1;
    let inner = n;
    for (let f = 2; f * f <= inner; f++) {
      while (inner % (f * f) === 0) {
        outer *= f;
        inner /= f * f;
      }
    }
    return { coeff: outer, radicand: inner };
  }

  function radicalMath(coeff, radicand) {
    if (radicand === 1) return M.wrap(M.n(coeff));
    const sqrtPart = sq(radicand);
    if (coeff === 1)  return M.wrap(sqrtPart);
    if (coeff === -1) return M.wrap(M.row(M.o('−'), sqrtPart));
    return M.wrap(M.row(M.n(coeff), sqrtPart));
  }

  function radicalText(coeff, radicand) {
    if (radicand === 1) return `${coeff}`;
    if (coeff === 1)    return `√${radicand}`;
    if (coeff === -1)   return `-√${radicand}`;
    return `${coeff}√${radicand}`;
  }

  // ── integer_sqrt ──

  function generateIntegerSqrt() {
    const problems = [];
    const perfectSquares = [
      1, 4, 9, 16, 25, 36, 49, 64, 81, 100,
      121, 144, 169, 196, 225, 256, 289, 324, 361, 400,
    ];
    for (const n of perfectSquares) {
      const root = Math.round(Math.sqrt(n));
      problems.push({
        type: "integer_sqrt",
        questionHtml: M.wrap(M.row(sq(n), M.o('='))),
        answerHtml:   M.wrap(M.n(root)),
        questionText: `√${n} =`,
        answerText:   `${root}`,
      });
    }
    return problems;
  }

  // ── simplify ──

  function generateSimplify() {
    const problems = [];
    const targets = [
      8, 12, 18, 20, 24, 27, 28, 32, 45, 48,
      50, 54, 63, 72, 75, 80, 90, 98, 108, 125,
      147, 150, 162, 175, 200,
    ];
    for (const n of targets) {
      const { coeff, radicand } = simplifyRadical(n);
      if (coeff === 1) continue;
      problems.push({
        type: "simplify",
        questionHtml: M.wrap(M.row(sq(n), M.o('='))),
        answerHtml:   radicalMath(coeff, radicand),
        questionText: `√${n} =`,
        answerText:   radicalText(coeff, radicand),
      });
    }
    return problems;
  }

  // ── add_sub ──

  function generateAddSub() {
    const problems = [];

    const sameTerm = [
      { qh: M.row(M.n(3), sq(2), M.o('+'), M.n(2), sq(2),  M.o('=')), ah: M.row(M.n(5), sq(2)),  qt: "3√2 + 2√2 = ",   at: "5√2"  },
      { qh: M.row(M.n(5), sq(3), M.o('−'), M.n(2), sq(3),  M.o('=')), ah: M.row(M.n(3), sq(3)),  qt: "5√3 - 2√3 = ",   at: "3√3"  },
      { qh: M.row(M.n(4), sq(5), M.o('+'), M.n(3), sq(5),  M.o('=')), ah: M.row(M.n(7), sq(5)),  qt: "4√5 + 3√5 = ",   at: "7√5"  },
      { qh: M.row(M.n(7), sq(2), M.o('−'), M.n(4), sq(2),  M.o('=')), ah: M.row(M.n(3), sq(2)),  qt: "7√2 - 4√2 = ",   at: "3√2"  },
      { qh: M.row(M.n(6), sq(3), M.o('+'),          sq(3),  M.o('=')), ah: M.row(M.n(7), sq(3)),  qt: "6√3 + √3 = ",    at: "7√3"  },
      { qh: M.row(M.n(2), sq(7), M.o('−'),          sq(7),  M.o('=')), ah: sq(7),                  qt: "2√7 - √7 = ",    at: "√7"   },
      { qh: M.row(M.n(8), sq(5), M.o('−'), M.n(3), sq(5),  M.o('=')), ah: M.row(M.n(5), sq(5)),  qt: "8√5 - 3√5 = ",   at: "5√5"  },
      { qh: M.row(         sq(6), M.o('+'), M.n(4), sq(6),  M.o('=')), ah: M.row(M.n(5), sq(6)),  qt: "√6 + 4√6 = ",    at: "5√6"  },
      { qh: M.row(M.n(9), sq(3), M.o('−'), M.n(5), sq(3),  M.o('=')), ah: M.row(M.n(4), sq(3)),  qt: "9√3 - 5√3 = ",   at: "4√3"  },
      { qh: M.row(M.n(3), sq(11), M.o('+'), M.n(2), sq(11), M.o('=')), ah: M.row(M.n(5), sq(11)), qt: "3√11 + 2√11 = ", at: "5√11" },
    ];

    const simplifyThenCalc = [
      { qh: M.row(sq(8),   M.o('+'), sq(2),  M.o('=')), ah: M.row(M.n(3),  sq(2)),  qt: "√8 + √2 = ",     at: "3√2"  },
      { qh: M.row(sq(27),  M.o('−'), sq(12), M.o('=')), ah: sq(3),                   qt: "√27 - √12 = ",   at: "√3"   },
      { qh: M.row(sq(18),  M.o('+'), sq(2),  M.o('=')), ah: M.row(M.n(4),  sq(2)),  qt: "√18 + √2 = ",    at: "4√2"  },
      { qh: M.row(sq(50),  M.o('−'), sq(8),  M.o('=')), ah: M.row(M.n(3),  sq(2)),  qt: "√50 - √8 = ",    at: "3√2"  },
      { qh: M.row(sq(48),  M.o('+'), sq(12), M.o('=')), ah: M.row(M.n(6),  sq(3)),  qt: "√48 + √12 = ",   at: "6√3"  },
      { qh: M.row(sq(75),  M.o('−'), sq(27), M.o('=')), ah: M.row(M.n(2),  sq(3)),  qt: "√75 - √27 = ",   at: "2√3"  },
      { qh: M.row(sq(45),  M.o('+'), sq(20), M.o('=')), ah: M.row(M.n(5),  sq(5)),  qt: "√45 + √20 =",   at: "5√5"  },
      { qh: M.row(sq(32),  M.o('−'), sq(18), M.o('=')), ah: sq(2),                   qt: "√32 - √18 =",   at: "√2"   },
      { qh: M.row(M.n(2), sq(3),  M.o('+'), sq(12), M.o('=')), ah: M.row(M.n(4), sq(3)), qt: "2√3 + √12 =",  at: "4√3" },
      { qh: M.row(M.n(3), sq(2),  M.o('−'), sq(8),  M.o('=')), ah: sq(2),                qt: "3√2 - √8 =",   at: "√2"  },
      { qh: M.row(sq(50),  M.o('+'), sq(18), M.o('=')), ah: M.row(M.n(8),  sq(2)),  qt: "√50 + √18 =",   at: "8√2"  },
      { qh: M.row(sq(75),  M.o('+'), sq(48), M.o('=')), ah: M.row(M.n(9),  sq(3)),  qt: "√75 + √48 =",   at: "9√3"  },
      { qh: M.row(sq(45),  M.o('−'), sq(20), M.o('=')), ah: sq(5),                   qt: "√45 - √20 =",   at: "√5"   },
      { qh: M.row(sq(98),  M.o('−'), sq(50), M.o('=')), ah: M.row(M.n(2),  sq(2)),  qt: "√98 - √50 =",   at: "2√2"  },
      { qh: M.row(sq(72),  M.o('+'), sq(8),  M.o('=')), ah: M.row(M.n(8),  sq(2)),  qt: "√72 + √8 =",    at: "8√2"  },
      { qh: M.row(sq(108), M.o('−'), sq(75), M.o('=')), ah: sq(3),                   qt: "√108 - √75 =",  at: "√3"   },
      { qh: M.row(sq(162), M.o('+'), sq(2),  M.o('=')), ah: M.row(M.n(10), sq(2)),  qt: "√162 + √2 =",   at: "10√2" },
      { qh: M.row(sq(200), M.o('−'), sq(8),  M.o('=')), ah: M.row(M.n(8),  sq(2)),  qt: "√200 - √8 =",   at: "8√2"  },
      { qh: M.row(M.n(2), sq(5),  M.o('+'), sq(20), M.o('=')), ah: M.row(M.n(4), sq(5)), qt: "2√5 + √20 =",  at: "4√5" },
      { qh: M.row(sq(27),  M.o('+'), sq(48), M.o('=')), ah: M.row(M.n(7),  sq(3)),  qt: "√27 + √48 =",   at: "7√3"  },
    ];

    for (const p of [...sameTerm, ...simplifyThenCalc]) {
      problems.push({
        type: "add_sub",
        questionHtml: M.wrap(p.qh),
        answerHtml:   M.wrap(p.ah),
        questionText: p.qt,
        answerText:   p.at,
      });
    }

    return problems;
  }

  // ── expand ──

  function generateExpand() {
    const problems = [];

    function squaredExpr(inner) {
      return M.sup(M.row(M.o('('), ...inner, M.o(')')), M.n(2));
    }

    function productExpr(left, right) {
      return M.row(
        M.row(M.o('('), ...left,  M.o(')')),
        M.row(M.o('('), ...right, M.o(')'))
      );
    }

    const items = [
      { qh: M.row(squaredExpr([sq(2), M.o('+'), sq(3)]),           M.o('=')), ah: M.row(M.n(5),  M.o('+'), M.n(2),  sq(6)),  qt: "(√2 + √3)² =",   at: "5 + 2√6"   },
      { qh: M.row(squaredExpr([sq(3), M.o('+'), M.n(1)]),           M.o('=')), ah: M.row(M.n(4),  M.o('+'), M.n(2),  sq(3)),  qt: "(√3 + 1)² =",    at: "4 + 2√3"   },
      { qh: M.row(squaredExpr([sq(5), M.o('+'), sq(2)]),            M.o('=')), ah: M.row(M.n(7),  M.o('+'), M.n(2),  sq(10)), qt: "(√5 + √2)² =",   at: "7 + 2√10"  },
      { qh: M.row(squaredExpr([sq(2), M.o('+'), M.n(1)]),           M.o('=')), ah: M.row(M.n(3),  M.o('+'), M.n(2),  sq(2)),  qt: "(√2 + 1)² =",    at: "3 + 2√2"   },
      { qh: M.row(squaredExpr([sq(5), M.o('−'), M.n(1)]),           M.o('=')), ah: M.row(M.n(6),  M.o('−'), M.n(2),  sq(5)),  qt: "(√5 - 1)² =",    at: "6 - 2√5"   },
      { qh: M.row(squaredExpr([sq(3), M.o('−'), sq(2)]),            M.o('=')), ah: M.row(M.n(5),  M.o('−'), M.n(2),  sq(6)),  qt: "(√3 - √2)² =",   at: "5 - 2√6"   },
      { qh: M.row(squaredExpr([M.n(2), sq(2), M.o('−'), M.n(1)]),   M.o('=')), ah: M.row(M.n(9),  M.o('−'), M.n(4),  sq(2)),  qt: "(2√2 - 1)² =",   at: "9 - 4√2"   },
      { qh: M.row(squaredExpr([M.n(2), sq(3), M.o('+'), M.n(1)]),   M.o('=')), ah: M.row(M.n(13), M.o('+'), M.n(4),  sq(3)),  qt: "(2√3 + 1)² =",   at: "13 + 4√3"  },
      { qh: M.row(squaredExpr([sq(7), M.o('+'), sq(3)]),            M.o('=')), ah: M.row(M.n(10), M.o('+'), M.n(2),  sq(21)), qt: "(√7 + √3)² =",   at: "10 + 2√21" },
      { qh: M.row(squaredExpr([sq(6), M.o('−'), sq(2)]),            M.o('=')), ah: M.row(M.n(8),  M.o('−'), M.n(4),  sq(3)),  qt: "(√6 - √2)² =",   at: "8 - 4√3"   },
    ];

    const diffOfSquares = [
      { qh: M.row(productExpr([sq(5),  M.o('+'), sq(2)],  [sq(5),  M.o('−'), sq(2)]),  M.o('=')), ah: M.n(3), qt: "(√5 + √2)(√5 - √2) =",   at: "3" },
      { qh: M.row(productExpr([sq(7),  M.o('+'), sq(3)],  [sq(7),  M.o('−'), sq(3)]),  M.o('=')), ah: M.n(4), qt: "(√7 + √3)(√7 - √3) =",   at: "4" },
      { qh: M.row(productExpr([sq(3),  M.o('+'), M.n(1)], [sq(3),  M.o('−'), M.n(1)]), M.o('=')), ah: M.n(2), qt: "(√3 + 1)(√3 - 1) =",     at: "2" },
      { qh: M.row(productExpr([sq(6),  M.o('+'), sq(5)],  [sq(6),  M.o('−'), sq(5)]),  M.o('=')), ah: M.n(1), qt: "(√6 + √5)(√6 - √5) =",   at: "1" },
      { qh: M.row(productExpr([sq(10), M.o('+'), sq(6)],  [sq(10), M.o('−'), sq(6)]),  M.o('=')), ah: M.n(4), qt: "(√10 + √6)(√10 - √6) =", at: "4" },
      { qh: M.row(productExpr([M.n(2), M.o('+'), sq(3)],  [M.n(2), M.o('−'), sq(3)]),  M.o('=')), ah: M.n(1), qt: "(2 + √3)(2 - √3) =",     at: "1" },
      { qh: M.row(productExpr([M.n(3), M.o('+'), sq(2)],  [M.n(3), M.o('−'), sq(2)]),  M.o('=')), ah: M.n(7), qt: "(3 + √2)(3 - √2) =",     at: "7" },
      { qh: M.row(productExpr([sq(11), M.o('+'), sq(7)],  [sq(11), M.o('−'), sq(7)]),  M.o('=')), ah: M.n(4), qt: "(√11 + √7)(√11 - √7) =", at: "4" },
    ];

    const expansion = [
      { qh: M.row(productExpr([sq(2),          M.o('+'), M.n(3)], [sq(2),  M.o('+'), M.n(1)]), M.o('=')), ah: M.row(M.n(5), M.o('+'), M.n(4), sq(2)),  qt: "(√2 + 3)(√2 + 1) =",   at: "5 + 4√2"  },
      { qh: M.row(productExpr([sq(3),          M.o('+'), M.n(2)], [sq(3),  M.o('−'), M.n(1)]), M.o('=')), ah: M.row(M.n(1), M.o('+'),          sq(3)),  qt: "(√3 + 2)(√3 - 1) =",   at: "1 + √3"   },
      { qh: M.row(productExpr([sq(5),          M.o('+'), M.n(1)], [sq(5),  M.o('+'), M.n(2)]), M.o('=')), ah: M.row(M.n(7), M.o('+'), M.n(3), sq(5)),  qt: "(√5 + 1)(√5 + 2) =",   at: "7 + 3√5"  },
      { qh: M.row(productExpr([M.n(2), sq(2),  M.o('+'), M.n(1)], [sq(2),  M.o('+'), M.n(3)]), M.o('=')), ah: M.row(M.n(7), M.o('+'), M.n(7), sq(2)),  qt: "(2√2 + 1)(√2 + 3) =",  at: "7 + 7√2"  },
      { qh: M.row(productExpr([sq(6),          M.o('+'), sq(2)],  [sq(3),  M.o('−'), M.n(1)]), M.o('=')), ah: M.row(M.n(2),                    sq(2)),  qt: "(√6 + √2)(√3 - 1) =",  at: "2√2"      },
    ];

    for (const p of [...items, ...diffOfSquares, ...expansion]) {
      problems.push({
        type: "expand",
        questionHtml: M.wrap(p.qh),
        answerHtml:   M.wrap(p.ah),
        questionText: p.qt,
        answerText:   p.at,
      });
    }

    return problems;
  }

  // ── generateProblems ──

  function generateProblems(types, totalCount) {
    const generatorMap = {
      integer_sqrt: generateIntegerSqrt,
      simplify:     generateSimplify,
      add_sub:      generateAddSub,
      expand:       generateExpand,
    };

    let pool = [];
    for (const t of types) {
      if (generatorMap[t]) {
        pool = pool.concat(generatorMap[t]());
      }
    }

    if (pool.length === 0) return [];

    let result = [];
    while (result.length < totalCount) {
      const shuffled = shuffle(pool);
      result = result.concat(shuffled);
    }
    result = result.slice(0, totalCount);

    return result.map((p, i) => ({
      ...p,
      id: i + 1,
    }));
  }

  return { generateProblems };
})();
