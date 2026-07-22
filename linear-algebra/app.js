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
    app_subtitle: "线性代数交互学习与面试中心",
    nav_vectors: "向量与空间",
    nav_matrices: "矩阵与线性变换",
    nav_eigen: "特征值与特征向量",
    nav_ortho: "正交性与 SVD",
    nav_quiz: "测试与面试速查",

    hero_title: "通过直观几何与交互仿真，彻底掌握线性代数",
    hero_desc: "深入探索向量空间、张成空间 (Span)、2D 矩阵线性变换、行列式的几何面积缩放、特征值/特征向量探针、Gram-Schmidt 正交化与奇异值分解 (SVD)。内置中英双语、IPA 面试音标与发音辅助！",
    stat_modules: "核心知识模块",
    stat_simulators: "2D 动态画布",
    stat_quiz: "面试题库数量",

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
    lbl_preset_transforms: "预设常见线性变换:",

    m3_badge: "模块 3",
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

    m4_badge: "模块 4",
    m4_title: "正交性、投影、Gram-Schmidt 正交化与 SVD",
    m4_subtitle: "掌握向量点积、正交投影、最小二乘法几何直观与奇异值分解 (SVD)。",
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
    sim_svd_title: "2. 奇异值分解 (SVD) 几何步骤分解探索器",
    sim_svd_desc: "观察矩阵 A = U Σ Vᵀ 变换单位圆的完整几何三步走：Vᵀ 旋转 → Σ 轴向拉伸 → U 旋转。",
    lbl_svd_step: "分解步骤分解视图:",

    m5_badge: "模块 5",
    m5_title: "线性代数交互测试与面试速查",
    m5_subtitle: "检验你对特征向量、SVD、行列式与正定矩阵的掌握情况，速查高频面试考点。",
    sub_quiz: "15 题面试测验",
    sub_cheatsheet: "面试速查手册",
    btn_prev: "上一题",
    btn_next: "下一题",
    quiz_complete_title: "测试完成！",
    lbl_your_score: "你的最终得分:",
    btn_retake_quiz: "重新开始测试",
    footer_text: "LinAlgLab Interactive — 旨在提供高性能 2D 几何直观的线性代数学习与面试体验。"
  },

  en: {
    app_subtitle: "Linear Algebra Learning & Interview Hub",
    nav_vectors: "Vectors & Span",
    nav_matrices: "Matrix Transforms",
    nav_eigen: "Eigenvalues & Eigenvectors",
    nav_ortho: "Orthogonality & SVD",
    nav_quiz: "Quiz & Cheatsheet",

    hero_title: "Master Linear Algebra Geometrically & Interactively",
    hero_desc: "Explore vector spaces, linear combinations, 2D matrix transformations, determinants, eigenvectors, Gram-Schmidt orthogonalization, and Singular Value Decomposition (SVD) with real-time interactive canvases, bilingual explanations, and IPA interview audio aids.",
    stat_modules: "Core Modules",
    stat_simulators: "2D Live Canvases",
    stat_quiz: "Interview Questions",

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
    lbl_preset_transforms: "Preset Linear Transformations:",

    m3_badge: "Module 3",
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

    m4_badge: "Module 4",
    m4_title: "Orthogonality, Projection, Gram-Schmidt & SVD",
    m4_subtitle: "Master dot products, orthogonal projections, least squares approximations, and Singular Value Decomposition.",
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
    sim_svd_title: "2. Singular Value Decomposition (SVD) Visualizer",
    sim_svd_desc: "Observe how A = U Σ Vᵀ transforms unit circle step-by-step: Vᵀ Rotation → Σ Scaling → U Rotation.",
    lbl_svd_step: "Decomposition Step View:",

    m5_badge: "Module 5",
    m5_title: "Linear Algebra Quiz & Interview Cheatsheet",
    m5_subtitle: "Test your linear algebra knowledge with 15 interview-style questions or review key formulas, SVD intuitions, and traps.",
    sub_quiz: "15-Question Quiz",
    sub_cheatsheet: "Interview Cheatsheet",
    btn_prev: "Previous",
    btn_next: "Next Question",
    quiz_complete_title: "Quiz Complete!",
    lbl_your_score: "Your Final Score:",
    btn_retake_quiz: "Retake Quiz",
    footer_text: "LinAlgLab Interactive — High-performance 2D Canvas Linear Algebra Learning & Interview Hub."
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

  // Module 3: Eigenvalues & Eigenvectors
  {
    category: { zh: "模块 3：特征值与迹/行列式", en: "Module 3: Eigenvalues" },
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
    category: { zh: "模块 3：逆矩阵特征值", en: "Module 3: Inverse Eigenvalue" },
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
    category: { zh: "模块 3：实对称矩阵与谱定理", en: "Module 3: Spectral Theorem" },
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

  // Module 4: Orthogonality, Projection & SVD
  {
    category: { zh: "模块 4：正交投影公式", en: "Module 4: Projection" },
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
    category: { zh: "模块 4：SVD 奇异值与特征值", en: "Module 4: SVD Intuition" },
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
    category: { zh: "模块 4：最小二乘正规方程", en: "Module 4: Least Squares" },
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

  // Module 5: Advanced Traps & Applications
  {
    category: { zh: "模块 5：正定矩阵判定", en: "Module 5: Positive Definite" },
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
    category: { zh: "模块 5：PCA 与 SVD 关系", en: "Module 5: PCA & SVD" },
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
    category: { zh: "模块 5：秩-零化度定理", en: "Module 5: Rank-Nullity" },
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
  // Always render math first so formulas look great
  renderMath();

  try { initThemeToggle(); } catch (e) { console.error("Theme toggle error:", e); }
  try { initNavigation(); } catch (e) { console.error("Nav error:", e); }
  try { initBilingual(); } catch (e) { console.error("Bilingual error:", e); }
  try { initPhoneticsToggle(); } catch (e) { console.error("Phonetics error:", e); }
  
  // Initialize Canvas simulators & HiDPI scaling
  try { initSpanModule(); } catch (e) { console.error("Span module error:", e); }
  try { initTransformModule(); } catch (e) { console.error("Transform module error:", e); }
  try { initEigenModule(); } catch (e) { console.error("Eigen module error:", e); }
  try { initOrthogonalityModule(); } catch (e) { console.error("Ortho module error:", e); }
  try { initSVDModule(); } catch (e) { console.error("SVD module error:", e); }

  // Initialize Quiz module
  try { initQuizModule(); } catch (e) { console.error("Quiz module error:", e); }

  // Re-run renderMath safely to ensure everything is rendered
  renderMath();
});

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

// HiDPI Canvas scaler helper
function setupHiDPICanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width || canvas.width;
  const cssHeight = rect.height || canvas.height;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return { ctx, width: cssWidth, height: cssHeight };
}

function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    if (appState.theme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      themeLabel.textContent = 'Dark';
      themeIcon.setAttribute('data-lucide', 'moon');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      themeLabel.textContent = 'Light';
      themeIcon.setAttribute('data-lucide', 'sun');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();

    redrawAllCanvases();
  });
}

