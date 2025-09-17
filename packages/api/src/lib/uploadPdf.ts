import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET;

if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new Error("Missing AWS environment variables. Check your .env file");
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadPayslipToS3(
  pdfBuffer: Buffer,
  payrunId: string,
  employeeId: string
): Promise<string> {
  const key = `payruns/${payrunId}/${employeeId}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ServerSideEncryption: "AES256",
    })
  );

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
