/* ==========================================================================
   StatLab Interactive - Complete Application Logic (Bilingual, Chart & Sim)
   ========================================================================== */

// Global State
const appState = {
  theme: 'light', // 'light' or 'dark'; intentionally not persisted
  lang: 'zh', // 'zh' or 'en'
  showIPA: true,
  activeTab: 'descriptive',
  activeSubtab: 'lln-sec',
  activeTest: 'ztest',
  quiz: {
    currentIndex: 0,
    score: 0,
    userAnswers: []
  }
};
let hasCompletedInitialLanguageRender = false;

// ==========================================================================
// 1. Web Speech API Audio Pronunciation Engine
// ==========================================================================
function speakTerm(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // cancel any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // slightly slower for pronunciation clarity
    utterance.pitch = 1.0;
    
    // Find American or British English Voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, your browser doesn't support Web Speech audio synthesis.");
  }
}

// ==========================================================================
// 2. Bilingual i18n Dictionary
// ==========================================================================
const i18n = {
  zh: {
    page_title: "概率与统计交互学习中心 | StatLab Interactive",
    app_subtitle: "概率与统计交互学习中心",
    nav_descriptive: "描述性统计",
    nav_theorems: "极限定理与分布",
    nav_probability: "概率实验室",
    nav_hypothesis: "假设检验 Workbench",
    nav_quiz: "交互测验",
    nav_cheatsheet: "公式",
    theme_light: "浅色",
    theme_dark: "深色",

    hero_title: "在数据、变化与推断中，理解统计学",
    hero_desc: "深入学习中心极限定理 (CLT)、大数定律 (LLN)、偏度、正态与对数正态分布，以及 Hypothesis Testing (z, t, Chi-Square, F 检验)。自带双语切换、音标标记。",
    stat_modules: "核心知识模块",
    stat_simulators: "动态仿真工具",
    stat_ipa: "IPA 音标词",
    feedback_title: "问题与建议",
    feedback_email_label: "邮箱",
    feedback_github_label: "GitHub",
    title_feedback_toggle: "打开问题与建议面板",
    aria_feedback_toggle: "打开问题与建议面板",
    title_feedback_close: "关闭问题与建议面板",
    aria_feedback_close: "关闭问题与建议面板",

    m1_badge: "模块 1",
    m1_title: "均值、中位数、众数、标准差与偏度 (Skewness)",
    m1_subtitle: "观察不同偏度与异常值对集中趋势指标的影响与相对大小关系。",
    t_central_title: "集中趋势指标",
    t_mean_name: "均值 (Mean):",
    t_mean_desc: "所有数据的算术平均数。对极值/异常值高度敏感。",
    t_median_name: "中位数 (Median):",
    t_median_desc: "数据按顺序排列后的第 50% 分位数。对异常值极具鲁棒性。",
    t_mode_name: "众数 (Mode):",
    t_mode_desc: "数据集中出现频率最高的数值。",
    t_dispersion_title: "离散程度与偏度",
    t_sd_name: "标准差 (Standard Deviation):",
    t_sd_desc: "衡量数值偏离均值的平均程度。",
    t_skew_name: "偏度 (Skewness γ₁):",
    t_skew_desc: "描述概率分布不对称程度的指标（正偏/右偏为正，负偏/左偏为负）。",
    t_kurt_name: "峰度 (Kurtosis):",
    t_kurt_desc: "衡量分布相对正态分布的尾部厚度和峰顶尖锐程度。",

    sim_skew_title: "偏度与集中趋势交互仿真器",
    sim_skew_desc: "拖动偏度滑块，直观观察 Mean (蓝)、Median (绿)、Mode (紫) 的相对位置移动！",
    ctrl_skewness: "分布偏度 (Skewness γ₁):",
    skew_left: "左侧 (-1.5)", skew_right: "右侧 (+1.5)",
    ctrl_outlier: "注入极端异常值:",
    label_mean: "均值 Mean:",
    label_median: "Median:",
    label_mode: "Mode:",

    m2_badge: "模块 2",
    m2_title: "极限定理与核心概率分布",
    m2_subtitle: "探究大数定律 (LLN) 样本均值收敛性、中心极限定理 (CLT) 渐进正态性及正态与对数正态分布转换。",
    sub_lln: "大数定律 (LLN)",
    sub_clt: "中心极限定理 (CLT)",
    sub_lognormal: "正态 vs 对数正态",

    lln_header: "大数定律 (Law of Large Numbers, LLN)",
    lln_exp: "随着样本量 $n$ 的无限增加，样本均值 $\\bar{X}_n$ 以概率 1 收敛于总体真实均值 $\\mu$。",
    lln_sim_title: "LLN 样本均值收敛仿真",
    lln_sim_desc: "模拟掷硬币或掷骰子试验，观察样本均值如何平滑收敛于理论期望值。",
    opt_coin: "硬币投掷 (P=0.5)",
    opt_dice: "均匀骰子 (E=3.5)",
    opt_skewed_coin: "非均匀硬币 (P=0.7)",
    btn_run_sim: "运行试验模拟",
    ctrl_trials: "试验次数 (n):",
    lbl_theoretical: "理论期望 (μ):",
    lbl_final_sample: "最终样本均值 (x̄ₙ):",
    lbl_abs_error: "绝对误差 (|x̄ₙ - μ|):",

    clt_header: "中心极限定理 (Central Limit Theorem, CLT)",
    clt_exp: "无论总体分布呈现何种形状（均匀、指数、双峰或偏态），只要总体方差有限，当样本量 $n \\ge 30$ 时，样本均值的抽样分布都会呈渐进正态性 (Asymptotic Normality)！",
    clt_exp_lead: "无论总体分布呈现何种形状（均匀、指数、双峰或偏态），样本均值 $\\bar{X}$ 的抽样分布都会呈现",
    clt_exp_term: "渐进正态性 (Asymptotic Normality)",
    clt_exp_tail: "，当样本量 $n \\ge 30$ 时会趋近于正态分布。",
    clt_sim_title: "CLT 抽样实验室",
    clt_sim_desc: "选择非正态的总体分布，调整样本量 $n$，看样本均值分布如何一步步变成高斯钟形曲线！",
    ctrl_parent_dist: "总体分布形状:",
    opt_uniform: "均匀分布 U(0, 1)",
    opt_exponential: "指数分布 Exp(1)",
    opt_bimodal: "双峰分布 (Bimodal)",
    opt_heavyskew: "严重右偏分布",
    ctrl_sample_n: "单次抽样样本量 (n):",
    ctrl_num_samples: "独立重复抽样次数 (K):",
    btn_resample: "进行重复抽样并绘图",
    lbl_se: "标准误 SE = σ / √n:",
    title_parent_chart: "1. 总体分布形状 (Parent Population)",
    title_sample_means_chart: "2. 样本均值 x̄ 的抽样分布 (Sampling Dist of Means)",

    logn_header: "正态分布 vs. 对数正态分布 (Normal vs Lognormal)",
    logn_exp: "若随机变量 $X \\sim \\mathcal{N}(\\mu, \\sigma^2)$ 服从正态分布，则 $Y = e^X$ 服从对数正态分布。对数正态变量非负且右偏，广泛用于股票价格、收入分布及生物尺寸建模。",
    logn_sim_title: "正态与对数正态分布对比探究",
    logn_sim_desc: "调节参数 $\\mu$ 与 $\\sigma$，观察指数拉伸如何影响对数正态分布的长尾。",
    ctrl_mu: "位置参数 μ (Normal Mean):",
    ctrl_sigma: "尺度参数 σ (Normal Standard Deviation):",
    lbl_logn_mean: "对数正态均值 E[Y] = e^(μ + σ²/2):",
    lbl_logn_median: "对数正态中位数 Median = e^μ:",
    lbl_logn_mode: "对数正态众数 Mode = e^(μ - σ²):",
    title_norm_curve: "正态分布 X ~ N(μ, σ²)",
    title_logn_curve: "对数正态分布 Y = e^X ~ Lognormal(μ, σ²)",

    m3_badge: "模块 4",
    m3_title: "假设检验 (Hypothesis Testing): Z-test, t-test, Chi-Square & F-test",
    m3_subtitle: "可视化虚无假设 $H_0$、显著性水平 $\\alpha$、拒绝域 (Rejection Region) 与 P-value 决策过程。",
    ctrl_tail: "检验方向 (Tail Direction):",
    opt_two_tailed: "双尾检验 (Two-Tailed)",
    opt_right_tailed: "右侧单尾检验 (Right-Tailed)",
    opt_left_tailed: "左侧单尾检验 (Left-Tailed)",
    ctrl_alpha: "显著性水平 (α):",
    lbl_critical_val: "临界值 (Critical Value):",
    lbl_pvalue: "计算出的 P-value:",
    lbl_conclusion: "统计决策 (Conclusion):",
    legend_accept: "接受域 (1-α)",
    legend_reject: "拒绝域 (α)",
    legend_pvalue: "P值覆盖区域",
    table_test_title: "假设检验方法对比与选择指南",
    th_test: "检验类型",
    th_purpose: "主要应用场景",
    th_assumptions: "适用条件与样本要求",
    th_formula: "检验统计量公式",
    td_z_purpose: "已知总体方差 σ² 时，检验单样本均值与总体均值是否存在显著差异。",
    td_z_assump: "已知 σ，总体服从正态分布或大样本 (n ≥ 30)。",
    td_t_purpose: "未知总体方差 σ² 时，检验小样本均值是否存在显著差异。",
    td_t_assump: "未知 σ，总体正态，小样本 (n < 30)。自由度 df = n - 1。",
    td_chi_purpose: "分类数据的拟合优度检验 (Goodness of Fit) 或独立性检验。",
    td_chi_assump: "分类频数数据，各单元格期望频数 ≥ 5。呈右偏分布。",
    td_f_purpose: "比较两个总体的方差齐性，或用于单因素方差分析 (ANOVA) 检验三组以上均值。",
    td_f_assump: "独立正态总体，样本方差之比。自由度为 (df₁, df₂)。",

    m4_badge: "模块 5",
    m4_title: "概率与统计交互测评",
    m4_subtitle: "检验你对 CLT、LLN、偏度、正态分布与假设检验的掌握情况。",
    btn_prev: "上一题",
    btn_next: "下一题",
    quiz_complete_title: "测试完成！",
    lbl_your_score: "你的最终得分:",
    btn_retake_quiz: "重新开始测试",

    m5_badge: "模块 6",
    m5_title: "概率与统计核心公式手册",
    m5_subtitle: "快速查阅必备公式、性质推导与关键统计概念。",
    footer_text: "StatLab Interactive — 旨在提供直观、高效的概率与统计交互式学习体验。",
    ipa_on: "IPA 音标: 开", ipa_off: "IPA 音标: 关",
    unit_outlier: "异常值", unit_trials: "次试验",
    cheat_central: "1. 集中趋势与离散程度", cheat_mean: "样本均值", cheat_variance: "样本方差", cheat_se: "标准误 (SE)",
    cheat_distributions: "2. 常见概率分布", cheat_normal_pdf: "正态分布 PDF", cheat_lognormal_pdf: "对数正态分布 PDF",
    cheat_tests: "3. 假设检验统计量", cheat_z: "单样本 Z 统计量", cheat_t: "单样本 t 统计量", cheat_chi: "卡方 (χ²) 拟合优度检验", cheat_f: "双样本 F 检验",
    test_tab_z: "Z 检验（单样本均值）", test_tab_t: "t 检验（小样本）", test_tab_chi: "卡方（χ²）检验", test_tab_f: "F 检验（ANOVA／方差）",
    test_name_z: "Z 检验", test_name_t: "t 检验", test_name_chi: "卡方（χ²）检验", test_name_f: "F 检验（ANOVA）",
    path_hypotheses: "假设", path_rule: "检验规则", path_evidence: "证据", path_decision: "决策",
    cheat_rules: "⚡ 核心规则与概念", cheat_pvalue: "P 值定义:", cheat_pvalue_desc: "在原假设 $H_0$ 为真时，得到至少同样极端的检验结果的概率。它不是 $H_0$ 为真的概率！",
    cheat_errors: "第一类与第二类错误:", cheat_type1: "第一类（$\\alpha$）：当 $H_0$ 实际为真时拒绝它（假阳性）。", cheat_type2: "第二类（$\\beta$）：当 $H_0$ 为假时未能拒绝它（假阴性）。",
    cheat_skew_order: "偏度顺序:", cheat_skew_right: "右偏态：$\\text{Mean} > \\text{Median} > \\text{Mode}$", cheat_skew_left: "左偏态：$\\text{Mean} < \\text{Median} < \\text{Mode}$",
    title_ipa: "切换英文 IPA 音标与语音", aria_nav_prev: "显示前面的模块", aria_nav_next: "显示后面的模块", aria_nav_viewport: "学习模块", aria_decision_path: "假设检验决策路径"
  },

  en: {
    page_title: "Probability & Statistics Interactive Learning Hub | StatLab Interactive",
    app_subtitle: "Probability & Statistics Learning Hub",
    nav_descriptive: "Descriptive Stats",
    nav_theorems: "CLT & Distributions",
    nav_probability: "Probability Lab",
    nav_hypothesis: "Hypothesis Tests",
    nav_quiz: "Interactive Quiz",
    nav_cheatsheet: "Formula Sheet",
    theme_light: "Light",
    theme_dark: "Dark",

    hero_title: "Understand Statistics Through Data, Change, and Inference",
    hero_desc: "Explore Central Limit Theorem (CLT), Law of Large Numbers (LLN), Skewness, Normal vs Lognormal, and Hypothesis Testing (z, t, Chi-Square, F) with real-time visual simulations, bilingual explanations, and IPA.",
    stat_modules: "Core Modules",
    stat_simulators: "Live Simulators",
    stat_ipa: "Phonetic Terms",
    feedback_title: "Questions & Feedback",
    feedback_email_label: "Email",
    feedback_github_label: "GitHub",
    title_feedback_toggle: "Open questions and feedback panel",
    aria_feedback_toggle: "Open questions and feedback panel",
    title_feedback_close: "Close questions and feedback panel",
    aria_feedback_close: "Close questions and feedback panel",

    m1_badge: "Module 1",
    m1_title: "Mean, Median, Mode, Standard Deviation & Skewness",
    m1_subtitle: "Understand how measures of central tendency behave under different distribution shapes and extreme outliers.",
    t_central_title: "Central Tendency Measures",
    t_mean_name: "Mean:",
    t_mean_desc: "The arithmetic average. Highly sensitive to extreme outliers.",
    t_median_name: "Median:",
    t_median_desc: "The 50th percentile value. Highly robust to extreme outliers.",
    t_mode_name: "Mode:",
    t_mode_desc: "The value occurring with highest frequency in dataset.",
    t_dispersion_title: "Dispersion & Skewness",
    t_sd_name: "Standard Deviation:",
    t_sd_desc: "Measures average spread of observations from the mean.",
    t_skew_name: "Skewness (γ₁):",
    t_skew_desc: "Measures asymmetry of probability distribution (positive for right-skew, negative for left-skew).",
    t_kurt_name: "Kurtosis:",
    t_kurt_desc: "Measures tail-heaviness and peak sharpness relative to a normal distribution.",

    sim_skew_title: "Interactive Skewness & Central Tendency Simulator",
    sim_skew_desc: "Drag the skewness slider to see how Mean (Blue), Median (Green), and Mode (Purple) shift relative to each other!",
    ctrl_skewness: "Distribution Skewness (γ₁):",
    skew_left: "Left (-1.5)", skew_right: "Right (+1.5)",
    ctrl_outlier: "Inject Outlier Effect:",
    label_mean: "Mean:",
    label_median: "Median:",
    label_mode: "Mode:",

    m2_badge: "Module 2",
    m2_title: "Limit Theorems & Core Distributions",
    m2_subtitle: "Explore Law of Large Numbers (LLN) sample mean convergence, Central Limit Theorem (CLT) asymptotic normality, and Normal vs. Lognormal transformations.",
    sub_lln: "Law of Large Numbers (LLN)",
    sub_clt: "Central Limit Theorem (CLT)",
    sub_lognormal: "Normal vs Lognormal",

    lln_header: "Law of Large Numbers (LLN)",
    lln_exp: "As the sample size $n$ approaches infinity, the sample mean $\\bar{X}_n$ converges towards the true population mean $\\mu$ with probability 1.",
    lln_sim_title: "LLN Sample Convergence Simulator",
    lln_sim_desc: "Simulate tossing coins / rolling dice to see sample mean converge smoothly to theoretical expectation.",
    opt_coin: "Coin Toss (P=0.5)",
    opt_dice: "Fair Die (E=3.5)",
    opt_skewed_coin: "Biased Coin (P=0.7)",
    btn_run_sim: "Run Simulation",
    ctrl_trials: "Number of Trials (n):",
    lbl_theoretical: "Theoretical Mean (μ):",
    lbl_final_sample: "Final Sample Mean (x̄ₙ):",
    lbl_abs_error: "Absolute Error (|x̄ₙ - μ|):",

    clt_header: "Central Limit Theorem (CLT)",
    clt_exp: "Regardless of the underlying population distribution shape (Uniform, Exponential, Bimodal), the sampling distribution of sample means $\\bar{X}$ approaches a Normal distribution with Asymptotic Normality as $n \\ge 30$.",
    clt_exp_lead: "Regardless of the underlying population distribution shape (Uniform, Exponential, Bimodal), the distribution of sample means $\\bar{X}$ approaches a Normal distribution with",
    clt_exp_term: "Asymptotic Normality",
    clt_exp_tail: "as sample size $n \\ge 30$.",
    clt_sim_title: "CLT Interactive Sampling Laboratory",
    clt_sim_desc: "Select a non-normal parent population, adjust sample size $n$, and watch the sampling distribution become Gaussian!",
    ctrl_parent_dist: "Parent Population Distribution:",
    opt_uniform: "Uniform Distribution U(0, 1)",
    opt_exponential: "Exponential Distribution Exp(1)",
    opt_bimodal: "Bimodal Distribution",
    opt_heavyskew: "Heavy Right Skewed",
    ctrl_sample_n: "Sample Size (n per sample):",
    ctrl_num_samples: "Number of Resamples (K):",
    btn_resample: "Draw Samples & Plot",
    lbl_se: "Std Error SE = σ / √n:",
    title_parent_chart: "1. Parent Population Shape",
    title_sample_means_chart: "2. Distribution of Sample Means (x̄)",

    logn_header: "Normal vs. Lognormal Distributions",
    logn_exp: "If $X \\sim \\mathcal{N}(\\mu, \\sigma^2)$, then $Y = e^X$ follows a Lognormal distribution. Lognormal variables are strictly non-negative and right-skewed, common in asset pricing and income distributions.",
    logn_sim_title: "Normal & Lognormal Comparative Explorer",
    logn_sim_desc: "Adjust $\\mu$ and $\\sigma$ to observe how exponential transformation stretches the right tail.",
    ctrl_mu: "Location Parameter μ (Normal Mean):",
    ctrl_sigma: "Scale Parameter σ (Normal Std Dev):",
    lbl_logn_mean: "Lognormal Mean E[Y] = e^(μ + σ²/2):",
    lbl_logn_median: "Lognormal Median = e^μ:",
    lbl_logn_mode: "Lognormal Mode = e^(μ - σ²):",
    title_norm_curve: "Normal Distribution X ~ N(μ, σ²)",
    title_logn_curve: "Lognormal Distribution Y = e^X ~ Lognormal(μ, σ²)",

    m3_badge: "Module 4",
    m3_title: "Hypothesis Testing: Z-test, t-test, Chi-Square & F-test",
    m3_subtitle: "Visualizing Null Hypotheses $H_0$, Significance Levels $\\alpha$, Critical Values, and P-values.",
    ctrl_tail: "Test Tail Direction:",
    opt_two_tailed: "Two-Tailed",
    opt_right_tailed: "Right-Tailed",
    opt_left_tailed: "Left-Tailed",
    ctrl_alpha: "Significance Level (α):",
    lbl_critical_val: "Critical Value(s):",
    lbl_pvalue: "Calculated P-value:",
    lbl_conclusion: "Statistical Decision:",
    legend_accept: "Accept Region (1-α)",
    legend_reject: "Rejection Region (α)",
    legend_pvalue: "P-value Area",
    table_test_title: "Hypothesis Test Selector Matrix",
    th_test: "Test Type",
    th_purpose: "Primary Purpose",
    th_assumptions: "Assumptions & Sample Size",
    th_formula: "Test Statistic Formula",
    td_z_purpose: "Compare sample mean to population mean when population variance σ² is known.",
    td_z_assump: "Known σ, normal population or large sample size (n ≥ 30).",
    td_t_purpose: "Compare sample mean when population variance σ² is unknown.",
    td_t_assump: "Unknown σ, normally distributed population, small sample (n < 30). df = n - 1.",
    td_chi_purpose: "Goodness of fit or test of independence between categorical variables.",
    td_chi_assump: "Categorical frequency data, expected count per cell ≥ 5. Right-skewed distribution.",
    td_f_purpose: "Compare two population variances or test overall equality of 3+ means (ANOVA).",
    td_f_assump: "Independent normal populations. Ratio of sample variances with df₁ and df₂.",

    m4_badge: "Module 5",
    m4_title: "Interactive Knowledge Check & Quiz",
    m4_subtitle: "Test your understanding of CLT, LLN, Distributions, Descriptive Stats, and Hypothesis Tests.",
    btn_prev: "Previous",
    btn_next: "Next Question",
    quiz_complete_title: "Quiz Completed!",
    lbl_your_score: "Your Final Score:",
    btn_retake_quiz: "Retake Quiz",

    m5_badge: "Module 6",
    m5_title: "Probability & Statistics Formula Sheet",
    m5_subtitle: "Essential mathematical formulas, properties, and key statistical concepts.",
    footer_text: "StatLab Interactive — Built for intuitive learning of Probability & Statistics.",
    ipa_on: "IPA: ON", ipa_off: "IPA: OFF",
    unit_outlier: "Outlier", unit_trials: "Trials",
    cheat_central: "1. Central Tendency & Dispersion", cheat_mean: "Sample Mean", cheat_variance: "Sample Variance", cheat_se: "Standard Error (SE)",
    cheat_distributions: "2. Common Probability Distributions", cheat_normal_pdf: "Normal Distribution PDF", cheat_lognormal_pdf: "Lognormal Distribution PDF",
    cheat_tests: "3. Hypothesis Test Statistics", cheat_z: "One-Sample Z Statistic", cheat_t: "One-Sample t Statistic", cheat_chi: "Chi-Square (χ²) Goodness-of-Fit", cheat_f: "Two-Sample F Test",
    test_tab_z: "Z-Test (Single Mean)", test_tab_t: "t-Test (Small Sample)", test_tab_chi: "Chi-Square ($\\chi^2$) Test", test_tab_f: "F-Test (ANOVA / Variances)",
    test_name_z: "Z-Test", test_name_t: "t-Test", test_name_chi: "Chi-Square ($\\chi^2$)", test_name_f: "F-Test (ANOVA)",
    path_hypotheses: "Hypotheses", path_rule: "Test rule", path_evidence: "Evidence", path_decision: "Decision",
    cheat_rules: "⚡ Key Rules & Concepts", cheat_pvalue: "P-value Definition:", cheat_pvalue_desc: "The probability of obtaining test results at least as extreme as observed, assuming $H_0$ is true. It is not the probability that $H_0$ is true!",
    cheat_errors: "Type I vs Type II Error:", cheat_type1: "Type I ($\\alpha$): Reject $H_0$ when $H_0$ is actually true (false positive).", cheat_type2: "Type II ($\\beta$): Fail to reject $H_0$ when $H_0$ is false (false negative).",
    cheat_skew_order: "Skewness Order:", cheat_skew_right: "Right-skewed: $\\text{Mean} > \\text{Median} > \\text{Mode}$", cheat_skew_left: "Left-skewed: $\\text{Mean} < \\text{Median} < \\text{Mode}$",
    title_ipa: "Toggle English phonetic IPA and audio", aria_nav_prev: "Show previous modules", aria_nav_next: "Show next modules", aria_nav_viewport: "Learning modules", aria_decision_path: "Hypothesis test decision path"
  }
};

