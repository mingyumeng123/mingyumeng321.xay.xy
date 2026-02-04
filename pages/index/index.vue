<template>
  <!-- 登录注册页面 -->
  <view v-if="currentPage === 'login'" class="login-container">
    <view class="login-box">
      <text class="login-title">用户登录</text>
      
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input 
          v-model="phoneNumber" 
          type="number" 
          maxlength="11" 
          placeholder="请输入注册手机号"
          class="login-input"
          @input="validatePhone"
        />
        <text v-if="phoneError" class="error-text">{{ phoneError }}</text>
      </view>
      
      <view class="input-group">
        <text class="input-label">密码</text>
        <input 
          v-model="password" 
          type="password" 
          maxlength="6" 
          placeholder="请输入注册密码"
          class="login-input"
          @input="validatePassword"
        />
        <text v-if="passwordError" class="error-text">{{ passwordError }}</text>
      </view>
      
      <button @click="handleLogin" class="login-btn" :disabled="!isFormValid">登录</button>
      
      <text class="login-tip">请使用注册时的手机号和密码登录</text>
    </view>
  </view>
  
  <!-- 主页面 -->
  <view v-else class="container">
    <!-- 首页内容 -->
    <view v-if="currentPage === 'home'" class="page-content">
      <!-- 顶部状态栏 -->
      <view class="status-bar">
        <view class="status-item">
          <text class="status-label">ID:</text>
          <text class="status-value">{{ userId }}</text>
        </view>
        <view class="status-item">
          <text class="status-label">余额:</text>
          <text class="status-value">¥{{ userBalance.toFixed(2) }}</text>
        </view>
        <view class="status-item">
          <text class="status-label">金币:</text>
          <text class="status-value">{{ userGold.toLocaleString() }}</text>
        </view>
      </view>
      
      <!-- 答题区域 -->
      <view class="question-section">
        <view class="question-header">
          <text class="section-title">语文答题</text>
          <view class="grade-selector">
            <text 
              v-for="grade in grades" 
              :key="grade"
              :class="['grade-item', { active: selectedGrade === grade }]"
              @click="selectGrade(grade)"
            >
              {{ grade }}
            </text>
          </view>
        </view>
        
        <!-- 题目展示 -->
        <view class="question-box">
          <text class="question-index">第{{ currentQuestion + 1 }}题/{{ totalQuestions }}题</text>
          <text class="question-text">{{ currentQuestionData.question }}</text>
          
          <!-- 选项A和B -->
          <view class="option-row">
            <view 
              :class="['option-btn', { selected: selectedOptions.includes('A') }]"
              @click="toggleOption('A')"
            >
              <text class="option-label">A</text>
              <text class="option-text">{{ currentQuestionData.options.A }}</text>
            </view>
            <view 
              :class="['option-btn', { selected: selectedOptions.includes('B') }]"
              @click="toggleOption('B')"
            >
              <text class="option-label">B</text>
              <text class="option-text">{{ currentQuestionData.options.B }}</text>
            </view>
          </view>
          
          <!-- 选项C和D -->
          <view class="option-row">
            <view 
              :class="['option-btn', { selected: selectedOptions.includes('C') }]"
              @click="toggleOption('C')"
            >
              <text class="option-label">C</text>
              <text class="option-text">{{ currentQuestionData.options.C }}</text>
            </view>
            <view 
              :class="['option-btn', { selected: selectedOptions.includes('D') }]"
              @click="toggleOption('D')"
            >
              <text class="option-label">D</text>
              <text class="option-text">{{ currentQuestionData.options.D }}</text>
            </view>
          </view>
          
          <view class="question-tip">
            <text>（双选题，请选择两个选项）</text>
          </view>
        </view>
        
        <!-- 导航按钮 -->
        <view class="question-nav">
          <button @click="prevQuestion" class="nav-btn prev-btn" :disabled="currentQuestion === 0">上一题</button>
          <button @click="submitAnswer" class="nav-btn submit-btn">提交答案</button>
          <button @click="nextQuestion" class="nav-btn next-btn" :disabled="currentQuestion === totalQuestions - 1">下一题</button>
        </view>
      </view>
      
      <!-- 广告区域 -->
      <view class="ad-section">
        <view class="ad-header">
          <text class="ad-title">激励视频广告</text>
          <view class="ad-status">
            <text class="ad-count">今日: {{ todayCount }}/45次</text>
            <text class="ad-cooling" :class="{ cooling: !canWatch }">
              {{ canWatch ? '可观看' : `冷却中(${nextWatchTime}s)` }}
            </text>
          </view>
        </view>
        
        <!-- 广告按钮 -->
        <button 
          @click="showAd" 
          class="ad-btn reward-btn"
          :disabled="!canWatch || todayCount >= 45"
        >
          <text v-if="canWatch && todayCount < 45">观看激励视频</text>
          <text v-else-if="todayCount >= 45">今日已达上限</text>
          <text v-else>冷却中({{ nextWatchTime }}s)</text>
        </button>
        
        <view class="ad-tip">
          <text>观看完整广告可获得收益，每次观看后需等待60秒</text>
        </view>
      </view>
    </view>
    
    <!-- 我的页面内容 -->
    <view v-if="currentPage === 'me'" class="page-content me-page">
      <view class="user-info">
        <view class="avatar"></view>
        <view class="user-detail">
          <text class="username">{{ phoneNumber }}</text>
          <text class="user-id">ID: {{ userId }}</text>
        </view>
      </view>
      
      <view class="balance-section">
        <view class="balance-item">
          <text class="balance-label">账户余额</text>
          <text class="balance-amount">¥{{ userBalance.toFixed(2) }}</text>
        </view>
        <view class="balance-item">
          <text class="balance-label">金币数量</text>
          <text class="balance-amount">{{ userGold.toLocaleString() }}</text>
        </view>
        <view class="exchange-rate">
          <text>兑换比例: 10000金币 = 1元</text>
        </view>
      </view>
      
      <view class="menu-section">
        <!-- 提现界面 -->
        <view class="menu-item" @click="switchToWithdraw">
          <text class="menu-text">提现</text>
          <text class="menu-arrow">></text>
        </view>
        
        <!-- 支付宝账户 -->
        <view class="menu-item" @click="switchToAlipayAccount">
          <text class="menu-text">支付宝提现账户</text>
          <text class="menu-arrow">></text>
        </view>
        
        <!-- 设置 -->
        <view class="menu-item" @click="switchToSettings">
          <text class="menu-text">设置</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>
    
    <!-- 提现页面 -->
    <view v-if="currentPage === 'withdraw'" class="page-content withdraw-page">
      <view class="withdraw-header">
        <text class="back-arrow" @click="switchPage('me')">←</text>
        <text class="withdraw-title">提现</text>
      </view>
      
      <view class="withdraw-info">
        <view class="balance-display">
          <text class="balance-label">可提现金额:</text>
          <text class="balance-amount">¥{{ userBalance.toFixed(2) }}</text>
        </view>
        <view class="balance-display">
          <text class="balance-label">金币余额:</text>
          <text class="balance-amount">{{ userGold.toLocaleString() }}</text>
        </view>
        <text class="withdraw-tip">（今日剩余提现次数：{{ withdrawCount }}/3）</text>
      </view>
      
      <view class="amount-section">
        <text class="amount-title">选择提现金额</text>
        <view class="amount-grid">
          <view 
            v-for="amount in withdrawAmounts" 
            :key="amount"
            :class="['amount-item', { 
              selected: selectedAmount === amount,
              disabled: userBalance < amount 
            }]"
            @click="selectAmount(amount)"
          >
            <text class="amount-value">¥{{ amount }}</text>
            <text v-if="userBalance < amount" class="amount-hint">余额不足</text>
          </view>
        </view>
      </view>
      
      <view class="withdraw-tips">
        <text class="tip-title">提现规则：</text>
        <text class="tip-item">1. 每日最多可提现3次</text>
        <text class="tip-item">2. 提现到支付宝账户</text>
        <text class="tip-item">3. 提现金额需≥20元</text>
        <text class="tip-item">4. 提现申请将在1-3个工作日内处理</text>
      </view>
      
      <button 
        @click="handleWithdraw" 
        class="withdraw-btn" 
        :disabled="withdrawCount >= 3 || userBalance < selectedAmount || userBalance < 20"
      >
        {{ withdrawCount >= 3 ? '今日已达上限' : userBalance < selectedAmount ? '余额不足' : '申请提现' }}
      </button>
    </view>
    
    <!-- 支付宝账户页面 -->
    <view v-if="currentPage === 'alipayAccount'" class="page-content alipay-page">
      <view class="alipay-header">
        <text class="back-arrow" @click="switchPage('me')">←</text>
        <text class="alipay-title">支付宝提现账户</text>
      </view>
      
      <view class="alipay-form">
        <view class="form-group">
          <text class="form-label">姓名</text>
          <input 
            v-model="alipayName" 
            type="text" 
            placeholder="请输入支付宝实名姓名"
            class="form-input"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">手机号</text>
          <input 
            v-model="alipayPhone" 
            type="number" 
            maxlength="11"
            placeholder="请输入支付宝绑定手机号"
            class="form-input"
          />
        </view>
        
        <view class="alipay-tip">
          <text>注意：请确保姓名和手机号与支付宝账户一致</text>
        </view>
        
        <button @click="saveAlipayAccount" class="save-btn">保存账户信息</button>
      </view>
    </view>
    
    <!-- 设置页面 -->
    <view v-if="currentPage === 'settings'" class="page-content settings-page">
      <view class="settings-header">
        <text class="back-arrow" @click="switchPage('me')">←</text>
        <text class="settings-title">设置</text>
      </view>
      
      <view class="settings-menu">
        <view class="settings-item">
          <text class="settings-text">修改密码</text>
          <text class="settings-arrow">></text>
        </view>
        <view class="settings-item" @click="clearCache">
          <text class="settings-text">清除缓存</text>
          <text class="settings-arrow">></text>
        </view>
        <view class="settings-item">
          <text class="settings-text">版本信息</text>
          <text class="settings-arrow">></text>
        </view>
        <view class="settings-item logout" @click="handleLogout">
          <text class="settings-text logout-text">退出登录</text>
        </view>
      </view>
    </view>
    
    <!-- 底部导航 -->
    <view class="tab-bar" v-if="currentPage === 'home' || currentPage === 'me'">
      <view 
        class="tab-item" 
        :class="{ active: currentPage === 'home' }"
        @click="switchPage('home')"
      >
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentPage === 'me' }"
        @click="switchPage('me')"
      >
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 'login',
      phoneNumber: '',
      password: '',
      phoneError: '',
      passwordError: '',
      isFormValid: false,
      
      // 用户数据
      userBalance: 0,
      userGold: 0,
      userId: '', // 用户唯一ID
      
      // 答题相关数据
      grades: ['小学', '初中', '高中'],
      selectedGrade: '小学',
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
      nextWatchTime: 60, // 固定60秒冷却
      canWatch: false,
      countdownInterval: null,
      
      // 提现相关数据
      withdrawCount: 0,
      selectedAmount: 20,
      withdrawAmounts: [20, 50, 100, 200],
      
      // 支付宝账户数据
      alipayName: '',
      alipayPhone: '',
      
      // 用户存储的数据结构
      userData: {
        registeredUsers: {}, // 存储注册用户 {手机号: {密码, 余额, 金币, 支付宝账户, userId}}
        currentUser: null
      },
      
      // 阿里云函数配置
      fcEndpoint: 'https://ad-callback-gztszkuzsx.cn-hangzhou.fcapp.run', // 你的阿里云函数公网地址
      
      // 调试相关
      isDebug: false, // 调试模式，生产环境设为false
      
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
    }
  },
  
  onLoad() {
    // 1. 生成/获取用户唯一ID（每个设备一个）
    this.initUserId();
    
    // 初始化题目数据
    this.initQuestions();
    // 加载用户数据
    this.loadUserData();
    // 绑定广告回调
    document.addEventListener('plusready', () => {
      console.log("原生环境已初始化，开始绑定回调");
      this.bindCallbacks();
      this.setupMockForH5();
    });
    // 检查是否已登录
    this.checkLoginStatus();
    
    // 查询余额并显示
    this.refreshBalance();
  },

  onShow() {
    // 页面显示时查询余额
    this.refreshBalance();
  },
  
  onHide() {
    // 页面隐藏时清理定时器（切页面/退后台防错乱）
    this.clearCountdown();
  },
  
  onUnload() {
    // 页面销毁时彻底清理定时器
    this.clearCountdown();
  },
  
  methods: {
    // 初始化用户ID
    initUserId() {
      let currentUserId = uni.getStorageSync("user_id");
      if (!currentUserId) {
        currentUserId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        uni.setStorageSync("user_id", currentUserId);
      }
      this.userId = currentUserId;
      console.log("用户唯一ID:", this.userId);
    },
    
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
        const data = uni.getStorageSync('userData');
        if (data) {
          this.userData = data;
        }
      } catch (e) {
        console.error("加载用户数据失败:", e);
      }
    },
    
    // 保存用户数据
    saveUserData() {
      try {
        uni.setStorageSync('userData', this.userData);
      } catch (e) {
        console.error("保存用户数据失败:", e);
      }
    },
    
    // 初始化题目
    initQuestions() {
      this.grades.forEach(grade => {
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
        
        // 如果用户信息中没有userId，则分配一个
        if (!userInfo.userId) {
          userInfo.userId = this.userId;
          this.saveUserData();
        }
        
        this.currentPage = 'home';
        this.loadWatchRecords();
      }
    },
    
    // 验证手机号
    validatePhone() {
      if (this.phoneNumber.length !== 11) {
        this.phoneError = '手机号必须是11位';
      } else if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
        this.phoneError = '手机号格式不正确';
      } else {
        this.phoneError = '';
      }
      this.checkFormValid();
    },
    
    // 验证密码
    validatePassword() {
      if (this.password.length !== 6) {
        this.passwordError = '密码必须是6位';
      } else if (!/^\d{6}$/.test(this.password)) {
        this.passwordError = '密码必须是6位数字';
      } else {
        this.passwordError = '';
      }
      this.checkFormValid();
    },
    
    // 检查表单是否有效
    checkFormValid() {
      this.isFormValid = !this.phoneError && !this.passwordError && 
                         this.phoneNumber.length === 11 && 
                         this.password.length === 6;
    },
    
    // 处理登录
    handleLogin() {
      if (!this.isFormValid) return;
      const userInfo = this.userData.registeredUsers[this.phoneNumber];
      if (!userInfo) {
        uni.showModal({
          title: '提示',
          content: '该手机号未注册，是否立即注册？',
          success: (res) => {
            if (res.confirm) {
              this.registerUser();
            }
          }
        });
        return;
      }
      if (userInfo.password !== this.password) {
        uni.showToast({ title: '密码错误', icon: 'error' });
        return;
      }
      this.userData.currentUser = this.phoneNumber;
      this.userBalance = userInfo.balance || 0;
      this.userGold = userInfo.gold || 0;
      
      // 如果用户信息中没有userId，则分配一个
      if (!userInfo.userId) {
        userInfo.userId = this.userId;
      }
      
      this.saveUserData();
      this.currentPage = 'home';
      this.loadWatchRecords();
      uni.showToast({ title: '登录成功', icon: 'success' });
    },
    
    // 注册用户
    registerUser() {
      this.userData.registeredUsers[this.phoneNumber] = {
        password: this.password,
        balance: 0,
        gold: 0,
        alipayAccount: {},
        userId: this.userId // 保存用户ID
      };
      this.userData.currentUser = this.phoneNumber;
      this.userBalance = 0;
      this.userGold = 0;
      this.saveUserData();
      this.currentPage = 'home';
      this.loadWatchRecords();
      uni.showToast({ title: '注册成功', icon: 'success' });
    },

    // H5环境模拟原生SDK（测试用）
    setupMockForH5() {
      if (process.env.UNI_PLATFORM === 'h5') {
        console.log("当前为H5环境，模拟原生android SDK");
        window.android = {
          loadInteraction: (callbackName) => {
            console.log("模拟加载插屏广告");
            setTimeout(() => window[callbackName]({ code: 1, msg: "模拟广告加载成功" }), 1000);
          },
          loadPlayRewardVideo: (params) => {
            console.log("模拟加载激励视频，用户ID：", params.userId);
            setTimeout(() => {
              // 模拟广告观看完成
              if (params.callback) {
                params.callback("success");
              }
            }, 1500);
          }
        };
      }
    },

    // 绑定广告SDK回调
    bindCallbacks() {
      const self = this;
      
      // 绑定到全局对象
      window.callBack4 = async function(params) {
        await self.callBack4(params);
      };
      
      // 插屏广告回调（保持原有）
      window.callBack2 = function(params) {
        try {
          console.log("插屏广告回调:", params);
          if (params.code == 1) {
            console.log("✅ 插屏广告展现成功");
          } else {
            console.error("❌ 插屏广告加载失败:", params.msg);
          }
        } catch (e) {
          console.error("callBack2 回调异常:", e);
        }
      };
      
      // 绑定广告播放完成回调
      window.adPlayCompleteCallback = function() {
        self.adPlayCompleteCallback();
      };
    },

    // 广告播放完成后，SDK 会调用这个方法
    async adPlayCompleteCallback() {
      console.log("广告看完了，开始给用户加钱...");
      
      try {
        // 调用阿里云函数，给用户加钱
        // PRICE=100 表示 1 元（单位：分）
        const response = await this.callRewardFunction(this.userId, 100);
        
        if (response && response.success) {
          // 更新本地余额显示
          await this.refreshBalanceAndGold();
          uni.showToast({
            title: '广告看完，收益已到账！',
            icon: 'success',
            duration: 3000
          });
        }
      } catch (error) {
        console.error("广告回调处理异常:", error);
        uni.showToast({
          title: '收益处理失败，请稍后重试',
          icon: 'none',
          duration: 3000
        });
      }
    },

    // 完整的激励视频广告回调（核心修复）
    callBack4: async function(params) {
      console.log("📱 广告回调完整参数：", JSON.stringify(params));
      
      try {
        // 奖励达成回调（code == 2）
        if (params.code === 2) {
          console.log("✅ 奖励达成回调触发");
          
          // 调用广告完成回调
          await this.adPlayCompleteCallback();
          
          // 记录广告观看成功
          this.recordWatchSuccess();
        }
        
        // 展现回调（code == 1）
        if (params.code === 1) {
          console.log("✅ 广告展现回调");
        }
        
        // 关闭回调（code == 3）
        if (params.code === 3) {
          console.log("✅ 广告关闭回调");
        }
        
        // 错误回调（code == 0）
        if (params.code === 0) {
          console.error("❌ 广告错误：", params.msg);
          uni.showToast({ title: "广告加载失败：" + params.msg, icon: "none" });
        }
        
      } catch (error) {
        console.error("广告回调处理异常:", error);
        uni.showToast({ title: "系统异常，请联系客服", icon: "none" });
      }
    },

    // 调用阿里云函数加钱
    callRewardFunction: async function(userId, price) {
      try {
        console.log("📡 开始调用云函数，用户ID:", userId, "价格:", price);
        
        // 构造请求URL
        const url = this.fcEndpoint;
        
        // 构造请求参数
        const params = new URLSearchParams();
        params.append('userId', userId);
        params.append('PRICE', price.toString());
        
        console.log("🌐 请求云函数URL:", url);
        console.log("📤 请求参数:", params.toString());
        
        // 使用uni.request调用
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: url,
            method: 'POST',
            data: params.toString(),
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'text/plain'
            },
            success: (response) => {
              console.log("📥 云函数响应:", response);
              resolve(response);
            },
            fail: (error) => {
              console.error("❌ 请求失败:", error);
              reject(error);
            }
          });
        });
        
        // 检查响应状态
        if (res.statusCode !== 200) {
          throw new Error(`HTTP ${res.statusCode}: ${res.errMsg}`);
        }
        
        // 解析响应数据
        const result = res.data;
        console.log("📊 云函数返回结果:", result);
        
        // 处理返回结果
        if (result === "success") {
          return { success: true };
        } else {
          throw new Error(result || "未知错误");
        }
        
      } catch (error) {
        console.error("❌ 调用云函数失败:", error);
        
        // 调试模式：本地模拟奖励
        if (this.isDebug) {
          console.warn("⚠️ 调试模式：使用本地模拟奖励");
          this.handleDebugReward();
          return { success: true };
        }
        
        throw error;
      }
    },

    // 刷新余额 + 金币（适配兑换比例：10000金币=1元）
    refreshBalanceAndGold() {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `${this.fcEndpoint}/queryBalance?userId=${this.userId}`,
          success: (res) => {
            if (res.statusCode === 200 && res.data) {
              const balance = res.data.balance; // 账户余额（元）
              const gold = balance * 10000; // 按10000金币=1元换算
              
              // 更新页面显示
              this.userBalance = parseFloat(balance.toFixed(2)); // 显示为¥0.00
              this.userGold = parseInt(gold); // 显示为整数金币
              
              // 更新存储中的用户数据
              const currentUser = this.userData.currentUser;
              if (currentUser && this.userData.registeredUsers[currentUser]) {
                const userInfo = this.userData.registeredUsers[currentUser];
                userInfo.balance = this.userBalance;
                userInfo.gold = this.userGold;
                this.saveUserData();
              }
              
              resolve();
            } else {
              // 如果云函数查询失败，使用本地数据
              console.log("使用本地余额数据");
              const currentUser = this.userData.currentUser;
              if (currentUser && this.userData.registeredUsers[currentUser]) {
                const userInfo = this.userData.registeredUsers[currentUser];
                this.userBalance = userInfo.balance || 0;
                this.userGold = userInfo.gold || 0;
              }
              resolve();
            }
          },
          fail: (error) => {
            console.error("查询余额失败:", error);
            // 使用本地数据
            const currentUser = this.userData.currentUser;
            if (currentUser && this.userData.registeredUsers[currentUser]) {
              const userInfo = this.userData.registeredUsers[currentUser];
              this.userBalance = userInfo.balance || 0;
              this.userGold = userInfo.gold || 0;
            }
            reject(error);
          }
        });
      });
    },

    // 查询余额并显示（兼容原有代码）
    async refreshBalance() {
      try {
        await this.refreshBalanceAndGold();
      } catch (error) {
        console.error("刷新余额失败:", error);
      }
    },

    // 调试模式：本地模拟奖励
    handleDebugReward: function() {
      // 增加10000金币（1元）
      const addGold = 10000;
      const currentGold = this.userGold || 0;
      const newGold = currentGold + addGold;
      const newBalance = newGold / 10000;
      
      // 更新本地数据
      this.userGold = newGold;
      this.userBalance = newBalance;
      
      // 更新存储中的用户数据
      const currentUser = this.userData.currentUser;
      if (currentUser && this.userData.registeredUsers[currentUser]) {
        const userInfo = this.userData.registeredUsers[currentUser];
        userInfo.gold = newGold;
        userInfo.balance = newBalance;
        this.saveUserData();
      }
    },
    
    // 切换页面
    switchPage(page) {
      this.currentPage = page;
      if (page === 'me' || page === 'home') {
        this.refreshBalanceAndGold();
      }
    },
    
    // 切换到提现/支付宝/设置页面
    switchToWithdraw() { this.loadWithdrawRecords(); this.currentPage = 'withdraw'; },
    switchToAlipayAccount() { this.loadAlipayAccount(); this.currentPage = 'alipayAccount'; },
    switchToSettings() { this.currentPage = 'settings'; },

    // 加载广告观看记录（每日重置45次）
    loadWatchRecords() {
      try {
        const today = this.getTodayDate();
        const records = uni.getStorageSync('adWatchRecords') || {};
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
        console.error("加载观看记录失败:", e);
      }
    },
    
    // 加载提现记录（每日重置3次）
    loadWithdrawRecords() {
      try {
        const today = this.getTodayDate();
        const records = uni.getStorageSync('withdrawRecords') || {};
        this.withdrawCount = records.date === today ? (records.count || 0) : 0;
      } catch (e) {
        console.error("加载提现记录失败:", e);
      }
    },
    
    // 加载支付宝账户
    loadAlipayAccount() {
      try {
        const userInfo = this.userData.registeredUsers[this.userData.currentUser];
        if (userInfo) {
          this.alipayName = userInfo.alipayAccount?.name || '';
          this.alipayPhone = userInfo.alipayAccount?.phone || '';
        }
      } catch (e) {
        console.error("加载支付宝账户失败:", e);
      }
    },

    // 保存广告观看记录（本地存储，每日有效）
    saveWatchRecords(date, count, lastWatchTime) {
      try {
        uni.setStorageSync('adWatchRecords', { date, count, lastWatchTime });
      } catch (e) {
        console.error("保存观看记录失败:", e);
      }
    },
    
    // 保存提现记录
    saveWithdrawRecords(date, count) {
      try {
        uni.setStorageSync('withdrawRecords', { date, count });
      } catch (e) {
        console.error("保存提现记录失败:", e);
      }
    },
    
    // 保存支付宝账户
    saveAlipayAccount() {
      if (!this.alipayName.trim() || !this.alipayPhone.trim()) {
        return uni.showToast({ title: '请填写完整信息', icon: 'none' });
      }
      const userInfo = this.userData.registeredUsers[this.userData.currentUser];
      if (!userInfo) return uni.showToast({ title: '用户信息错误', icon: 'none' });
      userInfo.alipayAccount = { name: this.alipayName, phone: this.alipayPhone };
      this.saveUserData();
      uni.showToast({ title: '保存成功', icon: 'success' });
      this.switchPage('me');
    },

    // 获取今日日期（用于每日重置记录）
    getTodayDate() {
      const now = new Date();
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
      const cooldownTotal = 60 * 1000; // 固定60秒冷却
      const timePassed = now - this.lastWatchTime;
      // 已过冷却时间
      if (timePassed >= cooldownTotal) {
        this.canWatch = true;
        this.nextWatchTime = 60;
        this.clearCountdown(); // 清理定时器
        return true;
      } 
      // 未过冷却，启动倒计时
      else {
        this.canWatch = false;
        this.nextWatchTime = Math.ceil((cooldownTotal - timePassed) / 1000);
        this.startCountdown(); // 启动倒计时
        return false;
      }
    },

    // 启动60秒倒计时（精准每秒更新）
    startCountdown() {
      this.clearCountdown(); // 先清理旧定时器，防重复
      this.countdownInterval = setInterval(() => {
        if (this.nextWatchTime <= 0) {
          this.canWatch = true;
          this.nextWatchTime = 60;
          this.clearCountdown();
          return;
        }
        this.nextWatchTime--;
      }, 1000);
    },

    // 记录广告观看成功（核心：触发倒计时的入口）
    recordWatchSuccess() {
      const today = this.getTodayDate();
      this.todayCount++; // 今日次数+1
      this.lastWatchTime = Date.now(); // 记录本次观看时间
      this.saveWatchRecords(today, this.todayCount, this.lastWatchTime); // 保存到本地
      this.checkWatchCooldown(); // 自动检查并启动倒计时
    },

    // 调用广告SDK（合并后）- 您提供的代码片段
    showAd() {
      // 今日次数达45次，禁止
      if (this.todayCount >= 45) {
        return uni.showToast({ title: "今日观看次数已达上限（45次）", icon: "none" });
      }
      // 未过冷却时间，禁止
      if (!this.checkWatchCooldown()) {
        return uni.showToast({ title: `请等待 ${this.nextWatchTime} 秒`, icon: "none" });
      }
      
      // 一切正常，调用SDK加载广告
      if (window?.android) {
        // 传递界面上的用户ID
        window.android.loadPlayRewardVideo({
          userId: this.userId, // 界面上显示的ID
          callback: (result) => {
            if (result === "success") {
              uni.showToast({ title: "广告看完，收益已到账！" });
              this.refreshBalanceAndGold(); // 同时刷新余额和金币
              this.recordWatchSuccess(); // 记录观看成功
            }
          }
        });
      } else {
        uni.showToast({ title: "请在App环境运行", icon: "none" });
      }
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
          uni.showToast({ title: '最多只能选择两个选项', icon: 'none' });
        }
      }
    },
    
    // 答题上一题/下一题/提交
    prevQuestion() { if (this.currentQuestion > 0) { this.currentQuestion--; this.selectedOptions = []; } },
    nextQuestion() { if (this.currentQuestion < this.totalQuestions - 1) { this.currentQuestion++; this.selectedOptions = []; } },
    submitAnswer() {
      if (this.selectedOptions.length !== 2) return uni.showToast({ title: '请选择两个选项', icon: 'none' });
      const isCorrect = this.selectedOptions.length === 2 && this.selectedOptions.includes('A') && this.selectedOptions.includes('B');
      uni.showToast({ title: isCorrect ? '回答正确！' : '回答错误', icon: isCorrect ? 'success' : 'error' });
      setTimeout(() => {
        this.currentQuestion = this.currentQuestion < this.totalQuestions - 1 ? this.currentQuestion + 1 : 0;
        this.selectedOptions = [];
      }, 1000);
    },
    
    // 选择提现金额
    selectAmount(amount) {
      if (this.userBalance < amount) return uni.showToast({ title: '余额不足', icon: 'none' });
      this.selectedAmount = amount;
    },
    
    // 处理提现
    handleWithdraw() {
      if (this.withdrawCount >= 3) return uni.showToast({ title: '今日提现次数已达上限', icon: 'none' });
      if (this.userBalance < this.selectedAmount) return uni.showToast({ title: '可提现金额不足', icon: 'none' });
      if (this.userBalance < 20) return uni.showToast({ title: '提现金额需≥20元', icon: 'none' });
      const userInfo = this.userData.registeredUsers[this.userData.currentUser];
      if (!userInfo || !userInfo.alipayAccount?.name || !userInfo.alipayAccount?.phone) {
        uni.showToast({ title: '请先设置支付宝账户', icon: 'none' });
        return this.switchToAlipayAccount();
      }
      // 扣除金币和余额
      const goldToDeduct = this.selectedAmount * 10000;
      if (userInfo.gold < goldToDeduct) return uni.showToast({ title: '金币不足', icon: 'none' });
      userInfo.gold -= goldToDeduct;
      userInfo.balance = userInfo.gold / 10000;
      this.userGold = userInfo.gold;
      this.userBalance = userInfo.balance;
      // 保存提现记录
      const today = this.getTodayDate();
      this.withdrawCount++;
      this.saveWithdrawRecords(today, this.withdrawCount);
      this.saveUserData();
      // 提示并返回我的页面
      uni.showToast({ title: `提现申请已提交：¥${this.selectedAmount}`, icon: 'success' });
      setTimeout(() => this.switchPage('me'), 1500);
    },
    
    // 清除缓存/退出登录
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) { 
            uni.clearStorageSync(); 
            // 重新初始化用户ID
            this.initUserId();
            uni.showToast({ title: '缓存已清除', icon: 'success' }); 
          }
        }
      });
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.userData.currentUser = null;
            this.saveUserData();
            this.currentPage = 'login';
            this.phoneNumber = '';
            this.password = '';
            this.userBalance = 0;
            this.userGold = 0;
          }
        }
      });
    },

    // 调用原生SDK - 插屏广告
    loadInteraction() {
      if (window?.android) { window.android.loadInteraction("callBack2"); } 
      else { uni.showToast({ title: "请在App环境运行", icon: "none" }); }
    },

    // 调用原生SDK - 激励视频（兼容原有代码）
    loadPlayRewardVideo() {
      // 为了兼容原有代码，这个函数仍然保留
      this.showAd();
    }
  }
}
</script>

