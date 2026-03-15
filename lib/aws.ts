import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    endpoint: process.env.BUCKET_ENDPOINT,
    region: "auto",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string
    },
    // signatureVersion: "v4"
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
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: mediaObjectUUID
    })

    const url = await getSignedUrl(s3, command, {
        expiresIn: 3000
    });

    return url;
}

export async function moveObject(source: string, destination: string) {
    
}