import { v4 as uuid } from 'uuid'

export const fileName = (res: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(new Error('file is empty'), false);
    const fileExptension = file.mimetype.split('/')[1]; // ['image', 'jpg'] => jpg
    const fileName = `${uuid()}.${fileExptension}`
    return callback(null, fileName)
};