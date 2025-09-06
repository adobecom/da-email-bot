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
import { Octokit } from 'octokit';

export default async function listMergedPRs(owner, repo, baseBranch) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    console.log(`Fetching merged PRs for ${owner}/${repo} into ${baseBranch}...\n`);

    // Fetch all pages of PRs
    const allPRs = [];
    let page = 1;
    const perPage = 100; // GitHub's maximum per page

    while (true) {
      console.log(`Fetching page ${page}...`);

      const { data: prs } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'closed',
        base: baseBranch,
        sort: 'updated',
        direction: 'desc',
        per_page: perPage,
        page,
      });

      if (prs.length === 0) {
        console.log('No more PRs found.');
        break;
      }

      // Filter for merged PRs (not just closed)
      const mergedPRs = prs.filter((pr) => pr.merged_at !== null);
      allPRs.push(...mergedPRs);

      console.log(`Found ${mergedPRs.length} merged PRs on page ${page} (${prs.length} total PRs)`);

      // If we got less than perPage, we've reached the end
      if (prs.length < perPage) {
        console.log('Reached last page.');
        break;
      }

      page += 1;
    }

    return allPRs.map((pr) => ({
      pull_number: pr.number,
      repo,
      owner,
    }));
  } catch (error) {
    console.error('Error fetching PRs:', error.message);
    if (error.status === 401) {
      console.error('Authentication failed. Make sure GITHUB_TOKEN is set correctly.');
    } else if (error.status === 404) {
      console.error('Repository not found. Check OWNER and REPO values.');
    }
    return [];
  }
}
