# Typescript Template

This project was created from a template at https://github.com/TradeIdeasPhilip/typescript-template/.

See https://tradeideasphilip.github.io/typescript-getting-started/#degit_template__Try_It for instructions on using this template, along with background information on this template and the tools it uses.

This template is minimal on purpose.
I got tired of deleting things from the default Vite template.
If you [start with `npm create vite@latest`](https://tradeideasphilip.github.io/typescript-getting-started/#npm_create_vite@latest__Try_It) you will get a template with a lot of examples and other introductory material.

## Files

- [./index.html](./index.html)
  - When packing things up for production, the tools start here.
  - This will include references to `*.ts` files, and the tools will automatically compile those to `*.js` files and update the urls accordingly.
  - If you want to rename this, start from [./vite.config.js](./vite.config.js).
- [./src/](./src/) — Put your TypeScript, `*.css`, and media files into here.
- [./public/](./public/)
  - Files in here will get copied to production **_as is_**.
  - Most files get renamed and/or modified by the bundler.
  - See [Vite's documentation](https://vitejs.dev/guide/assets) for more details.
- [./vite.config.js](./vite.config.js)
  - Avoid this if you can.
  - I configured this to work well with GitHub pages.
  - If you need more than one HTML page per project, edit this file.
- [./README.md](./README.md)
  - You are here!
  - Replace this with a description of _your_ new project.
- [./tsconfig.json](./tsconfig.json) — Config file for [TypeScript](https://www.typescriptlang.org/tsconfig).
- [./node_modules/](./node_modules/), [./package-lock.json](./package-lock.json), [./package.json](./package.json) — used and managed by [npm](https://docs.npmjs.com/).
- [./gitignore](./gitignore) — [Git Ignore](https://git-scm.com/docs/gitignore).
- [./.vscode/](./.vscode/) — Config files for [VS Code](https://code.visualstudio.com/docs) and its extensions.
