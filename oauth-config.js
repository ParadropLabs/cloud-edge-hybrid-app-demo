'use strict';

module.exports = {
  provider: {
    protocol: "http",
    host: "localhost:3000",
    profileUrl: "/api/userinfo"
  },
  consumer: {
    protocol: "http",
    host: "localhost:5000"
  }
};
