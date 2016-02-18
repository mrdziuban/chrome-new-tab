# Chrome New Tab

This is a template for a Chrome browser extension that overrides the default new tab. It replaces it with a page where you can add links to helpful resources. The extension also displays bookmarks from your Bookmarks Bar and will display all of your open GitHub pull requests.

## Installation

- Go to your [personal access tokens settings in GitHub](https://github.com/settings/tokens) and generate a new token that can read all of the target organization's repositories. You will need this to set up the extension.
- Install [khaos](http://khaos.io) for templating
```bash
$ npm install -g khaos
```
- Install this repo as a khaos template
```bash
$ khaos install mrdziuban/chrome-new-tab chrome-new-tab
```
- Run the templating engine
```bash
$ khaos create chrome-new-tab <your-project-name>
```
- Fill in the necessary variables to complete the template
```
chrome-extension-name: The name to give the Chrome extension
github-username: The GitHub user whose pull requests will be displayed
github-org: The GitHub organization that owns the repositories to search for pull requests in
github-token: Your personal access token that you created above
```
- Go to the extensions page in Chrome: chrome://extensions
- Enable the "Developer mode" checkbox in the top right
- Click "Load unpacked extension..."
- Navigate to your project directory, \<your-project-name\>, which was created above, and click "Select"

## Customizing

You can add links to resources you find useful in `tab.html`. This template provides five `section`s. Each `section` has a header and a single empty list item. Add more list items with links to the pages you care about and refresh the new tab page to see the changes. You should not need to reinstall the Chrome extension when modifying `tab.html` or `tab.js`.
