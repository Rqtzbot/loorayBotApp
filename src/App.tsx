import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Battery, 
  Zap, 
  Move, 
  RotateCw, 
  Activity,
  Globe,
  Gauge,
  Camera,
  Cpu,
  Bot,
  RefreshCw,
  Wifi,
  Sun,
  Moon,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Database,
  Power,
  Radar,
  Video,
  Circle,
  Square,
  Play,
  Magnet,
  Target,
  Home,
  LayoutDashboard,
  Terminal,
  Languages,
  Radio,
  Scan,
  Aperture,
  CircuitBoard,
  Info,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  YAxis,
  Tooltip,
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Language = 'zh' | 'en';
type ActiveTab = 'dashboard' | 'camera' | 'control' | 'settings';
type Theme = 'light' | 'dark';

interface RobotState {
  connected: boolean;
  battery: number;
  voltage: number;
  current: number;
  vx: number;
  vy: number;
  vz: number;
  gyro: { roll: number; pitch: number; yaw: number };
  magnetometer: { x: number; y: number; z: number };
  odometer: { x: number; y: number; z: number };
  radar: { status: string; points: number };
  status: string;
  maxSpeed: number;
  minSpeed: number;
  hostIp: string;
  hostPort: string;
  clientIp: string;
  clientPort: string;
  wifiSSID: string;
  wifiSignal: number;
  theme: Theme;
  vibration: boolean;
  isRunning: boolean;
  hasCameraData: boolean;
  logs: string[];
}

const translations = {
  zh: {
    title: 'LooraysBotApp',
    status: '在线',
    offline: '离线',
    data: '实时速度',
    camera: '监控',
    dashboard: '仪表',
    control: '遥控',
    settings: '配置',
    forward: '前',
    backward: '后',
    left: '左',
    right: '右',
    speedLimit: '速度配置',
    ipAddr: 'IP地址',
    port: '端口',
    theme: '主题',
    vibration: '震动反馈',
    version: '版本 v4.2',
    noSignal: '视频丢失',
    estop: '紧急制动',
    curSpeed: '瞬时速度',
    imu: 'IMU姿态',
    mag: '磁力计',
    radar: '雷达点数',
    odometer: '里程记录',
    net: '网络节点',
    hostNode: '本机节点 (Host)',
    clientNode: '机器人节点 (Client)',
    wifiSettings: 'WiFi 连接',
    wifiName: 'WiFi 名称',
    wifiSignal: '信号强度',
    wifiStatus: '状态: 已连接',
    pref: '系统偏好',
    language: '语言设置',
    movement: '运动控制',
    linearSpeed: '线速度限幅',
    angularSpeed: '角速度限幅',
    liveStream: '实时监控',
    fps: '帧率',
    takePhoto: '拍照',
    recordVideo: '录像',
    camChannel: '监控频道 A',
    power: '电池电压',
    load: '当前负载',
    change: '切换',
    mode: '模式',
    engine: '系统引擎',
    serial: '序列号',
    curLang: '当前: 中文',
    roll: '横滚',
    pitch: '俯仰',
    yaw: '偏航',
    xAxis: 'X 轴',
    yAxis: 'Y 轴',
    zAxis: 'Z 轴'
  },
  en: {
    title: 'LooraysBotApp',
    status: 'Connected',
    offline: 'Offline',
    data: 'Velocity',
    camera: 'Live',
    dashboard: 'Dash',
    control: 'Drive',
    settings: 'Config',
    forward: 'FWD',
    backward: 'BWD',
    left: 'LEFT',
    right: 'RIGHT',
    speedLimit: 'Limit',
    ipAddr: 'Server',
    port: 'Port',
    theme: 'Mood',
    vibration: 'Vibration',
    version: 'Version 4.2',
    noSignal: 'No Stream',
    estop: 'E-STOP',
    curSpeed: 'Speed',
    imu: 'IMU Attitude',
    mag: 'Magnetometer',
    radar: 'Ld Points',
    odometer: 'Odometry',
    net: 'Networking',
    hostNode: 'Local Node (Host)',
    clientNode: 'Robot Node (Client)',
    wifiSettings: 'WiFi Setup',
    wifiName: 'SSID',
    wifiSignal: 'Signal Strength',
    wifiStatus: 'Status: Connected',
    pref: 'Display',
    language: 'Language',
    movement: 'Control',
    linearSpeed: 'Linear Limit',
    angularSpeed: 'Angular Limit',
    liveStream: 'LIVE STREAM',
    fps: 'FPS',
    takePhoto: 'Capture',
    recordVideo: 'Record',
    camChannel: 'Cam Channel A',
    power: 'Power Unit',
    load: 'Load',
    change: 'CHANGE',
    mode: 'MODE',
    engine: 'Engine',
    serial: 'Serial',
    curLang: 'English',
    roll: 'Roll',
    pitch: 'Pitch',
    yaw: 'Yaw',
    xAxis: 'X',
    yAxis: 'Y',
    zAxis: 'Z'
  }
};

const generateInitialChartData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    time: i,
    vx: 0,
    vy: 0,
    vz: 0
  }));
};

const GlassCard = ({ children, className, theme }: { children: React.ReactNode, className?: string, theme?: Theme }) => (
  <div className={cn(
    theme === 'dark' 
      ? "bg-slate-900/80 border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]" 
      : "bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
    "border rounded-[28px] p-5 transition-all duration-300 backdrop-blur-md",
    className
  )}>
    {children}
  </div>
);

