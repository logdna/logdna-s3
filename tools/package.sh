#!/bin/bash
mkdir -p pkg
npm ci --prod
zip pkg/logdna-s3.zip -r node_modules/ index.js package.json lib/*.js
