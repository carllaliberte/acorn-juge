import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MODELS,
  commandsIn,
  parseTrigger,
  keyedModels,
  loadPrompt,
  buildUserMessage,
  sanitizeReview,
  formatComment,
} from "../.github/swarm/review.mjs";

describe("swarm roster", () => {
  it("names Sonnet 5, Fable 5, ChatGPT, DeepSeek, Gemini", () => {
    assert.equal(MODELS.sonnet.model, "claude-sonnet-5");
    assert.equal(MODELS.fable.model, "claude-fable-5");
    assert.equal(MODELS.chatgpt.model, "gpt-5.6-terra");
    assert.equal(MODELS.deepseek.model, "deepseek-v4-flash");
    assert.equal(MODELS.gemini.model, "gemini-3.8-flash");
    assert.equal(MODELS.fable.auto, false);
    assert.equal(MODELS.sonnet.auto, true);
    assert.equal(MODELS.fable.maxTokens, 8192);
    assert.ok(MODELS.fable.maxTokens > MODELS.sonnet.maxTokens);
  });
});

describe("parseTrigger", () => {
  it("defaults to auto models — not Fable", () => {
    const ids = parseTrigger("", []);
    assert.deepEqual(ids, ["sonnet", "chatgpt", "deepseek", "gemini"]);
    assert.ok(!ids.includes("fable"));
  });

  it("maps /fable and /fabre and label fable to Fable 5", () => {
    assert.deepEqual(parseTrigger("/fable please", []), ["fable"]);
    assert.deepEqual(parseTrigger("please /fabre", []), ["fable"]);
    assert.deepEqual(parseTrigger("", [{ name: "fable" }]), ["fable"]);
  });

  it("maps /chatgpt /deepseek /gemini /sonnet /swarm", () => {
    assert.deepEqual(parseTrigger("/chatgpt", []), ["chatgpt"]);
    assert.deepEqual(parseTrigger("/deepseek", []), ["deepseek"]);
    assert.deepEqual(parseTrigger("/gemini", []), ["gemini"]);
    assert.deepEqual(parseTrigger("/sonnet", []), ["sonnet"]);
    assert.deepEqual(parseTrigger("/swarm", []), [
      "sonnet",
      "chatgpt",
      "deepseek",
      "gemini",
    ]);
  });

  it("does not treat .github/swarm paths as /swarm", () => {
    assert.deepEqual(commandsIn("see .github/swarm/prompt.md"), []);
    assert.deepEqual(commandsIn("https://example.com/swarm.yml"), []);
    assert.deepEqual(
      parseTrigger("see .github/swarm/prompt.md", [], "issue_comment"),
      [],
    );
  });

  it("labeled non-fable does not auto-run; labeled fable is Fable only", () => {
    assert.deepEqual(parseTrigger("", [], "pull_request", "labeled", "docs"), []);
    assert.deepEqual(
      parseTrigger("", [], "pull_request", "labeled", "fable"),
      ["fable"],
    );
  });

  it("issue_comment without a slash token does not default to auto", () => {
    assert.deepEqual(parseTrigger("looks good", [], "issue_comment"), []);
  });
});

describe("keyedModels fail-closed", () => {
  it("skips every model when secrets are absent", () => {
    const { run, skip } = keyedModels(
      ["sonnet", "fable", "chatgpt", "deepseek", "gemini"],
      {},
    );
    assert.equal(run.length, 0);
    assert.equal(skip.length, 5);
    assert.ok(skip.every((s) => /missing /.test(s.reason)));
  });

  it("runs Sonnet and Fable from the same Anthropic key", () => {
    const { run, skip } = keyedModels(["sonnet", "fable", "chatgpt"], {
      ANTHROPIC_API_KEY: "sk-ant-test",
    });
    assert.deepEqual(
      run.map((m) => m.id),
      ["sonnet", "fable"],
    );
    assert.equal(skip.length, 1);
    assert.equal(skip[0].id, "chatgpt");
  });
});

describe("prompt locks", () => {
  it("forbids QUANTUM, LIVE, second grok.me, attest canal, and names the ε split", () => {
    const p = loadPrompt();
    assert.match(p, /not the judge/i);
    assert.match(p, /Carl/);
    assert.match(p, /Never QUANTUM/);
    assert.match(p, /LIVE VERIFIED/);
    assert.match(p, /acorn-royal-dune-blend\.grok\.me/);
    assert.match(p, /EPSILON_MISSING/);
    assert.match(p, /isCalendarDay/);
    assert.match(p, /do not create `POST \/attest`/i);
    assert.match(p, /CORS never/);
  });
});

describe("sanitize and format", () => {
  it("annotates a review that says QUANTUM or LIVE VERIFIED", () => {
    const out = sanitizeReview("This is LIVE VERIFIED QUANTUM.");
    assert.match(out, /forbids QUANTUM/);
  });

  it("buildUserMessage includes the diff", () => {
    const msg = buildUserMessage({
      title: "docs",
      body: "n",
      files: ["README.md"],
      diff: "horizon calendar",
    });
    assert.match(msg, /README.md/);
    assert.match(msg, /horizon calendar/);
  });

  it("formatComment stays a comment, not a merge", () => {
    const text = formatComment({
      run: [],
      skip: [{ id: "sonnet", reason: "missing ANTHROPIC_API_KEY" }],
      results: [],
    });
    assert.match(text, /not a judgment/);
    assert.match(text, /ANTHROPIC_API_KEY/);
    assert.doesNotMatch(text, /wrangler deploy/);
  });
});
