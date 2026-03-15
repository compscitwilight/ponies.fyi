import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    endpoint: process.env.BUCKET_ENDPOINT,
    region: "auto",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SECRET_ACCESS_KEY as string
    }
});

/**
 * Generates a presigned PUT URL for user uploads directly to the configured S3 bucket.
 * @param mediaObjectUUID UUID of the existent Media row in the database
 * @returns Direct R2 presigned PUT URL
 */
export async function generatePresignedUploadURL(mediaObjectUUID: string) {
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
    const copyCommand = new CopyObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        CopySource: `${process.env.BUCKET_NAME}/${source}`,
        Key: destination
    }); 

    await s3.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: source
    });

    await s3.send(deleteCommand);
}