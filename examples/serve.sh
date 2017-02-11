#!/bin/bash

PORT="${1:-3000}"

./node_modules/.bin/sls simulate serve -p $PORT
