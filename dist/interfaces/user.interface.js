"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.AuthProvider = void 0;
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["LOCAL"] = "local";
    AuthProvider["GOOGLE"] = "google";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ONLINE"] = "online";
    UserStatus["OFFLINE"] = "offline";
    UserStatus["AWAY"] = "away";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=user.interface.js.map