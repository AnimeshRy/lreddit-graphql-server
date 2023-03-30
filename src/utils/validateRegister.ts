import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes("@")) {
        return [{
            field: "email",
            message: "invalid email"
        }];
    }

    if (options.password.length <= 5) {
        return [{
            field: "password",
            message: "length must be greater than 5"
        }];
    }

    if (options.username.includes("@")) {
        return [{
            field: "username",
            message: "cannot include an @"
        }];
    }
    return null;
};
