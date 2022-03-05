import '@types/express-session'

declare module "express-session" {
    interface Session {
        userId: any;
    }
}
