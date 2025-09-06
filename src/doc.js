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
import getImsToken from './ims.js';

const URL_TEMPLATE = '/da-pilot/docket/about/release-notes/{{REPO}}/{{PR_NUM}}';

const DOC_TEMPLATE = `
    <body>
        <main>
          <div>
            <div class="release-notes">
              <div>
                <div>
                  <h1><a href="{{URL}}">{{TITLE}}</a></h1>
                  <p><strong>Released</strong> {{DATE}}</p>
                </div>
              </div>

              <div>
                <div>
                  <h2>Notes</h2>
                  {{CONTENT}}
                </div>
              </div>

              <div>
                <div>
                  <h2>Created by</h2>
                  <p>{{CREATED_BY}}</p>
                </div>
                <div>
                  <h2>Scope</h2>
                  <p>{{FILES}}</p>
                </div>
              </div>

              <div>
                <div>
                  <h2>Approved by</h2>
                  <p>{{APPROVERS}}</p>
                </div>
                <div>
                  <h2>Released by</h2>
                  <p>{{RELEASED_BY}}</p>
                </div>
              </div>
            </div>


            <div class="metadata">
                <div>
                    <div>Title</div>
                    <div>{{DATE}}</div>
                </div>
                <div>
                    <div>Description</div>
                    <div>{{TITLE}}</div>
                </div>
                <div>
                    <div>Repo</div>
                    <div>{{REPO}}</div>
                </div>
                <div>
                  <div>Timestamp</div>
                  <div>{{TIMESTAMP}}</div>
                </div>
            </div>
          </div>
        </main>
    </body>
`;

function getTimestamp(string) {
  // Convert ISO 8601 string to Unix timestamp (seconds since epoch)
  return Math.floor(new Date(string).getTime() / 1000);
}

function formatDoc(data) {
  return DOC_TEMPLATE
    .replaceAll('{{TITLE}}', data.title)
    .replaceAll('{{URL}}', data.htmlUrl)
    .replaceAll('{{CONTENT}}', data.content)
    .replaceAll('{{CREATED_BY}}', data.createdBy)
    .replaceAll('{{FILES}}', data.files)
    .replaceAll('{{APPROVERS}}', data.approvers)
    .replaceAll('{{RELEASED_BY}}', data.releasedBy)
    .replaceAll('{{REPO}}', data.repo)
    .replaceAll('{{DATE}}', data.date)
    .replaceAll('{{TIMESTAMP}}', getTimestamp(data.mergedAt));
}

export default async function saveDoc(repo, number, releaseData) {
  const doc = formatDoc(releaseData);

  const token = await getImsToken();
  if (!token) return { error: 'Error getting IMS token.' };

  const body = new FormData();
  const data = new Blob([doc], { type: 'text/html' });
  body.append('data', data);

  const opts = {
    method: 'POST',
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const path = URL_TEMPLATE
    .replaceAll('{{REPO}}', repo)
    .replaceAll('{{PR_NUM}}', number);

  try {
    const resp = await fetch(`https://admin.da.live/source${path}.html`, opts);
    return { path, status: resp.status };
  } catch (e) {
    return { error: e };
  }
}
