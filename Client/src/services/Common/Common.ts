export const API_BASE_URL = 'http://localhost:8082/api/v1';

export interface StandardResponse<T> {
    code: number;
    message: string;
    data: T;
}