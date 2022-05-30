// Load environment variables
require("dotenv").config(); // Load environment variables

// Express modules
var express = require("express");
var router = express.Router();

// HTTP Requests modules
var axios = require("axios");

// Persistence modules
var redis = require("redis");
const redisClient = redis.createClient();

var AWS = require("aws-sdk");
const bucketName = "analysis-clarity-store";

// Check if redis is working
redisClient.on("error", (err) => {
  console.log("Error " + err);
});

// Test if credentials are accessable
AWS.config.getCredentials((err) => {
  if (err) console.log(err);
  else {
    console.log("Successfully retrieved credentials");
  }
});

// Ensure S3 Bucket has been created
const bucketPromise = new AWS.S3({ apiVersion: "2006-03-01" })
  .createBucket({ Bucket: bucketName })
  .promise();

// Output the result of the bucket creation
bucketPromise
  .then(function (data) {
    console.log("Successfully created " + bucketName);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });

// Neccessary global variables
const API_ENDPOINT = "http://127.0.0.1:8000/api";

// This function sends a request to the python server to process the article contents
let processArticle = async (articleURL) => {
  return axios({
    method: "post",
    url: API_ENDPOINT,
    data: {
      url: articleURL,
    },
  });
};

// Funciton to store JSON in cache
let storeInCache = (key, resultJSON) => {
  redisClient.setex(
    key,
    3600,
    JSON.stringify({ source: "Redis Cache", ...resultJSON })
  );
};

// Function to store JSON in AWS S3 Bucket
let storeInS3Bucket = (bucket, key, resultJSON) => {
  const body = JSON.stringify({
    source: "S3 Bucket",
    ...resultJSON,
  });
  const objectParams = {
    Bucket: bucket,
    Key: key,
    Body: body,
  };
  const uploadPromise = new AWS.S3({ apiVersion: "2006-03-01" })
    .putObject(objectParams)
    .promise();

  uploadPromise.then(function (data) {
    console.log("Successfully uploaded data to " + bucketName + "/" + key);
  });
};

/*POST clarity route*/
router.post("/", async (req, res, next) => {
  // Analayse URL to see if it passes regex
  // Send URL to data processing server
  // Recieve NLP analysis and pass keywords to news api
  let url = req.body.url.trim();
  if (url) {
    const redisKey = `clarity:${url}`;
    return redisClient.get(redisKey, (err, result) => {
      // NOTE: DISABLE REDIS AND AWS FUNCTIONS FOR NOW
      // If the result is within the cache, get it
      if (result) {
        const resultJSON = JSON.parse(result);
        return res.status(200).json(resultJSON);
      } else {
        // Else get it from the S3 Bucket
        const s3Key = `clarity-${url}`;
        const params = { Bucket: bucketName, Key: s3Key };

        return new AWS.S3({ apiVersion: "2006-03-01" }).getObject(
          params,
          (err, result) => {
            if (result) {
              // Serve from S3
              const resultJSON = JSON.parse(result.Body);

              // Store it in the cache
              storeInCache(redisKey, resultJSON);

              // Serve the result from S3
              return res.status(200).json(resultJSON);
            } else {
              // Process the data for the first time
              return processArticle(url)
                .then((response) => {
                  // Upload analysis data to S3 Bucket
                  storeInS3Bucket(bucketName, s3Key, response.data);

                  // Store analysis data in the cache
                  storeInCache(redisKey, response.data);

                  res.status(200).json({ ...response.data });
                })
                .catch((error) => {
                  console.log(error);
                  if (error.response) {
                    res.status(error.response.status).json(error.response.data); // Forward the error produced by the python server
                  }
                });
            }
          }
        );
      }
    });
  } else {
    // If an no valid URL is given, return an error
    return res
      .status(400) // TODO: need to change to code more fitting
      .json({ error: true, message: "A URL was not provided" });
  }
});

module.exports = router;
