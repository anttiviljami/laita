import crypto from 'crypto';

export const checkBucketName = (bucketName: string, prefix: string = 'laita') => {
  if (!bucketName || bucketName === 'randomly generated') {
    const hash = crypto
      .createHash('sha256')
      .update(`${Math.random()}`)
      .digest('hex')
      .substr(0, 8);
    return `${prefix}-${hash}`;
  }
  return bucketName;
};
