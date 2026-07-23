/* ==========================================================================
   LinAlgLab Interactive - Complete Application Logic & 2D Canvas Engines
   ========================================================================== */

// 1. Global State Management
const appState = {
  theme: 'dark', // 'dark' or 'light'
  lang: 'zh', // 'zh' or 'en'
  showIPA: true,
  activeTab: 'vectors',
  activeSubtab: 'quiz-sec',
  svdStep: 'full', // 'full', 'v', 'sigma', 'u'
  isSweepingEigen: false,
  sweepAnimationFrame: null,
  quiz: {
    currentIndex: 0,
    score: 0,
    userAnswers: []
  }
};

// ==========================================================================
// 2. Web Speech API Audio Pronunciation Engine
// ==========================================================================
function speakTerm(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, your browser doesn't support Web Speech audio synthesis.");
  }
}

// ==========================================================================
// 3. Bilingual i18n Dictionary
// ==========================================================================
const i18n = {
  zh: {
    page_title: "线性代数交互学习中心 | LinAlgLab Interactive",
    app_subtitle: "线性代数交互学习中心",
    nav_vectors: "向量与空间",
    nav_matrices: "矩阵与线性变换",
    nav_systems: "方程组与消元",
    nav_eigen: "特征值与特征向量",
    nav_ortho: "正交性与 SVD",
    nav_quiz: "测试与公式速查",

    hero_title: "在图形、关系与变化中，理解线性代数",
    hero_desc: "深入探索向量空间、张成空间 (Span)、2D 矩阵线性变换、行列式的几何面积缩放、特征值/特征向量探针、Gram-Schmidt 正交化与奇异值分解 (SVD)。内置中英双语与 IPA 音标标记。",
    stat_modules: "核心知识模块",
    stat_simulators: "2D 动态画布",
    stat_quiz: "练习题目数量",
    feedback_title: "问题与建议",
    feedback_email_label: "邮箱",
    feedback_github_label: "GitHub",
    title_feedback_toggle: "打开问题与建议面板",
    aria_feedback_toggle: "打开问题与建议面板",
    title_feedback_close: "关闭问题与建议面板",
    aria_feedback_close: "关闭问题与建议面板",

    m1_badge: "模块 1",
    m1_title: "向量、线性组合、张成空间 (Span) 与线性无关",
    m1_subtitle: "观察向量如何加减、标量乘法以及如何张成 2D 平面；直观理解向量组何时退化为线性相关。",
    t_vec_title: "向量与线性组合",
    t_vec_name: "向量 (Vector):",
    t_vec_desc: "具有大小与方向的几何对象，在空间中用带箭头的有向线段表示。",
    t_lincomb_name: "线性组合 (Linear Combination):",
    t_lincomb_desc: "向量乘以标量后的叠加和：c₁u + c₂v。",
    t_span_title: "张成空间与线性无关",
    t_span_name: "张成空间 (Span):",
    t_span_desc: "一组向量通过所有可能的线性组合所能到达的全体点构成的集合。",
    t_indep_name: "线性无关 (Linear Independence):",
    t_indep_desc: "向量组中任何一个向量都不能写成其他向量的线性组合 (c₁u + c₂v = 0 仅在 c₁=c₂=0 时成立)。",
    t_subspace_title: "子空间、基与维度",
    t_subspace_name: "子空间 (Subspace):",
    t_subspace_desc: "包含原点 0，且对加法与标量乘法封闭的向量子集。",
    t_basis_dim_name: "基与维度 (Basis & Dimension):",
    t_basis_dim_desc: "基是既线性无关又能张成空间的极小向量集；维度是基向量的数量。",

    sim_span_title: "2D 向量张成空间 (Span) 与线性无关仿真器",
    sim_span_desc: "可以直接在画布上拖动向量 u 和 v 的箭头终点，或者调节滑块，观察它们的 Span 是张成整个 2D 平面 (ℝ²) 还是退化为一条直线！",
    lbl_vec_u: "向量 u:",
    lbl_vec_v: "向量 v:",
    lbl_lincomb_weights: "线性组合系数 (c₁, c₂):",
    btn_make_collinear: "一键强行共线 (线性相关测试)",
    canvas_drag_hint: "💡 在画布上拖动向量箭头",

    m2_badge: "模块 2",
    m2_title: "矩阵作为线性变换与行列式的几何意义",
    m2_subtitle: "观察 2x2 矩阵如何拉伸、旋转和剪切空间网格，理解为何行列式等于面积缩放倍数。",
    t_matrix_title: "线性变换 (Linear Transformation)",
    t_transform_name: "线性变换:",
    t_transform_desc: "保持原点固定且原网格直线在变换后仍保持为直线的空间映射。",
    t_basis_transform_desc: "矩阵的列向量 = 标准基向量变换后的新位置:",
    t_det_rank_title: "行列式、秩与零空间",
    t_det_name: "行列式 (Determinant):",
    t_det_desc: "线性变换对空间区域面积（或体积）的缩放倍数 (det(A) = ad - bc)。",
    t_rank_null_name: "秩 (Rank) 与零空间 (Nullspace):",
    t_rank_null_desc: "秩代表变换后空间的维度；零空间代表所有被压缩至原点的向量集合。",
    t_inverse_title: "复合变换与逆矩阵",
    t_comp_name: "矩阵复合乘法:",
    t_comp_desc: "矩阵乘法 BA 代表先应用变换 A，再应用变换 B。注意 BA ≠ AB（不可交换）。",
    t_inv_name: "逆矩阵 (Inverse Matrix):",
    t_inv_desc: "撤销变换过程。可逆当且仅当 det(A) ≠ 0。",

    sim_transform_title: "2D 矩阵线性变换与行列式探索器",
    sim_transform_desc: "调节矩阵参数或选择预设变换，直观观察网格扭曲以及单位正方形拉伸为平行四边形的过程。",
    lbl_transform_matrix: "矩阵 $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$:",
    lbl_preset_transforms: "预设常见线性变换:",
    preset_transform_identity: "恒等变换",
    preset_transform_rotation: "旋转 (45°)",
    preset_transform_shear: "水平剪切",
    preset_transform_scale: "缩放 (2 倍, 0.5 倍)",
    preset_transform_singular: "奇异变换 (秩 1)",
    preset_transform_reflection: "关于 Y 轴反射",
    lbl_transform_determinant: "$\\det(A) = ad - bc =$:",
    lbl_transform_trace: "$\\text{迹}(A) = a + d =$:",
    lbl_transform_rank: "$\\text{秩}(A) =$:",
    sim_composition_title: "矩阵复合实验室：把乘法看作连续变换",
    sim_composition_desc: "分别设置两个独立的 2×2 矩阵，比较按不同顺序作用时的几何过程。",
    lbl_comp_matrix_a: "第一个矩阵 A:",
    lbl_comp_matrix_b: "第二个矩阵 B:",
    lbl_comp_order: "作用顺序:",
    btn_comp_ba: "A → B（BA）",
    btn_comp_ab: "B → A（AB）",
    lbl_comp_presets: "预设矩阵对:",
    preset_comp_rotate_shear: "旋转 → 剪切",
    preset_comp_shear_scale: "剪切 → 缩放",
    preset_comp_noncommuting: "不可交换示例",
    preset_comp_commuting: "可交换缩放",
    lbl_comp_product: "当前乘积:",
    lbl_comp_derivation: "行 × 列计算推导",
    comp_derivation_hint: "结果矩阵的每个元素，都是左矩阵的一行与右矩阵的一列的点积。",
    aria_composition_order: "矩阵复合作用顺序",
    aria_composition_canvas: "展示矩阵复合三个阶段的画布",
    sim_inverse_title: "2D 逆变换与可逆性实验室",
    sim_inverse_desc: "先应用一个矩阵，再检验是否存在唯一的逆矩阵将平面和单位正方形恢复。",
    lbl_inverse_matrix: "矩阵 A:",
    lbl_inverse_presets: "预设变换:",
    preset_inverse_identity: "单位变换",
    preset_inverse_rotation: "90° 旋转",
    preset_inverse_shear: "剪切",
    preset_inverse_reflection: "反射",
    preset_inverse_singular: "奇异压缩",
    lbl_inverse_determinant: "行列式:",
    lbl_inverse_derivation: "逆矩阵公式与验证",
    inverse_formula: "A⁻¹ = 1 / det(A) · [[d, −b], [−c, a]]",
    lbl_inverse_adjugate: "伴随矩阵部分",
    lbl_inverse_result: "逆矩阵",
    aria_inverse_canvas: "展示原始、变换与逆变换恢复的三阶段画布",

    m_systems_badge: "模块 3",
    m_systems_title: "线性方程组、秩与高斯消元",
    m_systems_subtitle: "用二维直线、增广矩阵与行变换理解唯一解、无解与无穷多解。",
    t_systems_geometry: "方程组的几何意义",
    t_systems_geometry_desc: "每个二元一次方程对应平面上的一条直线；交点就是同时满足两式的解。",
    t_systems_rref: "高斯-若尔当消元",
    t_systems_rref_desc: "通过交换、倍乘和倍加行操作，将增广矩阵化为最简行阶梯形（RREF）。",
    t_systems_rank: "秩与解的分类",
    t_systems_rank_desc: "若 rank(A) 与 rank([A|b]) 不同则无解；相同且等于未知数个数时有唯一解，否则有无穷多解。",
    sim_systems_title: "2×2 线性方程组与 RREF 实验室",
    sim_systems_desc: "修改系数，逐步观察两条直线、增广矩阵和消元操作如何共同决定解的类型。",
    lbl_system_coefficients: "系数矩阵 A 与常数向量 b:",
    lbl_system_equations: "对应方程:",
    lbl_system_augmented: "当前增广矩阵:",
    lbl_system_operation: "当前行操作:",
    lbl_rank_a: "rank(A):",
    lbl_rank_augmented: "rank([A|b]):",
    btn_system_next: "下一步",
    btn_system_auto: "自动完成",
    btn_system_reset: "重置步骤",
    btn_system_unique: "唯一解",
    btn_system_inconsistent: "无解",
    btn_system_infinite: "无穷多解",

    m3_badge: "模块 4",
    m3_title: "特征值、特征向量与特征分解",
    m3_subtitle: "寻找在空间变换中方向保持不变的特殊向量 (Av = λv)，探索特征值谱分解。",
    t_eigen_title: "特征值与特征向量",
    t_eigen_name: "特征值与特征向量:",
    t_eigen_desc: "非零向量 v 在矩阵 A 作用下仅发生标量缩放而不改变方向 (Av = λv)。",
    t_char_eq_name: "特征方程 (Characteristic Equation):",
    t_diag_title: "对角化与谱定理",
    t_diag_name: "矩阵对角化 (Diagonalization):",
    t_diag_desc: "将矩阵 A 分解为特征向量基 P 与对角矩阵 D: A = PDP⁻¹。",
    t_spectral_name: "谱定理 (Spectral Theorem):",
    t_spectral_desc: "每个实对称矩阵 (A = Aᵀ) 都可以正交对角化为 A = QDQᵀ，并且全部特征值都是实数。",
    t_mult_pca_title: "重数与 PCA 关联",
    t_mult_name: "代数重数 vs 几何重数:",
    t_mult_desc: "代数重数为特征方程多项式根的重数；几何重数为特征子空间 Null(A-λI) 的维度。",
    t_pca_name: "PCA 主成分分析:",
    t_pca_desc: "主成分即协方差矩阵 C = (1/n)XᵀX 的特征向量，指向数据方差最大的方向。",

    sim_eigen_title: "特征向量与特征值交互探针",
    sim_eigen_desc: "拖动角度滑块或开启 360° 自动扫描。当 x 与 Ax 在同一直线上重合时，你便找到了特征向量！",
    lbl_probe_angle: "测试探针向量角度 (θ):",
    btn_snap_eigen: "自动对齐特征向量",
    btn_auto_sweep: "360° 自动扫描",

    m4_badge: "模块 5",
    m4_title: "正交性、投影、QR、PCA 与 SVD",
    m4_subtitle: "掌握正交投影、QR 分解、最小二乘法、PCA 降维与奇异值分解 (SVD) 的几何直观。",
    t_proj_title: "点积与正交投影",
    t_dot_name: "点积与正交性 (Dot Product & Orthogonality):",
    t_dot_desc: "向量 u 和 v 正交 (垂直) 当且仅当 u · v = 0。",
    t_proj_name: "正交投影 (Orthogonal Projection):",
    t_proj_desc: "向量 v 在向量 u 张成直线上的投影影子。",
    t_svd_title: "正交化、QR 与 SVD",
    t_gs_name: "Gram-Schmidt & QR 分解:",
    t_gs_desc: "将一组独立向量转化为标准正交基 Q。矩阵表达：A = QR。",
    t_svd_name: "奇异值分解 (SVD):",
    t_svd_desc: "将任意矩阵 A 分解为：旋转 Vᵀ × 轴向拉伸 Σ × 旋转 U。",
    t_least_squares_title: "最小二乘法与伪逆",
    t_ls_name: "最小二乘法 (Least Squares):",
    t_ls_desc: "当 Ax = b 无解时，通过正交投影求得最近近似解 x̂: AᵀA x̂ = Aᵀb。",
    t_pinv_name: "摩尔-彭罗斯伪逆 (Pseudo-Inverse):",
    t_pinv_desc: "A⁺ = V Σ⁺ Uᵀ，将逆矩阵概念推广至任意非方阵。",

    sim_proj_title: "1. 向量正交投影与正交分解演示器",
    sim_proj_desc: "直接在画布上拖动向量终点，观察正交投影 proj_u(v) 与垂直补分量 v^⊥ 的几何直角分解。",
    sim_qr_title: "2. Gram-Schmidt 与 QR 分解实验室",
    sim_qr_desc: "拖动两个原始向量，分步观察归一化、投影相减与 QR 组装过程。",
    lbl_qr_vec_u: "第一列向量 u:",
    lbl_qr_vec_v: "第二列向量 v:",
    lbl_qr_norm_u: "‖u‖ =",
    lbl_qr_projection_coeff: "r₁₂ = q₁ · v =",
    lbl_qr_residual_norm: "‖u₂‖ =",
    lbl_qr_qtq: "QᵀQ:",
    lbl_qr_r: "上三角矩阵 R:",
    lbl_qr_reconstruction: "QR 重构结果:",
    btn_qr_next: "下一步",
    btn_qr_auto: "自动完成",
    btn_qr_reset: "重置步骤",
    btn_qr_default: "一般向量",
    btn_qr_orthogonal: "已正交",
    btn_qr_dependent: "线性相关",
    qr_drag_hint: "💡 拖动任一原始向量以重新开始 QR 步骤",
    sim_regression_title: "3. 最小二乘线性回归实验室",
    sim_regression_desc: "拖动五个数据点，观察拟合直线、残差与法方程如何随数据变化。",
    lbl_regression_model: "拟合模型:",
    lbl_regression_sse: "残差平方和 SSE:",
    lbl_regression_r2: "决定系数 R²:",
    lbl_regression_normal: "法方程 AᵀAθ = Aᵀy:",
    regression_drag_hint: "💡 拖动任一点以重新拟合直线",
    btn_regression_reset: "恢复默认数据",
    btn_regression_positive: "正相关",
    btn_regression_negative: "负相关",
    btn_regression_outlier: "离群点",
    sim_pca_title: "4. PCA 主成分降维实验室",
    sim_pca_desc: "拖动六个二维散点，观察中心化数据的协方差主轴，以及投影到第一主成分后的 1D 表示。",
    lbl_pca_mean: "均值 μ:",
    lbl_pca_covariance: "协方差矩阵 C:",
    lbl_pca_eigenvalues: "特征值:",
    lbl_pca_explained: "解释方差 (PC₁ / PC₂):",
    lbl_pca_direction: "第一主成分方向:",
    btn_pca_default: "默认斜向数据",
    btn_pca_horizontal: "水平主方向",
    btn_pca_vertical: "垂直主方向",
    btn_pca_outlier: "离群点",
    btn_pca_zero: "近零方差",
    pca_drag_hint: "💡 拖动任一散点以重新计算 PCA",
    aria_pca_canvas: "PCA 二维散点与第一主成分投影画布",
    title_pca_default: "载入默认斜向数据",
    title_pca_horizontal: "载入以水平为主方向的数据",
    title_pca_vertical: "载入以垂直为主方向的数据",
    title_pca_outlier: "载入包含离群点的数据",
    title_pca_zero: "载入近零方差数据",
    sim_svd_title: "5. 奇异值分解 (SVD) 几何步骤分解探索器",
    sim_svd_desc: "观察矩阵 A = U Σ Vᵀ 变换单位圆的完整几何三步走：Vᵀ 旋转 → Σ 轴向拉伸 → U 旋转。",
    lbl_svd_step: "分解步骤分解视图:",
    lbl_sigma_1: "奇异值 σ₁ =",
    lbl_sigma_2: "奇异值 σ₂ =",

    theme_light: "浅色模式",
    theme_dark: "深色模式",
    title_theme: "切换浅色/深色模式",
    title_ipa: "切换 IPA 音标与发音辅助",
    ipa_on: "IPA 音标: 开",
    ipa_off: "IPA 音标: 关",

    m5_badge: "模块 6",
    m5_title: "线性代数交互测试与公式速查",
    m5_subtitle: "检验你对特征向量、SVD、行列式与正定矩阵的掌握情况，并快速查阅核心公式与易错点。",
    sub_quiz: "15 题交互测验",
    sub_cheatsheet: "公式速查手册",
    quiz_explanation: "题目解析",
    cheat_matrix_ops_title: "矩阵运算与性质",
    cheat_determinant_properties: "行列式性质:",
    cheat_trace_properties: "迹的性质:",
    cheat_rank_nullity_title: "秩-零化度定理:",
    cheat_rank_nullity_formula: "$$\\text{rank}(A) + \\text{nullity}(A) = n \\quad (\\text{对于 } m \\times n \\text{ 矩阵 } A)$$",
    cheat_subspaces_title: "四个基本子空间",
    cheat_subspaces_theorem: "斯特朗的基本子空间定理:",
    cheat_subspaces_column: "1. 列空间",
    cheat_subspaces_column_desc: "维度 = $r$，是 $\\mathbb{R}^m$ 的子空间。",
    cheat_subspaces_null: "2. 零空间",
    cheat_subspaces_null_desc: "维度 = $n-r$，是 $\\mathbb{R}^n$ 的子空间。$\\text{Null}(A) \\perp \\text{Row}(A)$。",
    cheat_subspaces_row: "3. 行空间",
    cheat_subspaces_row_desc: "维度 = $r$，是 $\\mathbb{R}^n$ 的子空间。",
    cheat_subspaces_left_null: "4. 左零空间",
    cheat_subspaces_left_null_desc: "维度 = $m-r$，是 $\\mathbb{R}^m$ 的子空间。$\\text{Null}(A^T) \\perp \\text{Col}(A)$。",
    cheat_pd_title: "正定矩阵",
    cheat_pd_name: "正定",
    cheat_pd_desc: "对于实对称矩阵 $A$，$A$ 是正定矩阵（$A \\succ 0$）当且仅当满足下列任一等价条件：",
    cheat_pd_condition_1: "1. 对任意非零向量 $\\mathbf{x} \\neq \\mathbf{0}$，均有 $\\mathbf{x}^T A \\mathbf{x} > 0$。",
    cheat_pd_condition_2: "2. 所有特征值 $\\lambda_i > 0$ 都严格为正。",
    cheat_pd_condition_3: "3. 所有顺序主子式都严格为正（$\\det(A_k) > 0$）。",
    cheat_pd_condition_4: "4. 存在 Cholesky 分解：$A = L L^T$。",
    cheat_svd_title: "奇异值分解 (SVD)",
    cheat_svd_name: "奇异值分解",
    cheat_svd_intro: "对于任意 $m \\times n$ 矩阵 $A$：",
    cheat_svd_u: "$U$：由左奇异向量构成的 $m \\times m$ 正交矩阵（$A A^T$ 的特征向量）。",
    cheat_svd_sigma: "$\\Sigma$：包含奇异值 $\\sigma_i = \\sqrt{\\lambda_i(A^T A)}$ 的 $m \\times n$ 对角矩阵。",
    cheat_svd_v: "$V$：由右奇异向量构成的 $n \\times n$ 正交矩阵（$A^T A$ 的特征向量）。",
    cheat_least_squares_title: "最小二乘法与 PCA 应用",
    cheat_normal_equations: "正规方程:",
    cheat_projection_matrix: "到 $\\text{Col}(A)$ 上的投影矩阵：$P = A(A^T A)^{-1}A^T$。",
    cheat_pca_name: "PCA（主成分分析）:",
    cheat_pca_desc: "样本协方差矩阵 $C = \\frac{1}{n} X^T X$。对中心化数据矩阵 $X = U \\Sigma V^T$ 做 SVD，右奇异向量 $V$ 即为主方向。",
    cheat_pitfalls_title: "线性代数常见易错点",
    cheat_pitfall_1_title: "易错点 1：矩阵乘法不可交换！",
    cheat_pitfall_1_desc: "一般而言 $AB \\neq BA$。$(AB)^T = B^T A^T$，且 $(AB)^{-1} = B^{-1}A^{-1}$。",
    cheat_pitfall_2_title: "易错点 2：特征值与奇异值有什么不同？",
    cheat_pitfall_2_desc: "特征值只适用于方阵，可能为复数或负数；奇异值适用于任意矩形矩阵，且始终是非负实数 $\\sigma_i \\ge 0$。",
    btn_prev: "上一题",
    btn_next: "下一题",
    quiz_complete_title: "测试完成！",
    lbl_your_score: "你的最终得分:",
    btn_retake_quiz: "重新开始测试",
    footer_text: "LinAlgLab Interactive — 旨在提供高性能 2D 几何直观的线性代数学习体验。"
  },

  en: {
    page_title: "Linear Algebra Interactive Learning Hub | LinAlgLab Interactive",
    app_subtitle: "Linear Algebra Interactive Learning Hub",
    nav_vectors: "Vectors & Span",
    nav_matrices: "Matrix Transforms",
    nav_systems: "Systems & Elimination",
    nav_eigen: "Eigenvalues & Eigenvectors",
    nav_ortho: "Orthogonality & SVD",
    nav_quiz: "Quiz & Cheatsheet",

    hero_title: "Understand Linear Algebra Through Geometry, Relationships, and Change",
    hero_desc: "Explore vector spaces, linear combinations, 2D matrix transformations, determinants, eigenvectors, Gram-Schmidt orthogonalization, and Singular Value Decomposition (SVD) with real-time interactive canvases, bilingual explanations, and IPA.",
    stat_modules: "Core Modules",
    stat_simulators: "2D Live Canvases",
    stat_quiz: "Practice Questions",
    feedback_title: "Questions & Feedback",
    feedback_email_label: "Email",
    feedback_github_label: "GitHub",
    title_feedback_toggle: "Open questions and feedback panel",
    aria_feedback_toggle: "Open questions and feedback panel",
    title_feedback_close: "Close questions and feedback panel",
    aria_feedback_close: "Close questions and feedback panel",

    m1_badge: "Module 1",
    m1_title: "Vectors, Linear Combinations, Span & Independence",
    m1_subtitle: "Understand how vectors add, scale, and span 2D space, and visualize when vectors become linearly dependent.",
    t_vec_title: "Vectors & Linear Combinations",
    t_vec_name: "Vector:",
    t_vec_desc: "An object with magnitude and direction, represented as an arrow in space.",
    t_lincomb_name: "Linear Combination:",
    t_lincomb_desc: "Sum of scalar multiples of vectors: c₁u + c₂v.",
    t_span_title: "Span & Linear Independence",
    t_span_name: "Span:",
    t_span_desc: "The set of all possible linear combinations formed by a set of vectors.",
    t_indep_name: "Linear Independence:",
    t_indep_desc: "No vector in the set can be written as a linear combination of the others (c₁u + c₂v = 0 iff c₁=c₂=0).",
    t_subspace_title: "Subspace, Basis & Dimension",
    t_subspace_name: "Subspace:",
    t_subspace_desc: "A subset containing 0, closed under vector addition and scalar multiplication.",
    t_basis_dim_name: "Basis & Dimension:",
    t_basis_dim_desc: "A basis is a minimal spanning linearly independent set. Dimension is the number of basis vectors.",

    sim_span_title: "2D Vector Span & Linear Independence Simulator",
    sim_span_desc: "Drag vector arrowheads on canvas or adjust sliders to see if Span covers ℝ² or collapses into a line!",
    lbl_vec_u: "Vector u:",
    lbl_vec_v: "Vector v:",
    lbl_lincomb_weights: "Linear Combination Multipliers (c₁, c₂):",
    btn_make_collinear: "Set Vectors Collinear (Force Dependent)",
    canvas_drag_hint: "💡 Drag vector tips on canvas",

    m2_badge: "Module 2",
    m2_title: "Matrices as Linear Transformations & Determinants",
    m2_subtitle: "Visualize how a 2x2 matrix moves, skews, and rotates space, and discover why Determinant equals area scaling factor.",
    t_matrix_title: "Linear Transformations",
    t_transform_name: "Linear Transformation:",
    t_transform_desc: "A mapping that preserves grid lines (lines remain lines, origin remains fixed).",
    t_basis_transform_desc: "Columns of Matrix = Transformed Basis Vectors:",
    t_det_rank_title: "Determinant, Rank & Nullspace",
    t_det_name: "Determinant:",
    t_det_desc: "The factor by which a transformation scales areas (det(A) = ad - bc).",
    t_rank_null_name: "Rank & Nullspace:",
    t_rank_null_desc: "Rank is dimension of output space; Nullspace is all vectors that collapse to origin.",
    t_inverse_title: "Composition & Inverse Matrix",
    t_comp_name: "Matrix Multiplication Composition:",
    t_comp_desc: "BA applies transformation A first, then B. Note BA ≠ AB (non-commutative).",
    t_inv_name: "Inverse Matrix:",
    t_inv_desc: "Undoes the transformation. Exists iff det(A) ≠ 0.",

    sim_transform_title: "2D Matrix Transformation & Determinant Explorer",
    sim_transform_desc: "Adjust matrix parameters or click presets to view coordinate grid warping and unit square transformation.",
    lbl_transform_matrix: "Matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$:",
    lbl_preset_transforms: "Preset Linear Transformations:",
    preset_transform_identity: "Identity",
    preset_transform_rotation: "Rotation (45°)",
    preset_transform_shear: "Horizontal Shear",
    preset_transform_scale: "Scaling (2x, 0.5x)",
    preset_transform_singular: "Singular (Rank 1)",
    preset_transform_reflection: "Reflection (Y-axis)",
    lbl_transform_determinant: "$\\det(A) = ad - bc =$:",
    lbl_transform_trace: "$\\text{Trace}(A) = a + d =$:",
    lbl_transform_rank: "$\\text{Rank}(A) =$:",
    sim_composition_title: "Matrix Composition Lab: See Multiplication as Two Transformations",
    sim_composition_desc: "Set two independent 2×2 matrices, then compare the geometric stages of applying them in either order.",
    lbl_comp_matrix_a: "First matrix A:",
    lbl_comp_matrix_b: "Second matrix B:",
    lbl_comp_order: "Application order:",
    btn_comp_ba: "A → B (BA)",
    btn_comp_ab: "B → A (AB)",
    lbl_comp_presets: "Preset pairs:",
    preset_comp_rotate_shear: "Rotation → Shear",
    preset_comp_shear_scale: "Shear → Scale",
    preset_comp_noncommuting: "Non-commuting pair",
    preset_comp_commuting: "Commuting scales",
    lbl_comp_product: "Current product:",
    lbl_comp_derivation: "Row × Column Derivation",
    comp_derivation_hint: "Each result entry is one row of the left matrix dotted with one column of the right matrix.",
    aria_composition_order: "Matrix composition application order",
    aria_composition_canvas: "Three-stage matrix composition canvas",
    sim_inverse_title: "2D Inverse Transformation & Invertibility Lab",
    sim_inverse_desc: "Apply a matrix, then test whether a unique inverse can restore the plane and the unit square.",
    lbl_inverse_matrix: "Matrix A:",
    lbl_inverse_presets: "Preset transformations:",
    preset_inverse_identity: "Identity",
    preset_inverse_rotation: "90° rotation",
    preset_inverse_shear: "Shear",
    preset_inverse_reflection: "Reflection",
    preset_inverse_singular: "Singular collapse",
    lbl_inverse_determinant: "Determinant:",
    lbl_inverse_derivation: "Inverse Formula & Verification",
    inverse_formula: "A⁻¹ = 1 / det(A) · [[d, −b], [−c, a]]",
    lbl_inverse_adjugate: "Adjugate part",
    lbl_inverse_result: "Inverse matrix",
    aria_inverse_canvas: "Three-stage inverse transformation canvas",

    m_systems_badge: "Module 3",
    m_systems_title: "Linear Systems, Rank & Gaussian Elimination",
    m_systems_subtitle: "Use 2D lines, augmented matrices, and row operations to distinguish unique, no, and infinitely many solutions.",
    t_systems_geometry: "Geometry of Linear Systems",
    t_systems_geometry_desc: "Each two-variable linear equation is a line; their intersection satisfies both equations.",
    t_systems_rref: "Gauss-Jordan Elimination",
    t_systems_rref_desc: "Use row swaps, scaling, and replacement to reduce an augmented matrix to RREF.",
    t_systems_rank: "Rank & Solution Classification",
    t_systems_rank_desc: "Different ranks for A and [A|b] mean no solution; equal ranks give a unique solution only when they match the number of unknowns.",
    sim_systems_title: "2×2 Linear Systems & RREF Laboratory",
    sim_systems_desc: "Change coefficients and follow how lines, the augmented matrix, and row operations determine the solution type.",
    lbl_system_coefficients: "Coefficient Matrix A and Constant Vector b:",
    lbl_system_equations: "Equations:",
    lbl_system_augmented: "Current Augmented Matrix:",
    lbl_system_operation: "Current Row Operation:",
    lbl_rank_a: "rank(A):",
    lbl_rank_augmented: "rank([A|b]):",
    btn_system_next: "Next Step",
    btn_system_auto: "Auto Complete",
    btn_system_reset: "Reset Steps",
    btn_system_unique: "Unique Solution",
    btn_system_inconsistent: "No Solution",
    btn_system_infinite: "Infinite Solutions",

    m3_badge: "Module 4",
    m3_title: "Eigenvalues, Eigenvectors & Diagonalization",
    m3_subtitle: "Discover vectors that do not change direction during transformation (Av = λv) and explore spectral decomposition.",
    t_eigen_title: "Eigenvalues & Eigenvectors",
    t_eigen_name: "Eigenvalue & Eigenvector:",
    t_eigen_desc: "A non-zero vector v is an eigenvector if Av is a scalar multiple of v (Av = λv).",
    t_char_eq_name: "Characteristic Equation:",
    t_diag_title: "Diagonalization & Spectral Theorem",
    t_diag_name: "Diagonalization:",
    t_diag_desc: "Factoring matrix A into eigenvector basis P and diagonal matrix D: A = PDP⁻¹.",
    t_spectral_name: "Spectral Theorem:",
    t_spectral_desc: "Every real symmetric matrix (A = Aᵀ) can be orthogonally diagonalized as A = QDQᵀ, with only real eigenvalues.",
    t_mult_pca_title: "Multiplicity & PCA Connection",
    t_mult_name: "Algebraic vs Geometric Multiplicity:",
    t_mult_desc: "Algebraic is root multiplicity in characteristic eq; Geometric is dim of eigenspace Null(A-λI).",
    t_pca_name: "PCA Principal Component Analysis:",
    t_pca_desc: "Principal components are eigenvectors of covariance C = (1/n)XᵀX, pointing in max variance direction.",

    sim_eigen_title: "Eigenvector & Eigenvalue Interactive Probe",
    sim_eigen_desc: "Rotate probe vector x using slider or trigger 360° Auto-Sweep. When x and Ax align on the same line, you found an Eigenvector!",
    lbl_probe_angle: "Probe Vector Angle (θ):",
    btn_snap_eigen: "Snap Eigenvector",
    btn_auto_sweep: "360° Auto Sweep",

    m4_badge: "Module 5",
    m4_title: "Orthogonality, Projection, QR, PCA & SVD",
    m4_subtitle: "Master the geometry of orthogonal projection, QR, least squares, PCA dimensionality reduction, and Singular Value Decomposition.",
    t_proj_title: "Dot Product & Projection",
    t_dot_name: "Dot Product & Orthogonality:",
    t_dot_desc: "Vectors u, v are orthogonal (perpendicular) iff u · v = 0.",
    t_proj_name: "Orthogonal Projection:",
    t_proj_desc: "The shadow of vector v onto line spanned by u.",
    t_svd_title: "Gram-Schmidt, QR & SVD",
    t_gs_name: "Gram-Schmidt & QR:",
    t_gs_desc: "Converting vectors into orthonormal basis Q. Matrix form: A = QR.",
    t_svd_name: "Singular Value Decomposition (SVD):",
    t_svd_desc: "Factoring any matrix A = U Σ Vᵀ into Rotation × Scaling × Rotation.",
    t_least_squares_title: "Least Squares & Pseudo-Inverse",
    t_ls_name: "Least Squares Approximation:",
    t_ls_desc: "Solving inconsistent Ax = b by projecting b onto Col(A): AᵀA x̂ = Aᵀb.",
    t_pinv_name: "Moore-Penrose Pseudo-Inverse:",
    t_pinv_desc: "A⁺ = V Σ⁺ Uᵀ, generalizes inverse to non-square matrices.",

    sim_proj_title: "1. Vector Projection & Orthogonal Decomposition",
    sim_proj_desc: "Drag vector endpoints on canvas to observe orthogonal projection proj_u(v) and orthogonal complement v^⊥.",
    sim_qr_title: "2. Gram-Schmidt & QR Decomposition Laboratory",
    sim_qr_desc: "Drag two source vectors and follow normalization, projection subtraction, and QR assembly step by step.",
    lbl_qr_vec_u: "First column vector u:",
    lbl_qr_vec_v: "Second column vector v:",
    lbl_qr_norm_u: "‖u‖ =",
    lbl_qr_projection_coeff: "r₁₂ = q₁ · v =",
    lbl_qr_residual_norm: "‖u₂‖ =",
    lbl_qr_qtq: "QᵀQ:",
    lbl_qr_r: "Upper-triangular R:",
    lbl_qr_reconstruction: "Reconstructed QR:",
    btn_qr_next: "Next Step",
    btn_qr_auto: "Auto Complete",
    btn_qr_reset: "Reset Steps",
    btn_qr_default: "General Vectors",
    btn_qr_orthogonal: "Already Orthogonal",
    btn_qr_dependent: "Linearly Dependent",
    qr_drag_hint: "💡 Drag either source vector to restart the QR steps",
    sim_regression_title: "3. Least-Squares Linear Regression Laboratory",
    sim_regression_desc: "Drag five data points to see how the fitted line, residuals, and normal equation change.",
    lbl_regression_model: "Fitted Model:",
    lbl_regression_sse: "Residual Sum of Squares (SSE):",
    lbl_regression_r2: "Coefficient of Determination (R²):",
    lbl_regression_normal: "Normal Equation AᵀAθ = Aᵀy:",
    regression_drag_hint: "💡 Drag any point to refit the line",
    btn_regression_reset: "Reset Data",
    btn_regression_positive: "Positive Trend",
    btn_regression_negative: "Negative Trend",
    btn_regression_outlier: "Outlier",
    sim_pca_title: "4. PCA Dimensionality-Reduction Laboratory",
    sim_pca_desc: "Drag six 2D points to inspect centered covariance axes and their 1D projection onto the first principal component.",
    lbl_pca_mean: "Mean μ:",
    lbl_pca_covariance: "Covariance Matrix C:",
    lbl_pca_eigenvalues: "Eigenvalues:",
    lbl_pca_explained: "Explained Variance (PC₁ / PC₂):",
    lbl_pca_direction: "First Principal Direction:",
    btn_pca_default: "Diagonal Data",
    btn_pca_horizontal: "Horizontal Direction",
    btn_pca_vertical: "Vertical Direction",
    btn_pca_outlier: "Outlier",
    btn_pca_zero: "Near-Zero Variance",
    pca_drag_hint: "💡 Drag any point to recompute PCA",
    aria_pca_canvas: "PCA two-dimensional scatter plot and first-component projection canvas",
    title_pca_default: "Load the default diagonal data",
    title_pca_horizontal: "Load data with a horizontal principal direction",
    title_pca_vertical: "Load data with a vertical principal direction",
    title_pca_outlier: "Load data with an outlier",
    title_pca_zero: "Load near-zero-variance data",
    sim_svd_title: "5. Singular Value Decomposition (SVD) Visualizer",
    sim_svd_desc: "Observe how A = U Σ Vᵀ transforms unit circle step-by-step: Vᵀ Rotation → Σ Scaling → U Rotation.",
    lbl_svd_step: "Decomposition Step View:",
    lbl_sigma_1: "Singular Value σ₁ =",
    lbl_sigma_2: "Singular Value σ₂ =",

    theme_light: "Light mode",
    theme_dark: "Dark mode",
    title_theme: "Toggle light/dark theme",
    title_ipa: "Toggle IPA phonetics and pronunciation",
    ipa_on: "IPA: ON",
    ipa_off: "IPA: OFF",

    m5_badge: "Module 6",
    m5_title: "Linear Algebra Quiz & Formula Cheatsheet",
    m5_subtitle: "Test your linear algebra knowledge with 15 practice questions or review key formulas, SVD intuitions, and common pitfalls.",
    sub_quiz: "15-Question Quiz",
    sub_cheatsheet: "Formula Cheatsheet",
    quiz_explanation: "Explanation",
    cheat_matrix_ops_title: "Matrix Operations & Properties",
    cheat_determinant_properties: "Determinant Properties:",
    cheat_trace_properties: "Trace Properties:",
    cheat_rank_nullity_title: "Rank-Nullity Theorem:",
    cheat_rank_nullity_formula: "$$\\text{Rank}(A) + \\text{Nullity}(A) = n \\quad (\\text{for } m \\times n \\text{ matrix } A)$$",
    cheat_subspaces_title: "Four Fundamental Subspaces",
    cheat_subspaces_theorem: "Strang's Fundamental Subspaces Theorem:",
    cheat_subspaces_column: "1. Column Space",
    cheat_subspaces_column_desc: "Dim = $r$, subspace of $\\mathbb{R}^m$.",
    cheat_subspaces_null: "2. Nullspace",
    cheat_subspaces_null_desc: "Dim = $n-r$, subspace of $\\mathbb{R}^n$. $\\text{Null}(A) \\perp \\text{Row}(A)$.",
    cheat_subspaces_row: "3. Row Space",
    cheat_subspaces_row_desc: "Dim = $r$, subspace of $\\mathbb{R}^n$.",
    cheat_subspaces_left_null: "4. Left Nullspace",
    cheat_subspaces_left_null_desc: "Dim = $m-r$, subspace of $\\mathbb{R}^m$. $\\text{Null}(A^T) \\perp \\text{Col}(A)$.",
    cheat_pd_title: "Positive Definite Matrix",
    cheat_pd_name: "Positive Definite",
    cheat_pd_desc: "A real symmetric matrix $A$ is positive definite ($A \\succ 0$) iff any of the following equivalent conditions holds:",
    cheat_pd_condition_1: "1. $\\mathbf{x}^T A \\mathbf{x} > 0$ for every non-zero vector $\\mathbf{x} \\neq \\mathbf{0}$.",
    cheat_pd_condition_2: "2. All eigenvalues $\\lambda_i > 0$ are strictly positive.",
    cheat_pd_condition_3: "3. All leading principal minors are strictly positive ($\\det(A_k) > 0$).",
    cheat_pd_condition_4: "4. A Cholesky factorization exists: $A = L L^T$.",
    cheat_svd_title: "Singular Value Decomposition (SVD)",
    cheat_svd_name: "Singular Value Decomposition",
    cheat_svd_intro: "For any $m \\times n$ matrix $A$:",
    cheat_svd_u: "$U$: $m \\times m$ orthogonal matrix of left singular vectors (eigenvectors of $A A^T$).",
    cheat_svd_sigma: "$\\Sigma$: $m \\times n$ diagonal matrix of singular values $\\sigma_i = \\sqrt{\\lambda_i(A^T A)}$.",
    cheat_svd_v: "$V$: $n \\times n$ orthogonal matrix of right singular vectors (eigenvectors of $A^T A$).",
    cheat_least_squares_title: "Least Squares & PCA Applications",
    cheat_normal_equations: "Normal Equations:",
    cheat_projection_matrix: "Projection matrix onto $\\text{Col}(A)$: $P = A(A^T A)^{-1}A^T$.",
    cheat_pca_name: "PCA (Principal Component Analysis):",
    cheat_pca_desc: "Sample covariance $C = \\frac{1}{n} X^T X$. Applying SVD to the centered data matrix $X = U \\Sigma V^T$ gives right singular vectors $V$ as the principal directions.",
    cheat_pitfalls_title: "Common Linear Algebra Pitfalls",
    cheat_pitfall_1_title: "Pitfall 1: Matrix Multiplication is Non-Commutative!",
    cheat_pitfall_1_desc: "$AB \\neq BA$ in general. $(AB)^T = B^T A^T$ and $(AB)^{-1} = B^{-1}A^{-1}$.",
    cheat_pitfall_2_title: "Pitfall 2: Eigenvalue vs. Singular Value—what is the difference?",
    cheat_pitfall_2_desc: "Eigenvalues apply only to square matrices and can be complex or negative. Singular values apply to any rectangular matrix and are always non-negative real numbers $\\sigma_i \\ge 0$.",
    btn_prev: "Previous",
    btn_next: "Next Question",
    quiz_complete_title: "Quiz Complete!",
    lbl_your_score: "Your Final Score:",
    btn_retake_quiz: "Retake Quiz",
    footer_text: "LinAlgLab Interactive — High-performance 2D Canvas Linear Algebra Learning Hub."
  }
};

