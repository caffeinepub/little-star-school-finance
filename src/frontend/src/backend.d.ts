import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface FeeEntry {
    id: bigint;
    studentName: string;
    className: string;
    feeType: string;
    amount: bigint;
    paymentMode: string;
    date: string;
    receiptNumber: string;
    createdAt: bigint;
}

export interface ExpenseEntry {
    id: bigint;
    title: string;
    description: string;
    amount: bigint;
    date: string;
    createdAt: bigint;
}

export interface DailySummary {
    date: string;
    totalFees: bigint;
    totalExpenses: bigint;
    netBalance: bigint;
    feeCount: bigint;
    expenseCount: bigint;
}

export interface RangeSummary {
    fromDate: string;
    toDate: string;
    totalFees: bigint;
    totalExpenses: bigint;
    netBalance: bigint;
    feeCount: bigint;
    expenseCount: bigint;
}

export interface backendInterface {
    login(username: string, password: string): Promise<boolean>;
    logout(): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    addFeeEntry(
        studentName: string,
        className: string,
        feeType: string,
        amount: bigint,
        paymentMode: string,
        date: string,
        currentHourIST: bigint
    ): Promise<FeeEntry>;
    getFeesByDate(date: string): Promise<FeeEntry[]>;
    getFeesByDateRange(fromDate: string, toDate: string): Promise<FeeEntry[]>;
    addExpenseEntry(
        title: string,
        description: string,
        amount: bigint,
        date: string,
        currentHourIST: bigint
    ): Promise<ExpenseEntry>;
    getExpensesByDate(date: string): Promise<ExpenseEntry[]>;
    getExpensesByDateRange(fromDate: string, toDate: string): Promise<ExpenseEntry[]>;
    getDailySummary(date: string): Promise<DailySummary>;
    getRangeSummary(fromDate: string, toDate: string): Promise<RangeSummary>;
    checkDayStatus(currentHourIST: bigint): Promise<boolean>;
    getSchoolLogoUrl(): Promise<string>;
    setSchoolLogoUrl(url: string): Promise<void>;
}