<style scoped>
/* 登录页面样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  width: 85%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.login-title {
  display: block;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}
.input-group {
  margin-bottom: 25px;
}
.input-label {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}
.login-input {
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 15px;
  font-size: 16px;
  box-sizing: border-box;
}
.login-input:focus {
  border-color: #667eea;
  outline: none;
}
.error-text {
  display: block;
  color: #f5576c;
  font-size: 14px;
  margin-top: 5px;
}
.login-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}
.login-btn:disabled {
  opacity: 0.6;
}
.login-tip {
  display: block;
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 20px;
}

/* 主容器样式 */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}
.page-content {
  flex: 1;
  padding: 15px;
  padding-bottom: 80px;
  overflow-y: auto;
}

/* 顶部状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.status-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.status-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

/* 答题区域样式 */
.question-section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.grade-selector {
  display: flex;
  gap: 8px;
}
.grade-item {
  padding: 4px 12px;
  border-radius: 15px;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  transition: all 0.3s ease;
}
.grade-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.question-box {
  padding: 10px 0;
}
.question-index {
  display: block;
  color: #f5576c;
  font-size: 12px;
  margin-bottom: 8px;
}
.question-text {
  display: block;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 20px;
  font-weight: 500;
}
.option-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 10px;
}
.option-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 10px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}
.option-btn.selected {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}
.option-label {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}
.option-btn.selected .option-label {
  background: #667eea;
  color: white;
}
.option-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.3;
}
.question-tip {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}
.question-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 8px;
}
.nav-btn {
  flex: 1;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: bold;
}
.nav-btn:disabled {
  opacity: 0.5;
}
.prev-btn {
  background: #f0f0f0;
  color: #666;
}
.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.next-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

