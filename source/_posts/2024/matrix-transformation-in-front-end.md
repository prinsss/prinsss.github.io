---
title: '前端中的矩阵变换与数学原理'
date: '2024-01-03 21:35:00'
updated: '2024-01-03 21:35:00'
categories: 技术
mathjax: true
tikzjax: true
tags:
  - 前端
---

## 问题引入 {.hide-in-post-preview}

大家都知道，CSS 中有一个 [`transform` 属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform)，可以设置元素的变换，如：`rotate` 旋转、`scale` 缩放、`translate` 平移、`skew` 剪切等。

除此之外，`transform` 还有两个非常唬人的写法：

```css
transform: matrix(a, b, c, d, tx, ty);
transform: matrix3d(a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4);
```

我的天，这么多参数！🙀

相信很多人看到这玩意儿，都会有和我一样的想法：这是用来干啥的？Matrix 是什么意思？~~（不是《黑客帝国》🐶）~~为什么它有这么多参数？这些参数分别代表什么？为什么这些参数组合可以表示元素变换？

<!--more-->

剧透一下，这里的 Matrix 代表了二维/三维空间中的：

<p style="text-align: center">
**变换矩阵** (Transformation matrix)
</p>

在计算机图形学中，变换矩阵可以用来表示线性变换、仿射变换、透视投影，等等。

听起来是不是很高深、很吓人？其实矩阵变换本质上就是「一系列包装好的数学运算」，通过这些数学运算，我们可以方便地对 2D/3D 图形进行各种旋转、缩放、平移等操作。而 CSS、WebGL 等前端技术中的这些变换矩阵，就是它们的实际应用。

好了，话不多说，下面让我们来一起揭开矩阵变换的神秘面纱吧！

## 坐标系与顶点表示

先来点基础知识。把一个长宽均为 1 的矩形 A，放在下图所示的笛卡尔坐标系中：

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};
  \node[below left] at (0,0) {$O$};
  \node[below] at (1,0) {1};
  \node[below] at (-1,0) {-1};
  \node[left] at (0,1) {1};
  \node[left] at (0,-1) {-1};

  \draw[very thick] (0,0) rectangle (1,1);
\end{tikzpicture}
\end{document}
```

> 打个广告：本文中的所有示意图都是用 [Ti*k*Z](https://en.wikipedia.org/wiki/PGF/TikZ) 画的。Ti*k*Z 是一个 $\LaTeX$ 的绘图工具，可以用来画各种图，非常好用。我最近写了一个 Hexo 插件，可以让你在博客中直接使用 Ti*k*Z 语法画图，欢迎试用：[hexo-filter-tikzjax](https://github.com/prinsss/hexo-filter-tikzjax)。

这个矩形的四个顶点的位置，可以分别表示为：

- 左下角 $(0, 0)$
- 左上角 $(0, 1)$
- 右上角 $(1, 1)$
- 右下角 $(1, 0)$

这就是顶点在这个坐标系中的**笛卡尔坐标** (Cartesian coordinates)。

下面我们将其扩展到线性空间中，用向量来表示这些点。[向量](https://zh.wikipedia.org/zh-cn/%E5%90%91%E9%87%8F) (Vector) 是一种既有大小，又有方向的量。取 $(0, 0)$ 为坐标原点，上述坐标系中 x, y 轴的基向量 (Basis) 为：

$$
\begin{align}
\boldsymbol{i} &= (1, 0) \\
\boldsymbol{j} &= (0, 1)
\end{align}
$$

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[very thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[->,very thick,blue] (0,0) -- (1,0) node[below left] {$\vec{i}$};
  \draw[->,very thick,red] (0,0) -- (0,1) node[below left] {$\vec{j}$};
\end{tikzpicture}
\end{document}
```

二维空间中的任意一点 P，都可以用基向量来表示：

$$
(a, b) = a\boldsymbol{i} + b\boldsymbol{j}
$$

比如说一个 $(3, 2)$ 向量，就是 3 个 $\boldsymbol{i}$ 加上 2 个 $\boldsymbol{j}$ 所得到的向量（平行四边形法则）。

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-3.6,-1.6) grid (3.6,2.6);
  \draw[->,thick,color=gray] (-3.8,0) -- (3.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,2.8) node[above] {$y$};
  \node[below left] at (0,0) {$O$};

  \draw[->,very thick,blue] (0,0) -- (1,0) node[below left] {$\vec{i}$};
  \draw[->,very thick,blue] (1,0) -- (2,0);
  \draw[->,very thick,blue] (2,0) -- (3,0);

  \draw[->,very thick,red] (0,0) -- (0,1) node[below left] {$\vec{j}$};
  \draw[->,very thick,red] (0,1) -- (0,2);

  \draw[->,thick,red,dashed] (3,0) -- (3,1);
  \draw[->,thick,red,dashed] (3,1) -- (3,2);

  \draw[->,very thick] (0,0) -- (3,2) node[above right] {$(3, 2)$};
