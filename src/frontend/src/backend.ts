/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

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

export class Backend implements backendInterface {
  constructor(private actor: ActorSubclass<_SERVICE>) {}

  login(username: string, password: string): Promise<boolean> {
    return this.actor.login(username, password);
  }
  logout(): Promise<void> {
    return this.actor.logout();
  }
  isLoggedIn(): Promise<boolean> {
    return this.actor.isLoggedIn();
  }
  addFeeEntry(studentName: string, className: string, feeType: string, amount: bigint, paymentMode: string, date: string, currentHourIST: bigint): Promise<FeeEntry> {
    return this.actor.addFeeEntry(studentName, className, feeType, amount, paymentMode, date, currentHourIST);
  }
  getFeesByDate(date: string): Promise<FeeEntry[]> {
    return this.actor.getFeesByDate(date);
  }
  getFeesByDateRange(fromDate: string, toDate: string): Promise<FeeEntry[]> {
    return this.actor.getFeesByDateRange(fromDate, toDate);
  }
  addExpenseEntry(title: string, description: string, amount: bigint, date: string, currentHourIST: bigint): Promise<ExpenseEntry> {
    return this.actor.addExpenseEntry(title, description, amount, date, currentHourIST);
  }
  getExpensesByDate(date: string): Promise<ExpenseEntry[]> {
    return this.actor.getExpensesByDate(date);
  }
  getExpensesByDateRange(fromDate: string, toDate: string): Promise<ExpenseEntry[]> {
    return this.actor.getExpensesByDateRange(fromDate, toDate);
  }
  getDailySummary(date: string): Promise<DailySummary> {
    return this.actor.getDailySummary(date);
  }
  getRangeSummary(fromDate: string, toDate: string): Promise<RangeSummary> {
    return this.actor.getRangeSummary(fromDate, toDate);
  }
  checkDayStatus(currentHourIST: bigint): Promise<boolean> {
    return this.actor.checkDayStatus(currentHourIST);
  }
  getSchoolLogoUrl(): Promise<string> {
    return this.actor.getSchoolLogoUrl();
  }
  setSchoolLogoUrl(url: string): Promise<void> {
    return this.actor.setSchoolLogoUrl(url);
  }
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
}

export function createActor(canisterId: string, options: CreateActorOptions = {}): Backend {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions,
  });
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
  return new Backend(actor);
}
