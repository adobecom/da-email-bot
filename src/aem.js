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
async function aemAdmin(path, api) {
  const opts = {
    method: 'POST',
    headers: {
      'X-Auth-Token': process.env.AEM_API_KEY,
    },
  };

  const [, org, site, ...rest] = path.split('/');
  const resp = await fetch(`https://admin.hlx.page/${api}/${org}/${site}/main/${rest.join('/')}`, opts);
  if (!resp.ok) return { error: `Error on AEM ${api}: ${resp.status}` };
  return { message: `Success on AEM ${api}` };
}

export default async function publishDoc(path) {
  const aemPreview = await aemAdmin(path, 'preview');

  if (aemPreview.error) {
    console.log(aemPreview.error);
    return;
  }

  const aemPublish = await aemAdmin(path, 'live');

  console.log(aemPublish);

  if (aemPublish.error) {
    console.log(aemPublish.error);
  }
}
