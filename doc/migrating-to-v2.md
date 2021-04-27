## Guide for Migrating from v1 to v2

The `v2` release of LogDNA S3 Lambda function integration contains lots of refactoral changes to improve the performance and configuration by introducing [`@logdna/logger`](https://www.npmjs.com/package/@logdna/logger), [`@logdna/env-config`](https://www.npmjs.com/package/@logdna/env-config), and [`eslint-config-logdna`](https://www.npmjs.com/package/eslint-config-logdna). There are several changes in naming and handling environment variables as well. All environment variables are documented [here](./env.md)

### Renamed Variables
* `LOGDNA_KEY` was replaced with [`INGESTION_KEY`](./env.md#ingestion_key).
* `LOGDNA_HOSTNAME` was replaced with [`HOSTNAME`](./env.md#hostname).
* `LOGDNA_TAGS` was replaced with [`TAGS`](./env.md#tags).
* `LOGDNA_URL` was split into multiple new variables: [`INGESTION_ENDPOINT`](./env.md#ingestion_endpoint), [`INGESTION_HOST`](./env.md#ingestion_host), [`INGESTION_PORT`](./env.md#ingestion_port), and [`SSL`](./env.md#ssl).
* `LOGDNA_BATCH_INTERVAL` was replaced with [`FLUSH_INTERVAL`](./env.md#flush_interval).
* `LOGDNA_BATCH_LIMIT` was replaced with [`FLUSH_LIMIT`](./env.md#flush_limit).

### Removed Variables
* `LOGDNA_FREE_SOCKET_TIMEOUT`, `LOGDNA_MAX_REQUEST_RETRIES`, `LOGDNA_REQUEST_RETRY_INTERVAL`, and `LOGDNA_MAX_REQUEST_TIMEOUT` were removed because the connection is handled within the logger client.
* `LOGDNA_MAX_LINE_LENGTH` was removed because line length is handled on the server-side.
* `LOGDNA_EVENTLOG` and `LOGDNA_FILELOG` were removed because `v2` streams only the logs from the files within the specified bucket. You can use `AWS CloudTrail Event Logging` to stream Object-level operations from `S3` buckets. For more information, refer to [this article](https://docs.amazonaws.cn/en_us/AmazonS3/latest/userguide/enable-cloudtrail-logging-for-s3.html).

### New Variables
* [`PROXY`](./env.md#proxy), [`HTTPS_PROXY`](./env.md#https_proxy), and [`HTTP_PROXY`](./env.md#http_proxy) provide proxy support.
* [`USER_AGENT`](./env.md#user_agent) supports custom `user-agent` overrides.