function redrawAllCanvases() {
  drawSpanCanvas();
  drawTransformCanvas();
  drawEigenCanvas();
  drawProjCanvas();
  drawSVDCanvas();
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
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

function switchTab(tabId) {
  appState.activeTab = tabId;
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
  const activePanel = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) activePanel.classList.add('active');

  setTimeout(() => {
    if (tabId === 'vectors') drawSpanCanvas();
    if (tabId === 'matrices') drawTransformCanvas();
    if (tabId === 'eigen') drawEigenCanvas();
    if (tabId === 'orthogonality') {
      drawProjCanvas();
      drawSVDCanvas();
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
    updateLanguageTexts();
  });
}

function updateLanguageTexts() {
  const lang = appState.lang;
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = lang === 'zh' ? '中 / EN' : 'EN / 中';

  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  updateSpanStatus();
  updateTransformStatus();
  updateEigenStatus(document.getElementById('collinearError') ? parseFloat(document.getElementById('collinearError').textContent) : 0);
  updateProjStatus();
  updateSVDStatus();

  renderQuizQuestion();
}

function initPhoneticsToggle() {
  const toggleBtn = document.getElementById('phoneticToggleBtn');
  const label = document.getElementById('phoneticLabel');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    appState.showIPA = !appState.showIPA;
    if (appState.showIPA) {
      document.body.classList.add('show-ipa');
      toggleBtn.classList.add('active');
      label.textContent = appState.lang === 'zh' ? 'IPA 音标: ON' : 'IPA: ON';
    } else {
      document.body.classList.remove('show-ipa');
      toggleBtn.classList.remove('active');
      label.textContent = appState.lang === 'zh' ? 'IPA 音标: OFF' : 'IPA: OFF';
    }
  });
}

// ==========================================================================
// 6. CANVAS SIMULATOR 1: 2D Vector Span (With Dragging)
// ==========================================================================
let spanState = {
  u: [2.0, 1.0],
  v: [-1.0, 2.0],
  c1: 1.0,
  c2: 1.0,
  draggingTarget: null
};

