## Dark Alley Release Bot
The DA Release Bot sends an email when:

1. A PR has been merged into main.
2. The PR has `## Release notes` in the comment.

## Usage
To use this Github Action, you will need a workflow file and appropriate secrets.

### Sample workflow file

```yaml
name: Dark Alley Bot Release Email

on:
  pull_request_target:
    types:
      - closed
    branches:
      - main

jobs:
  action:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4
      - name: Use email bot
        uses: adobecom/da-email-bot@main
        env:
          SG_TO_EMAIL: ${{ secrets.SG_TO_EMAIL }}
          SG_FROM_EMAIL: ${{ secrets.SG_FROM_EMAIL }}
          SG_FROM_NAME: ${{ secrets.SG_FROM_NAME }}
          SG_KEY: ${{ secrets.SG_KEY }}
          SG_TEMPLATE: ${{ secrets.SG_TEMPLATE }}
```

## Local development

### Requirements
1. Node 20+
2. A `.dev.env` file.

### Sample `.dev.env`

```bash
SG_KEY="{{{YOUR_SENDGRID_KEY}}}"
SG_FROM_NAME="Dark Alley Release"
SG_FROM_EMAIL="{{{YOUR_SENDGRID_EMAIL_ADDRESS}}}"
SG_TO_EMAIL="{{{your@emailaddress.com}}}"
SG_TEMPLATE="{{{YOUR_SENDGRID_TEMPPLATE}}}"
GITHUB_TOKEN="{{{your-github-token}}}"
```
If you need these, reach out to the team.

### Run locally
1. Install dependencies - `npm i`
2. Run dev - `npm run email:dev`