// ==========================================================================
// 4. Extended 15-Question Quiz Dataset
// ==========================================================================
const quizQuestions = [
  // Module 1: Vectors & Span
  {
    category: { zh: "模块 1：向量与 Span", en: "Module 1: Vectors & Span" },
    question: {
      zh: "对于 2D 平面上的两个向量 u 和 v，当它们满足什么条件时，它们的 Span(u, v) 退化为一条 1D 直线而非整个 2D 平面？",
      en: "For two 2D vectors u and v, under what condition does Span(u, v) collapse into a 1D line instead of the full 2D plane?"
    },
    options: [
      { zh: "A. 向量 u 和 v 的长度均为 1", en: "A. Both vectors u and v have unit length 1" },
      { zh: "B. 向量 u 和 v 线性相关（即共线，存在 c 使得 v = c·u）", en: "B. Vectors u and v are linearly dependent (collinear, v = c·u)" },
      { zh: "C. 向量 u 和 v 点积等于零（相互正交）", en: "C. The dot product u · v = 0 (orthogonal)" },
      { zh: "D. 向量 u 和 v 夹角等于 90 度", en: "D. The angle between u and v is 90 degrees" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。当向量 u 和 v 线性相关（共线）时，它们的行列式 det([u v]) = 0，任何线性组合 c₁u + c₂v 都只能落在一条直线上，导致 Span 从 2D 降维至 1D。",
      en: "Correct answer is B. When u and v are linearly dependent (collinear), det([u v]) = 0, so any linear combination stays on the same line."
    }
  },
  {
    category: { zh: "模块 1：子空间与维数", en: "Module 1: Subspace & Dim" },
    question: {
      zh: "下列哪一个是 ℝ² 的合法子空间 (Subspace)？",
      en: "Which of the following is a valid Subspace of ℝ²?"
    },
    options: [
      { zh: "A. 满足 x + y = 1 的直线集合", en: "A. The set of points satisfying line x + y = 1" },
      { zh: "B. 穿过原点的直线 y = 2x 的全体点集合", en: "B. The set of points on line y = 2x passing through origin" },
      { zh: "C. 第一象限中的所有向量 (x ≥ 0, y ≥ 0)", en: "C. All vectors in the first quadrant (x ≥ 0, y ≥ 0)" },
      { zh: "D. 单位圆周上的所有向量集合 (x² + y² = 1)", en: "D. All vectors on the unit circle (x² + y² = 1)" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。子空间必须包含零向量，且对向量加法和标量乘法封闭。选项 B 穿过原点且封闭；而 A 不含原点，C 对标量乘负数不封闭，D 对加法不封闭。",
      en: "Correct answer is B. A subspace must contain the origin zero vector and be closed under vector addition and scalar multiplication."
    }
  },
  {
    category: { zh: "模块 1：基与维度", en: "Module 1: Basis & Dim" },
    question: {
      zh: "关于向量空间的基 (Basis)，下列说法错误的是？",
      en: "Which statement about the Basis of a vector space is FALSE?"
    },
    options: [
      { zh: "A. 基既是张成空间的集合，又是线性无关的集合", en: "A. A basis is both a spanning set and linearly independent" },
      { zh: "B. 一个 n 维向量空间的所有基中，基向量的个数一定全相等，均等于 n", en: "B. Any basis for an n-dimensional space must have exactly n vectors" },
      { zh: "C. 空间中任意向量在给定基下的坐标表示是唯一确定的", en: "C. Coordinates of any vector relative to a given basis are unique" },
      { zh: "D. 一个向量空间有且仅有一组固定的基", en: "D. A vector space has one and only one unique basis" }
    ],
    answer: 3,
    explanation: {
      zh: "正确答案是 D。一个向量空间可以有无数多组不同的基（只要满足线性无关且能张成空间），标准基只是其中一组特殊的基。",
      en: "Correct answer is D. A vector space has infinitely many choices of bases, not just one unique basis."
    }
  },

  // Module 2: Matrix Transforms & Determinants
  {
    category: { zh: "模块 2：行列式几何含义", en: "Module 2: Determinant" },
    question: {
      zh: "关于 2×2 矩阵的行列式 det(A) 的几何含义，下列说法正确的是？",
      en: "What is the geometric meaning of the determinant det(A) of a 2x2 matrix?"
    },
    options: [
      { zh: "A. 代表线性变换后原点移动的距离", en: "A. The distance the origin moves under transformation" },
      { zh: "B. 代表单位正方形在变换后所形成平行四边形的面积缩放倍数", en: "B. The scaling factor of area for a region transformed by matrix A" },
      { zh: "C. 代表特征值的算术平均数", en: "C. The arithmetic average of all eigenvalues" },
      { zh: "D. 代表矩阵转置后的迹 (Trace)", en: "D. The trace of the transpose of matrix A" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。行列式 det(A) 表示线性变换对面积（2D）或体积（3D）的缩放倍数。如果 det(A) = 0，说明变换将空间压缩到了更低维度（如点或线）。",
      en: "Correct answer is B. Determinant measures the factor by which area (2D) or volume (3D) is scaled under linear transformation."
    }
  },
  {
    category: { zh: "模块 2：逆矩阵与奇异性", en: "Module 2: Inverse Matrix" },
    question: {
      zh: "若 2x2 矩阵 A 的行列式 det(A) = 0，则下列结论不正确的是？",
      en: "If det(A) = 0 for a 2x2 matrix A, which statement is NOT true?"
    },
    options: [
      { zh: "A. 矩阵 A 不存在逆矩阵 A⁻¹", en: "A. Matrix A does not have an inverse A⁻¹" },
      { zh: "B. 矩阵 A 的列向量组线性相关", en: "B. The columns of A are linearly dependent" },
      { zh: "C. 齐次线性方程组 Ax = 0 仅有唯一零解 x = 0", en: "C. The system Ax = 0 has only the unique trivial solution x = 0" },
      { zh: "D. 矩阵 A 的秩 Rank(A) < 2", en: "D. The rank of A is strictly less than 2" }
    ],
    answer: 2,
    explanation: {
      zh: "正确答案是 C。当 det(A) = 0 时，矩阵非满秩，Nullspace 包含非零向量，因此 Ax = 0 存在无穷多非零解，而不是唯一零解。",
      en: "Correct answer is C. When det(A) = 0, the nullspace contains non-zero vectors, so Ax = 0 has infinitely many solutions."
    }
  },
  {
    category: { zh: "模块 2：矩阵复合乘法", en: "Module 2: Matrix Composition" },
    question: {
      zh: "设 R 是旋转 90 度的变换矩阵，S 是水平剪切矩阵，计算复合矩阵 M = S·R。在对向量 x 进行变换时，变换的实际执行顺序是？",
      en: "Let R be rotation matrix and S be shear matrix. In product M = S·R acting on x (M·x = S·R·x), which transform applies FIRST?"
    },
    options: [
      { zh: "A. 先应用旋转 R，再应用剪切 S", en: "A. Rotate R first, then Shear S" },
      { zh: "B. 先应用剪切 S，再应用旋转 R", en: "B. Shear S first, then Rotate R" },
      { zh: "C. 旋转 R 和剪切 S 同时并发进行", en: "C. Both apply simultaneously" },
      { zh: "D. 顺序无关紧要，因为矩阵乘法始终可交换", en: "D. Order does not matter because matrix multiplication is commutative" }
    ],
    answer: 0,
    explanation: {
      zh: "正确答案是 A。根据矩阵向量乘法结合律 M·x = S·(R·x)，最靠右紧贴向量 x 的矩阵 R 最先被应用！矩阵乘法不可交换，顺序至关重要。",
      en: "Correct answer is A. S·R·x = S(R(x)), so R is applied first to x, then S is applied to the result."
    }
  },

  // Module 4: Eigenvalues & Eigenvectors
  {
    category: { zh: "模块 4：特征值与迹/行列式", en: "Module 4: Eigenvalues" },
    question: {
      zh: "已知矩阵 A 的特征值为 λ₁ = 4 和 λ₂ = -2，则矩阵 A 的行列式 det(A) 和迹 tr(A) 分别是多少？",
      en: "Given matrix A has eigenvalues λ₁ = 4 and λ₂ = -2, what are det(A) and tr(A)?"
    },
    options: [
      { zh: "A. det(A) = 2, tr(A) = -8", en: "A. det(A) = 2, tr(A) = -8" },
      { zh: "B. det(A) = -8, tr(A) = 2", en: "B. det(A) = -8, tr(A) = 2" },
      { zh: "C. det(A) = 8, tr(A) = 6", en: "C. det(A) = 8, tr(A) = 6" },
      { zh: "D. det(A) = -6, tr(A) = -2", en: "D. det(A) = -6, tr(A) = -2" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。行列式等于特征值之积：det(A) = 4 × (-2) = -8；迹等于特征值之和：tr(A) = 4 + (-2) = 2。",
      en: "Correct answer is B. Determinant is product of eigenvalues: 4 * (-2) = -8. Trace is sum of eigenvalues: 4 + (-2) = 2."
    }
  },
  {
    category: { zh: "模块 4：逆矩阵特征值", en: "Module 4: Inverse Eigenvalue" },
    question: {
      zh: "向量 v 是矩阵 A 对应特征值 λ 的特征向量 (Av = λv)。若 A 可逆，则 v 是 A⁻¹ 的对应哪个特征值的特征向量？",
      en: "If v is an eigenvector of invertible matrix A with eigenvalue λ (Av = λv), what is the eigenvalue of v for A⁻¹?"
    },
    options: [
      { zh: "A. λ", en: "A. λ" },
      { zh: "B. -λ", en: "B. -λ" },
      { zh: "C. 1 / λ", en: "C. 1 / λ" },
      { zh: "D. λ²", en: "D. λ²" }
    ],
    answer: 2,
    explanation: {
      zh: "正确答案是 C。两边同时左乘 A⁻¹：A⁻¹Av = A⁻¹(λv) ⇒ v = λ(A⁻¹v) ⇒ A⁻¹v = (1/λ)v。特征值为 1/λ。",
      en: "Correct answer is C. Multiplying both sides of Av = λv by A⁻¹ yields v = λ A⁻¹v => A⁻¹v = (1/λ)v."
    }
  },
  {
    category: { zh: "模块 4：实对称矩阵与谱定理", en: "Module 4: Spectral Theorem" },
    question: {
      zh: "对于一个实对称矩阵 A (A = Aᵀ)，下列说法错误的是？",
      en: "For a real symmetric matrix A (A = Aᵀ), which of the following statements is FALSE?"
    },
    options: [
      { zh: "A. A 的所有特征值必定全为实数", en: "A. All eigenvalues of A are real numbers" },
      { zh: "B. 对应不同特征值的特征向量必定相互正交", en: "B. Eigenvectors corresponding to distinct eigenvalues are orthogonal" },
      { zh: "C. A 必然可以被正交对角化 (A = Q D Qᵀ)", en: "C. A can always be orthogonally diagonalized (A = Q D Qᵀ)" },
      { zh: "D. A 的行列式一定严格大于零", en: "D. The determinant of A must always be strictly positive" }
    ],
    answer: 3,
    explanation: {
      zh: "正确答案是 D。实对称矩阵保证特征值为实数且特征向量正交，但特征值可以是负数或零，因此行列式 det(A) 不一定大于零。",
      en: "Correct answer is D. Eigenvalues of symmetric matrix can be negative or zero, so det(A) is not necessarily positive."
    }
  },

  // Module 5: Orthogonality, Projection & SVD
  {
    category: { zh: "模块 5：正交投影公式", en: "Module 5: Projection" },
    question: {
      zh: "向量 v 在非零向量 u 张成直线上的正交投影 proj_u(v) 的精确计算公式是？",
      en: "What is the formula for the orthogonal projection proj_u(v) of vector v onto vector u?"
    },
    options: [
      { zh: "A. (v · u / ||u||) · u", en: "A. (v · u / ||u||) · u" },
      { zh: "B. (v · u / ||u||²) · u", en: "B. (v · u / ||u||²) · u" },
      { zh: "C. (v · u) · u", en: "C. (v · u) · u" },
      { zh: "D. (||v|| / ||u||) · u", en: "D. (||v|| / ||u||) · u" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。影长标量系数为 (v·u / ||u||)，再乘以单位方向向量 (u / ||u||)，组合起来得到 (v·u / ||u||²) · u。",
      en: "Correct answer is B. Scalar component (v·u / ||u||) multiplied by unit vector (u / ||u||) equals (v·u / ||u||²) · u."
    }
  },
  {
    category: { zh: "模块 5：SVD 奇异值与特征值", en: "Module 5: SVD Intuition" },
    question: {
      zh: "对任意 m×n 矩阵 A，SVD 分解 A = U Σ Vᵀ 中，奇异值 σ_i 与特征值有何联系？",
      en: "In SVD decomposition A = U Σ Vᵀ for an m x n matrix A, how are singular values σ_i related to eigenvalues?"
    },
    options: [
      { zh: "A. σ_i 是 A 的特征值的绝对值", en: "A. σ_i are absolute values of eigenvalues of A" },
      { zh: "B. σ_i 是 AᵀA (或 AAᵀ) 的非负特征值的算术平方根", en: "B. σ_i are the square roots of non-negative eigenvalues of AᵀA (or AAᵀ)" },
      { zh: "C. σ_i 是 A 的特征值的倒数", en: "C. σ_i are the reciprocals of eigenvalues of A" },
      { zh: "D. σ_i 与特征值没有任何关联", en: "D. σ_i have no relationship to eigenvalues" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。奇异值定义为 σ_i = √(λ_i(AᵀA))。即使 A 不是方阵，AᵀA 也是半正定的实对称方阵，其特征值必非负。",
      en: "Correct answer is B. Singular values are defined as σ_i = sqrt(λ_i(AᵀA)). AᵀA is always a symmetric positive semi-definite matrix."
    }
  },
  {
    category: { zh: "模块 5：最小二乘正规方程", en: "Module 5: Least Squares" },
    question: {
      zh: "在数据拟合中，当线性方程组 Ax = b 无解（b 不在 A 的列空间内）时，最小二乘估计解 x̂ 满足什么正规方程 (Normal Equation)？",
      en: "When system Ax = b has no exact solution, the least-squares solution x̂ satisfies which Normal Equation?"
    },
    options: [
      { zh: "A. A x̂ = b", en: "A. A x̂ = b" },
      { zh: "B. Aᵀ A x̂ = Aᵀ b", en: "B. Aᵀ A x̂ = Aᵀ b" },
      { zh: "C. A Aᵀ x̂ = b", en: "C. A Aᵀ x̂ = b" },
      { zh: "D. A⁻¹ x̂ = b", en: "D. A⁻¹ x̂ = b" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。残差向量 (b - A x̂) 必须与 A 的列空间正交，即 Aᵀ(b - A x̂) = 0 ⇒ AᵀA x̂ = Aᵀb。若 AᵀA 可逆，解为 x̂ = (AᵀA)⁻¹Aᵀb。",
      en: "Correct answer is B. The residual (b - Ax̂) must be orthogonal to Col(A), giving Aᵀ(b - Ax̂) = 0 => AᵀAx̂ = Aᵀb."
    }
  },

  // Module 6: Advanced Traps & Applications
  {
    category: { zh: "模块 6：正定矩阵判定", en: "Module 6: Positive Definite" },
    question: {
      zh: "对于实对称矩阵 A，下列哪一条不能作为判断 A 是正定矩阵 (Positive Definite) 的等价条件？",
      en: "Which of the following is NOT an equivalent condition for a real symmetric matrix A to be Positive Definite?"
    },
    options: [
      { zh: "A. 对任意非零向量 x，均有 xᵀAx > 0", en: "A. For all non-zero x, xᵀAx > 0" },
      { zh: "B. 矩阵 A 的所有特征值 λ_i > 0 严格大于零", en: "B. All eigenvalues λ_i > 0 are strictly positive" },
      { zh: "C. 矩阵 A 的迹 tr(A) > 0 且行列式 det(A) > 0", en: "C. Trace tr(A) > 0 and determinant det(A) > 0" },
      { zh: "D. 矩阵 A 的所有主子式 (Principal Leading Minors) 均严格大于零", en: "D. All leading principal minors are strictly positive" }
    ],
    answer: 2,
    explanation: {
      zh: "正确答案是 C。虽然正定矩阵的迹和行列式必定大于零，但反过来仅凭 tr(A)>0 且 det(A)>0 并不足以保证正定（例如 2x2 矩阵特征值为 3 和 -1 时，迹为 2，但行列式为 -3；若特征值为 -2 和 -4 则 det>0 且 tr<0）。注意对于 3x3 及更高维，det>0 且 tr>0 容易存在负特征值！",
      en: "Correct answer is C. Having positive trace and determinant is a necessary condition, but NOT sufficient for positive definiteness in higher dimensions."
    }
  },
  {
    category: { zh: "模块 6：PCA 与 SVD 关系", en: "Module 6: PCA & SVD" },
    question: {
      zh: "在机器学习降维算法 PCA 中，对中心化数据矩阵 X (n×d) 进行 SVD 分解 X = U Σ Vᵀ，第一主成分方向对应的是？",
      en: "In PCA algorithm, after performing SVD X = U Σ Vᵀ on centered data matrix X, the first principal component direction is:"
    },
    options: [
      { zh: "A. 左奇异矩阵 U 的第一列向量 u₁", en: "A. The first column u₁ of left singular matrix U" },
      { zh: "B. 右奇异矩阵 V 的第一列向量 v₁ (对应最大奇异值 σ₁ 的右奇异向量)", en: "B. The first column v₁ of right singular matrix V" },
      { zh: "C. 奇异值矩阵 Σ 的对角元素和", en: "C. Sum of diagonal singular values in Σ" },
      { zh: "D. 矩阵 X 的第一行数据点", en: "D. The first row vector of matrix X" }
    ],
    answer: 1,
    explanation: {
      zh: "正确答案是 B。协方差矩阵 C = (1/n)XᵀX = (1/n) V Σ² Vᵀ。右奇异向量 v₁ 即是协方差矩阵最大特征值对应的特征向量，指示数据方差最大的主要投影方向！",
      en: "Correct answer is B. Covariance matrix C = (1/n)XᵀX = V (Σ²/n) Vᵀ. The right singular vector v₁ is the eigenvector of maximum variance."
    }
  },
  {
    category: { zh: "模块 6：秩-零化度定理", en: "Module 6: Rank-Nullity" },
    question: {
      zh: "已知一个 4×7 的矩阵 A 的秩 Rank(A) = 3，则该矩阵零空间 Null(A) 的维度 (Nullity) 是多少？",
      en: "Given a 4x7 matrix A with Rank(A) = 3, what is the dimension of its Nullspace Null(A)?"
    },
    options: [
      { zh: "A. 1", en: "A. 1" },
      { zh: "B. 3", en: "B. 3" },
      { zh: "C. 4", en: "C. 4" },
      { zh: "D. 7", en: "D. 7" }
    ],
    answer: 2,
    explanation: {
      zh: "正确答案是 C。根据 Rank-Nullity 定理：Rank(A) + Nullity(A) = n（列数 n = 7）。因此 Nullity(A) = 7 - 3 = 4。",
      en: "Correct answer is C. By Rank-Nullity Theorem: Rank(A) + Nullity(A) = n (columns n = 7). Thus Nullity = 7 - 3 = 4."
    }
  }
];

// ==========================================================================
// 5. Initializers & DOM Event Wireup
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  try { initThemeToggle(); } catch (e) { console.error("Theme toggle error:", e); }
  try { initNavigation(); } catch (e) { console.error("Nav error:", e); }
  try { initBilingual(); } catch (e) { console.error("Bilingual error:", e); }
  try { initPhoneticsToggle(); } catch (e) { console.error("Phonetics error:", e); }
  try { initFeedbackWidget(); } catch (e) { console.error("Feedback widget error:", e); }
  
  // Bind declarative controls before starting independent lab modules.
  try { LinAlgLab.interactions.bind(); } catch (e) { console.error("Interaction binding error:", e); }
  try { LinAlgLab.modules.initAll({ state: appState }); } catch (e) { console.error("Lab module error:", e); }

  // Initialize Quiz module
  try { initQuizModule(); } catch (e) { console.error("Quiz module error:", e); }

  // Apply the explicit default language before KaTeX renders the translated text.
  applyLanguage(appState.lang);
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

function renderMath() {
  try {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false
      });
    }
  } catch (err) {
    console.warn("KaTeX renderMath warning:", err);
  }
}

function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    refreshThemeControl();
    redrawAllCanvases();
  });
}

function refreshThemeControl() {
  const isLight = appState.theme === 'light';
  const button = document.getElementById('themeToggleBtn');
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  document.body.classList.toggle('light-mode', isLight);
  document.body.classList.toggle('dark-mode', !isLight);
  if (label) label.textContent = i18n[appState.lang][isLight ? 'theme_dark' : 'theme_light'];
  if (icon) icon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
  if (button) button.title = i18n[appState.lang].title_theme;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function redrawAllCanvases() {
  LinAlgLab.modules.redrawAll();
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  initNavScroller();
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const subtabBtns = document.querySelectorAll('.sub-tab-btn');
  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtabId = btn.getAttribute('data-subtab');
      switchSubtab(subtabId);
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

function switchTab(tabId) {
  appState.activeTab = tabId;
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
  const activePanel = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) activePanel.classList.add('active');
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  setTimeout(() => {
    if (tabId === 'vectors') LinAlgLab.modules.redraw('span');
    if (tabId === 'matrices') {
      LinAlgLab.modules.redraw('transform');
      LinAlgLab.modules.redraw('composition');
      LinAlgLab.modules.redraw('inverse');
    }
    if (tabId === 'systems') LinAlgLab.modules.redraw('systems');
    if (tabId === 'eigen') LinAlgLab.modules.redraw('eigen');
    if (tabId === 'orthogonality') {
      LinAlgLab.modules.redraw('projection');
      LinAlgLab.modules.redraw('qr');
      LinAlgLab.modules.redraw('regression');
      LinAlgLab.modules.redraw('pca');
      LinAlgLab.modules.redraw('svd');
    }
  }, 50);
}

function switchSubtab(subtabId) {
  appState.activeSubtab = subtabId;
  document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));

  const activeBtn = document.querySelector(`.sub-tab-btn[data-subtab="${subtabId}"]`);
  const activeContent = document.getElementById(subtabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');
}

function initBilingual() {
  const langBtn = document.getElementById('langToggleBtn');
  if (!langBtn) return;
  langBtn.addEventListener('click', () => {
    appState.lang = appState.lang === 'zh' ? 'en' : 'zh';
    applyLanguage(appState.lang);
  });
}

function applyLanguage(lang = appState.lang) {
  appState.lang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = i18n[lang].page_title;
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = lang === 'zh' ? '中 / EN' : 'EN / 中';

  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (i18n[lang][key]) el.title = i18n[lang][key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (i18n[lang][key]) el.setAttribute('aria-label', i18n[lang][key]);
  });

  refreshThemeControl();
  refreshPhoneticsControl();
  LinAlgLab.modules.refreshAll();

  renderQuizQuestion();
  renderMath();
}

