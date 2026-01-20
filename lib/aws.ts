import SDK from "aws-sdk";

const s3 = new SDK.S3({
    endpoint: process.env.BUCKET_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string
    },
    signatureVersion: "v4"
});

/**
 * Generates a presigned PUT URL for user uploads directly to the configured S3 bucket.
 * @param mediaObjectUUID UUID of the existent Media row in the database
 * @param mime Content-type of the object being uploaded
 * @returns Direct R2 presigned PUT URL
 */
export async function generatePresignedUploadURL(
    mediaObjectUUID: string,
    mime: string
) {
    const url = await s3.getSignedUrlPromise("putObject", {
        Bucket: process.env.BUCKET_NAME,
        Key: mediaObjectUUID,
        Expires: 3000,
        ContentType: mime
    });

    return url;
}