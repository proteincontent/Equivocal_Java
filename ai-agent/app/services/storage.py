import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from app.core.config import get_settings
import os
import uuid

settings = get_settings()

class R2Storage:
    def __init__(self):
        # 配置超时和重试，防止请求无限挂起
        client_config = Config(
            connect_timeout=settings.R2_CONNECT_TIMEOUT,
            read_timeout=settings.R2_READ_TIMEOUT,
            retries={
                'max_attempts': 2,
                'mode': 'standard'
            }
        )
        
        self.s3_client = boto3.client(
            service_name='s3',
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name='auto',  # Cloudflare R2 region is auto
            config=client_config
        )
        self.bucket_name = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL.rstrip('/')

    def upload_file(self, file_content: bytes, file_name: str, content_type: str = "application/octet-stream") -> str:
        """
        Uploads a file to R2 and returns the public URL.
        """
        try:
            # Generate a unique object key to prevent overwrites
            ext = os.path.splitext(file_name)[1]
            object_key = f"{uuid.uuid4()}{ext}"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_content,
                ContentType=content_type
            )
            
            # Construct public URL
            # Assuming the public URL is configured to point to the bucket root
            return f"{self.public_url}/{object_key}"
            
        except ClientError as e:
            print(f"Error uploading file to R2: {e}")
            raise e

    def generate_presigned_url(self, object_key: str, expiration: int = 3600) -> str:
        """
        Generate a presigned URL for downloading a private file.
        """
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None

storage_service = R2Storage()