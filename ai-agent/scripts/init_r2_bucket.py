import sys
import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Add the parent directory of 'app' to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)

# Load .env file explicitly
env_path = os.path.join(parent_dir, '.env')
load_dotenv(env_path)

from app.core.config import get_settings

def init_r2_bucket():
    settings = get_settings()
    
    print(f"Initializing R2 Bucket connection...")
    print(f"Endpoint: {settings.R2_ENDPOINT_URL}")
    print(f"Bucket Name: {settings.R2_BUCKET_NAME}")
    
    s3 = boto3.client(
        service_name='s3',
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name='auto'
    )

    try:
        # Check if bucket exists
        print("Checking if bucket exists...")
        s3.head_bucket(Bucket=settings.R2_BUCKET_NAME)
        print(f"Bucket '{settings.R2_BUCKET_NAME}' already exists.")
    except ClientError as e:
        # If a 404 error is returned, the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            print(f"Bucket '{settings.R2_BUCKET_NAME}' does not exist. Creating...")
            try:
                s3.create_bucket(Bucket=settings.R2_BUCKET_NAME)
                print(f"Bucket '{settings.R2_BUCKET_NAME}' created successfully.")
            except Exception as create_error:
                print(f"Failed to create bucket: {create_error}")
                raise create_error
        else:
            print(f"Error checking bucket: {e}")
            raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise e

if __name__ == "__main__":
    init_r2_bucket()