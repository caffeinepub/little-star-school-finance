/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const FeeEntry = IDL.Record({
  id: IDL.Nat,
  studentName: IDL.Text,
  className: IDL.Text,
  feeType: IDL.Text,
  amount: IDL.Nat,
  paymentMode: IDL.Text,
  date: IDL.Text,
  receiptNumber: IDL.Text,
  createdAt: IDL.Int,
});

const ExpenseEntry = IDL.Record({
  id: IDL.Nat,
  title: IDL.Text,
  description: IDL.Text,
  amount: IDL.Nat,
  date: IDL.Text,
  createdAt: IDL.Int,
});

const DailySummary = IDL.Record({
  date: IDL.Text,
  totalFees: IDL.Nat,
  totalExpenses: IDL.Nat,
  netBalance: IDL.Int,
  feeCount: IDL.Nat,
  expenseCount: IDL.Nat,
});

const RangeSummary = IDL.Record({
  fromDate: IDL.Text,
  toDate: IDL.Text,
  totalFees: IDL.Nat,
  totalExpenses: IDL.Nat,
  netBalance: IDL.Int,
  feeCount: IDL.Nat,
  expenseCount: IDL.Nat,
});

export const idlService = IDL.Service({
  login: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  logout: IDL.Func([], [], []),
  isLoggedIn: IDL.Func([], [IDL.Bool], ['query']),
  addFeeEntry: IDL.Func(
    [IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat],
    [FeeEntry],
    []
  ),
  getFeesByDate: IDL.Func([IDL.Text], [IDL.Vec(FeeEntry)], ['query']),
  getFeesByDateRange: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(FeeEntry)], ['query']),
  addExpenseEntry: IDL.Func(
    [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Nat],
    [ExpenseEntry],
    []
  ),
  getExpensesByDate: IDL.Func([IDL.Text], [IDL.Vec(ExpenseEntry)], ['query']),
  getExpensesByDateRange: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(ExpenseEntry)], ['query']),
  getDailySummary: IDL.Func([IDL.Text], [DailySummary], ['query']),
  getRangeSummary: IDL.Func([IDL.Text, IDL.Text], [RangeSummary], ['query']),
  checkDayStatus: IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
  getSchoolLogoUrl: IDL.Func([], [IDL.Text], ['query']),
  setSchoolLogoUrl: IDL.Func([IDL.Text], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const FeeEntry = IDL.Record({
    id: IDL.Nat,
    studentName: IDL.Text,
    className: IDL.Text,
    feeType: IDL.Text,
    amount: IDL.Nat,
    paymentMode: IDL.Text,
    date: IDL.Text,
    receiptNumber: IDL.Text,
    createdAt: IDL.Int,
  });
  const ExpenseEntry = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    description: IDL.Text,
    amount: IDL.Nat,
    date: IDL.Text,
    createdAt: IDL.Int,
  });
  const DailySummary = IDL.Record({
    date: IDL.Text,
    totalFees: IDL.Nat,
    totalExpenses: IDL.Nat,
    netBalance: IDL.Int,
    feeCount: IDL.Nat,
    expenseCount: IDL.Nat,
  });
  const RangeSummary = IDL.Record({
    fromDate: IDL.Text,
    toDate: IDL.Text,
    totalFees: IDL.Nat,
    totalExpenses: IDL.Nat,
    netBalance: IDL.Int,
    feeCount: IDL.Nat,
    expenseCount: IDL.Nat,
  });
  return IDL.Service({
    login: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    logout: IDL.Func([], [], []),
    isLoggedIn: IDL.Func([], [IDL.Bool], ['query']),
    addFeeEntry: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat],
      [FeeEntry],
      []
    ),
    getFeesByDate: IDL.Func([IDL.Text], [IDL.Vec(FeeEntry)], ['query']),
    getFeesByDateRange: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(FeeEntry)], ['query']),
    addExpenseEntry: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Nat],
      [ExpenseEntry],
      []
    ),
    getExpensesByDate: IDL.Func([IDL.Text], [IDL.Vec(ExpenseEntry)], ['query']),
    getExpensesByDateRange: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(ExpenseEntry)], ['query']),
    getDailySummary: IDL.Func([IDL.Text], [DailySummary], ['query']),
    getRangeSummary: IDL.Func([IDL.Text, IDL.Text], [RangeSummary], ['query']),
    checkDayStatus: IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    getSchoolLogoUrl: IDL.Func([], [IDL.Text], ['query']),
    setSchoolLogoUrl: IDL.Func([IDL.Text], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
