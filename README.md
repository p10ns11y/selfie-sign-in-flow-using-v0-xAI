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

## Preview the production build

```sh
pnpm run start
```

## Project seed preparation

1. Project seed(initial project modules and tools configuration, working prototype) initialized with the [v0.dev](https://v0.dev) chat
2. Used [Grok 4](https://grok.com/) to modularize and to use xstate state machines to cleanly separate logic and UI since it involves user media devices (camera) and complex flows that can easily clutter the code
3. Cursor IDE(free version) for local tweaks
4. Vercel for deployment
5. [AWS Rekognition](https://aws.amazon.com/rekognition/) for real face recognition trained model
6. [Biomejs](https://biomejs.dev/) for consistent format and code styling

## Play with the state machines simulation at stately.ai

### Creat Account Flow

<a href="https://stately.ai/registry/editor/embed/ba1525ec-eb20-481d-a16a-603f0dba37e4?machineId=3823989b-7359-433b-826a-a373cdda24d5">
  <img 
    src="https://github.com/user-attachments/assets/379dcb30-39b3-4975-af5a-9f9a4088f9a7" 
    alt="Stately.ai machine" 
    width="800" 
    height="600"
  >
</a>

### Sign In Flow

<a href="https://stately.ai/registry/editor/embed/ba1525ec-eb20-481d-a16a-603f0dba37e4?machineId=a68dcace-10b4-4c97-899f-b966a5beb44c">
  <img 
    src="https://github.com/user-attachments/assets/9b116ad6-032f-4ca0-8fa3-5fabda27f3a3" 
    alt="Stately.ai machine" 
    width="800" 
    height="600"
  >
</a>

## Watch the simple walk through 

Use 2x speed if needed

[![Face Authentication using AWS Rekognition](https://img.youtube.com/vi/o3AXKWVPn_I/hqdefault.jpg)](https://www.youtube-nocookie.com/embed/o3AXKWVPn_I)

P.S: Who owns youtube-nocookie? 
Google LLC (https://www.whois.com/whois/youtube-nocookie.com)