function initSpanModule() {
  const uxSlider = document.getElementById('uxSlider');
  const uySlider = document.getElementById('uySlider');
  const vxSlider = document.getElementById('vxSlider');
  const vySlider = document.getElementById('vySlider');
  const c1Slider = document.getElementById('c1Slider');
  const c2Slider = document.getElementById('c2Slider');
  const makeCollinearBtn = document.getElementById('makeCollinearBtn');

  if (!uxSlider) return;

  function readSpanInputs() {
    spanState.u[0] = parseFloat(uxSlider.value);
    spanState.u[1] = parseFloat(uySlider.value);
    spanState.v[0] = parseFloat(vxSlider.value);
    spanState.v[1] = parseFloat(vySlider.value);
    spanState.c1 = parseFloat(c1Slider.value);
    spanState.c2 = parseFloat(c2Slider.value);

    updateSpanSliderDisplays();
    drawSpanCanvas();
  }

  function updateSpanSliderDisplays() {
    document.getElementById('uxVal').textContent = spanState.u[0].toFixed(1);
    document.getElementById('uyVal').textContent = spanState.u[1].toFixed(1);
    document.getElementById('vxVal').textContent = spanState.v[0].toFixed(1);
    document.getElementById('vyVal').textContent = spanState.v[1].toFixed(1);
    document.getElementById('c1Val').textContent = spanState.c1.toFixed(1);
    document.getElementById('c2Val').textContent = spanState.c2.toFixed(1);
  }

  [uxSlider, uySlider, vxSlider, vySlider, c1Slider, c2Slider].forEach(slider => {
    slider.addEventListener('input', readSpanInputs);
  });

  makeCollinearBtn.addEventListener('click', () => {
    vxSlider.value = (spanState.u[0] * 1.5).toFixed(1);
    vySlider.value = (spanState.u[1] * 1.5).toFixed(1);
    readSpanInputs();
  });

  const canvas = document.getElementById('spanCanvas');
  setupCanvasDragging(canvas, (gridPos, isMouseDown) => {
    const distU = Math.hypot(gridPos.x - spanState.u[0], gridPos.y - spanState.u[1]);
    const distV = Math.hypot(gridPos.x - spanState.v[0], gridPos.y - spanState.v[1]);

    if (isMouseDown) {
      if (distU < 0.6) spanState.draggingTarget = 'u';
      else if (distV < 0.6) spanState.draggingTarget = 'v';
    } else {
      if (spanState.draggingTarget === 'u') {
        spanState.u[0] = Math.min(4, Math.max(-4, parseFloat(gridPos.x.toFixed(1))));
        spanState.u[1] = Math.min(4, Math.max(-4, parseFloat(gridPos.y.toFixed(1))));
        uxSlider.value = spanState.u[0];
        uySlider.value = spanState.u[1];
      } else if (spanState.draggingTarget === 'v') {
        spanState.v[0] = Math.min(4, Math.max(-4, parseFloat(gridPos.x.toFixed(1))));
        spanState.v[1] = Math.min(4, Math.max(-4, parseFloat(gridPos.y.toFixed(1))));
        vxSlider.value = spanState.v[0];
        vySlider.value = spanState.v[1];
      }
      updateSpanSliderDisplays();
      drawSpanCanvas();
    }
  }, () => { spanState.draggingTarget = null; });

  drawSpanCanvas();
}

function drawSpanCanvas() {
  const canvas = document.getElementById('spanCanvas');
  if (!canvas) return;
  const { ctx, width, height } = setupHiDPICanvas(canvas);
  const origin = { x: width / 2, y: height / 2 };
  const scale = 40;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, origin, scale);

  const u = spanState.u;
  const v = spanState.v;
  const c1 = spanState.c1;
  const c2 = spanState.c2;

  const res = [c1 * u[0] + c2 * v[0], c1 * u[1] + c2 * v[1]];
  const det = u[0] * v[1] - u[1] * v[0];

  if (Math.abs(det) > 0.01) {
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + c1 * u[0] * scale, origin.y - c1 * u[1] * scale);
    ctx.lineTo(origin.x + res[0] * scale, origin.y - res[1] * scale);
    ctx.lineTo(origin.x + c2 * v[0] * scale, origin.y - c2 * v[1] * scale);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.beginPath();
    ctx.moveTo(origin.x - 10 * u[0] * scale, origin.y + 10 * u[1] * scale);
    ctx.lineTo(origin.x + 10 * u[0] * scale, origin.y - 10 * u[1] * scale);
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawVector(ctx, origin, [c1 * u[0], c1 * u[1]], scale, '#06b6d4', 2, 'c₁u');
  drawVector(ctx, origin, [c2 * v[0], c2 * v[1]], scale, '#8b5cf6', 2, 'c₂v');
  drawVector(ctx, origin, u, scale, '#06b6d4', 3.5, 'u');
  drawVector(ctx, origin, v, scale, '#8b5cf6', 3.5, 'v');
  drawVector(ctx, origin, res, scale, '#10b981', 4, 'c₁u + c₂v');

  document.getElementById('resultVectorVal').textContent = `[${res[0].toFixed(2)}, ${res[1].toFixed(2)}]`;
  document.getElementById('spanDetVal').textContent = det.toFixed(2);

  updateSpanStatus();
}

function updateSpanStatus() {
  const det = spanState.u[0] * spanState.v[1] - spanState.u[1] * spanState.v[0];
  const badge = document.getElementById('spanStatusBadge');
  const text = document.getElementById('spanRuleText');
  if (!badge || !text) return;
  const isZh = appState.lang === 'zh';

  if (Math.abs(det) > 0.05) {
    badge.textContent = isZh ? "Span = 2D 平面 (线性无关)" : "Span = 2D Plane (Linearly Independent)";
    badge.style.background = 'rgba(16, 185, 129, 0.15)';
    badge.style.color = '#10b981';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    text.textContent = isZh ?
      `det([u v]) = ${det.toFixed(2)} ≠ 0。向量线性无关，Span 覆盖整个 2D 平面 (ℝ²)。` :
      `det([u v]) = ${det.toFixed(2)} ≠ 0. Vectors are Linearly Independent, Span covers full 2D plane (ℝ²).`;
  } else {
    badge.textContent = isZh ? "Span = 1D 直线 (线性相关/退化!)" : "Span = 1D Line (Linearly Dependent)";
    badge.style.background = 'rgba(244, 63, 94, 0.15)';
    badge.style.color = '#f43f5e';
    badge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    text.textContent = isZh ?
      `det([u v]) = 0.00。向量线性相关 (u 与 v 共线)，Span 塌缩为一条 1D 直线。` :
      `det([u v]) = 0.00. Vectors are Linearly Dependent (collinear), Span collapses into a 1D line.`;
  }
}

// ==========================================================================
// 7. CANVAS SIMULATOR 2: Matrix Transformation & Determinant
// ==========================================================================
let matrixState = { a: 1.5, b: 0.5, c: 0.0, d: 1.2 };