\end{tikzpicture}
\end{document}
```

所以，矩形 A 的四个顶点，可表示为从原点指向顶点的向量：

$$
\begin{align}
\boldsymbol{v}_{左下角} &= 0 \boldsymbol{i} + 0 \boldsymbol{j} = (0, 0) \\
\boldsymbol{v}_{左上角} &= 0 \boldsymbol{i} + 1 \boldsymbol{j} = (0, 1) \\
\boldsymbol{v}_{右上角} &= 1 \boldsymbol{i} + 1 \boldsymbol{j} = (1, 1) \\
\boldsymbol{v}_{右下角} &= 1 \boldsymbol{i} + 0 \boldsymbol{j} = (1, 0)
\end{align}
$$

使用向量表示的好处是它可以很方便地进行线性运算，而且几何表示更直观：箭头的长度表示大小，箭头所指的方向表示方向，向量的变换就相当于箭头的运动。

-----

## 二维变换

在计算机图形学中，二维变换 (2D Transformation) 指的是在二维平面中对物体的位置、方向、大小、形状进行改变的过程。

一个二维坐标经过变换后会得到一个新的坐标。主要的二维变换包括：平移、旋转、缩放、剪切、镜像等。

### 缩放

[缩放 (Scaling)](https://en.wikipedia.org/wiki/Scaling_(geometry)) 是最基本的变换之一，即沿着坐标轴将物体均匀地放大或缩小。

比如我们把矩形 A 在 x 轴方向缩放到 3 倍，在 y 轴方向上缩放到 2 倍，如图所示：

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-3.6,-1.6) grid (3.6,2.6);
  \draw[->,thick,color=gray] (-3.8,0) -- (3.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,2.8) node[above] {$y$};
  \node[below left] at (0,0) {$O$};

  \draw[very thick,dotted] (0,0) rectangle (1,1);
  \draw[very thick] (0,0) rectangle (3,2);

  \node[above] at (1,1) {$(1,1)$};
  \node[above] at (3,2) {$(3,2)$};
\end{tikzpicture}
\end{document}
```

很显然，变换后的坐标与原始坐标有以下函数关系：

$$
\begin{align}
x' &= x \times s_x \\
y' &= y \times s_y
\end{align}
$$

其中，$s_x$ 和 $s_y$ 表示缩放因子，通俗地说就是要在这个方向上放大/缩小到原来的几倍。缩放因子也可以是负数，表示方向的反转。

