<h1 align="center">ponies.fyi</h1>
Source code for <a href="https://ponies.fyi">ponies.fyi</a>, a community-maintained reference index for ponysonas and other fan-created characters.

## Contributing
ponies.fyi is licensed under the MIT license. Anyone may contribute, fork, or redistribute this repository. If you're interested in contributing to the project, you may do so in the following ways:

### Bug reports and feature requests
If reporting a bug  or suggesting the addition/removal of a feature, create an issue describing reproduction steps (for bugs) or a writeup for how the feature would enhance the experience of ponies.fyi

### Code contributions
Contributing code is fairly easy:
1. Fork the repository (click here)
2. Use `git checkout -b [branch name]` for your code changes. Depending on what the purpose of your pull request will be, please follow the schema below when naming your branch:
    * Bug fixes: `fix/your-branch-name`
    * New features: `feature/your-branch-name`
    * Code cleanup/other: `other/your-branch-name`
3. Review the [project file structure](https://github.com/compscitwilight/ponies.fyi/blob/main/contributing/STRUCTURE.md) for clarity
4. Once finished, create a pull request with a descriptive name highlighting your changes.

## Installation and self-hosting
Steps below are for installing and setting up ponies.fyi in a local Linux environment.

1. Install [Node.js](https://nodejs.org/en/download)
2. Clone this repository: `git clone https://github.com/compscitwilight/ponies.fyi`
3. Run `npm setup` (`npm install` + `npx prisma generate`)
4. Deploy with `npm run start`