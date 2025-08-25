#!/bin/bash

# load environment variables dari .env
export $(grep -v '^#' .env | xargs)

# deploy ke Deno Deploy
deployctl deploy --project=kotoba-web --entrypoint=main.ts --prod
