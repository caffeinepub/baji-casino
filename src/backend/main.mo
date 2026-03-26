import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type GameResult = {
    game : Text;
    bet : Nat;
    amount : Int;
  };

  module GameResult {
    public func compare(a : GameResult, b : GameResult) : Order.Order {
      switch (Text.compare(a.game, b.game)) {
        case (#equal) { Nat.compare(a.bet, b.bet) };
        case (o) { o };
      };
    };
  };

  type DailyBonus = { lastClaimed : Time.Time };

  type RechargeStatus = { #pending; #approved; #rejected };

  type RechargeRequest = {
    id : Nat;
    userId : Principal;
    txId : Text;
    amount : Nat;
    method : Text;
    status : RechargeStatus;
    createdAt : Time.Time;
  };

  let INITIAL_BALANCE = 0;
  let DAILY_BONUS_AMOUNT = 100;
  let DAY_NANOS : Int = 86_400_000_000_000;
  let RECHARGE_BONUS_MULTIPLIER = 2; // 100% bonus: user gets 2x chips on recharge

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let balances = Map.empty<Principal, Nat>();
  let dailyBonuses = Map.empty<Principal, DailyBonus>();
  let gameHistory = Map.empty<Principal, List.List<GameResult>>();
  let favoriteGames = Map.empty<Principal, Set.Set<Text>>();
  let rechargeRequests = Map.empty<Nat, RechargeRequest>();
  var rechargeCounter : Nat = 0;

  func getBalanceInternal(caller : Principal) : Nat {
    switch (balances.get(caller)) {
      case (null) {
        balances.add(caller, INITIAL_BALANCE);
        INITIAL_BALANCE;
      };
      case (?balance) { balance };
    };
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch balance");
    };
    getBalanceInternal(caller);
  };

  public shared ({ caller }) func addChips(amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add chips");
    };
    let currentBalance = getBalanceInternal(caller);
    let newBalance = currentBalance + amount;
    balances.add(caller, newBalance);
    newBalance;
  };

  public shared ({ caller }) func recordGameRound(game : Text, bet : Nat, amount : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record games");
    };

    let currentBalance : Nat = getBalanceInternal(caller);

    if (bet > currentBalance) {
      Runtime.trap("Insufficient balance for this bet");
    };

    let newBalance : Nat = (currentBalance + amount).toNat();
    balances.add(caller, newBalance);

    let result : GameResult = { game; bet; amount };

    switch (gameHistory.get(caller)) {
      case (null) {
        let results = List.empty<GameResult>();
        results.add(result);
        gameHistory.add(caller, results);
      };
      case (?results) {
        results.add(result);
      };
    };
  };

  public query ({ caller }) func getRecentHistory() : async [GameResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access history");
    };
    if (not balances.containsKey(caller)) { Runtime.trap("User does not exist") };
    switch (gameHistory.get(caller)) {
      case (?history) {
        let sortedArray = history.toArray().sort();
        let size = Nat.min(sortedArray.size(), 10);
        Array.tabulate<GameResult>(size, func(i) { sortedArray[i] });
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func claimDailyBonus() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim daily bonus");
    };
    let currentTime = Time.now();

    let alreadyClaimed = switch (dailyBonuses.get(caller)) {
      case (null) { false };
      case (?bonus) {
        let timeSinceLastClaim = currentTime - bonus.lastClaimed;
        timeSinceLastClaim < DAY_NANOS;
      };
    };

    if (alreadyClaimed) { return false };

    switch (balances.get(caller)) {
      case (null) { balances.add(caller, DAILY_BONUS_AMOUNT) };
      case (?balance) { balances.add(caller, balance + DAILY_BONUS_AMOUNT) };
    };

    dailyBonuses.add(caller, { lastClaimed = currentTime });
    true;
  };

  public shared ({ caller }) func toggleFavoriteGame(game : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle favorites");
    };
    let currentFavorites = switch (favoriteGames.get(caller)) {
      case (null) {
        let favorites = Set.empty<Text>();
        favorites.add(game);
        favoriteGames.add(caller, favorites);
        favorites;
      };
      case (?favorites) {
        if (favorites.contains(game)) {
          favorites.remove(game);
        } else {
          favorites.add(game);
        };
        favorites;
      };
    };
    favoriteGames.add(caller, currentFavorites);
  };

  public query ({ caller }) func getFavorites() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access favorites");
    };
    switch (favoriteGames.get(caller)) {
      case (null) { [] };
      case (?favorites) {
        favorites.toArray().sort();
      };
    };
  };

  public query ({ caller }) func isFavorite(game : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check favorites");
    };
    switch (favoriteGames.get(caller)) {
      case (null) { false };
      case (?favorites) { favorites.contains(game) };
    };
  };

  public shared ({ caller }) func submitRechargeRequest(txId : Text, amount : Nat, method : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit recharge requests");
    };
    let id = rechargeCounter;
    rechargeCounter += 1;
    let request : RechargeRequest = {
      id;
      userId = caller;
      txId;
      amount;
      method;
      status = #pending;
      createdAt = Time.now();
    };
    rechargeRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getPendingRechargeRequests() : async [RechargeRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view recharge requests");
    };
    let all = rechargeRequests.values().toArray();
    all.filter(func(r : RechargeRequest) : Bool { r.status == #pending });
  };

  public shared ({ caller }) func approveRechargeRequest(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can approve recharge requests");
    };
    switch (rechargeRequests.get(id)) {
      case (null) { false };
      case (?req) {
        if (req.status != #pending) { return false };
        let updated : RechargeRequest = {
          id = req.id;
          userId = req.userId;
          txId = req.txId;
          amount = req.amount;
          method = req.method;
          status = #approved;
          createdAt = req.createdAt;
        };
        rechargeRequests.add(id, updated);
        // 100% bonus: give 2x the requested amount
        let bonusAmount = req.amount * RECHARGE_BONUS_MULTIPLIER;
        let currentBalance = getBalanceInternal(req.userId);
        balances.add(req.userId, currentBalance + bonusAmount);
        true;
      };
    };
  };

  public shared ({ caller }) func rejectRechargeRequest(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can reject recharge requests");
    };
    switch (rechargeRequests.get(id)) {
      case (null) { false };
      case (?req) {
        if (req.status != #pending) { return false };
        let updated : RechargeRequest = {
          id = req.id;
          userId = req.userId;
          txId = req.txId;
          amount = req.amount;
          method = req.method;
          status = #rejected;
          createdAt = req.createdAt;
        };
        rechargeRequests.add(id, updated);
        true;
      };
    };
  };
};
