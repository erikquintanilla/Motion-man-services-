This repository includes a small static site in the `motionmanservices/` folder.

This file explains how to publish it so the site becomes publicly accessible.

Option A — GitHub Pages (automatic via Actions)

1. Push your changes to the `main` branch on GitHub.
2. The included GitHub Actions workflow at `.github/workflows/deploy-pages.yml` will automatically upload the `motionmanservices` folder and publish it to GitHub Pages.
3. After the Action completes, your site will be available at:
   https://<your-github-username>.github.io/<repository-name>/

Notes:
- If you want to publish to the repository root (https://<user>.github.io/) or a custom domain, update Pages settings in your repository on GitHub.
- The workflow uses the `motionmanservices` folder as the site root.

Option B — GitHub Pages (manual)

- You can manually enable GitHub Pages in repository Settings → Pages and select `gh-pages` branch or the `main` branch / `motionmanservices` folder depending on your preference.

Option C — Netlify / Vercel (recommended for simple deployments)

- Netlify and Vercel both support quick deployments from GitHub and offer free tiers and easy custom domain setup.
- On Netlify: create a new site from Git and set the build/publish directory to `motionmanservices` (no build command required).
- On Vercel: import project, set the root directory to `motionmanservices`, and deploy.

Troubleshooting

- If the site doesn't appear after the workflow runs, check the Actions tab in your GitHub repository for logs and errors.
- Make sure the repo is public or the Pages settings allow public access.

If you want, I can also:
- Create a tiny CNAME and instructions to use a custom domain.
- Generate a simple flyer with QR codes linking to the published site URL after you confirm the Pages URL.
