'use strict'

const {S3Client, GetObjectCommand} = require('@aws-sdk/client-s3')
const {object} = require('@logdna/stdlib')

const s3 = new S3Client({})

module.exports = exports = {
  getObject
}

async function getObject(params) {
  let data, err
  try {
    const command = new GetObjectCommand(params)
    data = await s3.send(command)
  } catch (error) {
    err = new Error('Error in Getting the S3 Object')
    err.meta = {error, params}
    throw err
  }

  if (!object.has(data, 'Body')) {
    err = new Error('Corrupted data returned from the object')
    err.meta = {params}
    throw err
  }

  const s3ResponseStream = data.Body
  const chunks = []

  for await (const chunk of s3ResponseStream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}