// ==========================================================================
// 3. Quiz Questions Database (Bilingual)
// ==========================================================================
const quizQuestions = [
  {
    category: "Descriptive Statistics",
    question: {
      zh: "在一个高度正偏态（右偏，Right-skewed）的收入数据集中，均值 (Mean)、中位数 (Median) 与众数 (Mode) 通常满足什么大小顺序关系？",
      en: "In a heavily right-skewed income dataset, what is the typical relationship between Mean, Median, and Mode?"
    },
    options: [
      { zh: "Mean > Median > Mode", en: "Mean > Median > Mode" },
      { zh: "Mode > Median > Mean", en: "Mode > Median > Mean" },
      { zh: "Mean = Median = Mode", en: "Mean = Median = Mode" },
      { zh: "Median > Mean > Mode", en: "Median > Mean > Mode" }
    ],
    correct: 0,
    explanation: {
      zh: "正偏态/右偏分布的长尾伸向右侧高值区，拉高了对极值敏感的均值 (Mean)，因此 Mean > Median > Mode。",
      en: "In a right-skewed distribution, the long right tail stretches towards extreme high values, pulling the Mean higher than the Median and Mode."
    }
  },
  {
    category: "Central Limit Theorem",
    question: {
      zh: "根据中心极限定理 (CLT)，无论总体分布呈现何种形状，当样本量 $n$ 足够大 ($n \\ge 30$) 时，样本均值 $\\bar{X}$ 的抽样分布趋向于哪种分布？",
      en: "According to the Central Limit Theorem (CLT), regardless of the parent population distribution shape, what distribution does the sample mean approach as $n \\ge 30$?"
    },
    options: [
      { zh: "均匀分布 (Uniform)", en: "Uniform Distribution" },
      { zh: "指数分布 (Exponential)", en: "Exponential Distribution" },
      { zh: "正态分布 (Normal Distribution)", en: "Normal Distribution" },
      { zh: "泊松分布 (Poisson Distribution)", en: "Poisson Distribution" }
    ],
    correct: 2,
    explanation: {
      zh: "中心极限定理核心要义：不管总体分布多偏斜，只要独立同分布且方差有限，独立样本均值的分布在 $n$ 增大时均收敛于正态分布！",
      en: "The CLT states that the sampling distribution of independent sample means approaches a Normal distribution as sample size $n$ grows large."
    }
  },
  {
    category: "Law of Large Numbers",
    question: {
      zh: "关于大数定律 (LLN) 与中心极限定理 (CLT) 的本质区别，下列描述正确的是？",
      en: "Which statement correctly describes the key difference between LLN and CLT?"
    },
    options: [
      { zh: "LLN 描述样本均值收敛于一个数值（期望值），而 CLT 描述样本均值的概率分布形状", en: "LLN describes numerical convergence to expected value, while CLT describes the shape of the sampling distribution" },
      { zh: "LLN 适用于小样本，CLT 适用于大样本", en: "LLN applies to small samples, CLT applies to large samples" },
      { zh: "LLN 要求总体必须服从正态分布，CLT 不需要", en: "LLN requires normal population, CLT does not" },
      { zh: "LLN 和 CLT 描述的是完全相同的现象", en: "LLN and CLT describe the exact same phenomenon" }
    ],
    correct: 0,
    explanation: {
      zh: "大数定律 (LLN) 关注的是样本均值收敛于理论常数 $\\mu$；中心极限定理 (CLT) 关注的是样本均值在收敛过程中形成的‘分布波动形状’为高斯分布。",
      en: "LLN governs convergence of sample mean to a constant numerical value (μ), whereas CLT describes the limiting Gaussian distribution shape of that sample mean."
    }
  },
  {
    category: "Normal vs Lognormal",
    question: {
      zh: "如果随机变量 $Y = e^X$ 服从对数正态分布 (Lognormal Distribution)，那么变量 $X = \\ln(Y)$ 服从什么分布？",
      en: "If random variable $Y = e^X$ follows a Lognormal distribution, what distribution does $X = \\ln(Y)$ follow?"
    },
    options: [
      { zh: "正态分布 (Normal Distribution)", en: "Normal Distribution" },
      { zh: "指数分布 (Exponential)", en: "Exponential Distribution" },
      { zh: "卡方分布 (Chi-Square)", en: "Chi-Square Distribution" },
      { zh: "二项分布 (Binomial)", en: "Binomial Distribution" }
    ],
    correct: 0,
    explanation: {
      zh: "根据定义，对数正态变量取自然对数后，其结果 $X = \\ln(Y)$ 严格服从标准或一般正态分布 $N(\\mu, \\sigma^2)$。",
      en: "By definition, taking the natural logarithm of a Lognormal random variable yields a Gaussian Normal random variable $X \\sim \\mathcal{N}(\\mu, \\sigma^2)$."
    }
  },
  {
    category: "Hypothesis Testing",
    question: {
      zh: "在假设检验中，当真实情况为 $H_0$ 为真，但统计分析结果却拒绝了 $H_0$，犯了哪种错误？",
      en: "In hypothesis testing, what type of error is committed when a true null hypothesis $H_0$ is wrongly rejected?"
    },
    options: [
      { zh: "第一类错误 (Type I Error / 假阳性 α)", en: "Type I Error (α / False Positive)" },
      { zh: "第二类错误 (Type II Error / 假阴性 β)", en: "Type II Error (β / False Negative)" },
      { zh: "计算错误 (Standard Error)", en: "Standard Error" },
      { zh: "自由度错误 (Degrees of Freedom Error)", en: "Degrees of Freedom Error" }
    ],
    correct: 0,
    explanation: {
      zh: "弃真即为第一类错误 (Type I Error)，其发生概率上限由我们设定的显著性水平 $\\alpha$ 决定。",
      en: "Rejecting a true null hypothesis is defined as a Type I Error (False Positive), controlled by alpha (α)."
    }
  },
  {
    category: "Test Selection",
    question: {
      zh: "当我们想要比较两组独立正态总体的方差是否存在显著差异，或者进行方差齐性检验时，应当使用哪种统计检验？",
      en: "Which statistical test should be used when comparing two independent population variances for equality?"
    },
    options: [
      { zh: "Z 检验 (Z-Test)", en: "Z-Test" },
      { zh: "t 检验 (Student's t-Test)", en: "Student's t-Test" },
      { zh: "卡方检验 (Chi-Square Test)", en: "Chi-Square Test" },
      { zh: "F 检验 (F-Test)", en: "F-Test" }
    ],
    correct: 3,
    explanation: {
      zh: "F 检验通过计算两组独立样本方差之比 $F = s_1^2 / s_2^2$ 来评估总体方差的比值与齐性。",
      en: "The F-test evaluates the ratio of two sample variances $F = s_1^2 / s_2^2$ to assess variance equality."
    }
  }
];


