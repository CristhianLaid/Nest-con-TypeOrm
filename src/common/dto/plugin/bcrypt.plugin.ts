import * as bcrypt from 'bcrypt';

export const bcryptPlugin = {
    hasSync: (password:string) => bcrypt.hashSync(password, 10),
    compareSync: (password:string, hash:string) => bcrypt.compareSync(password, hash)
};