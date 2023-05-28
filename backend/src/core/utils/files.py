import io
import logging
import traceback
from dataclasses import dataclass
from io import BytesIO

import boto3
import botocore.exceptions
from boto3.exceptions import Boto3Error
from botocore.config import Config
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from core.utils.exceptions import S3ConnectionError, S3DeleteError, S3DownloadError, S3OtherError, S3UploadError
from core.utils.notification import telegram_message

try:
    from settings.settings import S3_SERVER, S3_ACCESS_KEY, S3_SECRET_KEY
except ImportError:
    S3_SERVER = None
    S3_ACCESS_KEY = None
    S3_SECRET_KEY = None

logger = logging.getLogger(__name__)


class S3Wrapper:
    def __init__(self,
                 bucket_name: str,
                 s3_access_key_id: str = S3_ACCESS_KEY,
                 s3_secret_access_key: str = S3_SECRET_KEY,
                 url: str = S3_SERVER) -> None:
        """
        Initialize S3 client

        :param bucket_name: name of bucket to use (str)
        :param s3_access_key_id: access key id (str)
        :param s3_secret_access_key: secret access key (str)
        :param url: url of S3 server (str)
        """
        if not (url.startswith("http://") or url.startswith("https://")):
            url = f"https://{url}"

        self.bucket_name = bucket_name
        self.url = url
        try:
            self.s3 = boto3.resource('s3',
                                     endpoint_url=url,
                                     aws_access_key_id=s3_access_key_id,
                                     aws_secret_access_key=s3_secret_access_key,
                                     config=Config(signature_version='s3v4'))
            self.bucket = self.s3.Bucket(bucket_name)
        except Boto3Error as error:
            message = (f"Текст ошибки: {error.response['Error']['Message']}\n"
                       f"ID ошибки: {error.response['Error']['Code']}\n"
                       f"HTTP код ошибки: {error.response['ResponseMetadata']['HTTPStatusCode']}\n"
                       )
            logger.info(f"Ошибка при подключении на S3: {message}")
            raise S3ConnectionError(message)
        except Exception as error:
            telegram_message(f"Ошибка при загрузке файла на S3: {traceback.format_exc()}")
            raise S3ConnectionError(f"{error} \n{traceback.format_exc()}")

    def upload_file(self, file_name: str, file: bytes | BytesIO) -> bool:
        """
        Upload file to S3

        :param file: file object (bytes)
        :param file_name: name of file to upload (str)
        :return: True if file was uploaded, False otherwise
        """
        try:
            if isinstance(file, bytes):
                buf = io.BytesIO(file)
                buf.seek(0)
            elif isinstance(file, BytesIO):
                buf = file
                buf.seek(0)
            else:
                raise S3UploadError(f"Ожидается bytes или BytesIO, получен {type(file)}")
            self.bucket.upload_fileobj(buf, file_name)
            return True
        except Boto3Error as error:
            message = (f"Текст ошибки: {error.response['Error']['Message']}\n"
                       f"ID ошибки: {error.response['Error']['Code']}\n"
                       f"HTTP код ошибки: {error.response['ResponseMetadata']['HTTPStatusCode']}\n"
                       )
            telegram_message(f"Ошибка при загрузке файла на S3: {message}")
            raise S3UploadError(message)
        except Exception as error:
            telegram_message(f"Ошибка при загрузке файла на S3: {traceback.format_exc()}")
            raise S3UploadError(f"{error}"
                                f"\n{traceback.format_exc()}")

    def upload_files(self, files: list[dict]) -> list[bool]:
        """
        Upload files to S3

        :param files:  list of files to upload, each file should have keys:
            - data: file object (bytes)
            - name: name of file to upload (str)
        :return: list of booleans. True if file was uploaded, False otherwise
        """
        result = []
        for file in files:
            result.append(self.upload_file(file['name'], file['data']))
        return result

    def download_file(self, file_name: str) -> bytes | None:
        """
        Download file from S3 as bytes

        :param file_name: name of file to download (str)
        :return: file object (bytes)
        """
        try:
            obj = self.bucket.Object(file_name)
            return obj.get()['Body'].read()
        except Boto3Error as error:
            message = (f"Текст ошибки: {error.response['Error']['Message']}\n"
                       f"ID ошибки: {error.response['Error']['Code']}\n"
                       f"HTTP код ошибки: {error.response['ResponseMetadata']['HTTPStatusCode']}\n")
            telegram_message(f"Ошибка при загрузке файла на S3: {message}")
            raise S3DownloadError(message)
        except Exception as error:
            telegram_message(f"Ошибка при загрузке файла на S3: {traceback.format_exc()}")
            raise S3DownloadError(f"{error}"
                                  f"\n{traceback.format_exc()}")

    def download_files(self, files: list[str]) -> list[bytes]:
        """
        Download files from S3 as bytes

        :param files: list of file names to download (list[str])
        :return: list of file objects (bytes) or None if file was not found
        """
        result = []
        for file in files:
            result.append(self.download_file(file))
        return result

    def get_presigned_url(self, file_name: str, expires: int = 3600) -> str | None:
        """
        Get presigned url for file

        :param expires: time in seconds for which url is valid
        :param file_name: name of file to get url for (str)
        :return: presigned url (str)
        """
        try:
            return self.bucket.meta.client.generate_presigned_url('get_object',
                                                                  Params={'Bucket': self.bucket.name, 'Key': file_name},
                                                                  ExpiresIn=expires)
        except Boto3Error as error:
            message = (f"Текст ошибки: {error.response['Error']['Message']}\n"
                       f"ID ошибки: {error.response['Error']['Code']}\n"
                       f"HTTP код ошибки: {error.response['ResponseMetadata']['HTTPStatusCode']}\n")
            telegram_message(f"Ошибка при загрузке файла на S3: {message}")
            raise S3DownloadError(message)
        except Exception as error:
            telegram_message(f"Ошибка при загрузке файла на S3: {traceback.format_exc()}")
            raise S3DownloadError(f"{error}"
                                  f"\n{traceback.format_exc()}")

    def get_presigned_urls(self, files: list[str], expires: int = 3600) -> list[str | None]:
        """
        Get presigned urls for files

        :param expires: time in seconds for which url is valid
        :param files: list of file names to get urls for (list[str])
        :return: list of presigned urls (list of strings or None if file was not found)
        """
        result = []
        for file in files:
            result.append(self.get_presigned_url(file, expires))
        return result

    def check_file_exists(self, file_name: str) -> bool:
        """
        Check if file exists in S3

        :param file_name: name of file to check (str)
        :return: True if file exists, False otherwise
        """
        try:
            self.bucket.Object(file_name).load()
            return True
        except botocore.exceptions.ClientError as e:
            if e.response['Error']['Code'] == "404":
                return False
        except (Boto3Error, botocore.exceptions.BotoCoreError, botocore.exceptions.ClientError) as error:
            message = (f"Текст ошибки: {error.response['Error']['Message']}\n"
                       f"ID ошибки: {error.response['Error']['Code']}\n"
                       f"HTTP код ошибки: {error.response['ResponseMetadata']['HTTPStatusCode']}\n")
            telegram_message(f"Ошибка при загрузке файла на S3: {message}")
            raise S3OtherError(message)
        except Exception as error:
            telegram_message(f"Ошибка при загрузке файла на S3: {traceback.format_exc()}")
            raise S3OtherError(f"{error}"
                               f"\n{traceback.format_exc()}")

    def check_files_exists(self, files: list[str]) -> list[bool]:
        """
        Check if files exists in S3

        :param files: list of file names to check (list[str])
        :return: list of booleans. True if file exists, False otherwise
        """
        result = []
        for file in files:
            result.append(self.check_file_exists(file))
        return result

    def delete_file(self, file_name: str) -> bool:
        """
        Delete file from S3

        :param file_name: name of file to delete (str)
        :return: True if file was deleted, False otherwise
        """
        try:
            self.bucket.Object(file_name).delete()
            return True
        except Boto3Error as error:
            message = (f"Текст ошибки: {error.response['Error']['Message']}\n"
                       f"ID ошибки: {error.response['Error']['Code']}\n"
                       f"HTTP код ошибки: {error.response['ResponseMetadata']['HTTPStatusCode']}\n")
            telegram_message(f"Ошибка при загрузке файла на S3: {message}")
            raise S3DeleteError(message)
        except Exception as error:
            telegram_message(f"Ошибка при загрузке файла на S3: {traceback.format_exc()}")
            raise S3DeleteError(f"{error}"
                                f"\n{traceback.format_exc()}")

    def delete_files(self, files: list[str]) -> list[bool]:
        """
        Delete files from S3

        :param files: list of file names to delete (list[str])
        :return: list of booleans. True if file was deleted, False otherwise
        """
        result = []
        for file in files:
            result.append(self.delete_file(file))
        return result


@dataclass
class File:
    file: str
    mime: str
    file_name: str
    file_size: int


class UploadFileSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate(self, data):
        file = data['file'] or data['image']
        logger.debug(file)
        data['mime'] = file.content_type
        data['file_name'] = file.name
        file_size = file.size
        if file_size > 100 * 1024 * 1024:
            raise ValidationError("Файл слишком большой. Загрузите файл меньше 100 Мб")
        data['file_size'] = file_size
        allowed_mime_types = self.context.get('allowed_mime_types')
        if allowed_mime_types and data['mime'] not in allowed_mime_types:
            raise ValidationError("Недопустимый формат файла")
        if isinstance(file, InMemoryUploadedFile):
            data['file'] = file.file
        elif isinstance(file, TemporaryUploadedFile):
            data['file'] = file.read()
        else:
            raise ValidationError("Файл слишком большой")
        return data

    def create(self, validated_data):
        return File(**validated_data)