const vibrate = (enabled: boolean) => {
  if (enabled && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
};

const JoystickControl = ({ onMove, lang, maxSpeed, minSpeed, vibrationEnabled, theme }: { onMove: (x: number, y: number) => void, lang: Language, maxSpeed: number, minSpeed: number, vibrationEnabled: boolean, theme: Theme }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const t = translations[lang];

  const handleStart = () => {
    setIsDragging(true);
    vibrate(vibrationEnabled);
  };
  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0); 
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    if ('touches' in e && e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const pad = document.getElementById('joystick-pad');
    if (!pad) return;
    
    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2 - 10;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const limitedDist = Math.min(distance, radius);
    const x = Math.cos(angle) * limitedDist;
    const y = Math.sin(angle) * limitedDist;
    
    setPosition({ x, y });
    
    // Scale normalized value (-1 to 1) to user defined limits
    const normX = x / radius;
    const normY = -y / radius;
    
    // Simple scaling: if forward/right use max, if backward/left use absolute min
    const scaleX = normX >= 0 ? maxSpeed : Math.abs(minSpeed);
    const scaleY = normY >= 0 ? maxSpeed : Math.abs(minSpeed);
    
    onMove(parseFloat((normX * scaleX).toFixed(3)), parseFloat((normY * scaleY).toFixed(3)));
  };

  return (
    <div className="relative p-4">
      <div 
        id="joystick-pad"
        className={cn(
          "relative w-44 h-44 rounded-full border-[3px] shadow-[inset_0_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center touch-none select-none",
          theme === 'dark' ? "bg-slate-800/50 border-white/20" : "bg-slate-100/50 border-white"
        )}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div className={cn(
          "absolute top-3 left-1/2 -translate-x-1/2",
          theme === 'dark' ? "text-slate-200" : "text-slate-400/40"
        )}>
          <ChevronUp size={24} />
        </div>
        <div className={cn(
          "absolute bottom-3 left-1/2 -translate-x-1/2",
          theme === 'dark' ? "text-slate-200" : "text-slate-400/40"
        )}>
          <ChevronDown size={24} />
        </div>
        <div className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2",
          theme === 'dark' ? "text-slate-200" : "text-slate-400/40"
        )}>
          <ChevronLeft size={24} />
        </div>
        <div className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2",
          theme === 'dark' ? "text-slate-200" : "text-slate-400/40"
        )}>
          <ChevronRight size={24} />
        </div>

        <div className={cn(
          "absolute w-14 h-14 rounded-full border",
          theme === 'dark' ? "border-slate-700/50" : "border-slate-300/30"
        )} />
        <motion.div 
          className={cn(
            "w-16 h-16 rounded-full shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center z-10 border-2 border-white/20",
            theme === 'dark' ? "bg-gradient-to-tr from-blue-600 to-indigo-500" : "bg-gradient-to-tr from-slate-700 to-slate-900"
          )}
          animate={{ x: position.x, y: position.y }}
          transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 15, stiffness: 250 }}
        >
          <div className="w-6 h-6 rounded-full border border-white/10" />
        </motion.div>
      </div>
    </div>
  );
};