/* 广告区域 */
.ad-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.ad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.ad-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.ad-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.ad-count {
  font-size: 12px;
  color: #666;
}
.ad-cooling {
  font-size: 12px;
  color: #4CAF50;
  font-weight: bold;
}
.ad-cooling.cooling {
  color: #f5576c;
}
.ad-btn.reward-btn {
  width: 100%;
  height: 45px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}
.ad-btn:disabled {
  opacity: 0.6;
  background: #ccc;
}
.ad-tip {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

/* 我的页面样式 */
.me-page {
  display: flex;
  flex-direction: column;
}
.user-info {
  display: flex;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-right: 15px;
}
.user-detail {
  display: flex;
  flex-direction: column;
}
.username {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}
.user-id {
  font-size: 12px;
  color: #666;
}
.balance-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.balance-item:last-child {
  margin-bottom: 0;
}
.balance-label {
  font-size: 16px;
  color: #666;
}
.balance-amount {
  font-size: 20px;
  font-weight: bold;
  color: #f5576c;
}
.exchange-rate {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}
.menu-section {
  background: white;
  border-radius: 12px;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #eee;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-text {
  font-size: 16px;
  color: #333;
}
.menu-arrow {
  font-size: 18px;
  color: #999;
}

/* 提现/支付宝/设置页面样式 */
.withdraw-page, .alipay-page, .settings-page {
  background-color: #f5f5f5;
}
.withdraw-header, .alipay-header, .settings-header {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  margin: -15px -15px 15px -15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.back-arrow {
  font-size: 20px;
  margin-right: 15px;
  color: #333;
  cursor: pointer;
}
.withdraw-title, .alipay-title, .settings-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.withdraw-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.balance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.withdraw-tip {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}
.amount-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.amount-title {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
}
.amount-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.amount-item {
  position: relative;
  padding: 15px 10px;
  border: 2px solid #eee;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}
.amount-item.selected {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}
.amount-item.disabled {
  opacity: 0.6;
  border-color: #ddd;
  background-color: #f9f9f9;
  cursor: not-allowed;
}
.amount-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.amount-hint {
  display: block;
  font-size: 10px;
  color: #f5576c;
  margin-top: 5px;
}
.withdraw-tips {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.tip-title {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}
.tip-item {
  display: block;
  color: #666;
  font-size: 12px;
  margin-bottom: 6px;
  line-height: 1.4;
}
.withdraw-btn {
  width: 100%;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
}
.withdraw-btn:disabled {
  opacity: 0.6;
  background: #ccc;
  cursor: not-allowed;
}

/* 支付宝页面样式 */
.alipay-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.form-group {
  margin-bottom: 15px;
}
.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}
.form-input {
  width: 100%;
  height: 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #667eea;
  outline: none;
}
.alipay-tip {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 15px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}
.save-btn {
  width: 100%;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
}

/* 设置页面样式 */
.settings-menu {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.settings-text {
  font-size: 14px;
  color: #333;
}
.settings-arrow {
  font-size: 16px;
  color: #999;
}
.settings-item.logout {
  margin-top: 15px;
  justify-content: center;
  background: #f8f9fa;
  border-bottom: none;
}
.logout-text {
  color: #f5576c;
}

/* 底部导航 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  display: flex;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 100;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}
.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.tab-icon {
  font-size: 20px;
  margin-bottom: 4px;
}
.tab-text {
  font-size: 12px;
  color: #666;
}
.tab-item.active .tab-text {
  color: #667eea;
}
</style>