function updateLanguageTexts() {
  applyLanguage(appState.lang);
}

function initPhoneticsToggle() {
  const toggleBtn = document.getElementById('phoneticToggleBtn');
  const label = document.getElementById('phoneticLabel');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    appState.showIPA = !appState.showIPA;
    refreshPhoneticsControl();
  });
}

function refreshPhoneticsControl() {
  const button = document.getElementById('phoneticToggleBtn');
  const label = document.getElementById('phoneticLabel');
  document.body.classList.toggle('show-ipa', appState.showIPA);
  if (button) { button.classList.toggle('active', appState.showIPA); button.title = i18n[appState.lang].title_ipa; }
  if (label) label.textContent = i18n[appState.lang][appState.showIPA ? 'ipa_on' : 'ipa_off'];
}

// Interactive canvas experiments are implemented in linear-algebra/modules/.
// ==========================================================================
// 6. Interactive Quiz Module Engine
// ==========================================================================
function initQuizModule() {
  renderQuizQuestion();

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

  document.getElementById('retakeQuizBtn').addEventListener('click', () => {
    appState.quiz.currentIndex = 0;
    appState.quiz.score = 0;
    appState.quiz.userAnswers = [];
    document.getElementById('quizCard').classList.remove('hidden');
    document.getElementById('quizResultsCard').classList.add('hidden');
    renderQuizQuestion();
  });
}