const RobotVisual = ({ vx, vy, vz, isRunning, theme }: { vx: number, vy: number, vz: number, isRunning: boolean, theme: Theme }) => {
  const isMoving = Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05 || Math.abs(vz) > 0.05;
  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
  const intensity = Math.min(speed / 1.2, 1);

  return (
    <div className="flex flex-col items-center justify-center py-0 w-full overflow-visible">
      <motion.div
        animate={{
          y: isMoving ? [0, -2, 0] : 0,
          rotateY: vy * 12,
          rotateX: -vx * 8,
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 0.15, ease: "linear" },
          default: { type: 'spring', stiffness: 100, damping: 20 }
        }}
        className="relative w-full max-w-[320px] aspect-[4/3] flex items-center justify-center transform scale-95 my-0"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {/* Ground shadow */}
        <motion.div 
          animate={{
            scale: isMoving ? [1, 1.1, 1] : 1,
            opacity: isMoving ? 0.35 : 0.2
          }}
          transition={{ repeat: Infinity, duration: 0.15 }}
          className="absolute bottom-4 w-40 h-6 bg-black/40 blur-2xl rounded-full"
        />

        {/* Side/Perspective View Robot SVG */}
        <svg viewBox="0 0 200 160" className={cn(
          "w-full h-full overflow-visible my-0",
          theme === 'dark' 
            ? "drop-shadow-[0_15px_35px_rgba(148,163,184,0.25)]" 
            : "drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
        )}>
          <defs>
            <linearGradient id="chassisSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? "#64748b" : "#475569"} />
              <stop offset="100%" stopColor={theme === 'dark' ? "#334155" : "#0f172a"} />
            </linearGradient>
            <linearGradient id="chassisTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? "#94a3b8" : "#64748b"} />
              <stop offset="100%" stopColor={theme === 'dark' ? "#475569" : "#334155"} />
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Perspective Wheels (Back Row) */}
          <g transform="translate(40, 110)">
            <motion.circle 
              cx="0" cy="0" r="22" 
              fill={theme === 'dark' ? "#1e293b" : "#020617"} 
              stroke="rgba(255,255,255,0.1)" strokeWidth="1"
              animate={{ rotate: isMoving ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
            />
            {isMoving && <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeDasharray="8 4" />}
            <circle cx="0" cy="0" r="5" fill={theme === 'dark' ? "#475569" : "#334155"} />
            <circle cx="0" cy="0" r="1.5" fill={theme === 'dark' ? "#94a3b8" : "#f8fafc"} />
          </g>

          <g transform="translate(160, 110)">
            <motion.circle 
              cx="0" cy="0" r="22" 
              fill={theme === 'dark' ? "#1e293b" : "#020617"} 
              stroke="rgba(255,255,255,0.1)" strokeWidth="1"
              animate={{ rotate: isMoving ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
            />
            {isMoving && <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeDasharray="8 4" />}
            <circle cx="0" cy="0" r="5" fill={theme === 'dark' ? "#475569" : "#334155"} />
            <circle cx="0" cy="0" r="1.5" fill={theme === 'dark' ? "#94a3b8" : "#f8fafc"} />
          </g>
          
          {/* Main Chassis Cylindrical Base */}
          <path d="M20,105 Q100,135 180,105 L180,60 Q100,90 20,60 Z" fill="url(#chassisSideGrad)" />
          <ellipse cx="100" cy="60" rx="80" ry="32" fill="url(#chassisTopGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          
          {/* Facial Expression (Eyes & Brows) */}
          <g transform="translate(0, 15)">
            {/* Eyes */}
            <g>
              {/* Left Eye */}
              <motion.ellipse
                cx="72" cy="80"
                animate={{
                  rx: 8 - intensity * 4,
                  ry: 8 - intensity * 5,
                  cy: 80 + intensity * 3
                }}
                fill={theme === 'dark' ? "#f8fafc" : "#0f172a"}
                className="opacity-100"
              />
              {/* Left Pupil */}
              <motion.circle
                cx="72" 
                animate={{
                  cy: 80 + intensity * 3,
                  r: 3 - intensity * 1
                }}
                transition={{ duration: 0.1 }}
                fill={theme === 'dark' ? "#0f172a" : "#f8fafc"}
              />
              
              {/* Right Eye */}
              <motion.ellipse
                cx="128" cy="80"
                animate={{
                  rx: 8 - intensity * 4,
                  ry: 8 - intensity * 5,
                  cy: 80 + intensity * 3
                }}
                fill={theme === 'dark' ? "#f8fafc" : "#0f172a"}
                className="opacity-100"
              />
              {/* Right Pupil */}
              <motion.circle
                cx="128" 
                animate={{
                  cy: 80 + intensity * 3,
                  r: 3 - intensity * 1
                }}
                transition={{ duration: 0.1 }}
                fill={theme === 'dark' ? "#0f172a" : "#f8fafc"}
              />
            </g>
            
            {/* Eyebrows - reacting to "stress" */}
            <motion.path
              stroke={theme === 'dark' ? "#f8fafc" : "#0f172a"}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={false}
              animate={{
                d: intensity > 0.1 
                  ? `M 62 ${73 - intensity * 5} L 82 ${73 + intensity * 8}` // Aggressive slant
                  : `M 62 71 Q 72 65 82 71`, // Happy Arch
                opacity: 1,
                y: intensity * 2
              }}
            />
            <motion.path
              stroke={theme === 'dark' ? "#f8fafc" : "#0f172a"}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={false}
              animate={{
                d: intensity > 0.1 
                  ? `M 118 ${73 + intensity * 8} L 138 ${73 - intensity * 5}` // Aggressive slant
                  : `M 118 71 Q 128 65 138 71`, // Happy Arch
                opacity: 1,
                y: intensity * 2
              }}
            />

            {/* Mouth - tightens or shows effort */}
            <motion.path
              stroke={theme === 'dark' ? "#cbd5e1" : "#1e293b"}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: intensity > 0.3
                  ? `M 90 102 Q 100 ${102 - intensity * 10} 110 102` // Strained grimace
                  : `M 88 102 Q 100 114 112 102`, // Happy smile
                opacity: 0.9
              }}
            />
          </g>
          
          {/* Front central wheel */}
          <g transform="translate(100, 125)">
            <motion.circle 
              cx="0" cy="0" r="26" 
              fill={theme === 'dark' ? "#1e293b" : "#020617"} 
              stroke={theme === 'dark' ? "#334155" : "#1e293b"} strokeWidth="2"
              animate={{ rotate: isMoving ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 0.25, ease: "linear" }}
            />
            <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeDasharray="10 5" />
            <circle cx="0" cy="0" r="10" fill={theme === 'dark' ? "#334155" : "#1e293b"} />
            <circle cx="0" cy="0" r="5" fill={theme === 'dark' ? "#475569" : "#475569"} />
            <circle cx="0" cy="0" r="2" fill={theme === 'dark' ? "#94a3b8" : "#f8fafc"} />
          </g>

          {/* Lidar Unit (Cylindrical Radar) */}
          <g transform="translate(100, 48)">
            {/* Lidar Base */}
            <path d="M-22,12 Q0,18 22,12 L22,0 Q0,6 -22,0 Z" fill={theme === 'dark' ? "#475569" : "#0f172a"} />
            <ellipse cx="0" cy="0" rx="22" ry="7" fill={theme === 'dark' ? "#64748b" : "#1e293b"} />
            
            {/* Main Lidar Cylinder */}
            <motion.g
              animate={{ 
                y: isRunning ? [2, 0, 2] : 2
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              {/* Spinning scanning slot */}
              {isRunning && (
                <motion.rect 
                  x="-20" y="-21" width="40" height="6" rx="1.8" 
                  fill={theme === 'dark' ? "#D3D3D3" : "#000000"}
                  animate={{ 
                    x: [-20, 15, -20],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              )}
              <path d="M-25,-12 Q0,0 25,-12 L25,-32 Q0,-20 -25,-32 Z" fill={theme === 'dark' ? "#1e293b" : "#020617"} stroke="rgba(255,255,255,0.1)" />
              <ellipse cx="0" cy="-32" rx="25" ry="10" fill={theme === 'dark' ? "#475569" : "#1e293b"} stroke="rgba(255,255,255,0.2)" />
              {/* Red Indicator Dot Glow */}
              {isRunning && (
                <motion.circle 
                  cx="0" cy="-32" r="5" 
                  fill="#ef4444"
                  filter="url(#neonGlow)"
                  animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.9, 1.4, 0.9] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              )}
              {/* Red Indicator Dot */}
              <motion.circle 
                cx="0" cy="-32" r="3" 
                fill={isRunning ? "#ef4444" : "#450a0a"}
                animate={isRunning ? { opacity: [1, 0.4, 1], scale: [1, 1.1, 1] } : { opacity: 1, scale: 1 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </motion.g>
          </g>

          {/* Ground Speed Effects (Appear when moving) */}
          {isMoving && (
            <g transform="translate(100, 130)">
              {/* Speed lines under rear wheels */}
              <motion.line 
                x1="-60" y1="0" x2="-90" y2="5" 
                stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.4"
                animate={{ x: [-5, -30], opacity: [0, 0.6, 0] }}
                transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
              />
              <motion.line 
                x1="60" y1="0" x2="90" y2="5" 
                stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.4"
                animate={{ x: [5, 30], opacity: [0, 0.6, 0] }}
                transition={{ repeat: Infinity, duration: 0.15, ease: "linear", delay: 0.07 }}
              />
              {/* Dust particles under center wheel */}
              <motion.circle 
                cx="0" cy="5" r="2" fill="#cbd5e1" opacity="0.5"
                animate={{ y: [0, 8], x: [-5, 5], opacity: [0.5, 0], scale: [1, 2] }}
                transition={{ repeat: Infinity, duration: 0.2, ease: "easeOut" }}
              />
              <motion.circle 
                cx="0" cy="5" r="1.5" fill="#cbd5e1" opacity="0.5"
                animate={{ y: [0, 10], x: [5, -5], opacity: [0.5, 0], scale: [1, 1.5] }}
                transition={{ repeat: Infinity, duration: 0.25, ease: "easeOut", delay: 0.1 }}
              />
            </g>
          )}

          {/* Antenna */}
          <motion.g
            initial={{ rotate: -5 }}
            animate={{ rotate: isMoving ? [-5, 5, -5] : -5 }}
            style={{ originX: '150px', originY: '45px' }}
          >
            <line x1="150" y1="45" x2="165" y2="5" stroke={theme === 'dark' ? "#94a3b8" : "#0f172a"} strokeWidth="3" strokeLinecap="round" />
            <circle cx="165" cy="5" r="3" fill={theme === 'dark' ? "#64748b" : "#1e293b"} />
            {isRunning && (
                <circle cx="165" cy="5" r="1.5" fill="#facc15" filter="url(#neonGlow)">
                    <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
                </circle>
            )}
          </motion.g>


        </svg>
      </motion.div>

      {/* Real-time speed indicators */}
      <div className="grid grid-cols-3 gap-2 px-4 w-full text-center relative z-10 mt-2 mb-4">
          {[
            { label: 'VX', value: vx },
            { label: 'VY', value: vy },
            { label: 'VZ', value: vz }
          ].map((item, i) => (
            <div key={item.label} className={cn(
                "flex flex-col items-center justify-center p-2 rounded-[20px] border transition-all",
                theme === 'dark' ? "bg-slate-900 border-white/20 shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)]" : "bg-white border-slate-200 shadow-sm"
            )}>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest mb-0.5",
                  theme === 'dark' ? "text-slate-500" : "text-slate-400"
                )}>{item.label}</p>
                <p className={cn(
                    "text-xl font-display font-black",
                    i === 0 ? (theme === 'dark' ? "text-indigo-400" : "text-indigo-600") : 
                    i === 1 ? (theme === 'dark' ? "text-emerald-400" : "text-emerald-600") : 
                    (theme === 'dark' ? "text-rose-400" : "text-rose-600")
                )}>
                    {item.value.toFixed(2)}
                </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [activeTab, setActiveTab] = useState<ActiveTab>('control');
  const [robotData, setRobotData] = useState<RobotState>({
    connected: true,
    battery: 88,
    voltage: 7.20,
    current: 0.9,
    vx: 0,
    vy: 0,
    vz: 0,
    gyro: { roll: 0, pitch: 0, yaw: 0 },
    magnetometer: { x: 35.2, y: -12.4, z: 48.1 },
    odometer: { x: 0, y: 0, z: 0 },
    radar: { status: 'SCANNING', points: 667 },
    status: 'SYSTEM_OK',
    maxSpeed: 1.2,
    minSpeed: -1.2,
    hostIp: '127.0.0.1',
    hostPort: '3000',
    clientIp: '192.168.1.18',
    clientPort: '8888',
    wifiSSID: '杂物房',
    wifiSignal: -42,
    theme: 'light',
    vibration: true,
    isRunning: true,
    hasCameraData: true,
    logs: ['系统启动成功', '正在搜索网络...', '已连接到机器人终端', '实时数据链路建立成功']
  });
  const [isRecording, setIsRecording] = useState(false);
  const [chartData, setChartData] = useState(generateInitialChartData());
  const t = translations[lang];

  useEffect(() => {
    // Sync dark mode class to root for tailwind dark: utility
    if (robotData.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [robotData.theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRobotData(prev => ({
        ...prev,
        odometer: {
            x: prev.odometer.x + Math.abs(prev.vx) * 0.05,
            y: prev.odometer.y + Math.abs(prev.vy) * 0.05,
            z: prev.odometer.z + Math.abs(prev.vz) * 0.05,
        },
        gyro: {
            roll: parseFloat((prev.gyro.roll + (Math.random() - 0.5) * 0.1).toFixed(2)),
            pitch: parseFloat((prev.gyro.pitch + (Math.random() - 0.5) * 0.1).toFixed(2)),
            yaw: parseFloat((prev.gyro.yaw + (Math.random() - 0.5) * 0.05).toFixed(2)),
        },
        magnetometer: {
            x: parseFloat((prev.magnetometer.x + (Math.random() - 0.5) * 0.5).toFixed(2)),
            y: parseFloat((prev.magnetometer.y + (Math.random() - 0.5) * 0.5).toFixed(2)),
            z: parseFloat((prev.magnetometer.z + (Math.random() - 0.5) * 0.5).toFixed(2)),
        },
        radar: {
            status: Math.random() > 0.05 ? 'SCANNING' : 'OBSTACLE',
            points: Math.floor(660 + Math.random() * 15)
        },
        logs: Math.random() > 0.9 ? [
            ...prev.logs.slice(-4), 
            `[${new Date().toLocaleTimeString()}] ${['传感器数据偏移', '正在重构SLAM地图', '雷达检测到动态障碍', '电池电压稳定', '磁力计校验完成'][Math.floor(Math.random() * 5)]}`
        ] : prev.logs
      }));

      setChartData(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(1), { 
            time: last.time + 1, 
            vx: robotData.vx + (Math.random() - 0.5) * 0.05,
            vy: robotData.vy + (Math.random() - 0.5) * 0.05,
            vz: robotData.vz + (Math.random() - 0.5) * 0.05
        }];
      });
    }, 100);
    return () => clearInterval(interval);
  }, [robotData.vx, robotData.vy, robotData.vz]);

  const toggleTheme = () => {
    setRobotData(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleEStop = () => {
    setRobotData(prev => ({ ...prev, vx: 0, vy: 0, vz: 0, isRunning: false, status: 'E_STOP' }));
  };

  const toggleRun = () => {
    vibrate(robotData.vibration);
    setRobotData(prev => {
      const nextState = !prev.isRunning;
      return { 
        ...prev, 
        isRunning: nextState,
        vx: nextState ? prev.vx : 0,
        vy: nextState ? prev.vy : 0,
        vz: nextState ? prev.vz : 0
      };
    });
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 px-4 pb-4 pt-0 font-sans select-none overflow-x-hidden",
      robotData.theme === 'dark' ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
    )}>
      <div className="max-w-lg mx-auto flex flex-col gap-4 pb-28">
        
        {/* Header - Sticky Wrapper */}
        <div className="sticky top-0 z-50 pt-4 -mx-4 px-4 bg-inherit">
          <header className={cn(
            "flex justify-between items-center p-3 rounded-2xl border transition-colors",
            robotData.theme === 'dark' 
              ? "bg-slate-900/90 border-white/20 backdrop-blur-md" 
              : "bg-white/90 border-slate-200 shadow-sm backdrop-blur-md"
          )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg relative overflow-hidden",
              robotData.theme === 'dark' ? "bg-indigo-600" : "bg-slate-900"
            )}>
              <motion.div
                animate={{ 
                  y: [0, -4, 0],
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="relative z-10"
              >
                <Bot size={22} />
              </motion.div>
              {/* Subtle scanning light effect */}
              <motion.div 
                animate={{ 
                  top: ['-100%', '200%']
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute left-0 right-0 h-1/2 bg-white/10 -skew-y-12 pointer-events-none"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight">{t.title}</h1>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  robotData.connected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_green]" : "bg-rose-500"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest font-display",
                  robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                )}>
                  {robotData.connected ? t.status : t.offline}
                </span>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "px-4 py-2 rounded-xl border flex items-center gap-2",
            robotData.theme === 'dark' ? "bg-slate-800 border-white/20" : "bg-slate-50 border-slate-200"
          )}>
            <Battery size={16} className={cn(robotData.battery < 20 ? "text-rose-500" : robotData.theme === 'dark' ? "text-indigo-400" : "text-indigo-500")} />
            <span className={cn(
              "text-sm font-black font-display tracking-tight",
              robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
            )}>{Math.round(robotData.battery)}%</span>
          </div>
        </header>
      </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-4"
            >
              {/* Velocity Deep Black Card */}
              <div className={cn(
                "rounded-[32px] overflow-hidden shadow-2xl border relative transition-all duration-300",
                robotData.theme === 'dark' ? "bg-black border-white/30" : "bg-slate-900 border-slate-800"
              )}>
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{t.data}</p>
                    <div className="flex gap-4">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/80"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> VX</span>
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/80"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> VY</span>
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/80"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> VZ</span>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="curveFillVX" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <YAxis 
                          tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold'}} 
                          width={40} axisLine={false} tickLine={false} domain={[-2.0, 2.0]}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                          itemStyle={{ padding: '0px' }}
                        />
                        <Area type="monotone" dataKey="vx" stroke="#10b981" strokeWidth={3} fill="url(#curveFillVX)" isAnimationActive={false} />
                        <Area type="monotone" dataKey="vy" stroke="#06b6d4" strokeWidth={3} fill="none" isAnimationActive={false} />
                        <Area type="monotone" dataKey="vz" stroke="#f59e0b" strokeWidth={3} fill="none" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Radar / Powergrid Info */}
              <div className="grid grid-cols-2 gap-4">
                 <GlassCard theme={robotData.theme} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          robotData.theme === 'dark' ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-500"
                        )}>
                            <Zap size={16} />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                        )}>{t.power}</span>
                    </div>
                    <div>
                        <p className={cn(
                          "text-[10px] font-bold uppercase whitespace-nowrap",
                          robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                        )}>{t.load} {robotData.current}A</p>
                        <p className={cn(
                          "text-2xl font-display font-bold",
                          robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                        )}>{robotData.voltage}<span className="text-sm opacity-40 ml-1">V</span></p>
                    </div>
                 </GlassCard>

                 <GlassCard theme={robotData.theme} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          robotData.theme === 'dark' ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-500"
                        )}>
                            <Radar size={16} />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                        )}>{t.radar}</span>
                    </div>
                    <div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            robotData.radar.status === 'OBSTACLE' ? "text-rose-500" : "text-emerald-500"
                        )}>
                            {robotData.radar.status}
                        </p>
                        <p className={cn(
                          "text-2xl font-display font-bold",
                          robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                        )}>{robotData.radar.points}<span className="text-sm opacity-40 ml-1 uppercase text-slate-400">pts</span></p>
                    </div>
                 </GlassCard>
              </div>

              {/* Odometry */}
              <GlassCard theme={robotData.theme} className="px-0">
                 <div className="flex items-center gap-2 mb-4 px-6">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      robotData.theme === 'dark' ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                    )}>
                        <Gauge size={18} />
                    </div>
                    <h3 className={cn(
                      "font-display font-bold text-sm tracking-tight",
                      robotData.theme === 'dark' ? "text-slate-200" : "text-slate-600"
                    )}>{t.odometer}</h3>
                 </div>
                 <div className="grid grid-cols-3 gap-2 px-3">
                    {[
                      { key: 'x', label: t.xAxis },
                      { key: 'y', label: t.yAxis },
                      { key: 'z', label: t.zAxis }
                    ].map(axis => (
                        <div key={axis.key} className={cn(
                          "flex flex-col items-center justify-center py-4 px-1 rounded-2xl border shadow-sm min-w-0 transition-colors",
                          robotData.theme === 'dark' ? "bg-slate-950/20 border-white/20" : "bg-white border-slate-100"
                        )}>
                            <p className={cn(
                              "text-[11px] font-black mb-2 uppercase tracking-widest leading-none",
                              robotData.theme === 'dark' ? "text-slate-500" : "text-slate-400"
                            )}>{axis.label}</p>
                            <p className={cn(
                              "text-xl font-display font-bold tabular-nums flex items-baseline gap-1",
                              robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                            )}>
                              {(robotData.odometer as any)[axis.key].toFixed(2)}
                              <span className="text-[10px] font-bold opacity-50">{axis.key === 'z' ? 'rad' : 'm'}</span>
                            </p>
                        </div>
                    ))}
                 </div>
              </GlassCard>

              {/* IMU Attitude */}
              <GlassCard theme={robotData.theme} className="px-0">
                 <div className="flex items-center gap-2 mb-4 px-6">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      robotData.theme === 'dark' ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600"
                    )}>
                        <Navigation size={18} />
                    </div>
                    <h3 className={cn(
                      "font-display font-bold text-sm tracking-tight",
                      robotData.theme === 'dark' ? "text-slate-200" : "text-slate-600"
                    )}>{t.imu}</h3>
                 </div>
                 <div className="grid grid-cols-3 gap-2 px-3">
                    {[
                      { key: 'roll', label: t.roll },
                      { key: 'pitch', label: t.pitch },
                      { key: 'yaw', label: t.yaw }
                    ].map(axis => (
                        <div key={axis.key} className={cn(
                          "flex flex-col items-center justify-center py-4 px-1 rounded-2xl border shadow-sm min-w-0 transition-colors",
                          robotData.theme === 'dark' ? "bg-slate-950/20 border-white/20" : "bg-white border-slate-100"
                        )}>
                            <p className={cn(
                              "text-[11px] font-black mb-2 uppercase tracking-widest leading-none",
                              robotData.theme === 'dark' ? "text-slate-500" : "text-slate-400"
                            )}>{axis.label}</p>
                            <p className={cn(
                              "text-xl font-display font-bold tabular-nums flex items-baseline gap-1",
                              robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                            )}>
                              {(robotData.gyro as any)[axis.key].toFixed(2)}
                              <span className="text-[10px] font-bold opacity-50">rad/s</span>
                            </p>
                        </div>
                    ))}
                 </div>
              </GlassCard>

              {/* Magnetometer */}
              <GlassCard theme={robotData.theme} className="px-0">
                 <div className="flex items-center gap-2 mb-4 px-6">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      robotData.theme === 'dark' ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"
                    )}>
                        <Magnet size={18} />
                    </div>
                    <h3 className={cn(
                      "font-display font-bold text-sm tracking-tight",
                      robotData.theme === 'dark' ? "text-slate-200" : "text-slate-600"
                    )}>{t.mag}</h3>
                 </div>
                 <div className="grid grid-cols-3 gap-2 px-3">
                    {[
                      { key: 'x', label: t.xAxis },
                      { key: 'y', label: t.yAxis },
                      { key: 'z', label: t.zAxis }
                    ].map(axis => (
                        <div key={axis.key} className={cn(
                          "flex flex-col items-center justify-center py-4 px-1 rounded-2xl border shadow-sm min-w-0 transition-colors",
                          robotData.theme === 'dark' ? "bg-slate-950/20 border-white/20" : "bg-white border-slate-100"
                        )}>
                            <p className={cn(
                              "text-[11px] font-black mb-2 uppercase tracking-widest leading-none",
                              robotData.theme === 'dark' ? "text-slate-500" : "text-slate-400"
                            )}>{axis.label}</p>
                            <p className={cn(
                              "text-xl font-display font-bold tabular-nums flex items-baseline gap-1",
                              robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                            )}>
                              {(robotData.magnetometer as any)[axis.key].toFixed(2)}
                              <span className="text-[10px] font-bold opacity-50">uT</span>
                            </p>
                        </div>
                    ))}
                 </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'camera' && (
            <motion.div 
               key="cam"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col justify-evenly min-h-[calc(100vh-180px)] gap-4 pb-4"
            >
               <GlassCard theme={robotData.theme} className={cn(
                  "p-0 overflow-hidden bg-black shadow-2xl relative h-[260px]",
                  robotData.theme === 'dark' ? "border-white/30" : "border-slate-200"
               )}>
                  {robotData.hasCameraData ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                        <Camera size={100} className="text-white" />
                        <div className="absolute top-8 left-8 flex items-center gap-2 bg-rose-600 px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> {t.liveStream}
                        </div>
                        <div className="absolute top-8 right-8 flex items-center justify-between gap-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white/70 min-w-[80px]">
                           <p className="text-[12px] font-black tracking-widest uppercase">{t.fps}</p>
                           <p className="text-[12px] font-bold opacity-60">30</p>
                        </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-8">
                        <Radio size={80} className="opacity-10" />
                        <p className="text-xs font-black uppercase tracking-[1em] opacity-30">{t.noSignal}</p>
                    </div>
                  )}
               </GlassCard>

               <div className={cn(
                   "flex items-center justify-center gap-6 mt-4 mb-4 p-4 rounded-[2rem] border transition-colors",
                   robotData.theme === 'dark' ? "bg-slate-900/50 border-white/20 shadow-inner" : "bg-white/50 border-slate-100 shadow-sm"
               )}>
                   <button 
                     onClick={() => setRobotData(d => ({ ...d, hasCameraData: !d.hasCameraData }))}
                     className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 border",
                        robotData.theme === 'dark' ? "bg-slate-800 border-white/20 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                     )}
                     title={t.liveStream}
                   >
                      <RefreshCw size={24} />
                   </button>

                   <button 
                     className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-2xl active:scale-95 border",
                        robotData.theme === 'dark' ? "bg-indigo-600 border-white/20 text-white hover:bg-indigo-500" : "bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
                     )}
                     title={t.takePhoto}
                   >
                      <Camera size={28} />
                   </button>

                   <button 
                     onClick={() => setIsRecording(!isRecording)}
                     className={cn(
                         "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 border",
                         isRecording 
                             ? "bg-rose-500 border-rose-400 text-white animate-pulse" 
                             : (robotData.theme === 'dark' ? "bg-slate-800 border-white/10 text-rose-500 hover:bg-slate-700" : "bg-white border-slate-200 text-rose-500 hover:bg-slate-50")
                     )}
                     title={t.recordVideo}
                   >
                      {isRecording ? <Square size={22} fill="currentColor" /> : <Video size={24} />}
                   </button>
               </div>

               <GlassCard theme={robotData.theme} className="min-h-[120px] flex flex-col p-4">
                  <div className={cn(
                    "flex items-center gap-2 mb-3 border-b pb-2",
                    robotData.theme === 'dark' ? "border-white/10" : "border-slate-100"
                  )}>
                      <div className={cn(
                        "p-1 rounded-md",
                        robotData.theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                      )}>
                          <Terminal size={14} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        robotData.theme === 'dark' ? "text-slate-500" : "text-slate-400"
                      )}>{lang === 'zh' ? '实时日志' : 'SYSTEM LOGS'}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-1">
                      {robotData.logs.map((log, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -5 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            key={i} 
                            className={cn(
                              "text-[11px] font-medium font-mono break-all",
                              robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                              <span className="opacity-40 mr-1.5">{i+1}.</span>
                              {log}
                          </motion.div>
                      ))}
                  </div>
               </GlassCard>
            </motion.div>
          )}

          {activeTab === 'control' && (
            <motion.div 
              key="joy"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-1"
            >
              <RobotVisual 
                vx={robotData.vx} 
                vy={robotData.vy} 
                vz={robotData.vz} 
                isRunning={robotData.isRunning} 
                theme={robotData.theme} 
              />

              <GlassCard theme={robotData.theme} className="flex flex-col items-center gap-4 py-4 px-4 relative overflow-hidden">
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none",
                  robotData.theme === 'dark' ? "bg-blue-500/10" : "bg-indigo-500/5"
                )} />
                
                <div className="flex flex-col items-center gap-1">
                  <JoystickControl 
                      lang={lang} 
                      maxSpeed={robotData.maxSpeed} 
                      minSpeed={robotData.minSpeed}
                      vibrationEnabled={robotData.vibration}
                      theme={robotData.theme}
                      onMove={(x, y) => {
                          // Forward/backward is y (mapped to vx), sideways is x (mapped to vy)
                          if (!robotData.isRunning) {
                            if (robotData.vx !== 0 || robotData.vy !== 0) {
                              setRobotData(d => ({ ...d, vx: 0, vy: 0 }));
                            }
                            return;
                          }
                          setRobotData(d => ({ ...d, vx: y, vy: x }));
                      }} 
                  />

                  {/* Custom Rotation & Run Control */}
                  <div className="flex gap-6 items-center">
                    <button 
                      onMouseDown={() => { vibrate(robotData.vibration); if(robotData.isRunning) setRobotData(d => ({ ...d, vz: d.minSpeed })); }} 
                      onMouseUp={() => setRobotData(d => ({ ...d, vz: 0 }))} 
                      onTouchStart={() => { vibrate(robotData.vibration); if(robotData.isRunning) setRobotData(d => ({ ...d, vz: d.minSpeed })); }} 
                      onTouchEnd={() => setRobotData(d => ({ ...d, vz: 0 }))}
                      className={cn(
                        "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all shadow-md active:shadow-none",
                        robotData.theme === 'dark' ? "bg-indigo-900/20 border-2 border-white/30 text-indigo-400 active:bg-blue-600 active:text-white" : "bg-slate-100 border-2 border-slate-200 text-slate-600 active:bg-blue-600 active:text-white"
                      )}
                    >
                      <RotateCw size={24} className="-scale-x-100" />
                    </button>

                    <button 
                      onClick={toggleRun}
                      className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-xl active:scale-95 border-2",
                        robotData.isRunning 
                          ? (robotData.theme === 'dark' ? "bg-rose-600 border-rose-400 text-white" : "bg-rose-600 border-rose-500 text-white") 
                          : (robotData.theme === 'dark' ? "bg-emerald-600 border-emerald-400 text-white" : "bg-emerald-600 border-emerald-500 text-white")
                      )}
                    >
                      {robotData.isRunning ? <Square size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </button>

                    <button 
                      onMouseDown={() => { vibrate(robotData.vibration); if(robotData.isRunning) setRobotData(d => ({ ...d, vz: d.maxSpeed })); }} 
                      onMouseUp={() => setRobotData(d => ({ ...d, vz: 0 }))} 
                      onTouchStart={() => { vibrate(robotData.vibration); if(robotData.isRunning) setRobotData(d => ({ ...d, vz: d.maxSpeed })); }} 
                      onTouchEnd={() => setRobotData(d => ({ ...d, vz: 0 }))}
                      className={cn(
                        "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all shadow-md active:shadow-none",
                        robotData.theme === 'dark' ? "bg-indigo-900/20 border-2 border-white/30 text-indigo-400 active:bg-indigo-600 active:text-white" : "bg-slate-100 border-2 border-slate-200 text-slate-600 active:bg-indigo-600 active:text-white"
                      )}
                    >
                      <RotateCw size={24} />
                    </button>
                  </div>
                </div>

                {/* Range Sliders for Scaling */}
                <div className="w-full px-0 mt-1">
                    <div className={cn(
                        "flex flex-col gap-2.5 p-4 rounded-[24px] border transition-colors",
                        robotData.theme === 'dark' ? "bg-slate-900/50 border-white/30" : "bg-slate-100/50 border-slate-200 shadow-sm"
                    )}>
                        <div className="space-y-1">
                            <div className={cn(
                              "flex justify-between items-center text-[9px] font-bold uppercase tracking-widest",
                              robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                            )}>
                                 <span>{t.linearSpeed}</span>
                                 <span className={cn(
                                   "font-display font-black",
                                   robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                                 )}>{robotData.maxSpeed} m/s</span>
                            </div>
                            <input type="range" min="0.1" max="2.0" step="0.1" value={robotData.maxSpeed}
                                onChange={(e) => setRobotData(v => ({ ...v, maxSpeed: parseFloat(e.target.value) }))}
                                className="w-full h-1.5 accent-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <div className={cn(
                              "flex justify-between items-center text-[9px] font-bold uppercase tracking-widest",
                              robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                            )}>
                                 <span>{t.angularSpeed}</span>
                                 <span className={cn(
                                   "font-display font-black",
                                   robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                                 )}>{Math.abs(robotData.minSpeed)} rad/s</span>
                            </div>
                            <input type="range" min="-2.0" max="-0.1" step="0.1" value={robotData.minSpeed}
                                onChange={(e) => setRobotData(v => ({ ...v, minSpeed: parseFloat(e.target.value) }))}
                                className="w-full h-1.5 accent-indigo-500" />
                        </div>
                    </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
               key="set"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col gap-4"
            >
               <h2 className="text-xl font-display font-black px-2 mt-2 tracking-tight drop-shadow-sm">{t.settings}</h2>
               
               {/* Regional Blocks */}
               <div className="space-y-4">
                  {/* WiFi Setup */}
                  <GlassCard theme={robotData.theme} className="flex flex-col gap-4 p-4">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-11 h-11 rounded-xl flex items-center justify-center",
                           robotData.theme === 'dark' ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                         )}>
                              <Wifi size={22} />
                         </div>
                         <h4 className={cn(
                           "font-display font-bold text-base",
                           robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                         )}>{t.wifiSettings}</h4>
                      </div>
                      <div className="space-y-4">
                          <div className="space-y-1.5">
                              <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-1",
                                "text-slate-400"
                              )}>{t.wifiName}</label>
                              <input type="text" value={robotData.wifiSSID} readOnly
                                  className={cn(
                                    "w-full p-3 rounded-xl text-sm font-black border transition-all outline-none",
                                    robotData.theme === 'dark' ? "bg-slate-900/50 border-slate-600 text-slate-400" : "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed"
                                  )} />
                          </div>
                          <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                  <div className={cn(
                                      "w-2 h-2 rounded-full bg-emerald-500 animate-pulse",
                                      "shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                  )} />
                                  <span className={cn(
                                      "text-[11px] font-bold uppercase tracking-widest",
                                      robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                                  )}>{t.wifiStatus}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                  <span className={cn(
                                      "text-[11px] font-black font-display",
                                      robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                                  )}>{robotData.wifiSignal} dBm</span>
                                  <div className="flex gap-0.5 items-end h-3">
                                      {[1, 2, 3, 4].map((i) => (
                                          <div key={i} className={cn(
                                              "w-1 rounded-full",
                                              i === 1 ? "h-1.5" : i === 2 ? "h-2" : i === 3 ? "h-2.5" : "h-3",
                                              robotData.wifiSignal > -30 - (i * 20) 
                                                ? (robotData.theme === 'dark' ? "bg-emerald-400" : "bg-emerald-500") 
                                                : (robotData.theme === 'dark' ? "bg-slate-800" : "bg-slate-200")
                                          )} />
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </GlassCard>

                  {/* Network - Host */}
                  <GlassCard theme={robotData.theme} className="flex flex-col gap-4 p-4">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-11 h-11 rounded-xl flex items-center justify-center",
                           robotData.theme === 'dark' ? "bg-sky-500/10 text-sky-400" : "bg-sky-50 text-sky-600"
                         )}>
                              <Globe size={22} />
                         </div>
                         <h4 className={cn(
                           "font-display font-bold text-base",
                           robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                         )}>{t.hostNode}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                              <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-1",
                                "text-slate-400"
                              )}>{t.ipAddr}</label>
                              <input type="text" value={robotData.hostIp} onChange={(e) => setRobotData(d => ({ ...d, hostIp: e.target.value }))}
                                  className={cn(
                                    "w-full p-3 rounded-xl text-sm font-black border transition-all outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500",
                                    robotData.theme === 'dark' ? "bg-slate-950 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                                  )} placeholder="127.0.0.1" />
                          </div>
                          <div className="space-y-1.5">
                              <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-1",
                                "text-slate-400"
                              )}>{t.port}</label>
                              <input type="text" value={robotData.hostPort} onChange={(e) => setRobotData(d => ({ ...d, hostPort: e.target.value }))}
                                  className={cn(
                                    "w-full p-3 rounded-xl text-sm font-black border transition-all outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500",
                                    robotData.theme === 'dark' ? "bg-slate-950 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                                  )} placeholder="3000" />
                          </div>
                      </div>
                  </GlassCard>

                  {/* Network - Client */}
                  <GlassCard theme={robotData.theme} className="flex flex-col gap-4 p-4">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-11 h-11 rounded-xl flex items-center justify-center",
                           robotData.theme === 'dark' ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                         )}>
                              <Cpu size={22} />
                         </div>
                         <h4 className={cn(
                           "font-display font-bold text-base",
                           robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                         )}>{t.clientNode}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                              <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-1",
                                "text-slate-400"
                              )}>{t.ipAddr}</label>
                              <input type="text" value={robotData.clientIp} onChange={(e) => setRobotData(d => ({ ...d, clientIp: e.target.value }))}
                                  className={cn(
                                    "w-full p-3 rounded-xl text-sm font-black border transition-all outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500",
                                    robotData.theme === 'dark' ? "bg-slate-950 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                                  )} placeholder="192.168.1.18" />
                          </div>
                          <div className="space-y-1.5">
                              <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-1",
                                "text-slate-400"
                              )}>{t.port}</label>
                              <input type="text" value={robotData.clientPort} onChange={(e) => setRobotData(d => ({ ...d, clientPort: e.target.value }))}
                                  className={cn(
                                    "w-full p-3 rounded-xl text-sm font-black border transition-all outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500",
                                    robotData.theme === 'dark' ? "bg-slate-950 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                                  )} placeholder="8888" />
                          </div>
                      </div>
                  </GlassCard>

                  {/* Language */}
                  <GlassCard theme={robotData.theme} className="hover:border-indigo-500/50 cursor-pointer group p-4">
                      <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            robotData.theme === 'dark' ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                          )}>
                              <Languages size={22} />
                          </div>
                          <div className="flex-1">
                              <p className={cn(
                                "font-display font-bold text-base",
                                robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                              )}>{t.language}</p>
                              <p className={cn(
                                "text-[11px] font-bold uppercase tracking-widest",
                                robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                              )}>{t.curLang}</p>
                          </div>
                          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className={cn(
                            "px-4 py-2 rounded-xl text-[11px] font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-white",
                            robotData.theme === 'dark' ? "bg-indigo-600" : "bg-slate-900"
                          )}>{t.change}</button>
                      </div>
                  </GlassCard>

                  {/* Display Mode */}
                  <GlassCard theme={robotData.theme} className="hover:shadow-xl transition-shadow p-4">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center",
                                robotData.theme === 'dark' ? "bg-slate-800" : "bg-amber-50"
                              )}>
                                  {robotData.theme === 'light' ? <Sun size={22} className="text-amber-600" /> : <Moon size={22} className="text-indigo-400" />}
                              </div>
                              <div>
                                  <p className={cn(
                                    "font-display font-bold text-base",
                                    robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                                  )}>{t.theme}</p>
                                  <p className={cn(
                                    "text-[11px] uppercase font-black tracking-widest",
                                    robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                                  )}>{robotData.theme} {t.mode}</p>
                              </div>
                          </div>
                          <button onClick={toggleTheme} className={cn(
                              "w-12 h-7 rounded-full relative transition-all duration-500 shadow-inner",
                              robotData.theme === 'dark' ? "bg-indigo-600" : "bg-slate-300"
                          )}>
                              <motion.div className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-md" animate={{ left: robotData.theme === 'dark' ? '24px' : '4px' }} />
                          </button>
                      </div>
                  </GlassCard>

                  {/* Vibration Feedback */}
                  <GlassCard theme={robotData.theme} className="hover:shadow-xl transition-shadow p-4">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center",
                                robotData.theme === 'dark' ? "bg-slate-800 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                              )}>
                                  <Activity size={22} />
                              </div>
                              <div>
                                  <p className={cn(
                                    "font-display font-bold text-base",
                                    robotData.theme === 'dark' ? "text-slate-100" : "text-slate-900"
                                  )}>{t.vibration}</p>
                                  <p className={cn(
                                    "text-[11px] uppercase font-black tracking-widest",
                                    robotData.theme === 'dark' ? "text-slate-400" : "text-slate-500"
                                  )}>{robotData.vibration ? 'ON' : 'OFF'}</p>
                              </div>
                          </div>
                          <button onClick={() => setRobotData(d => ({ ...d, vibration: !d.vibration }))} className={cn(
                              "w-12 h-7 rounded-full relative transition-all duration-500 shadow-inner",
                              robotData.vibration ? "bg-indigo-600" : "bg-slate-300"
                          )}>
                              <motion.div className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-md" animate={{ left: robotData.vibration ? '24px' : '4px' }} />
                          </button>
                      </div>
                  </GlassCard>

                   {/* Info Footer */}
                   <div className="pt-6 flex flex-col items-center opacity-50 space-y-4">
                       <div className="flex items-center gap-3">
                           <Info size={20} className="text-slate-400" />
                           <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">{t.version}</h4>
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest leading-none">{t.serial}: AIS-2026-X8-64</p>
                       <p className="text-[10px] font-black uppercase tracking-widest leading-none">{t.engine}: DeepMind AI Build</p>
                   </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Bottom Navigation */}
        <div className="fixed bottom-6 left-6 right-6 z-[100]">
            <nav className={cn(
               "border p-2.5 flex justify-between shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] rounded-[40px] transition-all duration-500 backdrop-blur-xl",
               robotData.theme === 'dark' ? "bg-slate-900/90 border-white/20" : "bg-white/80 border-slate-100"
            )}>
                {[
                    { id: 'control', icon: Move },
                    { id: 'dashboard', icon: Activity },
                    { id: 'camera', icon: Camera },
                    { id: 'settings', icon: SettingsIcon }
                ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button key={item.id} onClick={() => setActiveTab(item.id as ActiveTab)}
                            className={cn(
                                "flex items-center justify-center transition-all duration-300 rounded-[32px] h-14 relative overflow-hidden",
                                isActive 
                                  ? (robotData.theme === 'dark' ? "flex-1 bg-indigo-600 text-white shadow-xl shadow-indigo-600/40" : "flex-1 bg-slate-900 text-white shadow-xl shadow-black/20")
                                  : (robotData.theme === 'dark' ? "w-14 text-slate-500 hover:text-slate-300" : "w-14 text-slate-400 hover:text-slate-600")
                            )}>
                            <Icon size={26} strokeWidth={isActive ? 3 : 2} className="relative z-10" />
                            {isActive && (
                                <motion.div 
                                    layoutId="tab-glow"
                                    className="absolute inset-x-0 bottom-0 h-1 opaque flex justify-center"
                                >
                                    <div className="w-12 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm" />
                                </motion.div>
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>
      </div>
    </div>
  );
}
