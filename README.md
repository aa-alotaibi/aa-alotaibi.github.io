# Abdulmajeed A. Alotaibi · Industrial Engineering Portfolio

Live site: https://aa-alotaibi.github.io/

Static site (HTML, CSS and a small JavaScript file) served by GitHub Pages from the root of the `main` branch.

## Structure

```
index.html                     Home page (hero, selected work, skills, about, contact)
.nojekyll                      Tells GitHub Pages to serve the files as they are
assets/
  css/style.css                Shared styles (primary colour: --primary #0F766E)
  js/site.js                   Mobile menu, scroll-spy, dashboard viewer
  img/                         Profile photo and favicons
projects/
  heavy-clay/
    index.html                 Case study: From Downtime to Decisions
    img/                       Simio images, dashboard pages, report cover
    media/simulation.mp4       Simio walkthrough video
    files/                     Report and dashboard PDFs
```

## Adding a project

1. Copy `projects/heavy-clay/` to `projects/<new-slug>/` and replace its content and images.
2. In the root `index.html`, add another `<a class="card work-card" ...>` block inside the `#work` section.
3. Keep file names lowercase with hyphens; GitHub Pages paths are case-sensitive.
