# WaveFocus

A beautiful and simple Pomodoro timer application.

## Architecture

### Frontend

I am using React Native for the iOS and Android application. If time permits, I would like to create a Windows and macOS application with Electron and a browser extension.

### Backend

WaveFocus is built on Google Cloud Platform (GCP). It relies on:

- Firebase Authentication to provide user accounts and timer sync across multiple devices
- Firebase Firestore for its realtime document database
- Firebase Cloud Functions to schedule and trigger notifications
- Firebase Cloud Messaging for push notifications
- Google Cloud Tasks API
  - A queue `wavefocus-notifications` in `us-central1` is used to queue notifications for deferred delivery
