## Building

### Chrome

Chrome requires Manifest v3. Build the project, then run `gen:v3` to upgrade the manifest.

Go to `chrome://extensions/`, and load `./dist/` as an unpacked extension.

### Firefox

Go to `about:debugging#/runtime/this-firefox`, and load `./dist/manifest.json` as a temporary add-on.

### Safari

Launch Safari, and enable `Develop > Allow Unsigned Extensions`.

Build the project, then run `gen:safari`. This will require Xcode.

Open the generated `./safari/` project in Xcode and build the application. Then, run the application and enable the extension in Safari preferences.
