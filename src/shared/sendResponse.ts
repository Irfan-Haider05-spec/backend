import { Response } from 'express';

type Pagination = {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
};

type IData<T> = {
    success: boolean;
    statusCode: number;
    message?: string;
    pagination?: Pagination;
    data?: T;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
    const resData: any = { success: data.success };

    if (data.message) resData.message = data.message;
    if (data.pagination) resData.pagination = data.pagination;
    if (data.data !== undefined) resData.data = data.data;

    return res.status(data.statusCode).json(resData);
};

export default sendResponse;
