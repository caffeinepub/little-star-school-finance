import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  // ─── State ────────────────────────────────────────────────────────────────

  let ADMIN_USERNAME : Text = "admin";
  let ADMIN_PASSWORD : Text = "admin123";
  var adminLoggedIn : Bool = false;

  // Kept for stable variable compatibility with previous version (migration)
  var activeSessions : Map.Map<Principal, Bool> = Map.empty<Principal, Bool>();

  type FeeEntry = {
    id : Nat;
    studentName : Text;
    className : Text;
    feeType : Text;
    amount : Nat;
    paymentMode : Text;
    date : Text;
    receiptNumber : Text;
    createdAt : Int;
  };

  var feeEntries : [FeeEntry] = [];
  var feeIdCounter : Nat = 0;
  var receiptCounters : Map.Map<Text, Nat> = Map.empty<Text, Nat>();

  type ExpenseEntry = {
    id : Nat;
    title : Text;
    description : Text;
    amount : Nat;
    date : Text;
    createdAt : Int;
  };

  var expenseEntries : [ExpenseEntry] = [];
  var expenseIdCounter : Nat = 0;

  var schoolLogoUrl : Text = "";

  let DAY_CLOSE_HOUR_IST : Nat = 15;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  func isDayClosed(currentHourIST : Nat) : Bool {
    currentHourIST >= DAY_CLOSE_HOUR_IST;
  };

  func padCount(count : Nat) : Text {
    if (count < 10) { "00" # count.toText() }
    else if (count < 100) { "0" # count.toText() }
    else { count.toText() }
  };

  func generateReceiptNumber(date : Text) : Text {
    let datePart = date.replace(#char '-', "");
    let count = switch (receiptCounters.get(date)) {
      case (?c) { c + 1 };
      case (null) { 1 };
    };
    receiptCounters.add(date, count);
    "RCPT-" # datePart # "-" # padCount(count);
  };

  // ─── Auth ────────────────────────────────────────────────────────────────

  public func login(username : Text, password : Text) : async Bool {
    if (username == ADMIN_USERNAME and password == ADMIN_PASSWORD) {
      adminLoggedIn := true;
      true;
    } else {
      false;
    };
  };

  public func logout() : async () {
    adminLoggedIn := false;
  };

  public query func isLoggedIn() : async Bool {
    adminLoggedIn;
  };

  // ─── Fees ────────────────────────────────────────────────────────────────

  public func addFeeEntry(
    studentName : Text,
    className : Text,
    feeType : Text,
    amount : Nat,
    paymentMode : Text,
    date : Text,
    currentHourIST : Nat
  ) : async FeeEntry {
    if (isDayClosed(currentHourIST)) {
      Runtime.trap("Day is closed: No new entries allowed after 3:00 PM");
    };
    let receiptNum = generateReceiptNumber(date);
    let entry : FeeEntry = {
      id = feeIdCounter;
      studentName;
      className;
      feeType;
      amount;
      paymentMode;
      date;
      receiptNumber = receiptNum;
      createdAt = Time.now();
    };
    feeIdCounter += 1;
    feeEntries := feeEntries.concat([entry]);
    entry;
  };

  public query func getFeesByDate(date : Text) : async [FeeEntry] {
    feeEntries.filter(func(e : FeeEntry) : Bool { e.date == date });
  };

  public query func getFeesByDateRange(fromDate : Text, toDate : Text) : async [FeeEntry] {
    feeEntries.filter(func(e : FeeEntry) : Bool { e.date >= fromDate and e.date <= toDate });
  };

  // ─── Expenses ───────────────────────────────────────────────────────────

  public func addExpenseEntry(
    title : Text,
    description : Text,
    amount : Nat,
    date : Text,
    currentHourIST : Nat
  ) : async ExpenseEntry {
    if (isDayClosed(currentHourIST)) {
      Runtime.trap("Day is closed: No new entries allowed after 3:00 PM");
    };
    let entry : ExpenseEntry = {
      id = expenseIdCounter;
      title;
      description;
      amount;
      date;
      createdAt = Time.now();
    };
    expenseIdCounter += 1;
    expenseEntries := expenseEntries.concat([entry]);
    entry;
  };

  public query func getExpensesByDate(date : Text) : async [ExpenseEntry] {
    expenseEntries.filter(func(e : ExpenseEntry) : Bool { e.date == date });
  };

  public query func getExpensesByDateRange(fromDate : Text, toDate : Text) : async [ExpenseEntry] {
    expenseEntries.filter(func(e : ExpenseEntry) : Bool { e.date >= fromDate and e.date <= toDate });
  };

  // ─── Summary ───────────────────────────────────────────────────────────

  type DailySummary = {
    date : Text;
    totalFees : Nat;
    totalExpenses : Nat;
    netBalance : Int;
    feeCount : Nat;
    expenseCount : Nat;
  };

  public query func getDailySummary(date : Text) : async DailySummary {
    let fees = feeEntries.filter(func(e : FeeEntry) : Bool { e.date == date });
    let expenses = expenseEntries.filter(func(e : ExpenseEntry) : Bool { e.date == date });
    var totalFees : Nat = 0;
    for (f in fees.vals()) { totalFees += f.amount };
    var totalExpenses : Nat = 0;
    for (e in expenses.vals()) { totalExpenses += e.amount };
    let netBalance : Int = Int.fromNat(totalFees) - Int.fromNat(totalExpenses);
    { date; totalFees; totalExpenses; netBalance; feeCount = fees.size(); expenseCount = expenses.size() };
  };

  type RangeSummary = {
    fromDate : Text;
    toDate : Text;
    totalFees : Nat;
    totalExpenses : Nat;
    netBalance : Int;
    feeCount : Nat;
    expenseCount : Nat;
  };

  public query func getRangeSummary(fromDate : Text, toDate : Text) : async RangeSummary {
    let fees = feeEntries.filter(func(e : FeeEntry) : Bool { e.date >= fromDate and e.date <= toDate });
    let expenses = expenseEntries.filter(func(e : ExpenseEntry) : Bool { e.date >= fromDate and e.date <= toDate });
    var totalFees : Nat = 0;
    for (f in fees.vals()) { totalFees += f.amount };
    var totalExpenses : Nat = 0;
    for (e in expenses.vals()) { totalExpenses += e.amount };
    let netBalance : Int = Int.fromNat(totalFees) - Int.fromNat(totalExpenses);
    { fromDate; toDate; totalFees; totalExpenses; netBalance; feeCount = fees.size(); expenseCount = expenses.size() };
  };

  // ─── Day Status ───────────────────────────────────────────────────────

  public query func checkDayStatus(currentHourIST : Nat) : async Bool {
    not isDayClosed(currentHourIST);
  };

  // ─── Settings ──────────────────────────────────────────────────────────

  public func setSchoolLogoUrl(url : Text) : async () {
    schoolLogoUrl := url;
  };

  public query func getSchoolLogoUrl() : async Text {
    schoolLogoUrl;
  };
};