// ==========================================================================
// 4. Application Initialization & Navigation
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initBilingual();
  initPhoneticsToggle();
  initFeedbackWidget();
  initSkewnessModule();
  initLlnModule();
  initCltModule();
  initLognormalModule();
  initHypothesisModule();
  initQuizModule();
  if (window.StatLab && StatLab.modules) {
    StatLab.modules.initAll({ getState: () => appState, getTheme: getVisualizationTheme });
  }
  applyLanguage(appState.lang);
  
  if (window.lucide) {
    lucide.createIcons();
  }
});

function initFeedbackWidget() {
  const widget = document.getElementById('feedbackWidget');
  const toggle = document.getElementById('feedbackToggle');
  const panel = document.getElementById('watermarkFeedbackPanel');
  const close = document.getElementById('feedbackClose');
  if (!widget || !toggle || !panel || !close) return;

  const setOpen = (open, restoreFocus = false) => {
    panel.hidden = !open;
    widget.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) close.focus();
    else if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false, true));
  document.addEventListener('click', event => {
    if (!panel.hidden && !widget.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      setOpen(false, true);
    }
  });
}

// ===========================================================================
// 4a. Theme and visualization palette
// ===========================================================================
function getVisualizationTheme() {
  return appState.theme === 'dark'
    ? {
        text: '#e2e8f0', muted: '#94a3b8', grid: 'rgba(148, 163, 184, 0.22)',
        tooltipBackground: '#1e293b', tooltipBorder: '#475569', canvasBackground: '#0f172a',
        canvasAxis: '#94a3b8', canvasCritical: '#fb7185', canvasCriticalText: '#fda4af'
      }
    : {
        text: '#334155', muted: '#64748b', grid: '#e2e8f0',
        tooltipBackground: '#ffffff', tooltipBorder: '#cbd5e1', canvasBackground: '#f8fafc',
        canvasAxis: '#94a3b8', canvasCritical: '#e11d48', canvasCriticalText: '#be123c'
      };
}

