"use client";

import React, {
  useState,
  useRef,
  useEffect,
  MouseEvent,
  DragEvent,
} from "react";

/**
 * 导入flag SVG 文件
 */
import logo1Src from "../../public/flag.svg";

/**
 * Logo 状态接口定义
 */
interface LogoState {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 拖拽状态接口定义
 */
interface DragState {
  isDragging: boolean;
  target: "none" | "logo1";
  offsetX: number;
  offsetY: number;
}

// ===============================================
// GitHub 贡献者数据接口
// ===============================================

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}


// ===============================================
// 优化的贡献者和项目仓库页脚组件 (动态获取)
// ===============================================

const ContributorsFooter = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // *** 根据您提供的 JS 代码逻辑设置的仓库 ***
  const REPO_OWNER = 'bghtnya'; 
  const REPO_NAME = 'TransFlag_Avatar_Tool';
  const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/`;
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors`;

  /**
   * 效果：在组件加载后立即调用 GitHub API
   */
  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          // 如果 API 调用失败（例如达到速率限制），返回错误
          throw new Error(`GitHub API error: ${response.statusText}`);
        }
        return response.json() as Promise<Contributor[]>;
      })
      .then(data => {
        // 过滤掉非用户类型的贡献者 (如 Bots)
        const humanContributors = data.filter(c => c.type === 'User');
        setContributors(humanContributors);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch contributors:", err);
        setError(true);
        setLoading(false);
      });
  }, []); 

  /**
   * 渲染贡献者列表的逻辑
   */
  const renderContributors = () => {
    if (loading) {
      // 骨架加载占位
      return (
        <ul className="flex justify-center flex-wrap gap-4 list-none p-0" aria-label="贡献者列表加载中">
          {Array.from({ length: 12 }).map((_, i) => (
            <li key={i} className="flex items-center bg-gray-100 p-2 rounded-full shadow-sm animate-pulse">
              <div className="w-7 h-7 rounded-full mr-2 bg-gray-300" />
              <div className="h-5 w-24 bg-gray-300 rounded" />
            </li>
          ))}
        </ul>
      );
    }

    if (error) {
      return (
        <p>
          无法同步贡献者信息。您可以前往
          <a
            href={`${REPO_URL}graphs/contributors`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-semibold hover:underline ml-1"
            title="查看 GitHub 贡献者图"
          >
            贡献者图
          </a>
          查看。
        </p>
      );
    }

    if (contributors.length === 0) {
      return <p>暂无贡献者信息。</p>;
    }
    
    return (
      <ul className="flex justify-center flex-wrap gap-4 list-none p-0" aria-label="项目贡献者列表">
        {contributors.slice(0, 24).map((contributor) => (
          <li 
            key={contributor.login}
            className="flex items-center font-semibold bg-white p-2 rounded-full transition hover:bg-gray-50 shadow-sm"
            aria-label={`贡献者：${contributor.login}`}
          >
            <img
              // 确保头像清晰，使用 s=56 参数
              src={`${contributor.avatar_url}?s=56`} 
              alt={`${contributor.login}'s avatar`}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full mr-2 border-2 border-green-500"
            />
            <a
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-green-600"
              title={`前往 ${contributor.login} 的 GitHub 主页`}
            >
              {contributor.login}
            </a>
          </li>
        ))}
      </ul>
    );
  };


  return (
    <footer className="pt-8 pb-4 text-center border-t border-gray-200 text-gray-600 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-4">
          <p className="font-semibold text-lg mb-4 text-gray-700">
            项目贡献者：
          </p>
          {renderContributors()}
        </div>
        <p>
          项目仓库：
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-bold hover:underline ml-1 transition"
            title="前往项目仓库"
          >
            {REPO_NAME}
          </a>
        </p>
      </div>
    </footer>
  );
};


// ===============================================
// 主应用组件 (App)
// 包含所有 Canvas 和交互逻辑
// ===============================================


/**
 * 主应用组件
 * @returns {JSX.Element} 渲染的应用界面
 */
