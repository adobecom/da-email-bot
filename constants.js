export const RELEASE_MARKER = '## Release notes';
export const USER_BASE = 'GET /users/{username}';
export const PULL_BASE = 'GET /repos/{owner}/{repo}/pulls/{pull_number}';
export const REVIEW_BASE = 'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews';

export const MOCK_CONFIG = {
  owner: 'adobe',
  repo: 'da-live',
  pull_number: 71,
};

export const DATE_OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: 'numeric',
  timeZone: 'UTC',
  timeZoneName: 'short',
};