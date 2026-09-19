import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
try {
  const { designCases, getAdjustedCase, canApplyAdjustment } = await server.ssrLoadModule("/src/data/designCases.ts");
  assert.equal(designCases.length, 3);
  for (const data of designCases) {
    assert.match(data.answerMarkdown, /^## \S/);
    assert.ok(data.plan.steps.length >= 2 && data.plan.steps.length <= 4);
    for (const match of data.answerMarkdown.matchAll(/#evidence-([\w-]+)/g)) assert.ok(data.evidence.some(item => item.id === match[1]), `${data.id}: broken citation`);
    for (const product of data.products) {
      assert.ok(data.document.markdown.includes(product.price));
      assert.ok(data.document.markdown.includes(product.serviceContent));
      assert.ok(["线上替代品", "线上互补品"].includes(product.relationship));
      assert.ok(product.comparisonTarget && product.relationshipReason);
    }
  }
  const [vinyl, translator, camera] = designCases;
  assert.equal(vinyl.products.filter(item => item.recommended).length, 1);
  assert.equal(translator.products.filter(item => item.recommended).length, 0);
  assert.match(translator.answerMarkdown, /28.35/);
  assert.equal(camera.products.length, 0);
  assert.ok(camera.actionRequired);
  assert.match(camera.answerMarkdown.split("\n")[0], /暂不能/);
  assert.ok(!vinyl.actionRequired && !translator.actionRequired);
  for (const text of ["只做 C 延保", "只做电销", "先看人群", "暂不定价", "只做 C 延保，暂不考虑电销"]) assert.ok(canApplyAdjustment(text), text);
  for (const text of ["价格改成 1 元", "只做电销，价格改成 1 元", "电销不是唯一渠道", "不要减少电销", "随便做"]) assert.ok(!canApplyAdjustment(text), text);
  const revised = getAdjustedCase("vinyl", ["只做 C 延保", "只做电销"]);
  assert.ok(revised.products.every(item => item.details.channels === "电销补购"));
  assert.ok(!revised.plan.scope.includes("C 延保"));
  assert.ok(!revised.answerMarkdown.includes("本轮仅作为 C 延保"));
  assert.ok(revised.process.every(item => !item.summary.includes("C 延保及电销")));
  const direction = getAdjustedCase("vinyl", ["只做电销", "暂不定价"]);
  assert.equal(direction.products.length, 0);
  assert.ok(!direction.answerMarkdown.includes("45 元"));
  assert.ok(direction.plan.note.includes("电销补购"));
  assert.ok(direction.process.every(item => !item.summary.includes("三款方案字段齐备")));
  const pending = getAdjustedCase("camera", ["暂不定价"]);
  assert.ok(pending.actionRequired);
  console.log("PASS: 3 cases, citation/document consistency, missing-data boundary, supported and rejected adjustments, latest-channel precedence.");
} finally { await server.close(); }