到这里为止都没什么难度，下面我们将这个变换放到向量空间中去看。

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-3.6,-1.6) grid (3.6,2.6);
  \draw[->,thick,color=gray] (-3.8,0) -- (3.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,2.8) node[above] {$y$};
  \node[below left] at (0,0) {$O$};

  \draw[thick,dotted] (0,0) rectangle (1,1);
  \draw[thick,dotted] (0,0) rectangle (3,2);

  \draw[->,very thick,gray] (0,0) -- (1,1) node[above] {$1\vec{i} + 1\vec{j}$};
  \draw[->,very thick] (0,0) -- (3,2) node[above] {$1\vec{i'} + 1\vec{j'}$};

  \draw[->,very thick,green] (0,0) -- (3,0) node[below left] {$\vec{i'}$};
  \draw[->,very thick,orange] (0,0) -- (0,2) node[below left] {$\vec{j'}$};

  \draw[->,very thick,blue] (0,0) -- (1,0) node[below left] {$\vec{i}$};
  \draw[->,very thick,red] (0,0) -- (0,1) node[below left] {$\vec{j}$};
\end{tikzpicture}
\end{document}
```

线性代数的知识告诉我们，二维空间中的所有向量都可以使用基向量 $\boldsymbol{i}, \boldsymbol{j}$ 来表示。因此，这个向量空间中任意的[线性变换 (Linear transformation)](https://zh.wikipedia.org/zh-cn/%E7%BA%BF%E6%80%A7%E6%98%A0%E5%B0%84)，其实都可以表示为**基向量的变换**。

以上图为例，经过缩放后，原来的基向量 $\boldsymbol{i}, \boldsymbol{j}$ 变换为了 $\boldsymbol{i'}, \boldsymbol{j'}$，也就是分别乘以缩放因子：

$$
\begin{align}
\boldsymbol{i'} &= 3 \boldsymbol{i} = (3, 0) \\
\boldsymbol{j'} &= 2 \boldsymbol{j} = (0, 2)
\end{align}
$$

这时候有意思的就来了，注意看哦！😸

如果我们用新的基向量 $\boldsymbol{i'}, \boldsymbol{j'}$ (绿色和橙色箭头) 来表示变换后的矩形坐标，就有：

$$
\begin{align}
\boldsymbol{v'}_{左下角} &= 0 \boldsymbol{i'} + 0 \boldsymbol{j'} = (0, 0) \\
\boldsymbol{v'}_{左上角} &= 0 \boldsymbol{i'} + 1 \boldsymbol{j'} = (0, 1) \\
\boldsymbol{v'}_{右上角} &= 1 \boldsymbol{i'} + 1 \boldsymbol{j'} = (1, 1) \\
\boldsymbol{v'}_{右下角} &= 1 \boldsymbol{i'} + 0 \boldsymbol{j'} = (1, 0)
\end{align}
$$

可以看到，**它们的坐标和变换前是一样的**！因为其所表示的线性组合的系数相同。

总结一下，对于二维变换，我们可以有以下理解：

- 二维变换可以看作是向量空间中不同坐标系之间的转换
- 坐标只有在坐标系中才有意义，同一个坐标在不同坐标系表示不同的向量
- 坐标系由坐标原点和基向量决定，坐标系的变化即原点和基向量的变化
- 在线性变换中，原点始终不变，且变换后所有的直线必须仍是直线

这些特性给我们带来的好处在于：

我们只需要跟踪**基向量**的变换，就可以跟踪到整个空间内所有向量的线性变换。换句话说，只要知道了基向量怎么变，给定原始点 $P$，就可以直接算出变换后的点 $P'$。

### 剪切

[剪切 (Shear)](https://en.wikipedia.org/wiki/Shear_mapping)，也译作错切、切变，效果类似于你拉着一个矩形的对角，将其拉成一个平行四边形。计算机图形学中的 shear, skew, transvection 可以视作同义词。

将矩形 A 分别沿 x 轴方向剪切 30°，以及沿 y 轴方向剪切 30°，如图所示：

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[very thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[very thick,xslant=0.57] (0,0) rectangle (1,1) node[above] {$(1.57,1)$};

  \begin{scope}
  \path[clip] (0,0) -- (0.57,1) -- (0,1);
  \fill[red, opacity=0.5, draw=black] (0,0) circle (0.57);
  \end{scope}

  \node[above left] at (0,0) {$\phi$};
\end{tikzpicture}
\qquad
\qquad
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[very thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[very thick,yslant=0.57] (0,0) rectangle (1,1) node[above] {$(1,1.57)$};

  \begin{scope}
  \path[clip] (0,0) -- (1,0.57) -- (1,0);
  \fill[red, opacity=0.5, draw=black] (0,0) circle (0.57);
  \end{scope}

  \node[below right] at (0,0) {$\phi$};
\end{tikzpicture}
\end{document}
```

平行于 x 轴和 y 轴的剪切变换分别可以表示为：

$$
\begin{equation}
\begin{aligned}[t]
x' &= x + my \\
y' &= y
\end{aligned}
\qquad\qquad\qquad
\begin{aligned}[t]
x' &= x \\
y' &= y + mx
\end{aligned}
\end{equation}
$$

其中，$m$ 表示剪切因子。

剪切变换的另外一种形式是使用对应坐标轴旋转的角度 $\phi$ 表示，把上式中的 $m$ 替换成 $\tan \phi$ 即可。CSS 中的 `transform: skew(ax, ay)`，其参数就是角度的形式。

对于剪切变换，变换后的基向量可以表示为：

$$
\begin{equation}
\begin{aligned}[t]
\boldsymbol{i'} &= (1, 0) \\
\boldsymbol{j'} &= (m, 1)
\end{aligned}
\qquad\qquad\qquad
\begin{aligned}[t]
\boldsymbol{i'} &= (1, m) \\
\boldsymbol{j'} &= (0, 1)
\end{aligned}
\end{equation}
$$

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[very thick,dotted,xslant=0.57] (0,0) rectangle (1,1) node[above] {$1\vec{i'} + 1\vec{j'}$};

  \draw[->,very thick,green] (0,0) -- (1,0) node[below left] {$\vec{i'}$};
  \draw[->,very thick,orange] (0,0) -- (0.57,1) node[above] {$\vec{j'}$};
\end{tikzpicture}
\qquad
\qquad
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[very thick,dotted,yslant=0.57] (0,0) rectangle (1,1) node[above] {$1\vec{i'} + 1\vec{j'}$};

  \draw[->,very thick,green] (0,0) -- (1,0.57) node[right] {$\vec{i'}$};
  \draw[->,very thick,orange] (0,0) -- (0,1) node[left] {$\vec{j'}$};
\end{tikzpicture}
\end{document}
```

### 旋转

[旋转 (Rotation)](https://en.wikipedia.org/wiki/Rotation_(mathematics)) 是描述物体围绕固定点转动指定角度的变换。

将矩形 A 围绕原点逆时针旋转 30°，如图所示：

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[very thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[very thick,rotate=30] (0,0) rectangle (1,1) node[right] {$(0.36,1.36)$};

  \begin{scope}
  \path[clip] (0,0) -- (0.86,0.5) -- (1,0);
  \fill[red, opacity=0.5, draw=black] (0,0) circle (0.5);
  \end{scope}

  \node[below right] at (0,0) {$\phi$};
\end{tikzpicture}
\end{document}
```

这里的公式稍微有些复杂，需要用到三角函数。不过这次我们可以反过来，先写出旋转变换后的基向量：

$$
\begin{align}
\boldsymbol{i'} &= (\cos \phi, \sin \phi) \\
\boldsymbol{j'} &= (-\sin \phi, \cos \phi)
\end{align}
$$

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[thick,dotted,rotate=30] (0,0) rectangle (1,1) node[right] {$1\vec{i'} + 1\vec{j'}$};

  \draw[->,very thick,green] (0,0) -- (0.86,0.5) node[right] {$\vec{i'}$};
  \draw[->,very thick,orange] (0,0) -- (-0.5,0.86) node[left] {$\vec{j'}$};
\end{tikzpicture}
\end{document}
```

然后，根据新的基向量，反推出旋转变换后每个点的坐标 $\boldsymbol{v} \rightarrow \boldsymbol{v'}$（这里为了计算方便，使用了向量的[列向量写法](https://en.wikipedia.org/wiki/Row_and_column_vectors)，和坐标写法表示的是一个意思，就是竖过来了）：

$$
\begin{align}
\boldsymbol{v} &= (x, y) = \begin{bmatrix}x \\ y\end{bmatrix} \\
\\
\boldsymbol{v'} &= x \boldsymbol{i'} + y \boldsymbol{j'} \\[2mm]
&= x \begin{bmatrix}\cos \phi \\ \sin \phi\end{bmatrix}
 + y \begin{bmatrix}-\sin \phi \\ \cos \phi\end{bmatrix} \\[2mm]
&= \begin{bmatrix}x \cos \phi \\ x \sin \phi\end{bmatrix}
 + \begin{bmatrix}-y \sin \phi \\ y \cos \phi\end{bmatrix} \\[2mm]
&= \begin{bmatrix}x \cos \phi - y \sin \phi \\ x \sin \phi + y \cos \phi \end{bmatrix}
\end{align}
$$

最后得出旋转变换中的坐标变换公式：

$$
\begin{align}
x' &= x\cos \phi - y\sin \phi \\
y' &= x\sin \phi + y\cos \phi
\end{align}
$$

### 平移

[平移 (Translation)](https://en.wikipedia.org/wiki/Translation_(geometry)) 变换非常好理解，就是对每个顶点的坐标做加减法运算。

比如我们想要把这个矩形沿 x 轴移动 2 单位，沿 y 轴移动 1 单位，如图所示：

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-3.6,-1.6) grid (3.6,2.6);
  \draw[->,thick,color=gray] (-3.8,0) -- (3.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,2.8) node[above] {$y$};
  \node[below left] at (0,0) {$O$};

  \draw[very thick,dotted] (0,0) rectangle (1,1);
  \draw[very thick] (2,1) rectangle (3,2);

  \node[below] at (2,1) {$(2, 1)$};
\end{tikzpicture}
\end{document}
```

平移变换的坐标公式也很简单：

$$
\begin{align}
x' &= x + t_x \\
y' &= y + t_y
\end{align}
$$

然而，和上面的其他变换不同的是，平移变换改变的是原点，而基向量不变：

$$
\begin{align}
\boldsymbol{i'} &= (1, 0) \\
\boldsymbol{j'} &= (0, 1)
\end{align}
$$

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-3.6,-1.6) grid (3.6,2.6);
  \draw[->,thick,color=gray] (-3.8,0) -- (3.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,2.8) node[above] {$y$};
  \node[below left] at (0,0) {$O$};
  \node[below left] at (2,1) {$O'$};

  \draw[thick,dotted] (0,0) rectangle (1,1);
  \draw[thick,dotted] (2,1) rectangle (3,2);

  \draw[->,very thick,gray] (0,0) -- (1,1) node[above] {$1\vec{i} + 1\vec{j}$};
  \draw[->,very thick] (2,1) -- (3,2) node[above] {$1\vec{i'} + 1\vec{j'}$};

  \draw[->,very thick,green] (2,1) -- (3,1) node[below left] {$\vec{i'}$};
  \draw[->,very thick,orange] (2,1) -- (2,2) node[below left] {$\vec{j'}$};

  \draw[->,very thick,blue] (0,0) -- (1,0) node[below left] {$\vec{i}$};
  \draw[->,very thick,red] (0,0) -- (0,1) node[below left] {$\vec{j}$};
\end{tikzpicture}
\end{document}
```

也就是说，在平移变换中，向量有以下变换关系：

$$
\boldsymbol{v'} = \boldsymbol{v} + (x_t, y_t)
$$

其中，$(x_t, y_t)$ 为新的原点。因为平移之后原点改变了，所以平移不是线性变换。

-----

## 二维变换的矩阵表示

OK，到现在我们已经掌握了四个基本的二维变换，以及它们的坐标变换公式：

- 缩放
- 剪切
- 旋转
- 平移

现在请考虑一个问题：二维变换要如何叠加？

举个例子，在 CSS 中我们可能会写出这样的效果，先旋转，再剪切，再缩放，最后平移（注意 transform 是从右往左应用的）：

```css
transform: translateX(30px) scaleY(0.5) scaleX(2) skewX(45deg) rotate(90deg);
```

如果使用坐标变换公式的形式去表示，可能需要联立一大堆式子才能刻画出这么一串二维变换。不仅实现起来麻烦、计算量大，而且一点也不直观。

> 试想，一个 3D 游戏中的模型可能包含了成千上万个三角形，要经过十几次坐标变换才能显示到屏幕上。如果这些模型上的每个顶点都要经过一长串的数学运算才能算出最终坐标结果，那这性能有多差就可想而知了。

那么有没有什么解决办法呢？答案就是矩阵。

[矩阵 (Matrix)](https://zh.wikipedia.org/zh-cn/%E7%9F%A9%E9%98%B5) 是一组排列成矩形的数的集合，在各学科中都有着广泛的应用。在线性代数和计算机图形学中，通常使用矩阵来描述线性变换。

$$
\boldsymbol{v'} = \mathbf{M} \boldsymbol{v}
$$

下面我们根据上一小节的内容，尝试推导旋转的变换矩阵 $\mathbf{M}_{rotate}$：

```tikz
\begin{document}
\begin{tikzpicture}[scale=1.5]
  \draw[help lines] (-1.6,-1.6) grid (1.6,1.6);
  \node[below left] at (0,0) {$O$};

  \draw[->,thick,color=gray] (-1.8,0) -- (1.8,0) node[right] {$x$};
  \draw[->,thick,color=gray] (0,-1.8) -- (0,1.8) node[above] {$y$};

  \draw[thick,dotted] (0,1) -- (1,1) -- (1,0);
  \draw[thick,dotted,rotate=30] (0,0) rectangle (1,1) node[right] {$1\vec{i'} + 1\vec{j'}$};

  \draw[->,very thick,green] (0,0) -- (0.86,0.5) node[right] {$\vec{i'}$};
  \draw[->,very thick,orange] (0,0) -- (-0.5,0.86) node[left] {$\vec{j'}$};
\end{tikzpicture}
\qquad
\qquad
\end{document}
```

$$
\begin{align}
\boldsymbol{v} &= \begin{bmatrix}x \\ y\end{bmatrix} \\
\\
\boldsymbol{v'} &= x \boldsymbol{i'} + y \boldsymbol{j'} \\[2mm]
&= x \begin{bmatrix}\cos \phi \\ \sin \phi\end{bmatrix}
 + y \begin{bmatrix}-\sin \phi \\ \cos \phi\end{bmatrix} \\[2mm]
&= \begin{bmatrix}\cos \phi & -\sin \phi \\ \sin \phi & \cos \phi \end{bmatrix} \begin{bmatrix}x \\ y\end{bmatrix} \\[2mm]
&= \mathbf{M}_{rotate} \boldsymbol{v} \\
\\
\mathbf{M}_{rotate} &= \begin{bmatrix}\cos \phi & -\sin \phi \\ \sin \phi & \cos \phi \end{bmatrix}
\end{align}
$$

不难看出，线性变换的矩阵有一个特性：**矩阵的每一列都是变换后的基向量**。因为线性变换本质上就是对基向量进行了变换，基向量的变换矩阵就是这个线性变换的矩阵。

$$
\begin{align}
%x' &= m_{11}x + m_{12}y \\
%y' &= m_{21}x + m_{22}y \\
%\\
\boldsymbol{i'} &= m_{11} \boldsymbol{i} + m_{21} \boldsymbol{j} \\
\boldsymbol{j'} &= m_{12} \boldsymbol{i} + m_{22} \boldsymbol{j} \\
\\
\mathbf{R} &= \begin{bmatrix}m_{11} & m_{12} \\ m_{21} & m_{22} \end{bmatrix}
\end{align}
$$

同理我们可以得出其他几个二维变换的变换矩阵（翻回去看看它们的基向量吧～）：

$$
\begin{align}
&\mathbf{M}_{scale} &= \begin{bmatrix}s_x & 0 \\ 0 & s_y \end{bmatrix} \quad &\text{(缩放)} \\
&\mathbf{M}_{shearx} &= \begin{bmatrix}1 & \tan \phi \\ 0 & 1 \end{bmatrix} \quad &\text{(沿 x 轴剪切)} \\
&\mathbf{M}_{sheary} &= \begin{bmatrix}1 & 0 \\ \tan \phi & 1 \end{bmatrix} \quad &\text{(沿 y 轴剪切)} \\
&\mathbf{M}_{rotate} &= \begin{bmatrix}\cos \phi & -\sin \phi \\ \sin \phi & \cos \phi \end{bmatrix} \quad &\text{(旋转)}
\end{align}
$$

矩阵可以描述任意线性变换，且线性变换的组合 (Composition) 可以表示为矩阵连乘的形式：

$$
\begin{gather}
\boldsymbol{v'} = \mathbf{M}_5 \mathbf{M}_4 \mathbf{M}_3 \mathbf{M}_2 \mathbf{M}_1 \boldsymbol{v}
\\
\\
\mathbf{M}_{composite} = \mathbf{M}_5 \mathbf{M}_4 \mathbf{M}_3 \mathbf{M}_2 \mathbf{M}_1
\\
\\
\boldsymbol{v'} = \mathbf{M}_{composite} \boldsymbol{v}
\end{gather}
$$

> 在 2D/3D 渲染引擎中，我们可以对物体进行无数次缩放/旋转/平移/嵌套，这些变换最终都是以矩阵的形式存储在对象的属性中，比如 Three.js 中的 `matrixWorld`。这样在渲染时，只需要一次矩阵乘法运算，就可以把物体中的顶点从模型坐标转换为世界坐标，非常高效。

而且在大多数情况下，线性变换矩阵都是可逆的。乘以一个变换的逆矩阵，相当于撤销这个变换：

$$
\begin{gather}
\mathbf{M}^{-1} \mathbf{M} = \mathbf{I}
\\
\\
\begin{aligned}
\mathbf{M}_{composite}^{-1}
&= (\mathbf{M}_5 \mathbf{M}_4 \mathbf{M}_3 \mathbf{M}_2 \mathbf{M}_1)^{-1} \\
&= \mathbf{M}_1^{-1} \mathbf{M}_2^{-1} \mathbf{M}_3^{-1} \mathbf{M}_4^{-1} \mathbf{M}_5^{-1}
\end{aligned}
\\
\\
\boldsymbol{v} = \mathbf{M}_{composite}^{-1} \boldsymbol{v'}
\end{gather}
$$

矩阵的强大之处远不止于此。总而言之，使用矩阵描述二维变换，可以大幅减少所需的计算量，表现形式上也更加简洁清晰，因此有着十分广泛的应用。

## 平移变换与齐次坐标

细心的同学可能发现，我们在上一小节中没有提到平移变换。

为什么？因为线性变换中原点保持不动，2x2 的矩阵无法表示二维空间内的平移。不信可以试试：

$$
\begin{bmatrix}a & b \\ c & d \end{bmatrix} \begin{bmatrix}x \\ y\end{bmatrix}
= \begin{bmatrix}ax + by \\ cx + dy\end{bmatrix}
$$

那怎么办呢？一个聪明的办法就是新增一个维度，将二维点 $(x, y)$ 用三维向量 $(x, y, 1)$ 来表示，然后用 3x3 的矩阵对其进行变换：

$$
\begin{bmatrix}a & b & t_x \\ c & d & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix}x \\ y \\ 1\end{bmatrix}
= \begin{bmatrix}ax + by + t_x \\ cx + dy + t_y \\ 1 \end{bmatrix}
$$

可以看到，矩阵乘法自动帮我们给向量加上了偏移量 $(t_x, t_y)$，也就是平移。

太神奇啦有木有！🧙

有别于[线性变换 (Linear transformation)](https://zh.wikipedia.org/zh-cn/%E7%BA%BF%E6%80%A7%E6%98%A0%E5%B0%84)，这种一次线性变换然后接着一个平移的变换，叫做[仿射变换 (Affine transformation)](https://zh.wikipedia.org/zh-cn/%E4%BB%BF%E5%B0%84%E5%8F%98%E6%8D%A2)。仿射变换可以改变坐标系原点。

这种添加一个维度来表示点和向量的方法，就叫做[齐次坐标 (Homogeneous coordinates)](https://zh.wikipedia.org/zh-cn/%E9%BD%90%E6%AC%A1%E5%9D%90%E6%A0%87)。齐次坐标使得仿射变换可以直接用矩阵来表示和计算，被大量运用于计算机图形学、计算机视觉、机器人等领域。

引入齐次坐标后，我们就可以写出所有二维变换的矩阵了：

![[2D_affine_transformation_matrix.svg.png]]

*▲ 图片来自 [Wikimedia](https://commons.wikimedia.org/wiki/File:2D_affine_transformation_matrix.svg)，作者：Cmglee*

## CSS 中的矩阵变换

好了，理论知识就到这里，现在来点我们熟悉的 CSS 实战一下吧！

现在打开 MDN 文档，会不会有种豁然开朗的感觉？

回到 CSS，所有的 transform function 都可以用 matrix3d 表示
在浏览器中，所有 translate、rotate、skew 等属性最终都被解析为 matrix，可以看 computed style
矩阵变换的种类：旋转、缩放、平移、切变、投影、镜像、反射、正投影（没有便捷方法）

## 变换的原点

上面我们介绍的所有二维变换，除了平移，都是基于坐标原点去变换的。熟悉 CSS 的同学一定知道，CSS 中有个 [`transform-origin` 属性](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin)，可以改变变换的原点。

![[Snipaste_2023-11-22_12-50-12.png]]

*▲ 注意：在 CSS 中 Y 轴正方向是朝下的，所以和前面的示意图会有些不同*

那么使用矩阵计算时，如何更改变换的原点呢？

也很简单，对于基准点非坐标原点的变换，可通过以下操作序列实现：

- 平移对象，使基准点位置移动到坐标原点
- 围绕坐标原点进行缩放/剪切/旋转变换
- 反向平移回去

写成公式就是：

$$
\boldsymbol{v'} = \mathbf{T}^{-1} \mathbf{M} \mathbf{T}
$$

其中，$\mathbf{T}$ 表示平移矩阵，$\mathbf{T}^{-1}$ 是其逆矩阵。比如围绕点 $(50, 50)$ 缩放 2 倍，矩阵表示为：

$$
\begin{bmatrix}
1 & 0 & 50 \\
0 & 1 & 50 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
2 & 0 & 0 \\
0 & 2 & 0 \\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
1 & 0 & -50 \\
0 & 1 & -50 \\
0 & 0 & 1
\end{bmatrix}
$$

这也是 [CSS 规范](https://www.w3.org/TR/css-transforms-1/#transform-rendering)中处理 `transform-origin` 的标准流程。以下两个样式效果是相同的：

```css
.box1 {
    transform-origin: 0 0;
    transform: translate(50px, 50px) scale(2) translate(-50px, -50px);
}

.box2 {
  transform-origin: 50px 50px;
    transform: scale(2);
}
```

## 从 2D 到 3D

要把我们已知的二维变换扩展到三维空间中也很简单，新增一个维度即可。

在三维空间中，我们使用包含四个分量的向量来表示点和向量的齐次坐标：

$$
\boldsymbol{v} = \begin{bmatrix}x \\ y \\ z \\ w\end{bmatrix}
$$

其中的 $w$ 齐次分量一般用于[透视投影 (Perspective projection)](https://en.wikipedia.org/wiki/Perspective_(graphical)) 中的齐次除法。而在仿射变换中 $w$ 始终不变，通常设其为 1 并忽略。

齐次坐标和笛卡尔坐标之间可以互相转换：

$$
(x, y, z, w) \Leftrightarrow (\frac{x}{w}, \frac{y}{w}, \frac{z}{w})
$$

同样地，我们的变换矩阵也要增加一个维度，变成 4x4 的矩阵：

$$
\begin{align}
\rm{scale}(s_x, s_y, s_z) &= \begin{bmatrix}
s_x & 0 & 0 & 0 \\
0 & s_y & 0 & 0 \\
0 & 0 & s_z & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
\\[2mm]
\rm{shear\textnormal{-}z}(d_z, d_y) &= \begin{bmatrix}
1 & 0 & d_x & 0 \\
0 & 1 & d_y & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
\\[2mm]
\rm{rotate\textnormal{-}z}(\phi) &= \begin{bmatrix}
\cos \phi & -\sin \phi & 0 & 0 \\
\sin \phi & \cos \phi & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
\\[2mm]
\rm{translate}(t_x, t_y, t_z) &= \begin{bmatrix}
1 & 0 & 0 & t_x \\
0 & 1 & 0 & t_y \\
0 & 0 & 1 & t_z \\
0 & 0 & 0 & 1
\end{bmatrix}
\end{align}
$$

更多关于 3D 变换的知识，可以参考 [Learn OpenGL 的《变换》章节](https://learnopengl-cn.github.io/01%20Getting%20started/07%20Transformations/)。

## WebGL 中的矩阵变换

再来复习一下 WebGL 中的坐标系统：

- **局部坐标 (Local Coordinate)**
  - 或称模型坐标，对应局部空间
  - 一个物体中的点相对于该物体原点的局部坐标
- **世界坐标 (World Coordinate)**
  - 对应世界空间
  - 局部坐标相对于世界原点的坐标，把物体放到整个世界中去看
- **观察坐标 (View Coordinate)**
  - 对应观察空间
  - 从摄像机/人眼的角度去观察世界，所看到的物体相对于观察者的坐标
  - 同一个世界坐标，从不同的距离、角度、视野去观察，得到的观察坐标也不同
- **裁剪坐标 (Clip Coordinate)**
  - 对应裁剪空间
  - 将观察空间内超出一定范围的坐标点都裁剪掉，只保留一定范围内的坐标
  - 任何超过这个范围的点都不会显示在你的屏幕上
  - 从观察坐标转换为裁剪坐标的过程，称作投影变换 (Projection)
- **标准化设备坐标 (Normalized Device Coordinate, NDC)**
  - 将裁剪空间的坐标值范围映射到 `[-1, 1]` 范围之间，即为 NDC
  - 坐标 `(0, 0)` 位于裁剪空间的正中间，左下角为 `(-1, -1)`，右上角为 `(1, 1)`
- **屏幕坐标 (Screen Coordinate)**
  - 对应屏幕空间
  - 将标准化设备坐标映射到屏幕坐标的过程，称做视口变换
- **纹理坐标 (Texture Coordinates)**
  - 即纹理图像上的坐标
  - 纹理坐标与像素坐标不同，无论纹理是什么尺寸，纹理坐标范围始终是 `[0, 1]`
  - 纹理图像的左下角坐标为 `(0, 0)`，右上角坐标为 `(1, 1)`

![[coordinate_systems.png]]

*▲ 各种坐标与变换矩阵的关系。插图来自 [LearnOpenGL](https://learnopengl.com/Getting-started/Coordinate-Systems)*

从上图中可以看出，在 WebGL 中各个坐标系之间的转换就是通过矩阵变换完成的。

介绍 WebGL 的各种坐标系，以及如何通过变换矩阵在坐标系中转换
注意矩阵合成的顺序，矩阵乘法不适用交换律
WebGL/OpenGL 中普遍使用齐次坐标和矩阵变换
使用 PixiJS 和 Three.js 分别举例说明 2D/3D 矩阵变换的应用

## 结语

计算机图形学和数学是紧密关联的，比如：向量、矩阵、线性代数、微积分、解析几何、计算几何
以前觉得抽象、枯燥的数学，在实际应用之后，会更容易感受到数学的美妙
希望大家听完后，对 transform 的应用可以更加得心应手

如果想了解更多关于线性代数的知识，可以看看 3Blue1Brown 的《线性代数的本质》系列视频，保证一定比大学里学的有意思多了。


向量是线性空间的基本元素，所有满足可加性与数乘性的向量集合构成了向量空间，我们用向量坐标表示矩阵，通过矩阵运算描述线性变换。

参考资料：

Fundamentals of Computer Graphics (Fourth Edition)


矩阵变换演示：
https://www.mathsisfun.com/algebra/matrix-transform.html

公式：
https://zh.wikipedia.org/zh-cn/%E5%8F%98%E6%8D%A2%E7%9F%A9%E9%98%B5

矩阵乘法作为组合变换的形式以理解 | 线性代数的本质，第4章 - YouTube
https://www.youtube.com/watch?app=desktop&v=XkY2DOUCWMU

变换 - LearnOpenGL-CN
https://learnopengl-cn.readthedocs.io/zh/latest/01%20Getting%20started/07%20Transformations/#_1

<style>
  article.post .hide-in-post-preview { display: none; }
  article.post .hide-in-post-preview + p { margin-top: 0; }
  aside { position: relative; }
  aside section.widget-toc { position: sticky; top: 2em; background-color: #fff; }
  @media (prefers-color-scheme: dark) {
    aside section.widget-toc { background-color:#181a1b; }
  }
</style>