function initTransformModule() {
  const matA = document.getElementById('matA');
  const matB = document.getElementById('matB');
  const matC = document.getElementById('matC');
  const matD = document.getElementById('matD');

  if (!matA) return;

  function readMatrixInputs() {
    matrixState.a = parseFloat(matA.value) || 0;
    matrixState.b = parseFloat(matB.value) || 0;
    matrixState.c = parseFloat(matC.value) || 0;
    matrixState.d = parseFloat(matD.value) || 0;
    drawTransformCanvas();
  }

  [matA, matB, matC, matD].forEach(inp => inp.addEventListener('input', readMatrixInputs));
  drawTransformCanvas();
}

function applyMatrixPreset(preset) {
  const matA = document.getElementById('matA');
  const matB = document.getElementById('matB');
  const matC = document.getElementById('matC');
  const matD = document.getElementById('matD');

  if (!matA) return;

  switch (preset) {
    case 'identity':
      matA.value = 1.0; matB.value = 0.0; matC.value = 0.0; matD.value = 1.0;
      break;
    case 'rotation':
      const cos45 = Math.cos(Math.PI / 4).toFixed(2);
      const sin45 = Math.sin(Math.PI / 4).toFixed(2);
      matA.value = cos45; matB.value = -sin45; matC.value = sin45; matD.value = cos45;
      break;
    case 'shear':
      matA.value = 1.0; matB.value = 1.2; matC.value = 0.0; matD.value = 1.0;
      break;
    case 'scale':
      matA.value = 2.0; matB.value = 0.0; matC.value = 0.0; matD.value = 0.5;
      break;
    case 'singular':
      matA.value = 1.0; matB.value = 2.0; matC.value = 0.5; matD.value = 1.0;
      break;
    case 'reflection':
      matA.value = -1.0; matB.value = 0.0; matC.value = 0.0; matD.value = 1.0;
      break;
  }

  matrixState.a = parseFloat(matA.value);
  matrixState.b = parseFloat(matB.value);
  matrixState.c = parseFloat(matC.value);
  matrixState.d = parseFloat(matD.value);

  drawTransformCanvas();
}

function drawTransformCanvas() {
  const canvas = document.getElementById('transformCanvas');
  if (!canvas) return;
  const { ctx, width, height } = setupHiDPICanvas(canvas);
  const origin = { x: width / 2, y: height / 2 };
  const scale = 45;

  ctx.clearRect(0, 0, width, height);

  const { a, b, c, d } = matrixState;
  drawGrid(ctx, width, height, origin, scale, 'rgba(255, 255, 255, 0.04)');

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.lineWidth = 1;

  for (let i = -6; i <= 6; i++) {
    const p1 = transformPoint(i, -6, a, b, c, d);
    const p2 = transformPoint(i, 6, a, b, c, d);
    ctx.beginPath();
    ctx.moveTo(origin.x + p1.x * scale, origin.y - p1.y * scale);
    ctx.lineTo(origin.x + p2.x * scale, origin.y - p2.y * scale);
    ctx.stroke();

    const p3 = transformPoint(-6, i, a, b, c, d);
    const p4 = transformPoint(6, i, a, b, c, d);
    ctx.beginPath();
    ctx.moveTo(origin.x + p3.x * scale, origin.y - p3.y * scale);
    ctx.lineTo(origin.x + p4.x * scale, origin.y - p4.y * scale);
    ctx.stroke();
  }

  const sq0 = transformPoint(0, 0, a, b, c, d);
  const sq1 = transformPoint(1, 0, a, b, c, d);
  const sq2 = transformPoint(1, 1, a, b, c, d);
  const sq3 = transformPoint(0, 1, a, b, c, d);

  ctx.beginPath();
  ctx.moveTo(origin.x + sq0.x * scale, origin.y - sq0.y * scale);
  ctx.lineTo(origin.x + sq1.x * scale, origin.y - sq1.y * scale);
  ctx.lineTo(origin.x + sq2.x * scale, origin.y - sq2.y * scale);
  ctx.lineTo(origin.x + sq3.x * scale, origin.y - sq3.y * scale);
  ctx.closePath();
  ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawVector(ctx, origin, [a, c], scale, '#06b6d4', 3.5, "T(î)");
  drawVector(ctx, origin, [b, d], scale, '#10b981', 3.5, "T(ĵ)");

  const det = a * d - b * c;
  const trace = a + d;
  const rank = Math.abs(det) > 0.001 ? 2 : (a === 0 && b === 0 && c === 0 && d === 0 ? 0 : 1);

  document.getElementById('detCalcVal').textContent = det.toFixed(2);
  document.getElementById('traceCalcVal').textContent = trace.toFixed(2);
  document.getElementById('rankCalcVal').textContent = rank;

  updateTransformStatus();
}

function transformPoint(x, y, a, b, c, d) {
  return { x: a * x + b * y, y: c * x + d * y };
}

