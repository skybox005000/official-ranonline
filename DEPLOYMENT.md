# Development Deployment

Pushing to the `dev` branch deploys the site through GitHub Actions.

The workflow syncs the tracked site code to the DigitalOcean site root while preserving these server-managed paths:

- `assets/js/published-data.js`
- `assets/img/`

This keeps data published from `config.html` and uploaded images on the server. Repository assets outside `assets/img`, including `assets/news-img`, deploy normally.

## One-time GitHub setup

Create a GitHub Environment named `development`, then add these environment secrets:

| Secret | Value |
| --- | --- |
| `DO_HOST` | DigitalOcean server hostname or IP address |
| `DO_USER` | SSH deployment user |
| `DO_SITE_PATH` | `/var/www/officialranonlineph.com` |
| `DO_SSH_PRIVATE_KEY` | Private key for the deployment user |
| `DO_KNOWN_HOSTS` | The server host key from `ssh-keyscan -H <host>` |

Use a dedicated SSH key and deployment user with write access to the site root. Do not store server passwords in GitHub secrets for this workflow.

## Deploy

Push or merge a commit into `dev`:

```bash
git push origin dev
```

GitHub Actions runs `.github/workflows/deploy-dev.yml` automatically. The deployment job verifies the target before syncing, then confirms the key public files and preserved published data remain on the server.