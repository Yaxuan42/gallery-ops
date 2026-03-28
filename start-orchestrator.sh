#!/bin/bash
export https_proxy=http://127.0.0.1:6152
export http_proxy=http://127.0.0.1:6152
export all_proxy=socks5://127.0.0.1:6153
export PATH=/opt/homebrew/bin:/usr/local/bin:$PATH

cd /Users/yaxuan/projects/gallery-ops
exec claude --dangerously-skip-permissions --max-turns 200 --model claude-sonnet-4-20250514 -p "$(cat ORCHESTRATOR.md)"