function updateTransformStatus() {
  const { a, b, c, d } = matrixState;
  const det = a * d - b * c;
  const badge = document.getElementById('transformBadge');
  const text = document.getElementById('transformCalloutText');
  if (!badge || !text) return;
  const isZh = appState.lang === 'zh';

  if (Math.abs(det) > 0.001) {
    badge.textContent = isZh ? `可逆矩阵 (det = ${det.toFixed(2)} ≠ 0)` : `Invertible (det = ${det.toFixed(2)} ≠ 0)`;
    badge.style.background = 'rgba(16, 185, 129, 0.15)';
    badge.style.color = '#10b981';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';

    if (det > 0) {
      text.textContent = isZh ?
        `变换保持定向 (det > 0)。原单位正方形面积被拉伸为原来的 ${det.toFixed(2)} 倍。` :
        `Orientation preserving (det > 0). Unit square area scaled by ${det.toFixed(2)}x.`;
    } else {
      text.textContent = isZh ?
        `变换颠倒空间定向 (det < 0，镜像翻转)。绝对面积缩放倍数为 ${Math.abs(det).toFixed(2)} 倍。` :
        `Orientation reversing (det < 0). Absolute area scaling factor is ${Math.abs(det).toFixed(2)}x.`;
    }
  } else {
    badge.textContent = isZh ? "奇异矩阵 (det = 0，不可逆!)" : "Singular Matrix (det = 0, Non-Invertible)";
    badge.style.background = 'rgba(244, 63, 94, 0.15)';
    badge.style.color = '#f43f5e';
    badge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    text.textContent = isZh ?
      `det(A) = 0。线性变换将 2D 平面压缩降维到了 1D 直线或 0D 原点（Rank < 2）。` :
      `det(A) = 0. Linear transformation flattens 2D space onto a 1D line or point.`;
  }
}

// ==========================================================================
// 8. CANVAS SIMULATOR 3: Eigenvalue Probe (With 360° Auto Sweep)
// ==========================================================================
let eigenState = { a: 2.0, b: 1.0, c: 3.0, angleDeg: 32 };

function initEigenModule() {
  const eigA = document.getElementById('eigA');
  const eigB = document.getElementById('eigB');
  const eigB2 = document.getElementById('eigB2');
  const eigC = document.getElementById('eigC');
  const probeAngleSlider = document.getElementById('probeAngleSlider');
  const autoFindEigenBtn = document.getElementById('autoFindEigenBtn');
  const autoSweepEigenBtn = document.getElementById('autoSweepEigenBtn');

  if (!eigA) return;

  function readEigenInputs() {
    eigenState.a = parseFloat(eigA.value) || 0;
    eigenState.b = parseFloat(eigB.value) || 0;
    eigenState.c = parseFloat(eigC.value) || 0;

    if (eigB2) eigB2.value = eigB.value; // Keep symmetric linked element updated

    eigenState.angleDeg = parseFloat(probeAngleSlider.value);
    document.getElementById('probeAngleVal').textContent = `${eigenState.angleDeg.toFixed(0)}°`;

    drawEigenCanvas();
  }

  [eigA, eigB, eigC, probeAngleSlider].forEach(el => {
    if (el) el.addEventListener('input', readEigenInputs);
  });
  if (autoFindEigenBtn) autoFindEigenBtn.addEventListener('click', snapToNearestEigenvector);
  if (autoSweepEigenBtn) autoSweepEigenBtn.addEventListener('click', toggleAutoSweepEigen);

  drawEigenCanvas();
}

function toggleAutoSweepEigen() {
  appState.isSweepingEigen = !appState.isSweepingEigen;
  const icon = document.getElementById('sweepIcon');
  const label = document.getElementById('sweepBtnLabel');
  const isZh = appState.lang === 'zh';

  if (appState.isSweepingEigen) {
    if (icon) icon.setAttribute('data-lucide', 'pause');
    if (label) label.textContent = isZh ? '暂停扫描' : 'Pause Sweep';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    function sweepStep() {
      if (!appState.isSweepingEigen) return;
      eigenState.angleDeg = (eigenState.angleDeg + 0.8) % 360;
      const slider = document.getElementById('probeAngleSlider');
      if (slider) slider.value = eigenState.angleDeg;
      const valText = document.getElementById('probeAngleVal');
      if (valText) valText.textContent = `${eigenState.angleDeg.toFixed(0)}°`;

      drawEigenCanvas();
      appState.sweepAnimationFrame = requestAnimationFrame(sweepStep);
    }
    sweepStep();
  } else {
    if (icon) icon.setAttribute('data-lucide', 'play');
    if (label) label.textContent = isZh ? '360° 自动扫描' : '360° Auto Sweep';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (appState.sweepAnimationFrame) cancelAnimationFrame(appState.sweepAnimationFrame);
  }
}

