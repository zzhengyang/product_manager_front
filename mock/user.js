const tokens = {
  admin: {
    token: "admin-token",
  },
};

const users = {
  "admin-token": {
    roles: ["admin"],
    introduction: "I am a super administrator",
    avatar:
      "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    name: "Super Admin",
  },
};

module.exports = [
  // user login
  {
    url: "/vue-element-admin/user/login",
    type: "post",
    response: (config) => {
      const { username, password } = config.body;

      // 验证用户名和密码
      if (username === "admin" && password === "U7WjsfuF7HGh0KxG") {
        return {
          code: 20000,
          data: tokens.admin,
        };
      }

      // 验证失败
      return {
        code: 60204,
        message: "账号或密码错误",
      };
    },
  },

  // get user info
  {
    url: "/vue-element-admin/user/info.*",
    type: "get",
    response: (config) => {
      const { token } = config.query;
      const info = users[token];

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: "Login failed, unable to get user details.",
        };
      }

      return {
        code: 20000,
        data: info,
      };
    },
  },

  // user logout
  {
    url: "/vue-element-admin/user/logout",
    type: "post",
    response: (_) => {
      return {
        code: 20000,
        data: "success",
      };
    },
  },
];
