## Environment Variables

### `BATCH_INTERVAL`

> The number of milliseconds between sending each batch

| Config | Value |
| --- | --- |
| Name | `batch-interval` |
| Environment Variable | `BATCH_INTERVAL` |
| Type | `number` |
| Required | no |
| Default | `50` |

***

### `BATCH_LIMIT`

> The number of lines within each batch

| Config | Value |
| --- | --- |
| Name | `batch-limit` |
| Environment Variable | `BATCH_LIMIT` |
| Type | `number` |
| Required | no |
| Default | `25` |

***

### `FREE_SOCKET_TIMEOUT`

> The number of milliseconds to wait for inactivity before timing out

| Config | Value |
| --- | --- |
| Name | `free-socket-timeout` |
| Environment Variable | `FREE_SOCKET_TIMEOUT` |
| Type | `number` |
| Required | no |
| Default | `300000` |

***

### `HOSTNAME`

> Optionally, use alternative host name set through the environment

| Config | Value |
| --- | --- |
| Name | `hostname` |
| Environment Variable | `HOSTNAME` |
| Type | `string` |
| Required | no |
| Default | `(none)` |

***

### `HTTP_PROXY`

> An http:// proxy URL to pass through before going to LogDNA

| Config | Value |
| --- | --- |
| Name | `http-proxy` |
| Environment Variable | `HTTP_PROXY` |
| Type | `string` |
| Required | no |
| Default | `(none)` |

***

### `HTTPS_PROXY`

> A secure (https://) proxy URL to pass through before going to LogDNA

| Config | Value |
| --- | --- |
| Name | `https-proxy` |
| Environment Variable | `HTTPS_PROXY` |
| Type | `string` |
| Required | no |
| Default | `(none)` |

***

### `INGESTION_ENDPOINT`

> The endpoint for log ingestion at LogDNA

| Config | Value |
| --- | --- |
| Name | `ingestion-endpoint` |
| Environment Variable | `INGESTION_ENDPOINT` |
| Type | `string` |
| Required | no |
| Default | `/logs/ingest` |

***

### `INGESTION_HOST`

> The host for log ingestion

| Config | Value |
| --- | --- |
| Name | `ingestion-host` |
| Environment Variable | `INGESTION_HOST` |
| Type | `string` |
| Required | no |
| Default | `logs.logdna.com` |

***

### `INGESTION_KEY`

> LogDNA Ingestion Key to stream the logs from files

| Config | Value |
| --- | --- |
| Name | `ingestion-key` |
| Environment Variable | `INGESTION_KEY` |
| Type | `string` |
| Required | **yes** |
| Default | `(none)` |

***

### `INGESTION_PORT`

> The port for log ingestion

| Config | Value |
| --- | --- |
| Name | `ingestion-port` |
| Environment Variable | `INGESTION_PORT` |
| Type | `number` |
| Required | no |
| Default | `443` |

***

### `MAX_REQUEST_RETRIES`

> Maximum number of retries for sending each batch

| Config | Value |
| --- | --- |
| Name | `max-request-retries` |
| Environment Variable | `MAX_REQUEST_RETRIES` |
| Type | `number` |
| Required | no |
| Default | `5` |

***

### `MAX_REQUEST_TIMEOUT`

> Maximum request timeout in sending each batch

| Config | Value |
| --- | --- |
| Name | `max-request-timeout` |
| Environment Variable | `MAX_REQUEST_TIMEOUT` |
| Type | `number` |
| Required | no |
| Default | `300` |

***

### `PROXY`

> A full proxy URL (including protocol) to pass through before going to LogDNA

| Config | Value |
| --- | --- |
| Name | `proxy` |
| Environment Variable | `PROXY` |
| Type | `string` |
| Required | no |
| Default | `(none)` |

***

### `REQUEST_RETRY_INTERVAL`

> The number of milliseconds between each retry

| Config | Value |
| --- | --- |
| Name | `request-retry-interval` |
| Environment Variable | `REQUEST_RETRY_INTERVAL` |
| Type | `number` |
| Required | no |
| Default | `100` |

***

### `SSL`

> Use https:// for log ingestion

| Config | Value |
| --- | --- |
| Name | `ssl` |
| Environment Variable | `SSL` |
| Type | `boolean` |
| Required | no |
| Default | `true` |

***

### `TAGS`

> Optionally, use comma-separated tags set through the environment

| Config | Value |
| --- | --- |
| Name | `tags` |
| Environment Variable | `TAGS` |
| Type | `string` |
| Required | no |
| Default | `(none)` |

***

### `URL`

> *Combination of SSL, INGESTION_HOST, INGESTION_PORT, and INGESTION_ENDPOINT*

| Config | Value |
| --- | --- |
| Name | `url` |
| Environment Variable | `URL` |
| Type | `string` |
| Required | no |
| Default | `https://logs.logdna.com/logs/ingest` |

***

### `USER_AGENT`

> user-agent header value to use while sending logs

| Config | Value |
| --- | --- |
| Name | `user-agent` |
| Environment Variable | `USER_AGENT` |
| Type | `string` |
| Required | no |
| Default | `logdna-s3/2.0.0` |

***

