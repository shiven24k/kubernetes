# Docs site

The written guide for this course, built with [Astro Starlight](https://starlight.astro.build).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Pages live in `src/content/docs/` as Markdown. Sidebar groups are configured in `astro.config.mjs`, and page order comes from each page's `sidebar.order` frontmatter.

See the [main README](../README.md) for the full project overview.
