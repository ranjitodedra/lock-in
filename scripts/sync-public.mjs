#!/usr/bin/env node
/**
 * Sync private branch tree to the public portfolio repo (linear commits).
 *
 * Usage:
 *   npm run sync:public
 *   node scripts/sync-public.mjs [source-branch]
 *
 * Requires:
 *   git remote named "public" → https://github.com/ranjitodedra/lock-in.git
 *   local branch "public-main" tracking public/main (created by bootstrap)
 */
import { execSync } from "node:child_process";

const PUBLIC_REMOTE = "public";
const PUBLIC_BRANCH = "public-main";
const DEFAULT_SOURCE = "main";

function run(cmd, options = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: options.stdio ?? "pipe" }).trim();
}

function runOrFail(cmd) {
  try {
    return run(cmd);
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? err.message;
    console.error(stderr);
    process.exit(1);
  }
}

function hasRemote(name) {
  const remotes = run("git remote");
  return remotes.split(/\r?\n/).includes(name);
}

function workingTreeClean() {
  const status = run("git status --porcelain");
  return status.length === 0;
}

function branchExists(name) {
  try {
    run(`git rev-parse --verify ${name}`);
    return true;
  } catch {
    return false;
  }
}

function main() {
  const sourceBranch = process.argv[2]?.trim() || DEFAULT_SOURCE;

  if (!hasRemote(PUBLIC_REMOTE)) {
    console.error(
      `Missing git remote "${PUBLIC_REMOTE}". Add it with:\n` +
        `  git remote add public https://github.com/ranjitodedra/lock-in.git`,
    );
    process.exit(1);
  }

  if (!branchExists(sourceBranch)) {
    console.error(`Source branch "${sourceBranch}" does not exist.`);
    process.exit(1);
  }

  if (!workingTreeClean()) {
    console.error("Working tree has uncommitted changes. Commit or stash before syncing.");
    process.exit(1);
  }

  const previousBranch = run("git branch --show-current");
  const sourceSha = run(`git rev-parse --short ${sourceBranch}`);
  const date = new Date().toISOString().slice(0, 10);

  console.log(`Fetching ${PUBLIC_REMOTE}...`);
  runOrFail(`git fetch ${PUBLIC_REMOTE}`);

  if (!branchExists(PUBLIC_BRANCH)) {
    console.log(`Creating local ${PUBLIC_BRANCH} from ${PUBLIC_REMOTE}/main...`);
    runOrFail(`git checkout -b ${PUBLIC_BRANCH} ${PUBLIC_REMOTE}/main`);
  } else {
    runOrFail(`git checkout ${PUBLIC_BRANCH}`);
    runOrFail(`git pull --ff-only ${PUBLIC_REMOTE} main`);
  }

  runOrFail(`git restore --source=${sourceBranch} :/`);
  runOrFail("git add -A");

  const diff = run("git diff --cached --stat");
  if (!diff) {
    console.log(`Public repo already matches private ${sourceBranch} (${sourceSha}).`);
    runOrFail(`git checkout ${previousBranch}`);
    process.exit(0);
  }

  const message = `Sync from private ${sourceBranch} (${sourceSha}) — ${date}`;
  run(`git commit -m "${message}"`, { stdio: "inherit" });

  console.log(`Pushing to ${PUBLIC_REMOTE}/main...`);
  runOrFail(`git push ${PUBLIC_REMOTE} ${PUBLIC_BRANCH}:main`);

  runOrFail(`git checkout ${previousBranch}`);
  console.log(`Done. Public repo updated with: ${message}`);
}

main();