function themedScale(scale = {}) {
  const theme = getVisualizationTheme();
  return {
    ...scale,
    ticks: { color: theme.muted, ...(scale.ticks || {}) },
    title: scale.title ? { ...scale.title, color: theme.text } : scale.title,
    grid: { color: theme.grid, ...(scale.grid || {}) }
  };
}

function themedChartOptions(options = {}) {
  const theme = getVisualizationTheme();
  const scales = options.scales || {};
  const plugins = options.plugins || {};
  return {
    ...options,
    plugins: {
      ...plugins,
      legend: { labels: { color: theme.text }, ...(plugins.legend || {}) },
      tooltip: {
        backgroundColor: theme.tooltipBackground,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        ...(plugins.tooltip || {})
      }
    },
    scales: Object.fromEntries(Object.entries(scales).map(([axis, scale]) => [axis, themedScale(scale)]))
  };
}

function updateThemeControl() {
  const isDark = appState.theme === 'dark';
  const label = document.getElementById('themeLabel');
  const button = document.getElementById('themeToggleBtn');
  const icon = document.getElementById('themeIcon');
  const nextTheme = isDark ? 'light' : 'dark';
  const nextThemeLabel = i18n[appState.lang][`theme_${nextTheme}`];
  document.body.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('light-mode', !isDark);
  label.textContent = nextThemeLabel;
  button.title = appState.lang === 'zh' ? `切换至${nextThemeLabel}主题` : `Switch to ${nextThemeLabel.toLowerCase()} theme`;
  icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  if (window.lucide) lucide.createIcons();
}

function redrawVisualizations() {
  updateSkewnessPlot();
  runLlnSimulation();
  runCltSimulation();
  updateLognormalPlots();
  updateHypothesisTestUI();
  if (window.StatLab && StatLab.modules) {
    StatLab.modules.refreshAll({ getState: () => appState, getTheme: getVisualizationTheme });
  }
}

function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  updateThemeControl();
  themeBtn.addEventListener('click', () => {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    updateThemeControl();
    redrawVisualizations();
  });
}

function initPhoneticsToggle() {
  const phoneticBtn = document.getElementById('phoneticToggleBtn');
  const phoneticLabel = document.getElementById('phoneticLabel');

  phoneticBtn.addEventListener('click', () => {
    appState.showIPA = !appState.showIPA;
    if (appState.showIPA) {
      document.body.classList.add('show-ipa');
      phoneticBtn.classList.add('active');
      phoneticLabel.textContent = i18n[appState.lang].ipa_on;
    } else {
      document.body.classList.remove('show-ipa');
      phoneticBtn.classList.remove('active');
      phoneticLabel.textContent = i18n[appState.lang].ipa_off;
    }
  });
}

// Render KaTeX Math
function renderMath(root = document.body) {
  if (window.renderMathInElement) {
    renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      throwOnError: false
    });
  }
}

// Navigation Tabs
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanels = document.querySelectorAll('.tab-panel');
  initNavScroller();

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tabId = link.getAttribute('data-tab');
      navLinks.forEach(l => l.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const targetPanel = document.getElementById(tabId);
      if (targetPanel) targetPanel.classList.add('active');
      
      appState.activeTab = tabId;
      link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      renderMath();
    });
  });

  // Module 2 Sub-tabs
  const subTabBtns = document.querySelectorAll('.sub-tab-btn');
  const subtabContents = document.querySelectorAll('.subtab-content');
  subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtabId = btn.getAttribute('data-subtab');
      subTabBtns.forEach(b => b.classList.remove('active'));
      subtabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetSub = document.getElementById(subtabId);
      if (targetSub) targetSub.classList.add('active');
      
      appState.activeSubtab = subtabId;
      renderMath();
    });
  });

  // Module 3 Test Selection Tabs
  const testTabBtns = document.querySelectorAll('.test-tab-btn');
  testTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      testTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.activeTest = btn.getAttribute('data-test');
      updateHypothesisTestUI();
    });
  });
}

function initNavScroller() {
  const viewport = document.getElementById('navViewport');
  const previous = document.getElementById('navScrollPrev');
  const next = document.getElementById('navScrollNext');
  if (!viewport || !previous || !next) return;

  const updateControls = () => {
    previous.disabled = viewport.scrollLeft <= 1;
    next.disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1;
  };
  const scrollByCard = direction => viewport.scrollBy({ left: direction * Math.max(180, viewport.clientWidth / 4), behavior: 'smooth' });

  previous.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));
  viewport.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  requestAnimationFrame(updateControls);
}

// Bilingual Toggle Engine
function initBilingual() {
  const langBtn = document.getElementById('langToggleBtn');
  const langLabel = document.getElementById('langLabel');

  langBtn.addEventListener('click', () => {
    appState.lang = appState.lang === 'zh' ? 'en' : 'zh';
    langLabel.textContent = appState.lang === 'zh' ? '中 / EN' : 'EN / 中';
    applyLanguage(appState.lang);
  });
}

