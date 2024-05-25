import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";



export const getUser = createParamDecorator(
    (data, context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        let user = req.user;


        if (!user) throw new InternalServerErrorException('User not found (request)');

        // if (data) {
        //     user = user.email;
        // };

        return (!data) ? user : user[data];
    }
);