function drawEigenCanvas() {
  const canvas = document.getElementById('eigenCanvas');
  if (!canvas) return;
  const { ctx, width, height } = setupHiDPICanvas(canvas);
  const origin = { x: width / 2, y: height / 2 };
  const scale = 40;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, origin, scale);

  const { a, b, c, angleDeg } = eigenState;

  const tr = a + c;
  const det = a * c - b * b;
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det));
  const l1 = (tr + disc) / 2;
  const l2 = (tr - disc) / 2;

  let theta1 = Math.abs(b) > 0.0001 ? Math.atan2(l1 - a, b) : (a >= c ? 0 : Math.PI / 2);
  let theta2 = theta1 + Math.PI / 2;

  ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);

  ctx.beginPath();
  ctx.moveTo(origin.x - 10 * Math.cos(theta1) * scale, origin.y + 10 * Math.sin(theta1) * scale);
  ctx.lineTo(origin.x + 10 * Math.cos(theta1) * scale, origin.y - 10 * Math.sin(theta1) * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(origin.x - 10 * Math.cos(theta2) * scale, origin.y + 10 * Math.sin(theta2) * scale);
  ctx.lineTo(origin.x + 10 * Math.cos(theta2) * scale, origin.y - 10 * Math.sin(theta2) * scale);
  ctx.stroke();

  ctx.setLineDash([]);

  const rad = (angleDeg * Math.PI) / 180;
  const x = [Math.cos(rad), Math.sin(rad)];
  const Ax = [a * x[0] + b * x[1], b * x[0] + c * x[1]];

  const magX = Math.hypot(x[0], x[1]);
  const magAx = Math.hypot(Ax[0], Ax[1]);
  const dot = x[0] * Ax[0] + x[1] * Ax[1];
  const cosErr = Math.min(1, Math.max(-1, dot / (magX * magAx)));
  let angleErrDeg = (Math.acos(cosErr) * 180) / Math.PI;

  drawVector(ctx, origin, [x[0] * 2, x[1] * 2], scale, '#ec4899', 3.5, 'Probe x');
  drawVector(ctx, origin, Ax, scale, '#8b5cf6', 3.5, 'Ax');

  document.getElementById('eigenVal1').textContent = l1.toFixed(2);
  document.getElementById('eigenVal2').textContent = l2.toFixed(2);
  document.getElementById('collinearError').textContent = `${angleErrDeg.toFixed(1)}°`;

  updateEigenStatus(angleErrDeg);
}

function snapToNearestEigenvector() {
  const { a, b, c } = eigenState;
  const tr = a + c;
  const det = a * c - b * b;
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det));
  const l1 = (tr + disc) / 2;

  let theta1 = Math.abs(b) > 0.0001 ? Math.atan2(l1 - a, b) : (a >= c ? 0 : Math.PI / 2);
  let deg = (theta1 * 180) / Math.PI;
  if (deg < 0) deg += 360;

  const slider = document.getElementById('probeAngleSlider');
  if (slider) slider.value = deg.toFixed(0);
  eigenState.angleDeg = deg;
  const valText = document.getElementById('probeAngleVal');
  if (valText) valText.textContent = `${deg.toFixed(0)}°`;

  drawEigenCanvas();
}

function updateEigenStatus(errDeg) {
  const badge = document.getElementById('eigenStatusBadge');
  const text = document.getElementById('eigenRuleText');
  if (!badge || !text) return;
  const isZh = appState.lang === 'zh';

  if (errDeg < 3.0 || Math.abs(errDeg - 180) < 3.0) {
    badge.textContent = isZh ? "🎉 已捕获特征向量！(Collinear)" : "🎉 Eigenvector Discovered!";
    badge.style.background = 'rgba(16, 185, 129, 0.15)';
    badge.style.color = '#10b981';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    text.textContent = isZh ?
      `完美对齐！测试向量 x 与 Ax 在同一直线上重合。Ax 为 x 的标量缩放倍数（即特征值 λ）。` :
      `Perfect alignment! Probe x and Ax are collinear. Ax is scalar multiple of x.`;
  } else {
    badge.textContent = isZh ? "扫描探针角度中..." : "Scanning Probe Angle...";
    badge.style.background = 'rgba(236, 72, 153, 0.15)';
    badge.style.color = '#ec4899';
    badge.style.borderColor = 'rgba(236, 72, 153, 0.4)';
    text.textContent = isZh ?
      `探针向量 x 与 Ax 存在 ${errDeg.toFixed(1)}° 偏角。继续拖动或自动扫描！` :
      `Probe x and Ax differ in direction by ${errDeg.toFixed(1)}°. Rotate to find eigenvectors.`;
  }
}

// ==========================================================================
// 9. CANVAS SIMULATOR 4: Vector Projection (With Dragging)
// ==========================================================================
let projState = {
  u: [3.0, 0.0],
  v: [2.0, 3.0],
  draggingTarget: null
};

function initOrthogonalityModule() {
  const puxSlider = document.getElementById('puxSlider');
  const puySlider = document.getElementById('puySlider');
  const pvxSlider = document.getElementById('pvxSlider');
  const pvySlider = document.getElementById('pvySlider');

  if (!puxSlider) return;

  function readProjInputs() {
    projState.u[0] = parseFloat(puxSlider.value);
    projState.u[1] = parseFloat(puySlider.value);
    projState.v[0] = parseFloat(pvxSlider.value);
    projState.v[1] = parseFloat(pvySlider.value);

    updateProjSliderDisplays();
    drawProjCanvas();
  }

  function updateProjSliderDisplays() {
    document.getElementById('puxVal').textContent = projState.u[0].toFixed(1);
    document.getElementById('puyVal').textContent = projState.u[1].toFixed(1);
    document.getElementById('pvxVal').textContent = projState.v[0].toFixed(1);
    document.getElementById('pvyVal').textContent = projState.v[1].toFixed(1);
  }

  [puxSlider, puySlider, pvxSlider, pvySlider].forEach(s => s.addEventListener('input', readProjInputs));

  const canvas = document.getElementById('projCanvas');
  setupCanvasDragging(canvas, (gridPos, isMouseDown) => {
    const distU = Math.hypot(gridPos.x - projState.u[0], gridPos.y - projState.u[1]);
    const distV = Math.hypot(gridPos.x - projState.v[0], gridPos.y - projState.v[1]);

    if (isMouseDown) {
      if (distU < 0.6) projState.draggingTarget = 'u';
      else if (distV < 0.6) projState.draggingTarget = 'v';
    } else {
      if (projState.draggingTarget === 'u') {
        projState.u[0] = Math.min(4, Math.max(-4, parseFloat(gridPos.x.toFixed(1))));
        projState.u[1] = Math.min(4, Math.max(-4, parseFloat(gridPos.y.toFixed(1))));
        puxSlider.value = projState.u[0];
        puySlider.value = projState.u[1];
      } else if (projState.draggingTarget === 'v') {
        projState.v[0] = Math.min(4, Math.max(-4, parseFloat(gridPos.x.toFixed(1))));
        projState.v[1] = Math.min(4, Math.max(-4, parseFloat(gridPos.y.toFixed(1))));
        pvxSlider.value = projState.v[0];
        pvySlider.value = projState.v[1];
      }
      updateProjSliderDisplays();
      drawProjCanvas();
    }
  }, () => { projState.draggingTarget = null; });

  drawProjCanvas();
}

