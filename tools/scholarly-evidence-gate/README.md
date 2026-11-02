# Scholarly Evidence Gate — proposed local module

Status: **setup scaffold only; no R02.2 implementation**.

This directory reserves a local home for the future R02.2 Scholarly Evidence Gate. It currently contains no source collection, corpus import, parsing, scoring, Jev calls or application integration. Do not add historical text until its license and permitted use are verified and the project owner approves the scope.

The module must remain separate from the charting engine and existing application. Any later implementation needs an owner-approved specification and a Draft PR. Evidence records should preserve source identity, rights/provenance, exact cited spans and review status; this README does not define an ingestion format or certify any source.

## Review exchange

- GitHub is authoritative for code. Send code changes through Draft PRs and keep reviewer comments there.
- Use the project's official [Google Drive exchange folder](https://drive.google.com/drive/folders/1cugfQW8ZuC7S7OBpUMtMjG9mr-ptyW4R) only for documents that need to pass between local Codex and ChatGPT Web. The folder is not a development mount.
- Transfer in one direction, from an explicitly selected local file to Drive. Use the authenticated Google Drive connector and the exact folder ID `1cugfQW8ZuC7S7OBpUMtMjG9mr-ptyW4R`; do not recurse through directories or sync a repository tree.
- Eligible files are Markdown, cleaned evidence JSON, test reports, a review manifest and handoff documents. Select and inspect each file before upload. Never upload `.git`, `node_modules`, `.env*`, credentials/API keys, sensitive logs or a corpus.
- After each upload, read the Drive file back and compare its content and SHA-256 with the local source. Stop if either differs. Drive review documents do not flow back into code automatically; apply code changes through GitHub.
- `review-exchange-smoke-test.md` is a harmless sample for checking this path. It is not project evidence.
