import crypto from 'crypto';

export const randomBase64 = () => {
    const randomData = crypto.randomBytes(256);
    const base64String = randomData.toString('base64');
    return `data:image/png;base64,${base64String}`;
};
