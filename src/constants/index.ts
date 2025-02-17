export const enum USER_STATUS {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    PENDING = 'pending',
}

export const enum USER_ROLE {
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
    ADMIN = 'admin',
}

export const enum PROVIDERS {
    DRIZZLE = 'drizzle',
    JWT_SERVICE = 'JWTService',
}

export const enum SORT_OPTION {
    ASC = 'asc',
    DESC = 'desc',
}

export enum USER_POSITION {
    HR = 'hr',
    FRONTEND = 'frontendDev',
    BACKEND = 'backendDev',
    DEVOPS = 'devOps',
    MOBILE = 'mobileDev',
    ASSISTANT = 'assistant',
    PM = 'pm',
    CEO = 'ceo',
    CTO = 'cto',
    RECRUITER = 'recruiter',
    QA = 'qa',
    TEAM_LEAD = 'teamLead',
    DESIGNER = 'designer',
    SALES = 'sales',
}
export const HTTP_CODES = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};

export const ERROR_MESSAGES = {
    USER_ALREADY_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    EMAIL_IN_USE: 'Email is already in use',
    PASSWORD_UPDATE_FAILED: 'Failed to update password',
    INVALID_OLD_PASSWORD: 'Old password is invalid',
    SAME_PASSWORD: "New password shouldn't be equal to old password",
    NO_PERMISSION: 'You do not have permission to do this',
    SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED: 'No authorization header provided',
};