function drawProjCanvas() {
  const canvas = document.getElementById('projCanvas');
  if (!canvas) return;
  const { ctx, width, height } = setupHiDPICanvas(canvas);
  const origin = { x: width / 2, y: height / 2 };
  const scale = 40;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, origin, scale);

  const u = projState.u;
  const v = projState.v;
  const magU2 = u[0] * u[0] + u[1] * u[1];
  const dot = u[0] * v[0] + u[1] * v[1];

  const projFactor = magU2 > 0.0001 ? dot / magU2 : 0;
  const proj = [projFactor * u[0], projFactor * u[1]];
  const vPerp = [v[0] - proj[0], v[1] - proj[1]];

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(origin.x - 10 * u[0] * scale, origin.y + 10 * u[1] * scale);
  ctx.lineTo(origin.x + 10 * u[0] * scale, origin.y - 10 * u[1] * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(origin.x + v[0] * scale, origin.y - v[1] * scale);
  ctx.lineTo(origin.x + proj[0] * scale, origin.y - proj[1] * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  drawVector(ctx, origin, u, scale, '#3b82f6', 3.5, 'u');
  drawVector(ctx, origin, v, scale, '#f59e0b', 3.5, 'v');
  drawVector(ctx, origin, proj, scale, '#10b981', 4, 'proj_u(v)');
  drawVector(ctx, origin, vPerp, scale, '#f43f5e', 3, 'v^⊥');

  document.getElementById('projVecVal').textContent = `[${proj[0].toFixed(2)}, ${proj[1].toFixed(2)}]`;
  document.getElementById('orthoCompVal').textContent = `[${vPerp[0].toFixed(2)}, ${vPerp[1].toFixed(2)}]`;
  document.getElementById('dotProductVal').textContent = dot.toFixed(2);

  updateProjStatus();
}

function updateProjStatus() {
  const badge = document.getElementById('projBadge');
  const text = document.getElementById('projCalloutText');
  if (!badge || !text) return;
  const isZh = appState.lang === 'zh';

  badge.textContent = isZh ? "正交分解: v = proj_u(v) + v^⊥" : "Decomposition: v = proj_u(v) + v^⊥";
  text.textContent = isZh ?
    `正交性校验：投影分量 proj 与垂直分量 v^⊥ 点积为 0.00 (构成精确直角三角形)。` :
    `Orthogonality Check: proj_u(v) · v^⊥ = 0.00 (Perfect Right Angle!).`;
}

// ==========================================================================
// 10. CANVAS SIMULATOR 5: SVD Decomposition 2D Visualizer
// ==========================================================================
let svdState = { a: 1.8, b: 0.6, c: 0.4, d: 1.2 };

function initSVDModule() {
  const svdA = document.getElementById('svdA');
  const svdB = document.getElementById('svdB');
  const svdC = document.getElementById('svdC');
  const svdD = document.getElementById('svdD');

  if (!svdA) return;

  function readSVDInputs() {
    svdState.a = parseFloat(svdA.value) || 0;
    svdState.b = parseFloat(svdB.value) || 0;
    svdState.c = parseFloat(svdC.value) || 0;
    svdState.d = parseFloat(svdD.value) || 0;
    drawSVDCanvas();
  }

  [svdA, svdB, svdC, svdD].forEach(inp => inp.addEventListener('input', readSVDInputs));
  drawSVDCanvas();
}

function setSVDStep(step) {
  appState.svdStep = step;
  ['full', 'v', 'sigma', 'u'].forEach(s => {
    const btn = document.getElementById(`svdStep${s.charAt(0).toUpperCase() + s.slice(1)}`);
    if (btn) btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`svdStep${step.charAt(0).toUpperCase() + step.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  drawSVDCanvas();
}

function drawSVDCanvas() {
  const canvas = document.getElementById('svdCanvas');
  if (!canvas) return;
  const { ctx, width, height } = setupHiDPICanvas(canvas);
  const origin = { x: width / 2, y: height / 2 };
  const scale = 50;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, origin, scale);

  const { a, b, c, d } = svdState;

  const ata11 = a * a + c * c;
  const ata12 = a * b + c * d;
  const ata22 = b * b + d * d;

  const tr = ata11 + ata22;
  const det = ata11 * ata22 - ata12 * ata12;
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det));

  const l1 = (tr + disc) / 2;
  const l2 = (tr - disc) / 2;

  const sigma1 = Math.sqrt(Math.max(0, l1));
  const sigma2 = Math.sqrt(Math.max(0, l2));

  let thetaV = Math.abs(ata12) > 0.0001 ? Math.atan2(l1 - ata11, ata12) : (ata11 >= ata22 ? 0 : Math.PI / 2);
  const v1 = [Math.cos(thetaV), Math.sin(thetaV)];
  const v2 = [-Math.sin(thetaV), Math.cos(thetaV)];

  let u1 = [0, 0], u2 = [0, 0];
  if (sigma1 > 0.0001) {
    const Av1 = [a * v1[0] + b * v1[1], c * v1[0] + d * v1[1]];
    u1 = [Av1[0] / sigma1, Av1[1] / sigma1];
  }
  if (sigma2 > 0.0001) {
    const Av2 = [a * v2[0] + b * v2[1], c * v2[0] + d * v2[1]];
    u2 = [Av2[0] / sigma2, Av2[1] / sigma2];
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, scale, 0, 2 * Math.PI);
  ctx.stroke();

  const step = appState.svdStep;

  if (step === 'v') {
    drawVector(ctx, origin, v1, scale, '#06b6d4', 3, 'v₁');
    drawVector(ctx, origin, v2, scale, '#ec4899', 3, 'v₂');
  } else if (step === 'sigma') {
    ctx.beginPath();
    ctx.ellipse(origin.x, origin.y, sigma1 * scale, sigma2 * scale, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.stroke();

    drawVector(ctx, origin, [sigma1, 0], scale, '#06b6d4', 3, 'σ₁e₁');
    drawVector(ctx, origin, [0, sigma2], scale, '#ec4899', 3, 'σ₂e₂');
  } else {
    const thetaU = Math.atan2(u1[1], u1[0]);
    ctx.beginPath();
    ctx.ellipse(origin.x, origin.y, sigma1 * scale, sigma2 * scale, -thetaU, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawVector(ctx, origin, [sigma1 * u1[0], sigma1 * u1[1]], scale, '#06b6d4', 3.5, 'σ₁u₁');
    drawVector(ctx, origin, [sigma2 * u2[0], sigma2 * u2[1]], scale, '#ec4899', 3.5, 'σ₂u₂');
  }

  document.getElementById('svdSigma1').textContent = sigma1.toFixed(2);
  document.getElementById('svdSigma2').textContent = sigma2.toFixed(2);
  const condNum = sigma2 > 0.001 ? (sigma1 / sigma2).toFixed(2) : '∞';
  document.getElementById('svdCondNum').textContent = condNum;

  updateSVDStatus();
}

function updateSVDStatus() {
  const badge = document.getElementById('svdStatusBadge');
  const text = document.getElementById('svdCalloutText');
  if (!badge || !text) return;
  const isZh = appState.lang === 'zh';

  badge.textContent = "SVD: A = U Σ Vᵀ";
  text.textContent = isZh ?
    `奇异值分解几何直观：正交基 V 中的向量在 A 映射后，变为输出空间的正交向量 U 乘以长度缩放因子 Σ。` :
    `Geometric SVD: Orthogonal vectors in V map to orthogonal vectors in U scaled by singular values Σ.`;
}

// ==========================================================================
// 11. Canvas Drawing & Drag Helpers
// ==========================================================================
function drawGrid(ctx, width, height, origin, scale, color = 'rgba(255, 255, 255, 0.08)') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let x = origin.x % scale; x < width; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = origin.y % scale; y < height; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(width, origin.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, height); ctx.stroke();

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = -5; i <= 5; i++) {
    if (i !== 0) {
      ctx.fillText(i, origin.x + i * scale - 4, origin.y + 14);
      ctx.fillText(-i, origin.x - 14, origin.y + i * scale + 4);
    }
  }
}

function drawVector(ctx, origin, vec, scale, color, lineWidth, label) {
  const targetX = origin.x + vec[0] * scale;
  const targetY = origin.y - vec[1] * scale;

  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();

  const headLen = 12;
  const angle = Math.atan2(origin.y - targetY, targetX - origin.x);

  ctx.beginPath();
  ctx.moveTo(targetX, targetY);
  ctx.lineTo(
    targetX - headLen * Math.cos(angle - Math.PI / 6),
    targetY + headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    targetX - headLen * Math.cos(angle + Math.PI / 6),
    targetY + headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  if (label) {
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, targetX + 8, targetY - 8);
  }
}

function setupCanvasDragging(canvas, onDragMove, onDragEnd) {
  if (!canvas) return;
  let isMouseDown = false;

  function getGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const originX = rect.width / 2;
    const originY = rect.height / 2;
    const scale = 40;
    return { x: (x - originX) / scale, y: (originY - y) / scale };
  }

  function start(e) {
    isMouseDown = true;
    onDragMove(getGridPos(e), true);
  }

  function move(e) {
    if (!isMouseDown) return;
    onDragMove(getGridPos(e), false);
  }

  function end() {
    if (isMouseDown) {
      isMouseDown = false;
      onDragEnd();
    }
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);

  canvas.addEventListener('touchstart', start, { passive: true });
  canvas.addEventListener('touchmove', move, { passive: true });
  window.addEventListener('touchend', end);
}

// ==========================================================================
// 12. Interactive Quiz Module Engine
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
