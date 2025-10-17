# DEVELOPING

The source code is within the `lib` directory which contains the `main.tsx` and `main-standalone.tsx` entry points. Both of these are built when running `npm run build`. `main.tsx` contains the code for use in a React app and `main-standalone.tsx` contains the code for using it in an HTML file's script tag.

### Set up

`npm install`

### Running Storybook

This SDK is set up with Storybook to help with development. The files are in `src/stories`. Run `npm run storybook` to start up Storybook.

### Build

`npm run build`

- This will run `npm run build:lib` and `npm run build:standalone` which creates the files needed for both use in a React app or directly in an HTML file's script tag.
