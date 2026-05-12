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
export const RELEASE_MARKER = '## Release notes';
export const USER_BASE = 'GET /users/{username}';
export const PULL_BASE = 'GET /repos/{owner}/{repo}/pulls/{pull_number}';
export const REVIEW_BASE = 'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews';

export const IMS = {
  endpoint: 'https://ims-na1.adobelogin.com/ims/token/v3',
  scopes: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,read_pc.dma_aem_ams,aem.frontend.all',
}

export const MOCK_CONFIG = {
  owner: 'adobe',
  repo: 'da-live',
  pull_number: 557,
};

export const DEFAULT_NOTES = '* Bug fixes and improvements';
