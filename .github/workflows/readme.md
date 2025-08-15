This folder contains CI workflows. The post-deploy check waits briefly for Cloudflare Pages to publish main and then validates that `/api/generate` returns a 200 with a JSON body containing an `ideas` array. Adjust the wait time if deploys take longer.