function renderQuizQuestion() {
  const index = appState.quiz.currentIndex;
  const q = quizQuestions[index];
  if (!q) return;
  const lang = appState.lang;

  document.getElementById('questionNum').textContent =
    lang === 'zh' ? `第 ${index + 1} / ${quizQuestions.length} 题` : `Question ${index + 1} of ${quizQuestions.length}`;
  document.getElementById('questionCategory').textContent = q.category[lang];
  document.getElementById('liveScoreBadge').textContent =
    lang === 'zh' ? `得分: ${appState.quiz.score} / 100` : `Score: ${appState.quiz.score} / 100`;

  document.getElementById('questionText').textContent = q.question[lang];

  const progressPercent = ((index + 1) / quizQuestions.length) * 100;
  document.getElementById('quizProgressBar').style.width = `${progressPercent}%`;

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';

  const userAnswer = appState.quiz.userAnswers[index];

  q.options.forEach((opt, optIndex) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt[lang];

    if (userAnswer !== undefined) {
      if (optIndex === q.answer) {
        btn.classList.add('correct');
      } else if (optIndex === userAnswer) {
        btn.classList.add('incorrect');
      }
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => selectAnswer(optIndex));
    }

    grid.appendChild(btn);
  });

  const expBox = document.getElementById('explanationBox');
  if (userAnswer !== undefined) {
    expBox.classList.remove('hidden');
    document.getElementById('expText').textContent = q.explanation[lang];
  } else {
    expBox.classList.add('hidden');
  }

  document.getElementById('prevQuestionBtn').disabled = index === 0;
  const nextBtn = document.getElementById('nextQuestionBtn');
  nextBtn.disabled = userAnswer === undefined;
}