export default function App() {
  /** Canvas 引用，用于主编辑区域 */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Canvas 引用，用于圆形预览区域 */
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  /** 文件输入引用，用于图片上传 */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 状态：用户上传的基础图片 */
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  /** 状态：原始图片尺寸，用于导出时保持原始分辨率 */
  const [originalSize, setOriginalSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  /** 状态：flag图片 */
  const [logo1, setLogo1] = useState<HTMLImageElement | null>(null);

  /** 状态：flag的位置和尺寸信息 */
  const [logo1Pos, setLogo1Pos] = useState<LogoState>({
    x: 10,
    y: 500, // 初始 Y 坐标设为画布高度，在图片加载后会更新
    width: 0,
    height: 0,
  });

  /** 状态：当前拖拽状态 */
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    target: "none",
    offsetX: 0,
    offsetY: 0,
  });

  /** 状态：是否有文件正在拖拽到上传区域上方 */
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  /**
   * 效果：组件加载时预加载flag
   */
  useEffect(() => {
    const img1 = new Image();
    img1.src = logo1Src.src;
    img1.onload = () => {
      if (!canvasRef.current) return;
      const canvasWidth = 500;
      const canvasHeight = 500;

      // 计算等比缩放后的尺寸
      const scale1 = canvasWidth / img1.width;
      const w1 = img1.width * scale1;
      const h1 = img1.height * scale1;

      // 计算初始位置
      const x = (canvasWidth - w1) / 2; // 水平居中
      const y = canvasHeight - h1 - 15; // 底部向上偏移 15px

      setLogo1(img1);
      setLogo1Pos((prev) => ({ ...prev, width: w1, height: h1, x, y }));
    };
  }, []);

  /**
   * 效果：主绘制函数
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const ctx = canvas.getContext("2d");
    const previewCtx = previewCanvas.getContext("2d");
    if (!ctx || !previewCtx) return;

    // 初始化画布尺寸
    canvas.width = 500;
    canvas.height = 500;
    previewCanvas.width = 500;
    previewCanvas.height = 500;

    // 清空画布内容
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (baseImage) {
      // 计算等比缩放尺寸
      const scale = Math.min(
        canvas.width / baseImage.width,
        canvas.height / baseImage.height,
      );
      const scaledWidth = baseImage.width * scale;
      const scaledHeight = baseImage.height * scale;

      // 计算居中位置
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      // 绘制头像
      ctx.drawImage(baseImage, x, y, scaledWidth, scaledHeight);
    } else {
      // 绘制默认提示界面
      ctx.fillStyle = "#E0E0E0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#616161";
      ctx.textAlign = "center";
      ctx.font = "16px sans-serif";
      ctx.fillText("请上传图片", canvas.width / 2, canvas.height / 2);
    }

    // 绘制flag
    if (logo1) {
      ctx.drawImage(
        logo1,
        logo1Pos.x,
        logo1Pos.y,
        logo1Pos.width,
        logo1Pos.height,
      );
    }

    // 创建圆形预览
    previewCtx.save();
    previewCtx.beginPath();
    const centerX = previewCanvas.width / 2;
    const centerY = previewCanvas.height / 2;
    const radius = Math.min(previewCanvas.width, previewCanvas.height) / 2;
    previewCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    previewCtx.clip();
    previewCtx.drawImage(canvas, 0, 0);
    previewCtx.restore();
  }, [baseImage, logo1, logo1Pos]);

  /**
   * 处理上传的图片文件
   */
  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // 记录原始图片尺寸（用于导出）
          setOriginalSize({ width: img.width, height: img.height });
          // 更新显示图片
          setBaseImage(img);

          // 重新定位flag
          if (logo1) {
            setLogo1Pos((prev) => ({
              ...prev,
              x: (500 - prev.width) / 2, // 水平居中
              y: 500 - prev.height - 25, // 底部位置向上偏移 25px
            }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert("请上传图片文件。");
    }
  };

  /**
   * 处理文件选择事件
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  /**
   * 处理文件拖拽到上传区域事件
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  /**
   * 处理文件离开拖拽区域事件
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  /**
   * 处理文件拖拽放置事件
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * 获取鼠标在 Canvas 上的实际坐标
   */
  const getMousePos = (
    e: MouseEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  /**
   * 检查指定坐标是否在目标区域内
   */
  const isHit = (pos: LogoState, x: number, y: number) => {
    return (
      x >= pos.x &&
      x <= pos.x + pos.width &&
      y >= pos.y &&
      y <= pos.y + pos.height
    );
  };

  /**
   * 处理鼠标按下事件
   */
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    let newDragState: DragState = {
      isDragging: false,
      target: "none",
      offsetX: 0,
      offsetY: 0,
    };

    if (logo1 && isHit(logo1Pos, x, y)) {
      newDragState = {
        isDragging: true,
        target: "logo1",
        offsetX: x - logo1Pos.x,
        offsetY: y - logo1Pos.y,
      };
    }

    setDragState(newDragState);
    e.preventDefault();
  };

  /**
   * 处理鼠标移动事件
   */
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging || !canvasRef.current) return;

    const { x, y } = getMousePos(e);
    const newX = x - dragState.offsetX;
    const newY = y - dragState.offsetY;

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    if (dragState.target === "logo1") {
      // 计算新位置（限制在画布范围内）
      const targetNewX = Math.max(
        0,
        Math.min(newX, canvasWidth - logo1Pos.width),
      );
      const targetNewY = Math.max(
        0,
        Math.min(newY, canvasHeight - logo1Pos.height),
      );

      // 仅当位置发生变化时更新状态
      if (targetNewX !== logo1Pos.x || targetNewY !== logo1Pos.y) {
        setLogo1Pos((prev) => ({ ...prev, x: targetNewX, y: targetNewY }));
      }
    }
  };

  /**
   * 处理鼠标释放事件
   */
  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      target: "none",
      offsetX: 0,
      offsetY: 0,
    });
  };

  /**
   * 处理下载事件
   */
  const handleDownload = () => {
    if (!baseImage || originalSize.width === 0) {
      alert("请先上传一张图片后再下载。");
      return;
    }

    // 创建临时画布
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalSize.width;
    tempCanvas.height = originalSize.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 计算从预览尺寸到原始尺寸的缩放比例
    const scale = originalSize.width / 500;

    // 绘制原始尺寸的图片
    tempCtx.drawImage(baseImage, 0, 0, originalSize.width, originalSize.height);

    // 按比例绘制flag
    if (logo1) {
      tempCtx.drawImage(
        logo1,
        logo1Pos.x * scale,
        logo1Pos.y * scale,
        logo1Pos.width * scale,
        logo1Pos.height * scale,
      );
    }

    // 导出并下载
    const link = document.createElement("a");
    link.download = "avatar-with-flag.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-6 md:p-12 bg-gray-100 text-gray-800">
        {/* 新标题 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-700">
          <span className="inline md:inline">头像添加鱼板跨旗工具</span>
          <span className="block text-center md:inline">🏳️‍⚧️🍥</span>
        </h1>

        {/* 修改卡片背景色和阴影 */}
        <div className="w-full max-w-6xl bg-white p-4 md:p-8 rounded-lg shadow-lg">
          <div className="flex flex-col gap-8">
            {/* 块 1: 上传图片 */}
            <div>
              <input
                ref={fileInputRef}
                id="base-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="选择头像图片"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="上传图片，点击或拖拽文件到此处"
                title="上传图片，点击或拖拽文件到此处"
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer
                          ${isDraggingOver ? "border-blue-400 bg-gray-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
                          transition-colors`}
              >
                <span className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600">
                  选择头像图片
                </span>
                <p className="mt-2 text-sm text-gray-500">或拖拽图片到此处</p>
              </div>
            </div>

            {/* 块 2: 左右布局的画布区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左侧: 编辑画布 */}
              <div>
                <p className="mb-2 text-lg text-gray-700 text-center">
                  编辑区域（可拖拽旗帜调整位置）
                </p>
                <div className="w-full overflow-auto">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto ${
                      dragState.isDragging ? "cursor-grabbing" : "cursor-grab"
                    } max-w-full`}
                    tabIndex={0}
                    role="img"
                    aria-label="头像编辑画布，按住并拖动旗帜以移动位置"
                    title="头像编辑画布，按住并拖动旗帜以移动位置"
                  >
                    您的浏览器不支持 Canvas
                  </canvas>
                </div>
              </div>

              {/* 右侧: 预览画布 */}
              <div>
                <p className="mb-2 text-lg text-gray-700 text-center">
                  推特头像预览效果
                </p>
                <div className="w-full overflow-auto">
                  <canvas
                    ref={previewCanvasRef}
                    className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-full mx-auto max-w-full aspect-square"
                    role="img"
                    aria-label="预览效果"
                    title="预览效果"
                  >
                    您的浏览器不支持 Canvas
                  </canvas>
                </div>
              </div>
            </div>

            {/* 块 4: 下载 */}
            <div className="max-w-lg mx-auto w-full">
              <button
                onClick={handleDownload}
                disabled={!baseImage}
                className="w-full bg-green-500 text-white font-bold py-4 px-8 rounded-lg text-xl hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:-translate-y-0.5 transition-all"
              >
                下载合成后的头像
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 插入优化的页脚组件 (现在是动态的) */}
      <ContributorsFooter />
    </>
  );
}