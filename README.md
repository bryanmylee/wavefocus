# Wave Focus

![feature](./assets/features/android_feature%402x.png)

A beautiful and simple Pomodoro timer application.

## Frontend

### Mobile

We use React Native for iOS and Android.

#### Android

Follow [this](https://reactnative.dev/docs/signed-apk-android) guide to build the release variant of the application.

After creating the keystore, run `./gradlew signingReport` in the `android` directory to get the SHA-1 and SHA-256 fingerprints of the newly created keystore. Then, make sure to copy the fingerprints over to the Firebase project settings for the Android application.

#### iOS

Follow [this](https://reactnative.dev/docs/publishing-to-app-store) guide to build and publish the application.

## Backend

Wave Focus is built on Google Cloud Platform (GCP). It relies on:

- Firebase Authentication to provide user accounts and timer sync across multiple devices
- Firebase Firestore for its realtime document database
- Firebase Cloud Functions to schedule and trigger notifications
- Firebase Cloud Messaging for push notifications
- Google Cloud Tasks API
  - A queue `wavefocus-notifications` in `us-central1` is used to queue notifications for deferred delivery

### Notifications

For more information about its notification architecture, refer to [this blog post](https://bryanmylee.com/blog/serverless-scheduled-push-notifications-with-163ece2f7f2c42edbcbfac027c15dabf).

## API Keys

### iOS

Visit the iOS application settings on [Firebase console](https://console.firebase.google.com/).

Download `GoogleService-Info.plist` and add it to the root of the Xcode project at `/ios/GoogleService-Info.plist`. If prompted, add the file to all targets.

### Android

Visit the Android application settings on [Firebase console](https://console.firebase.google.com/).

Download `google-services.json` and add it to `/android/app/google-services.json`.
