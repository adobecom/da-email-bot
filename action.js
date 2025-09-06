/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-await-in-loop */
import github from '@actions/github';
import { Octokit } from 'octokit';
import MarkdownIt from 'markdown-it';
import { decode } from 'html-entities';
import saveDoc from './src/doc.js';
import publishDoc from './src/aem.js';

import {
  RELEASE_MARKER,
  DEFAULT_NOTES,
  USER_BASE,
  PULL_BASE,
  REVIEW_BASE,
  MOCK_CONFIG,
} from './constants.js';

const mdIt = new MarkdownIt();

function canCreate() {
  const {
    IMS_CLIENT_ID,
    IMS_CLIENT_SECRET,
    AEM_API_KEY,
  } = process.env;
  if (!IMS_CLIENT_ID) {
    console.log('No IMS Client ID');
    return false;
  }
  if (!IMS_CLIENT_SECRET) {
    console.log('No IMS Client Secret');
    return false;
  }
  if (!AEM_API_KEY) {
    console.log('No AEM API Key');
    return false;
  }
  return true;
}

function getConfig() {
  const { base, number } = github.context.payload.pull_request;
  return { owner: base.repo.owner.login, repo: base.repo.name, pull_number: number };
}

function getDate(string) {
  const rawDate = new Date(string);
  const date = rawDate.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const time = rawDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
  return `${date} - ${time}`;
}

async function getName(octokit, username) {
  const user = await octokit.request(USER_BASE, { username });
  return user.data.name ? user.data.name : user.data.login;
}

async function getApprovals(octokit, config, mergedBy) {
  // Get reviewer info
  const releasedBy = mergedBy?.login ? await getName(octokit, mergedBy.login) : null;
  if (!releasedBy) return {};

  const reviews = await octokit.request(REVIEW_BASE, config);
  const names = [];
  for (const review of reviews.data) {
    if (review.state === 'APPROVED') {
      const name = await getName(octokit, review.user.login);
      names.push(name);
    }
  }

  const approvers = names.join('<br/>');

  return { releasedBy, approvers };
}

(async function createReleaseNotes() {
  if (!canCreate()) return;

  const isCi = process.env.GITHUB_ACTIONS;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const config = isCi ? getConfig() : MOCK_CONFIG;

  // Get base data
  const pull = await octokit.request(PULL_BASE, config);

  const {
    title,
    merged_at: mergedAt,
    changed_files: changedFiles,
    merged_by: mergedBy,
    body,
    user,
    base,
    number,
    html_url: htmlUrl,
  } = pull.data;
  const { name: repo } = base.repo;

  const { releasedBy, approvers } = await getApprovals(octokit, config, mergedBy);
  if (!(releasedBy || approvers)) {
    console.log('No approvals.');
    return;
  }

  // Pop notes out
  const notes = body?.includes(RELEASE_MARKER) ? body.split(RELEASE_MARKER).pop() : DEFAULT_NOTES;

  // Formatting cleanup
  const createdBy = await getName(octokit, user.login);
  const date = getDate(mergedAt);
  const content = notes ? decode(mdIt.render(notes)) : '';
  const files = changedFiles > 1 ? `${changedFiles} files` : `${changedFiles} file`;

  const releaseData = {
    title: decode(title),
    repo,
    date,
    content,
    approvers,
    createdBy,
    releasedBy,
    files,
    htmlUrl,
    mergedAt,
  };

  const { path, error } = await saveDoc(repo, number, releaseData);
  if (error) {
    console.log(error);
    return;
  }
  await publishDoc(path);
}());
