## Environment Variables

### `FLUSH_INTERVAL`

> The number of milliseconds to wait between sending payloads to LogDNA

| Config | Value |
| --- | --- |
| Name | `flush-interval` |
| Environment Variable | `FLUSH_INTERVAL` |
| Type | `number` |
| Required | no |
| Default | `1000` |

***

### `FLUSH_LIMIT`

> If the length of the send buffer exceeds this length, send immediately

| Config | Value |
| --- | --- |
| Name | `flush-limit` |
| Environment Variable | `FLUSH_LIMIT` |
| Type | `number` |
| Required | no |
| Default | `25` |

***

### `HOSTNAME`

> Optionally, use an alternative host name configured through the environment

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

### `USER_AGENT`

> The user-agent header value to use while sending logs

| Config | Value |
| --- | --- |
| Name | `user-agent` |
| Environment Variable | `USER_AGENT` |
| Type | `string` |
| Required | no |
| Default | `logdna-s3/2.0.0` |

***

