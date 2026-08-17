# Thin wrapper around the justfile (the source of truth for commands —
# see CLAUDE.md "Commands"). Exists for `make run` convenience only.

.PHONY: setup run check test

setup:
	cd app && npm install
	cd indexer && npm install
	cd underwriter && uv sync

run:
	just dev

check:
	just check

test:
	just test
