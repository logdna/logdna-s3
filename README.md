# LogDNA S3

The LogDNA Amazon S3 integration relies on [AWS Lambda](https://docs.aws.amazon.com/lambda/index.html) to route your logs from [S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html) to LogDNA.

## Configure the LogDNA AWS Lambda function
1. Create a [new AWS Lambda function](https://console.aws.amazon.com/lambda/home) and select `Author from scratch`
2. For the basic information:
 * Function Name: `logdna_s3` (you can choose what to name it)
 * Runtime: `Node.js.10.x`
3. Click on the Lambda function to edit the details:
 * Code entry type: `Upload a .ZIP file`
 * Upload our LogDNA Lambda function [.ZIP File](https://github.com/logdna/logdna-s3/releases/latest/download/logdna-s3.zip)
 * Handler: `index.handler`
 * Runtime: `Node.js.10.x`
 * Environment variables:
    * `LOGDNA_KEY`: `YOUR_INGESTION_KEY_HERE` *(Required)*
    * `LOGDNA_HOSTNAME`: Alternative Host Name *(Optional)*
    * `LOGDNA_TAGS`: Comma-separated Tags *(Optional)*
    * `LOGDNA_URL`: Custom Ingestion URL *(Optional)*
4. For Execution role, assign a role that has the following policies:
 * [`AmazonS3ReadOnlyAccess`](https://gist.github.com/bernadinm/6f68bfdd015b3f3e0a17b2f00c9ea3f8#file-all_aws_managed_policies-json-L4392-L4417)
 * [`AWSLambdaBasicExecutionRole`](https://gist.github.com/bernadinm/6f68bfdd015b3f3e0a17b2f00c9ea3f8#file-all_aws_managed_policies-json-L1447-L1473)
![Policies](https://raw.githubusercontent.com/logdna/artwork/master/logdna-s3/permissions.png)
5. It is recommended to set the `Timeout` to 30 seconds if the function is going to be used to stream the logs from `gzipped` files. You may change `Memory (MB)` limit as well depending on how heavy those files are going to be

### Configure your AWS S3 Bucket
You have the option of connecting your Amazon S3 Bucket within the S3 Lambda function console or in your S3 console.

### In the S3 Lambda Function
1. Add S3 as a Trigger and click it to Configure:
![Configure](https://raw.githubusercontent.com/logdna/artwork/master/logdna-s3/designer.png)
2. Select the `Bucket` and `Event type` to stream the logs from to LogDNA
    a. *Optional* You can also specify `Prefix` and `Suffix` for the files to capture
3. Make sure you check `Enable trigger` box:
![Trigger](https://raw.githubusercontent.com/logdna/artwork/master/logdna-s3/trigger.png)
4. Repeat steps 1-3 to add multiple buckets

### Optional Environment Variables
The following variables can be used to tune this S3 Lambda function for specific use cases.

* **LOGDNA_BATCH_INTERVAL**: How frequently (in `milliseconds`) to flush the batch of logs, *Optional*
	* **Default**: 50
* **LOGDNA_BATCH_LIMIT**: The maximum number of logs in one batch, *Optional*
	* **Default**: 25
* **LOGDNA_FREE_SOCKET_TIMEOUT**: How long (in `milliseconds`) to wait for inactivity before timing out on the free socket, *Optional*
    * **Default**: 300000
    * **Source**: [agentkeepalive#agentoptions](https://github.com/node-modules/agentkeepalive/blob/master/README.md#new-agentoptions)
* **LOGDNA_MAX_LINE_LENGTH**: The maximum character length for each line, *Optional*
    * **Default**: 32000
* **LOGDNA_MAX_REQUEST_RETRIES**: The maximum number of retries for sending a line when there are network failures, *Optional*
    * **Default**: 5
* **LOGDNA_MAX_REQUEST_TIMEOUT**: Time limit (in `seconds`) for requests made by this HTTP Client, *Optional*
    * **Default**: 300
* **LOGDNA_REQUEST_RETRY_INTERVAL**: How frequently (in `milliseconds`) to retry for sending a line when there are network failures, *Optional*
    * **Default**: 100

### Notes
* This S3 Lambda function and S3 Bucket should be in the same availability zone
* You can specify a bucket only in one trigger and/or S3 Lambda function since a bucket accepts only one subscription
* `Node.js.10.x` is the minimum runtime requirement for successfully running this S3 Lambda function

## Contributing
Contributions are always welcome. See the [contributing guide](/CONTRIBUTING.md) to learn how you can help. Build instructions for the agent are also in the guide.
