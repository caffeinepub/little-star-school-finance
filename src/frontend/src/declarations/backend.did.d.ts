/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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

export interface _SERVICE {
  login: ActorMethod<[string, string], boolean>;
  logout: ActorMethod<[], void>;
  isLoggedIn: ActorMethod<[], boolean>;
  addFeeEntry: ActorMethod<[string, string, string, bigint, string, string, bigint], FeeEntry>;
  getFeesByDate: ActorMethod<[string], FeeEntry[]>;
  getFeesByDateRange: ActorMethod<[string, string], FeeEntry[]>;
  addExpenseEntry: ActorMethod<[string, string, bigint, string, bigint], ExpenseEntry>;
  getExpensesByDate: ActorMethod<[string], ExpenseEntry[]>;
  getExpensesByDateRange: ActorMethod<[string, string], ExpenseEntry[]>;
  getDailySummary: ActorMethod<[string], DailySummary>;
  getRangeSummary: ActorMethod<[string, string], RangeSummary>;
  checkDayStatus: ActorMethod<[bigint], boolean>;
  getSchoolLogoUrl: ActorMethod<[], string>;
  setSchoolLogoUrl: ActorMethod<[string], void>;
}

export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
