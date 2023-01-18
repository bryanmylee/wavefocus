## Extension ID

When developing locally, we have to manage the extension key manually to get a stable extension ID.

Note that the `"key"` manifest field has to be removed before submitting to the Chrome Web Store as it will be automatically managed.

The dev ID is generated from our dev private key.

```bash
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem
```

The public key is stored in the `"key"` field of the extension manifest and is generated with:

```bash
openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A
```

Next, the extension ID is derived with:

```bash
openssl rsa -in key.pem -pubout -outform DER | shasum -a 256 | head -c32 | tr 0-9a-f a-p
```

which produces `dfbebboepanjemmiopgfnkojgkgkholo`.

## OAuth client ID

The OAuth client ID can be retrieved from the [Google Cloud console](https://console.cloud.google.com/apis/credentials) and is stored in the extension manifest.

Make sure to update `"oauth2.client_id"` to match the production OAuth ID before packaging and deployment.

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
