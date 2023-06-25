import { MyContext } from 'src/types';
import { createMethodDecorator } from 'type-graphql';

function useAuthenticate(): MethodDecorator {
  // WIP, Add an authorization check here
  return createMethodDecorator<MyContext>(async ({ context }, next) => {
    if (!context.req.session || !context.req.session.userId) {
      const errors = [
        {
          field: 'authentication',
          message: 'Unauthorized access',
        },
      ];
      return {
        errors,
      };
    }

    // Proceed to the main function
    return next();
  });
}

export { useAuthenticate };
