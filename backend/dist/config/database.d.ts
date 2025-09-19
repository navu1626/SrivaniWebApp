import sql from 'mssql';
export declare function connectDatabase(): Promise<sql.ConnectionPool>;
export declare function getDatabase(): sql.ConnectionPool;
export declare function closeDatabase(): Promise<void>;
export declare function executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<sql.IResult<T>>;
export declare function executeStoredProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<sql.IProcedureResult<T>>;
export declare function beginTransaction(): Promise<sql.Transaction>;
declare const _default: {
    connectDatabase: typeof connectDatabase;
    getDatabase: typeof getDatabase;
    closeDatabase: typeof closeDatabase;
    executeQuery: typeof executeQuery;
    executeStoredProcedure: typeof executeStoredProcedure;
    beginTransaction: typeof beginTransaction;
};
export default _default;
//# sourceMappingURL=database.d.ts.map