function applyLanguage(lang = appState.lang) {
  appState.lang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  const currentDict = i18n[appState.lang];
  document.title = currentDict.page_title;
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = appState.lang === 'zh' ? '中 / EN' : 'EN / 中';
  const updatedTextNodes = [];
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (currentDict[key]) {
      elem.textContent = currentDict[key];
      updatedTextNodes.push(elem);
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-title');
    if (currentDict[key]) elem.title = currentDict[key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-aria-label');
    if (currentDict[key]) elem.setAttribute('aria-label', currentDict[key]);
  });

  updateThemeControl();

  const phoneticLabel = document.getElementById('phoneticLabel');
  if (phoneticLabel) phoneticLabel.textContent = currentDict[appState.showIPA ? 'ipa_on' : 'ipa_off'];
  const phoneticBtn = document.getElementById('phoneticToggleBtn');
  if (phoneticBtn) phoneticBtn.title = currentDict.title_ipa;

  if (window.StatLab && StatLab.modules) {
    StatLab.modules.refreshAll({ getState: () => appState, getTheme: getVisualizationTheme });
  }

  // Re-render components with localized strings
  updateSkewnessPlot();
  updateHypothesisTestUI();
  renderQuizQuestion();
  updateQuizResultsMessage();
  if (!hasCompletedInitialLanguageRender) {
    renderMath();
    hasCompletedInitialLanguageRender = true;
  } else {
    const dynamicMathNodes = [
      document.getElementById('quizQuestionTitle'),
      document.getElementById('feedbackExplanation'),
      document.getElementById('resultMessageText')
    ].filter(Boolean);
    [...updatedTextNodes, ...dynamicMathNodes].forEach(renderMath);
  }
}

function updateLanguageTexts() { applyLanguage(appState.lang); }


// Throttle helper for smooth 60fps slider updates
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ==========================================================================
// 5. Module 1: Skewness & Central Tendency Simulator (Chart.js)
// ==========================================================================
let skewnessChartInstance = null;

function initSkewnessModule() {
  const skewnessSlider = document.getElementById('skewnessSlider');
  const outlierSlider = document.getElementById('outlierSlider');

  const throttledUpdate = throttle(updateSkewnessPlot, 40);
  skewnessSlider.addEventListener('input', throttledUpdate);
  outlierSlider.addEventListener('input', throttledUpdate);

  updateSkewnessPlot();
}

function updateSkewnessPlot() {
  const skewVal = parseFloat(document.getElementById('skewnessSlider').value);
  const outlierVal = parseFloat(document.getElementById('outlierSlider').value);

  document.getElementById('skewnessVal').textContent = skewVal > 0 ? `+${skewVal.toFixed(1)}` : skewVal.toFixed(1);
  document.getElementById('outlierVal').textContent = `+${outlierVal} ${i18n[appState.lang].unit_outlier}`;

  // Generate distribution data points
  const pointsCount = 100;
  const labels = [];
  const data = [];
  const valuesArray = [];

  for (let i = 0; i < pointsCount; i++) {
    const x = i / (pointsCount - 1);
    labels.push((x * 100).toFixed(0));

    let y = 0;
    if (Math.abs(skewVal) < 0.05) {
      y = Math.exp(-Math.pow((x - 0.5) * 6, 2) / 2);
    } else if (skewVal > 0) {
      const alpha = 1 + skewVal * 2;
      const betaVal = 5;
      y = Math.pow(x, alpha - 1) * Math.pow(1 - x, betaVal - 1);
    } else {
      const sAbs = Math.abs(skewVal);
      const alpha = 5;
      const betaVal = 1 + sAbs * 2;
      y = Math.pow(x, alpha - 1) * Math.pow(1 - x, betaVal - 1);
    }

    if (isNaN(y) || y < 0) y = 0;
    data.push(y);

    const count = Math.round(y * 1000);
    for (let c = 0; c < count; c++) {
      valuesArray.push(x * 100);
    }
  }

  if (outlierVal > 0) {
    const outlierCount = Math.round(outlierVal * 10);
    for (let o = 0; o < outlierCount; o++) {
      valuesArray.push(95);
    }
  }

  valuesArray.sort((a, b) => a - b);
  
  const n = valuesArray.length || 1;
  const mean = valuesArray.reduce((acc, curr) => acc + curr, 0) / n;
  const median = n % 2 === 0 ? (valuesArray[n / 2 - 1] + valuesArray[n / 2]) / 2 : valuesArray[Math.floor(n / 2)];
  
  const maxDensityIdx = data.indexOf(Math.max(...data));
  const mode = parseFloat(labels[maxDensityIdx]);

  document.getElementById('liveMeanVal').textContent = mean.toFixed(2);
  document.getElementById('liveMedianVal').textContent = median.toFixed(2);
  document.getElementById('liveModeVal').textContent = mode.toFixed(2);

  const badge = document.getElementById('skewStatusBadge');
  const ruleText = document.getElementById('skewRuleText');

  if (skewVal > 0.1 || outlierVal > 15) {
    badge.textContent = appState.lang === 'zh' ? '正偏态 (Right-Skewed)' : 'Right-Skewed (+)';
    badge.className = 'widget-badge reject';
    ruleText.textContent = appState.lang === 'zh' 
      ? '右偏分布法则: 均值 (Mean) > 中位数 (Median) > 众数 (Mode)。右侧长尾拉高了均值。'
      : 'Right-Skewed Rule: Mean > Median > Mode. Long right tail pulls Mean upwards.';
  } else if (skewVal < -0.1) {
    badge.textContent = appState.lang === 'zh' ? '负偏态 (Left-Skewed)' : 'Left-Skewed (-)';
    badge.className = 'widget-badge accept';
    ruleText.textContent = appState.lang === 'zh'
      ? '左偏分布法则: 众数 (Mode) > 中位数 (Median) > 均值 (Mean)。左侧长尾拉低了均值。'
      : 'Left-Skewed Rule: Mode > Median > Mean. Long left tail pulls Mean downwards.';
  } else {
    badge.textContent = appState.lang === 'zh' ? '对称分布 (Symmetric)' : 'Symmetric';
    badge.className = 'widget-badge';
    ruleText.textContent = appState.lang === 'zh'
      ? '对称分布法则: 均值 ≈ 中位数 ≈ 众数 (三者几乎重合)。'
      : 'Symmetric Rule: Mean ≈ Median ≈ Mode (all three overlap perfectly).';
  }

  const ctx = document.getElementById('skewnessChart').getContext('2d');
  if (skewnessChartInstance) skewnessChartInstance.destroy();

  skewnessChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Probability Density',
          data: data,
          borderColor: '#6366f1',
          borderWidth: 3,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: themedChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          title: { display: true, text: 'Variable Value (X)' },
          grid: { display: false }
        },
        y: { display: false }
      }
    })
  });
}


// ==========================================================================
// 6. Module 2: Limit Theorems & Distributions (LLN, CLT, Normal vs Lognormal)
// ==========================================================================

// --- LLN Simulation ---
let llnChartInstance = null;

function initLlnModule() {
  document.getElementById('runLlnBtn').addEventListener('click', runLlnSimulation);
  document.getElementById('llnTrialsInput').addEventListener('input', (e) => {
    document.getElementById('llnTrialsVal').textContent = `${e.target.value} ${i18n[appState.lang].unit_trials}`;
    runLlnSimulation();
  });
  document.getElementById('llnExperimentType').addEventListener('change', runLlnSimulation);
  
  runLlnSimulation();
}

function runLlnSimulation() {
  const type = document.getElementById('llnExperimentType').value;
  const nTrials = parseInt(document.getElementById('llnTrialsInput').value);

  let targetMean = 0.5;
  if (type === 'dice') targetMean = 3.5;
  if (type === 'skewed_coin') targetMean = 0.7;

  document.getElementById('llnTheoreticalMean').textContent = targetMean.toFixed(3);

  const trials = [];
  const runningMeans = [];
  let cumSum = 0;

  for (let i = 1; i <= nTrials; i++) {
    let outcome = 0;
    if (type === 'coin') {
      outcome = Math.random() < 0.5 ? 1 : 0;
    } else if (type === 'dice') {
      outcome = Math.floor(Math.random() * 6) + 1;
    } else if (type === 'skewed_coin') {
      outcome = Math.random() < 0.7 ? 1 : 0;
    }

    cumSum += outcome;
    trials.push(i);
    runningMeans.push(cumSum / i);
  }

  const finalMean = runningMeans[runningMeans.length - 1];
  document.getElementById('llnFinalSampleMean').textContent = finalMean.toFixed(3);
  document.getElementById('llnAbsError').textContent = Math.abs(finalMean - targetMean).toFixed(4);

  const ctx = document.getElementById('llnChart').getContext('2d');
  if (llnChartInstance) llnChartInstance.destroy();

  llnChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trials,
      datasets: [
        {
          label: 'Cumulative Sample Mean (x̄ₙ)',
          data: runningMeans,
          borderColor: '#4f46e5',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: 'Theoretical Mean (μ)',
          data: Array(nTrials).fill(targetMean),
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0
        }
      ]
    },
    options: themedChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Trial Number (n)' } },
        y: { title: { display: true, text: 'Sample Mean' } }
      }
    })
  });
}

// --- CLT Simulation ---
let cltParentChartInstance = null;
let cltMeansChartInstance = null;

function initCltModule() {
  document.getElementById('runCltBtn').addEventListener('click', runCltSimulation);
  document.getElementById('cltSampleSize').addEventListener('input', (e) => {
    document.getElementById('cltSampleSizeVal').textContent = `n = ${e.target.value}`;
  });
  document.getElementById('cltNumSamples').addEventListener('input', (e) => {
    document.getElementById('cltNumSamplesVal').textContent = `K = ${e.target.value}`;
  });

  runCltSimulation();
}

