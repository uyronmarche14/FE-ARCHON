# HTTP Layer

This directory owns shared HTTP utilities for the frontend.

Rules:

- feature services call the shared Axios client
- route files do not make raw requests
- transport types come from `src/contracts/`
- auth refresh handling and normalized error extraction live here
