import github from '@actions/github';
import { Octokit } from 'octokit';
import MarkdownIt from 'markdown-it';
import sgMail from '@sendgrid/mail';

import {
  RELEASE_MARKER,
  USER_BASE,
  PULL_BASE,
  REVIEW_BASE,
  MOCK_CONFIG,
  DATE_OPTIONS,
} from './constants.js';

const mdIt = new MarkdownIt();

function getConfig() {
  const { base, number: pull_number } = github.context.payload.pull_request;
  return { owner: base.repo.owner.login, repo: base.repo.name, pull_number };
}

function getDate(string) {
  return new Intl.DateTimeFormat('en-GB', DATE_OPTIONS).format(new Date(string));
}

async function sendMail(isCi, dynamicTemplateData) {
  sgMail.setApiKey(process.env.SG_KEY);
  const msg = {
    to: process.env.SG_TO_EMAIL,
    from: {
      name: process.env.SG_FROM_NAME,
      email: process.env.SG_FROM_EMAIL,
    },
    templateId: process.env.SG_TEMPLATE,
    dynamicTemplateData,
  };
  if (!isCi) {
    console.log(msg);
    return;
  }
  const resp = await sgMail.send(msg);
  console.log(`STATUS: ${resp.statusCode}`);
}

async function getName(octokit, username) {
  const user = await octokit.request(USER_BASE, { username });
  return user.data.name ? user.data.name : user.data.login;
}

(async function run() {
  const isCi = process.env.GITHUB_ACTIONS;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const config = isCi ? getConfig() : MOCK_CONFIG;

  // Get base data
  const pull = await octokit.request(PULL_BASE, config);
  const { title, merged_at, changed_files, merged_by, body, user, base } = pull.data;
  const { name: repo } = base.repo;

  // Check for release notes
  if (!body.includes(RELEASE_MARKER)) return;

  // Pop the notes out
  const notes = body.split(RELEASE_MARKER).pop();

  // Get reviewer info
  const reviews = await octokit.request(REVIEW_BASE, config);
  const names = [];
  await reviews.data.forEach(async (review) => {
    if (review.state === 'APPROVED') names.push(await getName(octokit, review.user.login));
  });

  const releasedBy = merged_by?.login ? await getName(octokit, merged_by.login) : null;
  if (!releasedBy) return;

  // Formatting cleanup
  const createdBy = await getName(octokit, user.login);
  const date = getDate(merged_at);
  const content = notes ? mdIt.render(notes) : '';
  const approvers = names.join('<br/>');
  const files = changed_files > 1 ? `${changed_files} files` : `${changed_files} file`;

  const data = { repo, title, date, content, approvers, createdBy, releasedBy, files };
  sendMail(isCi, data);
}());