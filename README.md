# Selfie sign in process


## Overview

Proof of concept implementation of sign in with selfie. 
User can create account by submitting their faces of different angles for training the AI model (AWS Rekognition) and then simply use their face for login.

## Pre-requisites 

1. Install AWS cli locally
https://docs.aws.amazon.com/cli/v1/userguide/install-macos.html

2. Configure AWS

    - [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

    - [Enviroment Varibles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html). These variables can be used in Production mode in the deployment platforms such as vercel.


## Run the app

```sh
pnpm run dev
```

## Build the app

```sh
pnpm run build
```

## Project seed preparation

1. Project seed(initial project modules and tools configuration, working prototype) initialized with the [v0.dev](https://v0.dev) chat
2. Used [Grok 4](https://grok.com/) to modularize and to use xstate state machines to cleanly separate logic and UI since it involves user media devices (camera) and complex flows that can easily clutter the code
3. Cursor IDE(free version) for local tweaks
4. Vercel for deployment
5. [AWS Rekognition](https://aws.amazon.com/rekognition/) for real face recognition trained model
6. [Biomejs](https://biomejs.dev/) for consistent format and code styling
