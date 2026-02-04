if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$1 = {
    data() {
      return {
        currentPage: "login",
        phoneNumber: "",
        password: "",
        phoneError: "",
        passwordError: "",
        isFormValid: false,
        // 用户数据
        userBalance: 0,
        userGold: 0,
        // 答题相关数据
        grades: ["小学", "初中", "高中"],
        selectedGrade: "小学",
        currentQuestion: 0,
        selectedOptions: [],
        questions: {
          小学: [],
          初中: [],
          高中: []
        },
        // 广告相关核心数据（60秒冷却固定配置）
        todayCount: 0,
        lastWatchTime: 0,
        nextWatchTime: 60,
        // 固定60秒冷却
        canWatch: false,
        countdownInterval: null,
        // 提现相关数据
        withdrawCount: 0,
        selectedAmount: 20,
        withdrawAmounts: [20, 50, 100, 200],
        // 支付宝账户数据
        alipayName: "",
        alipayPhone: "",
        // 用户存储的数据结构
        userData: {
          registeredUsers: {},
          // 存储注册用户 {手机号: {密码, 余额, 金币, 支付宝账户}}
          currentUser: null
        },
        // 模拟题目数据
        mockQuestions: {
          小学: [
            {
              question: "下面哪个词语是描写春天的？",
              options: {
                A: "秋风萧瑟",
                B: "夏日炎炎",
                C: "春暖花开",
                D: "寒冬腊月"
              },
              correctAnswer: ["C"]
            },
            {
              question: "下列诗句中，哪些出自李白的诗？",
              options: {
                A: "床前明月光",
                B: "春眠不觉晓",
                C: "举头望明月",
                D: "白日依山尽"
              },
              correctAnswer: ["A", "C"]
            }
          ],
          初中: [
            {
              question: "下列哪些作品是鲁迅的？",
              options: {
                A: "《呐喊》",
                B: "《彷徨》",
                C: "《子夜》",
                D: "《家》"
              },
              correctAnswer: ["A", "B"]
            }
          ],
          高中: [
            {
              question: "下列哪些是唐宋八大家？",
              options: {
                A: "韩愈",
                B: "柳宗元",
                C: "苏轼",
                D: "王安石"
              },
              correctAnswer: ["A", "B", "C", "D"]
            }
          ]
        }
      };
    },
    computed: {
      currentQuestionData() {
        return this.questions[this.selectedGrade][this.currentQuestion] || {};
      },
      totalQuestions() {
        return this.questions[this.selectedGrade].length || 0;
      },
      shortPhoneNumber() {
        if (this.phoneNumber.length === 11) {
          return this.phoneNumber.substring(0, 3) + "****" + this.phoneNumber.substring(7);
        }
        return this.phoneNumber;
      }
    },
    onLoad() {
      this.initQuestions();
      this.loadUserData();
      document.addEventListener("plusready", () => {
        formatAppLog("log", "at pages/index/index.vue:466", "原生环境已初始化，开始绑定回调");
        this.bindCallbacks();
        this.setupMockForH5();
      });
      this.checkLoginStatus();
    },
    onHide() {
      this.clearCountdown();
    },
    onUnload() {
      this.clearCountdown();
    },
    methods: {
      // 统一清理倒计时定时器
      clearCountdown() {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      },
      // 加载用户数据
      loadUserData() {
        try {
          const data = uni.getStorageSync("userData");
          if (data) {
            this.userData = data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:501", "加载用户数据失败:", e);
        }
      },
      // 保存用户数据
      saveUserData() {
        try {
          uni.setStorageSync("userData", this.userData);
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:510", "保存用户数据失败:", e);
        }
      },
      // 初始化题目
      initQuestions() {
        this.grades.forEach((grade) => {
          if (this.mockQuestions[grade]) {
            this.questions[grade] = [...this.mockQuestions[grade]];
            for (let i = this.questions[grade].length; i < 20; i++) {
              this.questions[grade].push({
                question: `${grade}语文题目 ${i + 1}？`,
                options: {
                  A: "选项A内容",
                  B: "选项B内容",
                  C: "选项C内容",
                  D: "选项D内容"
                },
                correctAnswer: ["A", "B"]
              });
            }
          }
        });
      },
      // 检查登录状态
      checkLoginStatus() {
        const currentUser = this.userData.currentUser;
        if (currentUser && this.userData.registeredUsers[currentUser]) {
          this.phoneNumber = currentUser;
          const userInfo = this.userData.registeredUsers[currentUser];
          this.userBalance = userInfo.balance || 0;
          this.userGold = userInfo.gold || 0;
          this.currentPage = "home";
          this.loadWatchRecords();
        }
      },
      // 验证手机号
      validatePhone() {
        if (this.phoneNumber.length !== 11) {
          this.phoneError = "手机号必须是11位";
        } else if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
          this.phoneError = "手机号格式不正确";
        } else {
          this.phoneError = "";
        }
        this.checkFormValid();
      },
      // 验证密码
      validatePassword() {
        if (this.password.length !== 6) {
          this.passwordError = "密码必须是6位";
        } else if (!/^\d{6}$/.test(this.password)) {
          this.passwordError = "密码必须是6位数字";
        } else {
          this.passwordError = "";
        }
        this.checkFormValid();
      },
      // 检查表单是否有效
      checkFormValid() {
        this.isFormValid = !this.phoneError && !this.passwordError && this.phoneNumber.length === 11 && this.password.length === 6;
      },
      // 处理登录
      handleLogin() {
        if (!this.isFormValid)
          return;
        const userInfo = this.userData.registeredUsers[this.phoneNumber];
        if (!userInfo) {
          uni.showModal({
            title: "提示",
            content: "该手机号未注册，是否立即注册？",
            success: (res) => {
              if (res.confirm) {
                this.registerUser();
              }
            }
          });
          return;
        }
        if (userInfo.password !== this.password) {
          uni.showToast({ title: "密码错误", icon: "error" });
          return;
        }
        this.userData.currentUser = this.phoneNumber;
        this.userBalance = userInfo.balance || 0;
        this.userGold = userInfo.gold || 0;
        this.saveUserData();
        this.currentPage = "home";
        this.loadWatchRecords();
        uni.showToast({ title: "登录成功", icon: "success" });
      },
      // 注册用户
      registerUser() {
        this.userData.registeredUsers[this.phoneNumber] = {
          password: this.password,
          balance: 0,
          gold: 0,
          alipayAccount: {}
        };
        this.userData.currentUser = this.phoneNumber;
        this.userBalance = 0;
        this.userGold = 0;
        this.saveUserData();
        this.currentPage = "home";
        this.loadWatchRecords();
        uni.showToast({ title: "注册成功", icon: "success" });
      },
      // H5环境模拟原生SDK（测试用）
      setupMockForH5() {
      },
      // 绑定广告SDK回调（核心：callBack4为激励视频成功回调）
      bindCallbacks() {
        if (typeof window === "undefined") {
          setTimeout(() => this.bindCallbacks(), 500);
          return;
        }
        const self = this;
        window.callBack2 = (params) => {
          try {
            params.code == 1 ? formatAppLog("log", "at pages/index/index.vue:667", "插屏广告展现") : formatAppLog("error", "at pages/index/index.vue:667", "插屏广告加载失败:", params.msg);
          } catch (e) {
            formatAppLog("error", "at pages/index/index.vue:669", "callBack2 回调异常:", e);
          }
        };
        window.callBack4 = (params) => {
          try {
            formatAppLog("log", "at pages/index/index.vue:676", "激励视频SDK回调参数:", params);
            if (params.code == 2) {
              formatAppLog("log", "at pages/index/index.vue:679", "✅ 激励视频观看成功，开始发放奖励+启动冷却");
              let goldEarned = 500;
              if (params.adData && params.adData.ecpm) {
                const shareRatio = 0.4;
                const profit = params.adData.ecpm / 1e3 * shareRatio;
                goldEarned = Math.floor(profit * 1e4);
                formatAppLog("log", "at pages/index/index.vue:686", `💴 实际收益计算: eCPM=${params.adData.ecpm}, 分成40%，金币=${goldEarned}`);
              }
              self.updateUserGold(goldEarned);
              uni.showToast({
                title: `观看成功！获得${goldEarned.toLocaleString()}金币`,
                icon: "success",
                duration: 2e3
              });
              self.recordWatchSuccess();
              setTimeout(() => self.loadInteraction(), 1e3);
            } else if (params.code == 0) {
              formatAppLog("error", "at pages/index/index.vue:703", "❌ 激励视频加载失败:", params.msg);
              uni.showToast({ title: "广告加载失败，请重试", icon: "none" });
            } else if (params.code == 1)
              formatAppLog("log", "at pages/index/index.vue:707", "激励视频开始展现");
            else if (params.code == 3)
              formatAppLog("log", "at pages/index/index.vue:708", "激励视频被用户关闭");
          } catch (e) {
            formatAppLog("error", "at pages/index/index.vue:710", "callBack4 回调异常:", e);
            uni.showToast({ title: "广告回调异常", icon: "none" });
          }
        };
      },
      // 更新用户金币+余额（同步存储）
      updateUserGold(gold) {
        const currentUser = this.userData.currentUser;
        if (!currentUser || !this.userData.registeredUsers[currentUser])
          return;
        const userInfo = this.userData.registeredUsers[currentUser];
        userInfo.gold = (userInfo.gold || 0) + gold;
        userInfo.balance = userInfo.gold / 1e4;
        this.userGold = userInfo.gold;
        this.userBalance = userInfo.balance;
        this.saveUserData();
      },
      // 切换页面
      switchPage(page) {
        this.currentPage = page;
      },
      // 切换到提现/支付宝/设置页面
      switchToWithdraw() {
        this.loadWithdrawRecords();
        this.currentPage = "withdraw";
      },
      switchToAlipayAccount() {
        this.loadAlipayAccount();
        this.currentPage = "alipayAccount";
      },
      switchToSettings() {
        this.currentPage = "settings";
      },
      // 加载广告观看记录（每日重置45次）
      loadWatchRecords() {
        try {
          const today = this.getTodayDate();
          const records = uni.getStorageSync("adWatchRecords") || {};
          if (records.date !== today) {
            this.todayCount = 0;
            this.lastWatchTime = 0;
            this.saveWatchRecords(today, 0, 0);
            this.canWatch = true;
          } else {
            this.todayCount = records.count || 0;
            this.lastWatchTime = records.lastWatchTime || 0;
            this.checkWatchCooldown();
          }
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:754", "加载观看记录失败:", e);
        }
      },
      // 加载提现记录（每日重置3次）
      loadWithdrawRecords() {
        try {
          const today = this.getTodayDate();
          const records = uni.getStorageSync("withdrawRecords") || {};
          this.withdrawCount = records.date === today ? records.count || 0 : 0;
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:765", "加载提现记录失败:", e);
        }
      },
      // 加载支付宝账户
      loadAlipayAccount() {
        var _a, _b;
        try {
          const userInfo = this.userData.registeredUsers[this.userData.currentUser];
          if (userInfo) {
            this.alipayName = ((_a = userInfo.alipayAccount) == null ? void 0 : _a.name) || "";
            this.alipayPhone = ((_b = userInfo.alipayAccount) == null ? void 0 : _b.phone) || "";
          }
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:778", "加载支付宝账户失败:", e);
        }
      },
      // 保存广告观看记录（本地存储，每日有效）
      saveWatchRecords(date, count, lastWatchTime) {
        try {
          uni.setStorageSync("adWatchRecords", { date, count, lastWatchTime });
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:787", "保存观看记录失败:", e);
        }
      },
      // 保存提现记录
      saveWithdrawRecords(date, count) {
        try {
          uni.setStorageSync("withdrawRecords", { date, count });
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:796", "保存提现记录失败:", e);
        }
      },
      // 保存支付宝账户
      saveAlipayAccount() {
        if (!this.alipayName.trim() || !this.alipayPhone.trim()) {
          return uni.showToast({ title: "请填写完整信息", icon: "none" });
        }
        const userInfo = this.userData.registeredUsers[this.userData.currentUser];
        if (!userInfo)
          return uni.showToast({ title: "用户信息错误", icon: "none" });
        userInfo.alipayAccount = { name: this.alipayName, phone: this.alipayPhone };
        this.saveUserData();
        uni.showToast({ title: "保存成功", icon: "success" });
        this.switchPage("me");
      },
      // 获取今日日期（用于每日重置记录）
      getTodayDate() {
        const now = /* @__PURE__ */ new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      },
      // 检查冷却时间：计算是否可观看，不可观看则启动倒计时
      checkWatchCooldown() {
        if (!this.lastWatchTime) {
          this.canWatch = true;
          this.nextWatchTime = 60;
          return true;
        }
        const now = Date.now();
        const cooldownTotal = 60 * 1e3;
        const timePassed = now - this.lastWatchTime;
        if (timePassed >= cooldownTotal) {
          this.canWatch = true;
          this.nextWatchTime = 60;
          this.clearCountdown();
          return true;
        } else {
          this.canWatch = false;
          this.nextWatchTime = Math.ceil((cooldownTotal - timePassed) / 1e3);
          this.startCountdown();
          return false;
        }
      },
      // 启动60秒倒计时（精准每秒更新）
      startCountdown() {
        this.clearCountdown();
        this.countdownInterval = setInterval(() => {
          if (this.nextWatchTime <= 0) {
            this.canWatch = true;
            this.nextWatchTime = 60;
            this.clearCountdown();
            return;
          }
          this.nextWatchTime--;
        }, 1e3);
      },
      // 记录广告观看成功（核心：触发倒计时的入口）
      recordWatchSuccess() {
        const today = this.getTodayDate();
        this.todayCount++;
        this.lastWatchTime = Date.now();
        this.saveWatchRecords(today, this.todayCount, this.lastWatchTime);
        this.checkWatchCooldown();
      },
      // 点击「观看激励视频」按钮的逻辑
      handleRewardVideoClick() {
        if (this.todayCount >= 45) {
          return uni.showToast({ title: "今日观看次数已达上限（45次）", icon: "none" });
        }
        if (!this.checkWatchCooldown()) {
          return uni.showToast({ title: `请等待 ${this.nextWatchTime} 秒`, icon: "none" });
        }
        this.loadPlayRewardVideo();
      },
      // 选择年级
      selectGrade(grade) {
        this.selectedGrade = grade;
        this.currentQuestion = 0;
        this.selectedOptions = [];
      },
      // 选择答题选项
      toggleOption(option) {
        const index = this.selectedOptions.indexOf(option);
        if (index > -1) {
          this.selectedOptions.splice(index, 1);
        } else {
          if (this.selectedOptions.length < 2) {
            this.selectedOptions.push(option);
          } else {
            uni.showToast({ title: "最多只能选择两个选项", icon: "none" });
          }
        }
      },
      // 答题上一题/下一题/提交
      prevQuestion() {
        if (this.currentQuestion > 0) {
          this.currentQuestion--;
          this.selectedOptions = [];
        }
      },
      nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
          this.currentQuestion++;
          this.selectedOptions = [];
        }
      },
      submitAnswer() {
        if (this.selectedOptions.length !== 2)
          return uni.showToast({ title: "请选择两个选项", icon: "none" });
        const isCorrect = this.selectedOptions.length === 2 && this.selectedOptions.includes("A") && this.selectedOptions.includes("B");
        uni.showToast({ title: isCorrect ? "回答正确！" : "回答错误", icon: isCorrect ? "success" : "error" });
        setTimeout(() => {
          this.currentQuestion = this.currentQuestion < this.totalQuestions - 1 ? this.currentQuestion + 1 : 0;
          this.selectedOptions = [];
        }, 1e3);
      },
      // 选择提现金额
      selectAmount(amount) {
        if (this.userBalance < amount)
          return uni.showToast({ title: "余额不足", icon: "none" });
        this.selectedAmount = amount;
      },
      // 处理提现
      handleWithdraw() {
        var _a, _b;
        if (this.withdrawCount >= 3)
          return uni.showToast({ title: "今日提现次数已达上限", icon: "none" });
        if (this.userBalance < this.selectedAmount)
          return uni.showToast({ title: "可提现金额不足", icon: "none" });
        if (this.userBalance < 20)
          return uni.showToast({ title: "提现金额需≥20元", icon: "none" });
        const userInfo = this.userData.registeredUsers[this.userData.currentUser];
        if (!userInfo || !((_a = userInfo.alipayAccount) == null ? void 0 : _a.name) || !((_b = userInfo.alipayAccount) == null ? void 0 : _b.phone)) {
          uni.showToast({ title: "请先设置支付宝账户", icon: "none" });
          return this.switchToAlipayAccount();
        }
        const goldToDeduct = this.selectedAmount * 1e4;
        if (userInfo.gold < goldToDeduct)
          return uni.showToast({ title: "金币不足", icon: "none" });
        userInfo.gold -= goldToDeduct;
        userInfo.balance = userInfo.gold / 1e4;
        this.userGold = userInfo.gold;
        this.userBalance = userInfo.balance;
        const today = this.getTodayDate();
        this.withdrawCount++;
        this.saveWithdrawRecords(today, this.withdrawCount);
        this.saveUserData();
        uni.showToast({ title: `提现申请已提交：¥${this.selectedAmount}`, icon: "success" });
        setTimeout(() => this.switchPage("me"), 1500);
      },
      // 清除缓存/退出登录
      clearCache() {
        uni.showModal({
          title: "提示",
          content: "确定要清除缓存吗？",
          success: (res) => {
            if (res.confirm) {
              uni.clearStorageSync();
              uni.showToast({ title: "缓存已清除", icon: "success" });
            }
          }
        });
      },
      handleLogout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              this.userData.currentUser = null;
              this.saveUserData();
              this.currentPage = "login";
              this.phoneNumber = "";
              this.password = "";
              this.userBalance = 0;
              this.userGold = 0;
            }
          }
        });
      },
      // 调用原生SDK - 插屏广告
      loadInteraction() {
        if (window == null ? void 0 : window.android) {
          window.android.loadInteraction("callBack2");
        } else {
          uni.showToast({ title: "请在App环境运行", icon: "none" });
        }
      },
      // 调用原生SDK - 激励视频（核心：传真实用户ID）
      loadPlayRewardVideo() {
        if (window == null ? void 0 : window.android) {
          window.android.loadPlayRewardVideo(this.shortPhoneNumber, "", "callBack4");
        } else {
          uni.showToast({ title: "请在App环境运行", icon: "none" });
        }
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return $data.currentPage === "login" ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "login-container"
    }, [
      vue.createElementVNode("view", { class: "login-box" }, [
        vue.createElementVNode("text", { class: "login-title" }, "用户登录"),
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.createElementVNode("text", { class: "input-label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.phoneNumber = $event),
              type: "number",
              maxlength: "11",
              placeholder: "请输入注册手机号",
              class: "login-input",
              onInput: _cache[1] || (_cache[1] = (...args) => $options.validatePhone && $options.validatePhone(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.phoneNumber]
          ]),
          $data.phoneError ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($data.phoneError),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.createElementVNode("text", { class: "input-label" }, "密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.password = $event),
              type: "password",
              maxlength: "6",
              placeholder: "请输入注册密码",
              class: "login-input",
              onInput: _cache[3] || (_cache[3] = (...args) => $options.validatePassword && $options.validatePassword(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.password]
          ]),
          $data.passwordError ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-text"
            },
            vue.toDisplayString($data.passwordError),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("button", {
          onClick: _cache[4] || (_cache[4] = (...args) => $options.handleLogin && $options.handleLogin(...args)),
          class: "login-btn",
          disabled: !$data.isFormValid
        }, "登录", 8, ["disabled"]),
        vue.createElementVNode("text", { class: "login-tip" }, "请使用注册时的手机号和密码登录")
      ])
    ])) : (vue.openBlock(), vue.createElementBlock("view", {
      key: 1,
      class: "container"
    }, [
      $data.currentPage === "home" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "page-content"
      }, [
        vue.createElementVNode("view", { class: "status-bar" }, [
          vue.createElementVNode("view", { class: "status-item" }, [
            vue.createElementVNode("text", { class: "status-label" }, "ID:"),
            vue.createElementVNode(
              "text",
              { class: "status-value" },
              vue.toDisplayString($options.shortPhoneNumber),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "status-item" }, [
            vue.createElementVNode("text", { class: "status-label" }, "余额:"),
            vue.createElementVNode(
              "text",
              { class: "status-value" },
              "¥" + vue.toDisplayString($data.userBalance.toFixed(2)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "status-item" }, [
            vue.createElementVNode("text", { class: "status-label" }, "金币:"),
            vue.createElementVNode(
              "text",
              { class: "status-value" },
              vue.toDisplayString($data.userGold.toLocaleString()),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "question-section" }, [
          vue.createElementVNode("view", { class: "question-header" }, [
            vue.createElementVNode("text", { class: "section-title" }, "语文答题"),
            vue.createElementVNode("view", { class: "grade-selector" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.grades, (grade) => {
                  return vue.openBlock(), vue.createElementBlock("text", {
                    key: grade,
                    class: vue.normalizeClass(["grade-item", { active: $data.selectedGrade === grade }]),
                    onClick: ($event) => $options.selectGrade(grade)
                  }, vue.toDisplayString(grade), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "question-box" }, [
            vue.createElementVNode(
              "text",
              { class: "question-index" },
              "第" + vue.toDisplayString($data.currentQuestion + 1) + "题/" + vue.toDisplayString($options.totalQuestions) + "题",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "question-text" },
              vue.toDisplayString($options.currentQuestionData.question),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "option-row" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["option-btn", { selected: $data.selectedOptions.includes("A") }]),
                  onClick: _cache[5] || (_cache[5] = ($event) => $options.toggleOption("A"))
                },
                [
                  vue.createElementVNode("text", { class: "option-label" }, "A"),
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString($options.currentQuestionData.options.A),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["option-btn", { selected: $data.selectedOptions.includes("B") }]),
                  onClick: _cache[6] || (_cache[6] = ($event) => $options.toggleOption("B"))
                },
                [
                  vue.createElementVNode("text", { class: "option-label" }, "B"),
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString($options.currentQuestionData.options.B),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "option-row" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["option-btn", { selected: $data.selectedOptions.includes("C") }]),
                  onClick: _cache[7] || (_cache[7] = ($event) => $options.toggleOption("C"))
                },
                [
                  vue.createElementVNode("text", { class: "option-label" }, "C"),
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString($options.currentQuestionData.options.C),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["option-btn", { selected: $data.selectedOptions.includes("D") }]),
                  onClick: _cache[8] || (_cache[8] = ($event) => $options.toggleOption("D"))
                },
                [
                  vue.createElementVNode("text", { class: "option-label" }, "D"),
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString($options.currentQuestionData.options.D),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "question-tip" }, [
              vue.createElementVNode("text", null, "（双选题，请选择两个选项）")
            ])
          ]),
          vue.createElementVNode("view", { class: "question-nav" }, [
            vue.createElementVNode("button", {
              onClick: _cache[9] || (_cache[9] = (...args) => $options.prevQuestion && $options.prevQuestion(...args)),
              class: "nav-btn prev-btn",
              disabled: $data.currentQuestion === 0
            }, "上一题", 8, ["disabled"]),
            vue.createElementVNode("button", {
              onClick: _cache[10] || (_cache[10] = (...args) => $options.submitAnswer && $options.submitAnswer(...args)),
              class: "nav-btn submit-btn"
            }, "提交答案"),
            vue.createElementVNode("button", {
              onClick: _cache[11] || (_cache[11] = (...args) => $options.nextQuestion && $options.nextQuestion(...args)),
              class: "nav-btn next-btn",
              disabled: $data.currentQuestion === $options.totalQuestions - 1
            }, "下一题", 8, ["disabled"])
          ])
        ]),
        vue.createElementVNode("view", { class: "ad-section" }, [
          vue.createElementVNode("view", { class: "ad-header" }, [
            vue.createElementVNode("text", { class: "ad-title" }, "激励视频广告"),
            vue.createElementVNode("view", { class: "ad-status" }, [
              vue.createElementVNode(
                "text",
                { class: "ad-count" },
                "今日: " + vue.toDisplayString($data.todayCount) + "/45次",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["ad-cooling", { cooling: !$data.canWatch }])
                },
                vue.toDisplayString($data.canWatch ? "可观看" : `冷却中(${$data.nextWatchTime}s)`),
                3
                /* TEXT, CLASS */
              )
            ])
          ]),
          vue.createElementVNode("button", {
            onClick: _cache[12] || (_cache[12] = (...args) => $options.handleRewardVideoClick && $options.handleRewardVideoClick(...args)),
            class: "ad-btn reward-btn",
            disabled: !$data.canWatch || $data.todayCount >= 45
          }, [
            $data.canWatch && $data.todayCount < 45 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "观看激励视频")) : $data.todayCount >= 45 ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "今日已达上限")) : (vue.openBlock(), vue.createElementBlock(
              "text",
              { key: 2 },
              "冷却中(" + vue.toDisplayString($data.nextWatchTime) + "s)",
              1
              /* TEXT */
            ))
          ], 8, ["disabled"]),
          vue.createElementVNode("view", { class: "ad-tip" }, [
            vue.createElementVNode("text", null, "观看完整广告可获得收益，每次观看后需等待60秒")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $data.currentPage === "me" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "page-content me-page"
      }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("view", { class: "avatar" }),
          vue.createElementVNode("view", { class: "user-detail" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.phoneNumber),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-id" },
              "ID: " + vue.toDisplayString($options.shortPhoneNumber),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "balance-section" }, [
          vue.createElementVNode("view", { class: "balance-item" }, [
            vue.createElementVNode("text", { class: "balance-label" }, "账户余额"),
            vue.createElementVNode(
              "text",
              { class: "balance-amount" },
              "¥" + vue.toDisplayString($data.userBalance.toFixed(2)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "balance-item" }, [
            vue.createElementVNode("text", { class: "balance-label" }, "金币数量"),
            vue.createElementVNode(
              "text",
              { class: "balance-amount" },
              vue.toDisplayString($data.userGold.toLocaleString()),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "exchange-rate" }, [
            vue.createElementVNode("text", null, "兑换比例: 10000金币 = 1元")
          ])
        ]),
        vue.createElementVNode("view", { class: "menu-section" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[13] || (_cache[13] = (...args) => $options.switchToWithdraw && $options.switchToWithdraw(...args))
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "提现"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[14] || (_cache[14] = (...args) => $options.switchToAlipayAccount && $options.switchToAlipayAccount(...args))
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "支付宝提现账户"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[15] || (_cache[15] = (...args) => $options.switchToSettings && $options.switchToSettings(...args))
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "设置"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $data.currentPage === "withdraw" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "page-content withdraw-page"
      }, [
        vue.createElementVNode("view", { class: "withdraw-header" }, [
          vue.createElementVNode("text", {
            class: "back-arrow",
            onClick: _cache[16] || (_cache[16] = ($event) => $options.switchPage("me"))
          }, "←"),
          vue.createElementVNode("text", { class: "withdraw-title" }, "提现")
        ]),
        vue.createElementVNode("view", { class: "withdraw-info" }, [
          vue.createElementVNode("view", { class: "balance-display" }, [
            vue.createElementVNode("text", { class: "balance-label" }, "可提现金额:"),
            vue.createElementVNode(
              "text",
              { class: "balance-amount" },
              "¥" + vue.toDisplayString($data.userBalance.toFixed(2)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "balance-display" }, [
            vue.createElementVNode("text", { class: "balance-label" }, "金币余额:"),
            vue.createElementVNode(
              "text",
              { class: "balance-amount" },
              vue.toDisplayString($data.userGold.toLocaleString()),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "text",
            { class: "withdraw-tip" },
            "（今日剩余提现次数：" + vue.toDisplayString($data.withdrawCount) + "/3）",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "amount-section" }, [
          vue.createElementVNode("text", { class: "amount-title" }, "选择提现金额"),
          vue.createElementVNode("view", { class: "amount-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.withdrawAmounts, (amount) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: amount,
                  class: vue.normalizeClass(["amount-item", {
                    selected: $data.selectedAmount === amount,
                    disabled: $data.userBalance < amount
                  }]),
                  onClick: ($event) => $options.selectAmount(amount)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "amount-value" },
                    "¥" + vue.toDisplayString(amount),
                    1
                    /* TEXT */
                  ),
                  $data.userBalance < amount ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "amount-hint"
                  }, "余额不足")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "withdraw-tips" }, [
          vue.createElementVNode("text", { class: "tip-title" }, "提现规则："),
          vue.createElementVNode("text", { class: "tip-item" }, "1. 每日最多可提现3次"),
          vue.createElementVNode("text", { class: "tip-item" }, "2. 提现到支付宝账户"),
          vue.createElementVNode("text", { class: "tip-item" }, "3. 提现金额需≥20元"),
          vue.createElementVNode("text", { class: "tip-item" }, "4. 提现申请将在1-3个工作日内处理")
        ]),
        vue.createElementVNode("button", {
          onClick: _cache[17] || (_cache[17] = (...args) => $options.handleWithdraw && $options.handleWithdraw(...args)),
          class: "withdraw-btn",
          disabled: $data.withdrawCount >= 3 || $data.userBalance < $data.selectedAmount || $data.userBalance < 20
        }, vue.toDisplayString($data.withdrawCount >= 3 ? "今日已达上限" : $data.userBalance < $data.selectedAmount ? "余额不足" : "申请提现"), 9, ["disabled"])
      ])) : vue.createCommentVNode("v-if", true),
      $data.currentPage === "alipayAccount" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "page-content alipay-page"
      }, [
        vue.createElementVNode("view", { class: "alipay-header" }, [
          vue.createElementVNode("text", {
            class: "back-arrow",
            onClick: _cache[18] || (_cache[18] = ($event) => $options.switchPage("me"))
          }, "←"),
          vue.createElementVNode("text", { class: "alipay-title" }, "支付宝提现账户")
        ]),
        vue.createElementVNode("view", { class: "alipay-form" }, [
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "form-label" }, "姓名"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => $data.alipayName = $event),
                type: "text",
                placeholder: "请输入支付宝实名姓名",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.alipayName]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("text", { class: "form-label" }, "手机号"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => $data.alipayPhone = $event),
                type: "number",
                maxlength: "11",
                placeholder: "请输入支付宝绑定手机号",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.alipayPhone]
            ])
          ]),
          vue.createElementVNode("view", { class: "alipay-tip" }, [
            vue.createElementVNode("text", null, "注意：请确保姓名和手机号与支付宝账户一致")
          ]),
          vue.createElementVNode("button", {
            onClick: _cache[21] || (_cache[21] = (...args) => $options.saveAlipayAccount && $options.saveAlipayAccount(...args)),
            class: "save-btn"
          }, "保存账户信息")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $data.currentPage === "settings" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "page-content settings-page"
      }, [
        vue.createElementVNode("view", { class: "settings-header" }, [
          vue.createElementVNode("text", {
            class: "back-arrow",
            onClick: _cache[22] || (_cache[22] = ($event) => $options.switchPage("me"))
          }, "←"),
          vue.createElementVNode("text", { class: "settings-title" }, "设置")
        ]),
        vue.createElementVNode("view", { class: "settings-menu" }, [
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("text", { class: "settings-text" }, "修改密码"),
            vue.createElementVNode("text", { class: "settings-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[23] || (_cache[23] = (...args) => $options.clearCache && $options.clearCache(...args))
          }, [
            vue.createElementVNode("text", { class: "settings-text" }, "清除缓存"),
            vue.createElementVNode("text", { class: "settings-arrow" }, ">")
          ]),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("text", { class: "settings-text" }, "版本信息"),
            vue.createElementVNode("text", { class: "settings-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item logout",
            onClick: _cache[24] || (_cache[24] = (...args) => $options.handleLogout && $options.handleLogout(...args))
          }, [
            vue.createElementVNode("text", { class: "settings-text logout-text" }, "退出登录")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $data.currentPage === "home" || $data.currentPage === "me" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 5,
        class: "tab-bar"
      }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentPage === "home" }]),
            onClick: _cache[25] || (_cache[25] = ($event) => $options.switchPage("home"))
          },
          [
            vue.createElementVNode("text", { class: "tab-icon" }, "🏠"),
            vue.createElementVNode("text", { class: "tab-text" }, "首页")
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentPage === "me" }]),
            onClick: _cache[26] || (_cache[26] = ($event) => $options.switchPage("me"))
          },
          [
            vue.createElementVNode("text", { class: "tab-icon" }, "👤"),
            vue.createElementVNode("text", { class: "tab-text" }, "我的")
          ],
          2
          /* CLASS */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]));
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/Administrator/Desktop/unpackage(1/成/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
      setTimeout(() => {
      }, 1e3);
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:18", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:21", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Administrator/Desktop/unpackage(1/成/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