function runCltSimulation() {
  const distType = document.getElementById('cltParentDist').value;
  const n = parseInt(document.getElementById('cltSampleSize').value);
  const K = parseInt(document.getElementById('cltNumSamples').value);

  const parentPoints = 2000;
  const parentData = [];
  
  const drawFromParent = () => {
    if (distType === 'uniform') {
      return Math.random();
    } else if (distType === 'exponential') {
      return -Math.log(1 - Math.random());
    } else if (distType === 'bimodal') {
      return Math.random() < 0.5 ? (Math.random() * 0.3 + 0.1) : (Math.random() * 0.3 + 0.6);
    } else {
      return Math.pow(Math.random(), 4) * 5;
    }
  };

  for (let i = 0; i < parentPoints; i++) {
    parentData.push(drawFromParent());
  }

  const sampleMeans = [];
  for (let k = 0; k < K; k++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += drawFromParent();
    }
    sampleMeans.push(sum / n);
  }

  const sampleMeansMean = sampleMeans.reduce((a, b) => a + b, 0) / K;
  const variance = sampleMeans.reduce((a, b) => a + Math.pow(b - sampleMeansMean, 2), 0) / K;
  const se = Math.sqrt(variance);
  document.getElementById('cltSeVal').textContent = se.toFixed(4);

  plotHistogram('cltParentChart', parentData, 20, '#06b6d4', 'Parent PDF', cltParentChartInstance, (chart) => cltParentChartInstance = chart);
  plotHistogram('cltMeansChart', sampleMeans, 25, '#8b5cf6', 'Sample Means Distribution (x̄)', cltMeansChartInstance, (chart) => cltMeansChartInstance = chart);
}

function plotHistogram(canvasId, data, numBins, color, label, instanceRef, setInstance) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins || 0.1;

  const bins = Array(numBins).fill(0);
  const binLabels = [];

  for (let i = 0; i < numBins; i++) {
    binLabels.push((min + i * binWidth + binWidth / 2).toFixed(2));
  }

  data.forEach(val => {
    let binIdx = Math.floor((val - min) / binWidth);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;
    bins[binIdx]++;
  });

  const ctx = document.getElementById(canvasId).getContext('2d');
  if (instanceRef) instanceRef.destroy();

  const newChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: label,
        data: bins,
        backgroundColor: color,
        borderRadius: 4
      }]
    },
    options: themedChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 150,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { display: false }
      }
    })
  });

  setInstance(newChart);
}

// --- Normal vs Lognormal Comparative Explorer ---
let normalChartInstance = null;
let lognormalChartInstance = null;

function initLognormalModule() {
  const throttledLogn = throttle(updateLognormalPlots, 40);
  document.getElementById('lognMu').addEventListener('input', (e) => {
    document.getElementById('lognMuVal').textContent = parseFloat(e.target.value).toFixed(1);
    throttledLogn();
  });
  document.getElementById('lognSigma').addEventListener('input', (e) => {
    document.getElementById('lognSigmaVal').textContent = parseFloat(e.target.value).toFixed(2);
    throttledLogn();
  });

  updateLognormalPlots();
}

function updateLognormalPlots() {
  const mu = parseFloat(document.getElementById('lognMu').value);
  const sigma = parseFloat(document.getElementById('lognSigma').value);

  const lognMean = Math.exp(mu + Math.pow(sigma, 2) / 2);
  const lognMedian = Math.exp(mu);
  const lognMode = Math.exp(mu - Math.pow(sigma, 2));

  document.getElementById('lognMeanVal').textContent = lognMean.toFixed(2);
  document.getElementById('lognMedianVal').textContent = lognMedian.toFixed(2);
  document.getElementById('lognModeVal').textContent = lognMode.toFixed(2);

  const normX = [], normY = [];
  for (let x = mu - 3.5 * sigma; x <= mu + 3.5 * sigma; x += 0.1) {
    normX.push(x.toFixed(1));
    const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    normY.push(pdf);
  }

  const lognY = [], lognX = [];
  const maxX = Math.min(lognMean + 4 * Math.sqrt((Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma)), 15);
  for (let y = 0.05; y <= maxX; y += maxX / 60) {
    lognX.push(y.toFixed(2));
    const pdf = (1 / (y * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(Math.log(y) - mu, 2) / (2 * sigma * sigma));
    lognY.push(pdf);
  }

  const ctxNorm = document.getElementById('normalChart').getContext('2d');
  if (normalChartInstance) normalChartInstance.destroy();
  normalChartInstance = new Chart(ctxNorm, {
    type: 'line',
    data: {
      labels: normX,
      datasets: [{ label: 'Normal PDF', data: normY, borderColor: '#4f46e5', fill: true, backgroundColor: 'rgba(79,70,229,0.1)', tension: 0.3, pointRadius: 0 }]
    },
    options: themedChartOptions({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: {}, y: {} } })
  });

  const ctxLogn = document.getElementById('lognormalChart').getContext('2d');
  if (lognormalChartInstance) lognormalChartInstance.destroy();
  lognormalChartInstance = new Chart(ctxLogn, {
    type: 'line',
    data: {
      labels: lognX,
      datasets: [{ label: 'Lognormal PDF', data: lognY, borderColor: '#f43f5e', fill: true, backgroundColor: 'rgba(244,63,94,0.1)', tension: 0.3, pointRadius: 0 }]
    },
    options: themedChartOptions({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: {}, y: {} } })
  });
}


// ==========================================================================
// 7. Module 3: Hypothesis Testing Canvas Visualizer & Calculator
// ==========================================================================
function initHypothesisModule() {
  document.getElementById('htTailSelect').addEventListener('change', updateHypothesisTestUI);
  document.getElementById('htAlphaSelect').addEventListener('change', updateHypothesisTestUI);
  document.getElementById('htStatVal').addEventListener('input', (e) => {
    const test = appState.activeTest;
    const statSymbol = test === 'chitest' ? 'χ²' : (test === 'ftest' ? 'F' : (test === 'ttest' ? 't' : 'z'));
    document.getElementById('htStatValDisplay').textContent = `${statSymbol} = ${parseFloat(e.target.value).toFixed(2)}`;
    updateHypothesisTestUI();
  });

  document.getElementById('htDf1Val').addEventListener('input', (e) => {
    document.getElementById('htDf1Display').textContent = `df = ${e.target.value}`;
    updateHypothesisTestUI();
  });
  document.getElementById('htDf2Val').addEventListener('input', (e) => {
    document.getElementById('htDf2Display').textContent = `df₂ = ${e.target.value}`;
    updateHypothesisTestUI();
  });

  updateHypothesisTestUI();
}

const hypothesisTests = {
  ztest: {
    symbol: 'z', distribution: 'normal', supportsTails: true,
    title: { en: 'Z-Test: Critical Regions & P-value', zh: 'Z 检验：临界区域与 P 值' },
    subtitle: { en: 'Compare an observed z statistic with the standard normal distribution.', zh: '将观测到的 z 统计量与标准正态分布进行比较。' },
    hypothesis: { en: 'H₀: the population mean equals μ₀', zh: 'H₀：总体均值等于 μ₀' }
  },
  ttest: {
    symbol: 't', distribution: 't', supportsTails: true,
    title: { en: 't-Test: Degrees of Freedom & Evidence', zh: 't 检验：自由度与证据' },
    subtitle: { en: 'See how sample size changes the t distribution and decision boundary.', zh: '观察样本自由度如何改变 t 分布与决策边界。' },
    hypothesis: { en: 'H₀: the population mean equals μ₀', zh: 'H₀：总体均值等于 μ₀' }
  },
  chitest: {
    symbol: 'χ²', distribution: 'chi', supportsTails: false,
    title: { en: 'Chi-Square Test: Right-tail Evidence', zh: '卡方检验：右尾证据' },
    subtitle: { en: 'Explore a right-skewed χ² distribution that changes with degrees of freedom.', zh: '探索随自由度变化的右偏卡方分布。' },
    hypothesis: { en: 'H₀: observed counts fit the expected pattern', zh: 'H₀：观测频数符合期望模式' }
  },
  ftest: {
    symbol: 'F', distribution: 'f', supportsTails: false,
    title: { en: 'F-Test: Variance Ratio & Right-tail Evidence', zh: 'F 检验：方差比与右尾证据' },
    subtitle: { en: 'Explore how numerator and denominator degrees of freedom shape the F distribution.', zh: '探索分子与分母自由度如何塑造 F 分布。' },
    hypothesis: { en: 'H₀: variances are equal / group means are equal', zh: 'H₀：方差相等／各组均值相等' }
  }
};

