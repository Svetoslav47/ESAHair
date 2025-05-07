import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export async function uploadBarberImageToS3(fileBuffer: Buffer, originalName: string, mimetype: string): Promise<string> {
  const ext = path.extname(originalName);
  const key = `barbers/${uuidv4()}${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read',
  }));
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadServiceImageToS3(fileBuffer: Buffer, originalName: string, mimetype: string): Promise<string> {
  const ext = path.extname(originalName);
  const key = `services/${uuidv4()}${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read',
  }));
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
} 