# LogDNA S3 Lambda Function

The integration with Amazon S3 relies on [AWS Lambda](https://docs.aws.amazon.com/lambda/index.html) to route your logs from [S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html) to LogDNA.

## How to Use
### Deploy the Code
1. Create a [new AWS Lambda function](https://console.aws.amazon.com/lambda/home) and select `Author from scratch`.
2. Click on the Lambda function to edit the details:
 * Code entry type: `Upload a .ZIP file`
 * Upload our LogDNA Lambda function [.ZIP File](https://github.com/logdna/logdna-s3/releases/latest/download/logdna-s3.zip).
 * Handler: `index.handler`
 * Runtime: `Node.js.14.x`

### Configuration
#### General Configuration
If the S3 Lambda is being used to stream from gzipped files:
1. Set `Timeout` to, at least, `30 seconds`.
2. Set `Memory` limit to, at least, `512 MB`.

**Notes**:
 * The recommended number of retries is 0 because retrying lambda execution can result in duplicate logs. It can be modified in `Configuration > Asynchronous invocation`.
 * `Timeout` and `Memory` limit might need to be increased if the file size is too big.

#### Triggers
Add `S3` as a trigger with the following configuration:
 * Specify the `bucket` you want to stream from.
 * Specify the event types you want to capture.
 * Optional prefix and suffix options are related to object paths within the specified bucket.

**Notes**:
 * This S3 Lambda function and S3 Bucket must be in the same availability zone.
 * You can specify a bucket in only one trigger and/or S3 Lambda function because a bucket accepts only one subscription but one S3 Lambda function can stream from multiple buckets at the same time.

#### Permissions
For Execution role, assign a role that has the following policies:
 * [`AmazonS3ReadOnlyAccess`](https://gist.github.com/bernadinm/6f68bfdd015b3f3e0a17b2f00c9ea3f8#file-all_aws_managed_policies-json-L4392-L4417)
 * [`AWSLambdaBasicExecutionRole`](https://gist.github.com/bernadinm/6f68bfdd015b3f3e0a17b2f00c9ea3f8#file-all_aws_managed_policies-json-L1447-L1473)

#### Environment Variables
Set `INGESTION_KEY` variable to your LogDNA ingestion key.

**Notes**:
 * For more information about required and optional environment variables, please, check out [this](./doc/env.md).

#### Monitoring
Enabling monitoring means forwarding the metrics and logs about the execution of the S3 Lambda function to `CloudWatch`. You can also use [`logdna-cloudwatch`](github.com/logdna/logdna-cloudwatch) to monitor the performance of this S3 Lambda function.

### Test
You can test the configuration and code package using the following test input containing the bucket name and the path to the file you want to test the lambda on:
```json
{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "<bucket-name>"
        },
        "object": {
          "key": "<object-path>"
        }
      }
    }
  ]
}
```

## Guide for Migrating from v1 to v2
If you have been using `v1` and want to switch to using the newer versions, check out [this guide](./doc/migrating-to-v2.md)

## License
Copyright © [LogDNA](https://logdna.com), released under an MIT license. See the [LICENSE](./LICENSE) file and https://opensource.org/licenses/MIT

## Contributing
Contributions are always welcome. See the [contributing guide](/CONTRIBUTING.md) to learn how you can help.

*Happy Logging!*
