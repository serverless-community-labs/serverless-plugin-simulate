# Contributing Guidelines

Welcome, and thanks in advance for your help!  Please follow these simple guidelines :)

# How to contribute to Serverless Docker Plugin

## When you want to start on something we need

Check out our [help-wanted](https://github.com/gertjvr/serverless-plugin-simulate/labels/help-wanted) label to find issues we want to move forward on with your help.

In there you will find different issues that we think are important and need some help with. Thanks for helping us with those, we really appreciate it.

## When you want to propose a new feature or bug fix
* Please make sure there is an open issue discussing your Contribution.
* If there isn't, please open an issue so we can talk about it before you invest time into the Implementation.
* When creating an issue follow the guide that Github shows so we have enough information about your proposal.

## Pull Requests
Please follow these Pull Request guidelines when creating Pull Requests:
* If an Issue exists, leave a comment there that you are working on a solution so nobody else jumps on it.
* If an Issue does not exist, create a new Issue, detail your changes.  We recommend waiting until we accept it, so you don't waste your precious time.
* Follow **Code Style** guidelines below.
* Start commit messages with a lowercase verb such as "add", "fix", "refactor", "remove".
* Submit your PR and make sure the Travis-CI builds don't fail.
* Reference the issue in your PR.

## Issues
Please follow these Issue guidelines for opening Issues:
* Make sure your Issue is not a duplicate.
* Make sure your Issue is for a *feature request*, *bug report*, or *a discussion about a relevant topic*.

### Code Style
We aim for clean, consistent code style.  We're using ESlint to check for codestyle issues using the Airbnb preset. If ESlint issues are found our build will fail and we can't merge the PR.  To help reduce the effort of creating contributions with this style, an [.editorconfig file](http://editorconfig.org/) is provided that your editor may use to override any conflicting global defaults and automate a subset of the style settings.  You may need to enable EditorConfig's use by changing a setting or installing a plugin.  Using it is not compulsory.

Please follow these Code Style guidelines when writing your unit tests:
* In the root of our repo, use this command to check for styling issues: `npm run lint`
* There are likely ESlint plugins for your favorite code editor that will make this easier too!

Thanks again for being a contributor to the Serverless Docker!
[gertjvr](http://github.com/gertjvr)