function updateHypothesisTestUI() {
  const test = appState.activeTest;
  const config = hypothesisTests[test];
  const tailSelect = document.getElementById('htTailSelect');
  let tail = tailSelect.value;
  const alpha = parseFloat(document.getElementById('htAlphaSelect').value);
  const df1 = parseInt(document.getElementById('htDf1Val').value);
  const df2 = parseInt(document.getElementById('htDf2Val').value);

  const df1Group = document.getElementById('df1Group');
  const df2Group = document.getElementById('df2Group');
  const statLabel = document.getElementById('htStatValLabel');
  const lang = appState.lang;

  document.getElementById('currentTestTitle').textContent = config.title[lang];
  document.getElementById('currentTestSubtitle').textContent = config.subtitle[lang];
  document.getElementById('htHypothesisStep').textContent = config.hypothesis[lang];
  tailSelect.disabled = !config.supportsTails;
  if (!config.supportsTails) {
    tail = 'right';
    tailSelect.value = 'right';
  }
  document.getElementById('htTailNote').textContent = config.supportsTails
    ? ''
    : (lang === 'zh' ? '此教学场景使用右尾检验：较大的统计量提供反对 H₀ 的证据。' : 'This teaching scenario uses a right-tailed test: larger statistics are evidence against H₀.');

  if (test === 'ztest') {
    df1Group.style.display = 'none';
    df2Group.style.display = 'none';
    statLabel.textContent = lang === 'zh' ? '观测 Z 统计量 (z)：' : 'Observed Z Statistic (z):';
  } else if (test === 'ttest') {
    df1Group.style.display = 'flex';
    df2Group.style.display = 'none';
    statLabel.textContent = lang === 'zh' ? '观测 t 统计量 (t)：' : 'Observed t Statistic (t):';
  } else if (test === 'chitest') {
    df1Group.style.display = 'flex';
    df2Group.style.display = 'none';
    statLabel.textContent = lang === 'zh' ? '观测卡方统计量 (χ²)：' : 'Observed Chi-Square (χ²):';
  } else if (test === 'ftest') {
    df1Group.style.display = 'flex';
    df2Group.style.display = 'flex';
    statLabel.textContent = lang === 'zh' ? '观测 F 统计量 (F)：' : 'Observed F Statistic (F):';
  }

  const plot = getHypothesisPlot(config.distribution, df1, df2);
  syncHypothesisStatisticSlider(plot, config.symbol);
  const statVal = parseFloat(document.getElementById('htStatVal').value);
  const result = calculateHypothesisResult(config.distribution, tail, alpha, statVal, df1, df2);

  document.getElementById('htStatValDisplay').textContent = `${config.symbol} = ${statVal.toFixed(2)}`;
  document.getElementById('htStatisticLabel').textContent = lang === 'zh' ? '观测统计量' : 'Observed statistic';
  document.getElementById('htStatisticDisplay').textContent = `${config.symbol} = ${statVal.toFixed(3)}`;
  document.getElementById('htCriticalValDisplay').textContent = result.criticalText;
  document.getElementById('htPValueDisplay').textContent = `p = ${result.pValue.toFixed(4)}`;

  const decisionBadge = document.getElementById('hypothesisDecisionBadge');
  const conclusionText = document.getElementById('htConclusionText');

  if (result.isReject) {
    decisionBadge.textContent = appState.lang === 'zh' ? '拒绝 H₀ (Reject H₀)' : 'Reject H₀';
    decisionBadge.className = 'decision-badge reject';
    conclusionText.textContent = appState.lang === 'zh'
      ? `p = ${result.pValue.toFixed(4)} < α = ${alpha}：拒绝 H₀。当前结果在 H₀ 为真时不太可能出现。`
      : `p = ${result.pValue.toFixed(4)} < α = ${alpha}: reject H₀. The observed result is unlikely if H₀ is true.`;
  } else {
    decisionBadge.textContent = appState.lang === 'zh' ? '未能拒绝 H₀ (Fail to Reject H₀)' : 'Fail to Reject H₀';
    decisionBadge.className = 'decision-badge accept';
    conclusionText.textContent = appState.lang === 'zh'
      ? `p = ${result.pValue.toFixed(4)} ≥ α = ${alpha}：未能拒绝 H₀。证据不足以支持显著差异。`
      : `p = ${result.pValue.toFixed(4)} ≥ α = ${alpha}: fail to reject H₀. Evidence is insufficient for a significant difference.`;
  }

  document.getElementById('htRuleStep').textContent = `${tailLabel(tail, lang)}, α = ${alpha}`;
  document.getElementById('htEvidenceStep').textContent = `${config.symbol} = ${statVal.toFixed(3)} · p = ${result.pValue.toFixed(4)}`;
  const decisionStep = document.getElementById('htDecisionStep');
  decisionStep.className = `decision-step final ${result.isReject ? 'reject' : 'accept'}`;
  decisionStep.querySelector('strong').textContent = result.isReject
    ? (lang === 'zh' ? '拒绝 H₀' : 'Reject H₀')
    : (lang === 'zh' ? '未能拒绝 H₀' : 'Fail to reject H₀');
  document.querySelectorAll('[data-test-row]').forEach(row => row.classList.toggle('active-test-row', row.dataset.testRow === test));

  drawHypothesisCanvas(config, tail, alpha, statVal, result, plot, df1, df2);
}

function standardNormalCdf(x) { return StatLab.statistics.normalCdf(x); }

function tailLabel(tail, lang) {
  const labels = lang === 'zh' ? { two: '双尾检验', left: '左尾检验', right: '右尾检验' } : { two: 'Two-tailed test', left: 'Left-tailed test', right: 'Right-tailed test' };
  return labels[tail];
}

function calculateHypothesisResult(distribution, tail, alpha, stat, df1, df2) {
  const cdf = x => distribution === 'normal' ? standardNormalCdf(x) : distribution === 't' ? studentTCdf(x, df1) : distribution === 'chi' ? chiSquareCdf(x, df1) : fCdf(x, df1, df2);
  const quantile = p => inverseCdf(cdf, distribution === 'normal' || distribution === 't' ? -12 : 0, distribution === 'f' ? 1000 : 200, p);
  let criticals;
  let pValue;
  if (tail === 'two') {
    const crit = quantile(1 - alpha / 2);
    criticals = [-crit, crit];
    pValue = Math.min(1, 2 * Math.min(cdf(stat), 1 - cdf(stat)));
  } else if (tail === 'left') {
    criticals = [quantile(alpha)];
    pValue = cdf(stat);
  } else {
    criticals = [quantile(1 - alpha)];
    pValue = 1 - cdf(stat);
  }
  const isReject = tail === 'two' ? stat <= criticals[0] || stat >= criticals[1] : tail === 'left' ? stat <= criticals[0] : stat >= criticals[0];
  return { criticals, pValue: Math.max(0, Math.min(1, pValue)), isReject, criticalText: criticals.length === 2 ? `±${criticals[1].toFixed(3)}` : `${tail === 'left' ? '' : '+'}${criticals[0].toFixed(3)}` };
}

function getHypothesisPlot(distribution, df1, df2) {
  const cdf = x => distribution === 'normal' ? standardNormalCdf(x) : distribution === 't' ? studentTCdf(x, df1) : distribution === 'chi' ? chiSquareCdf(x, df1) : fCdf(x, df1, df2);
  const min = distribution === 'normal' || distribution === 't' ? -Math.max(4.5, inverseCdf(cdf, -15, 15, 0.9995)) : 0;
  const max = distribution === 'normal' || distribution === 't' ? Math.abs(min) : inverseCdf(cdf, 0, distribution === 'f' ? 1000 : 200, 0.999);
  return { min, max, cdf };
}

function syncHypothesisStatisticSlider(plot, symbol) {
  const slider = document.getElementById('htStatVal');
  const min = plot.min.toFixed(2);
  const max = plot.max.toFixed(2);
  if (slider.min !== min || slider.max !== max) {
    const old = parseFloat(slider.value);
    slider.min = min;
    slider.max = max;
    slider.value = Math.max(plot.min, Math.min(plot.max, old)).toFixed(2);
  }
  document.getElementById('htStatValDisplay').textContent = `${symbol} = ${parseFloat(slider.value).toFixed(2)}`;
}

function inverseCdf(cdf, low, high, probability) { return StatLab.statistics.inverseCdf(cdf, low, high, probability); }

function logGamma(z) { return StatLab.statistics.logGamma(z); }

function betaContinuedFraction(a, b, x) {
  const maxIterations = 200;
  const epsilon = 3e-14;
  const tiny = 1e-30;
  let c = 1;
  let d = 1 - (a + b) * x / (a + 1);
  d = Math.abs(d) < tiny ? tiny : 1 / d;
  let h = d;
  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d; d = Math.abs(d) < tiny ? tiny : d;
    c = 1 + aa / c; c = Math.abs(c) < tiny ? tiny : c;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d; d = Math.abs(d) < tiny ? tiny : d;
    c = 1 + aa / c; c = Math.abs(c) < tiny ? tiny : c;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  return h;
}

function regularizedBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b));
  return x < (a + 1) / (a + b + 2) ? front * betaContinuedFraction(a, b, x) / a : 1 - front * betaContinuedFraction(b, a, 1 - x) / b;
}

function regularizedGammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n < 200; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-14) break; }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  let b = x + 1 - a;
  let c = 1e30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c; h *= delta;
    if (Math.abs(delta - 1) < 1e-14) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

function studentTCdf(x, df) {
  const beta = regularizedBeta(df / (df + x * x), df / 2, 0.5);
  return x >= 0 ? 1 - beta / 2 : beta / 2;
}

function chiSquareCdf(x, df) { return x <= 0 ? 0 : regularizedGammaP(df / 2, x / 2); }
function fCdf(x, df1, df2) { return x <= 0 ? 0 : regularizedBeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2); }

function distributionPdf(distribution, x, df1, df2) {
  if (distribution === 'normal') return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  if (distribution === 't') return Math.exp(logGamma((df1 + 1) / 2) - logGamma(df1 / 2)) / Math.sqrt(df1 * Math.PI) * Math.pow(1 + x * x / df1, -(df1 + 1) / 2);
  if (distribution === 'chi') return x <= 0 ? 0 : Math.exp((df1 / 2 - 1) * Math.log(x) - x / 2 - (df1 / 2) * Math.log(2) - logGamma(df1 / 2));
  return x <= 0 ? 0 : Math.exp((df1 / 2) * Math.log(df1 / df2) + (df1 / 2 - 1) * Math.log(x) - logGamma(df1 / 2) - logGamma(df2 / 2) + logGamma((df1 + df2) / 2) - ((df1 + df2) / 2) * Math.log(1 + df1 * x / df2));
}

