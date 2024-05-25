

export const fileFilter = (res: Express.Request, file: Express.Multer.File, callback: Function ) => {
    if (!file) return callback(new Error('file is empty'), false);
    const fileExptension = file.mimetype.split('/')[1]; // ['image', 'jpg'] => jpg
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (allowedExtensions.includes(fileExptension)) {
        callback(null, true);
    };
    callback(null, false);
};