#!/bin/bash

git checkout $1
npm run docs
aws s3 sync docs/ s3://ape.const.sh/$1 --profile ape.const.sh --region eu-west-1
aws cloudfront create-invalidation --distribution-id E2DJVTI57GD63Z --paths '/$1/*' --profile ape.const.sh --region eu-west-1
