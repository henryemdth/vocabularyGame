import { defineConfig } from 'astro/config';

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '';

export default defineConfig({
  site: isGitHubActions 
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` 
    : 'http://localhost:4321',
  base: isGitHubActions ? repoName : '/',
});