function drawHypothesisCanvas(config, tail, alpha, statVal, result, plot, df1, df2) {
  const theme = getVisualizationTheme();
  const canvas = document.getElementById('hypothesisCanvas');
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 700;
  const cssHeight = canvas.clientHeight || 340;
  if (canvas.width !== Math.round(cssWidth * ratio) || canvas.height !== Math.round(cssHeight * ratio)) { canvas.width = Math.round(cssWidth * ratio); canvas.height = Math.round(cssHeight * ratio); }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = cssWidth;
  const height = cssHeight;

  ctx.clearRect(0, 0, width, height);
  const margin = { top: 38, right: 24, bottom: 42, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const groundY = height - margin.bottom;

  const points = [];
  let maxPdf = 0;
  for (let i = 0; i <= plotWidth; i++) {
    const xVal = plot.min + (i / plotWidth) * (plot.max - plot.min);
    const pdf = distributionPdf(config.distribution, xVal, df1, df2);
    if (pdf > maxPdf) maxPdf = pdf;
    points.push({ xPixel: margin.left + i, xVal, pdf });
  }

  const yFor = pdf => groundY - (pdf / maxPdf) * (plotHeight - 20);
  const xFor = x => margin.left + ((x - plot.min) / (plot.max - plot.min)) * plotWidth;
  ctx.fillStyle = theme.canvasBackground;
  ctx.fillRect(margin.left, margin.top, plotWidth, plotHeight);
  for (let i = 0; i <= 4; i++) {
    const x = margin.left + (plotWidth * i / 4);
    const value = plot.min + (plot.max - plot.min) * i / 4;
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, groundY); ctx.stroke();
    ctx.fillStyle = theme.muted; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(value.toFixed(Math.abs(value) < 10 ? 1 : 0), x, groundY + 18);
  }
  const inReject = x => tail === 'two' ? x <= result.criticals[0] || x >= result.criticals[1] : tail === 'left' ? x <= result.criticals[0] : x >= result.criticals[0];
  const inPValue = x => tail === 'two' ? Math.abs(x) >= Math.abs(statVal) : tail === 'left' ? x <= statVal : x >= statVal;
  const fillArea = (predicate, color) => {
    let active = false;
    points.forEach((pt, index) => {
      const matches = predicate(pt.xVal);
      if (matches && !active) { ctx.beginPath(); ctx.moveTo(pt.xPixel, groundY); ctx.lineTo(pt.xPixel, yFor(pt.pdf)); active = true; }
      if (matches) ctx.lineTo(pt.xPixel, yFor(pt.pdf));
      if (active && (!matches || index === points.length - 1)) { const end = matches ? pt.xPixel : points[index - 1].xPixel; ctx.lineTo(end, groundY); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); active = false; }
    });
  };
  fillArea(inReject, 'rgba(244, 63, 94, 0.30)');
  fillArea(inPValue, 'rgba(16, 185, 129, 0.30)');

  ctx.beginPath();
  ctx.moveTo(margin.left, groundY);
  points.forEach(pt => {
    ctx.lineTo(pt.xPixel, yFor(pt.pdf));
  });
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin.left, groundY);
  ctx.lineTo(width - margin.right, groundY);
  ctx.strokeStyle = theme.canvasAxis;
  ctx.lineWidth = 2;
  ctx.stroke();

  result.criticals.forEach(critical => {
    const x = xFor(critical);
    ctx.beginPath(); ctx.setLineDash([4, 5]); ctx.moveTo(x, margin.top); ctx.lineTo(x, groundY); ctx.strokeStyle = theme.canvasCritical; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = theme.canvasCriticalText; ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`crit ${critical.toFixed(2)}`, x, margin.top - 9);
  });
  const statXPixel = xFor(statVal);
  if (statXPixel >= margin.left && statXPixel <= width - margin.right) {
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(statXPixel, margin.top);
    ctx.lineTo(statXPixel, groundY);
    ctx.strokeStyle = result.isReject ? '#f43f5e' : '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = result.isReject ? '#f43f5e' : '#10b981';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(`${config.symbol} = ${statVal.toFixed(2)}`, statXPixel, 18);
  }
  ctx.fillStyle = theme.muted; ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(config.distribution === 'f' ? 'F statistic' : `${config.symbol} statistic`, margin.left, height - 10);
}


// ==========================================================================
// 8. Module 4: Interactive Quiz Engine
// ==========================================================================
function initQuizModule() {
  document.getElementById('prevQuestionBtn').addEventListener('click', () => {
    if (appState.quiz.currentIndex > 0) {
      appState.quiz.currentIndex--;
      renderQuizQuestion();
    }
  });

  document.getElementById('nextQuestionBtn').addEventListener('click', () => {
    if (appState.quiz.currentIndex < quizQuestions.length - 1) {
      appState.quiz.currentIndex++;
      renderQuizQuestion();
    } else {
      showQuizResults();
    }
  });

  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    appState.quiz.currentIndex = 0;
    appState.quiz.score = 0;
    appState.quiz.userAnswers = [];
    document.getElementById('quizCard').style.display = 'block';
    document.getElementById('quizResultCard').style.display = 'none';
    renderQuizQuestion();
  });

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qIndex = appState.quiz.currentIndex;
  const q = quizQuestions[qIndex];
  const lang = appState.lang;

  document.getElementById('quizProgressFill').style.width = `${((qIndex + 1) / quizQuestions.length) * 100}%`;
  document.getElementById('quizQuestionIndexDisplay').textContent = `${lang === 'zh' ? '第' : 'Question'} ${qIndex + 1} ${lang === 'zh' ? '题，共' : 'of'} ${quizQuestions.length}`;
  document.getElementById('quizScoreDisplay').textContent = `${lang === 'zh' ? '得分:' : 'Score:'} ${appState.quiz.score}`;

  document.getElementById('quizCategoryTag').textContent = q.category;
  document.getElementById('quizQuestionTitle').textContent = q.question[lang];

  const optionsList = document.getElementById('quizOptionsList');
  optionsList.innerHTML = '';

  const feedbackBox = document.getElementById('quizFeedbackBox');
  feedbackBox.style.display = 'none';

  const nextBtn = document.getElementById('nextQuestionBtn');
  const prevBtn = document.getElementById('prevQuestionBtn');
  prevBtn.disabled = qIndex === 0;
  nextBtn.style.display = appState.quiz.userAnswers[qIndex] !== undefined ? 'inline-flex' : 'none';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    
    const marker = document.createElement('span');
    marker.className = 'option-marker';
    marker.textContent = String.fromCharCode(65 + idx);
    
    const label = document.createElement('span');
    label.textContent = opt[lang];

    btn.appendChild(marker);
    btn.appendChild(label);

    const answered = appState.quiz.userAnswers[qIndex];
    if (answered !== undefined) {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add('correct');
      if (answered === idx && idx !== q.correct) btn.classList.add('wrong');
    } else {
      btn.addEventListener('click', () => handleSelectOption(idx));
    }

    optionsList.appendChild(btn);
  });

  if (appState.quiz.userAnswers[qIndex] !== undefined) {
    showQuizFeedback(appState.quiz.userAnswers[qIndex] === q.correct);
  }
}

function handleSelectOption(selectedIndex) {
  const qIndex = appState.quiz.currentIndex;
  const q = quizQuestions[qIndex];
  
  appState.quiz.userAnswers[qIndex] = selectedIndex;

  if (selectedIndex === q.correct) {
    appState.quiz.score += 10;
  }

  renderQuizQuestion();
  showQuizFeedback(selectedIndex === q.correct);
}

function showQuizFeedback(isCorrect) {
  const qIndex = appState.quiz.currentIndex;
  const q = quizQuestions[qIndex];
  const lang = appState.lang;
  const feedbackBox = document.getElementById('quizFeedbackBox');

  feedbackBox.style.display = 'flex';
  feedbackBox.className = `quiz-feedback-box ${isCorrect ? 'correct' : 'wrong'}`;

  document.getElementById('feedbackTitle').textContent = isCorrect 
    ? (lang === 'zh' ? '回答正确！' : 'Correct!') 
    : (lang === 'zh' ? '回答错误' : 'Incorrect');

  document.getElementById('feedbackExplanation').textContent = q.explanation[lang];
  document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
}

function showQuizResults() {
  document.getElementById('quizCard').style.display = 'none';
  const resultCard = document.getElementById('quizResultCard');
  resultCard.style.display = 'block';

  const finalScore = appState.quiz.score;
  const totalScore = quizQuestions.length * 10;
  document.getElementById('finalScoreVal').textContent = `${finalScore} / ${totalScore}`;
  updateQuizResultsMessage();
}

function updateQuizResultsMessage() {
  const resultMessage = document.getElementById('resultMessageText');
  if (!resultMessage) return;
  const isStrongScore = appState.quiz.score >= quizQuestions.length * 10 * 0.7;
  resultMessage.textContent = appState.lang === 'zh'
    ? (isStrongScore ? '做得很棒！你已经扎实掌握了核心统计概念。' : '继续练习；复盘概念后再试一次，你会进步得很快。')
    : (isStrongScore ? 'Great job! You have demonstrated a solid command of core statistical concepts.' : 'Keep practising—review the concepts and try again to strengthen your understanding.');
}