function selectAnswer(selectedIndex) {
  const index = appState.quiz.currentIndex;
  const q = quizQuestions[index];

  appState.quiz.userAnswers[index] = selectedIndex;

  if (selectedIndex === q.answer) {
    appState.quiz.score += Math.round(100 / quizQuestions.length);
  }

  renderQuizQuestion();
}

function showQuizResults() {
  document.getElementById('quizCard').classList.add('hidden');
  const resultsCard = document.getElementById('quizResultsCard');
  resultsCard.classList.remove('hidden');

  document.getElementById('finalScoreVal').textContent = `${appState.quiz.score} / 100`;

  const breakdownBox = document.getElementById('scoreBreakdownBox');
  breakdownBox.innerHTML = '';

  const moduleScores = {};
  quizQuestions.forEach((q, i) => {
    const cat = q.category[appState.lang];
    if (!moduleScores[cat]) moduleScores[cat] = { correct: 0, total: 0 };
    moduleScores[cat].total++;
    if (appState.quiz.userAnswers[i] === q.answer) moduleScores[cat].correct++;
  });

  Object.keys(moduleScores).forEach(cat => {
    const data = moduleScores[cat];
    const card = document.createElement('div');
    card.className = 'breakdown-card';
    card.innerHTML = `
      <div class="breakdown-title">${cat}</div>
      <div class="breakdown-score">${data.correct} / ${data.total} (${Math.round((data.correct/data.total)*100)}%)</div>
    `;
    breakdownBox.appendChild(card);
  });
}
