#!/bin/bash
cd /home/kavia/workspace/code-generation/recipehub-31662-a746ba81/recipes_backend_workspace/recipes_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

