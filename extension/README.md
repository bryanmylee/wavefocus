## Building

### Chrome

Chrome requires Manifest v3. Build the project with `build:v3`.

Go to `chrome://extensions/`, and load `./dist/v3` as an unpacked extension.

### Firefox

Go to `about:debugging#/runtime/this-firefox`, and load `./dist/v2/manifest.json` as a temporary add-on.

### Safari

Launch Safari, and enable `Develop > Allow Unsigned Extensions`.

Build the project, then run `gen:safari`. This will require Xcode.

Open the generated `dist/safari/` project in Xcode and build the application. Then, run the application and enable the extension in Safari preferences.
