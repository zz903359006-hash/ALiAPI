"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ================================================================
   Constants & Types
   ================================================================ */
const TIME_RANGES = ["1 小时", "6 小时", "12 小时", "24 小时", "7 天", "30 天"] as const;
const PRECISIONS = ["按分钟", "按小时", "按天"] as const;
const INFERENCE_TYPES = ["全部", "实时推理", "批量推理"] as const;
const GRANULARITY_PRECISION: Record<typeof TIME_RANGES[number], typeof PRECISIONS[number]> = {
  "1 小时": "按分钟", "6 小时": "按分钟", "12 小时": "按小时", "24 小时": "按小时", "7 天": "按天", "30 天": "按天",
};
const TIME_LABELS: Record<typeof TIME_RANGES[number], string[]> = {
  "1 小时": ["-60m", "-50m", "-40m", "-30m", "-20m", "-10m", "现在"],
  "6 小时": ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "现在"],
  "12 小时": ["-12h", "-10h", "-8h", "-6h", "-4h", "-2h", "现在"],
  "24 小时": ["-24h", "-20h", "-16h", "-12h", "-8h", "-4h", "现在"],
  "7 天": ["07-05", "07-06", "07-07", "07-08", "07-09", "07-10", "07-11"],
  "30 天": ["06-11", "06-16", "06-21", "06-26", "07-01", "07-06", "07-11"],
};

type MainMetric = "tokenTotal" | "requestCount" | "avgToken" | "avgLatency" | "ttft" | "successRate";
const MAIN_METRICS: { key: MainMetric; label: string; unit: string; precision: (v: number) => string }[] = [
  { key: "tokenTotal", label: "Token 总量", unit: "M tokens", precision: (v) => formatMTokens(v) },
  { key: "requestCount", label: "请求总次数", unit: "次", precision: (v) => v.toFixed(0) },
  { key: "avgToken", label: "平均单次 Token 量", unit: "M tokens", precision: (v) => formatMTokens(v) },
  { key: "avgLatency", label: "平均延迟", unit: "s", precision: (v) => v.toFixed(2) },
  { key: "ttft", label: "首包时长 TTFT", unit: "ms", precision: (v) => v.toFixed(0) },
  { key: "successRate", label: "成功率", unit: "%", precision: (v) => v.toFixed(1) },
];

interface TokenKPIs {
  tokenTotal: number;
  requestCount: number;
  avgToken: number;
  modelCount: number;
  avgLatency: number;
  ttft: number;
  successRate: number;
  delta: { tokenTotal: number; requestCount: number; avgToken: number; modelCount: number; avgLatency: number; ttft: number; successRate: number };
}

interface TokenPeriod {
  kpi: TokenKPIs;
  trend: Record<MainMetric, number[]>;
  avgComp: { total: number[]; input: number[]; output: number[]; cached: number[] };
  reliability: {
    fail4xx: number[]; fail5xx: number[]; failRate: number[]; rateLimit: number[]; safety: number[];
    failTotal: number; failRatePct: number; rateLimitTotal: number; safetyTotal: number;
  };
  top10: { name: string; count: number; tokens: number }[];
  models: { name: string; tpm: number; rpm: number; requests: number; success: number; successRate: number; ttft: number; latency: number }[];
  keys: { id: string; name: string; mask: string; tokens: number; requests: number; lastUsed: string }[];
}

const PREV_PERIOD: Record<typeof TIME_RANGES[number], typeof TIME_RANGES[number] | null> = {
  "1 小时": null,
  "6 小时": "1 小时",
  "12 小时": "6 小时",
  "24 小时": "12 小时",
  "7 天": "24 小时",
  "30 天": "7 天",
};

const PERIOD_DATA: Record<typeof TIME_RANGES[number], TokenPeriod> = {
  "1 小时": {
    kpi: { tokenTotal: 7600000, requestCount: 612, avgToken: 12400, modelCount: 6, avgLatency: 0.82, ttft: 220, successRate: 99.2, delta: { tokenTotal: 24, requestCount: 12, avgToken: 8, modelCount: 5, avgLatency: -3, ttft: -2, successRate: 0.1 } },
    trend: { tokenTotal: [1000000,1100000,1200000,1050000,1180000,1010000,7600000], requestCount: [80,90,100,85,95,82,612], avgToken: [11000,11500,12000,12100,12200,12300,12400], avgLatency: [0.92,0.88,0.85,0.83,0.81,0.80,0.82], ttft: [240,235,228,225,222,220,220], successRate: [98.8,99.0,99.1,99.2,99.2,99.2,99.2] },
    avgComp: { total: [11000,11500,12000,12100,12200,12300,12400], input: [7700,8000,8400,8470,8540,8610,8680], output: [3300,3500,3600,3630,3660,3690,3720], cached: [2200,2300,2400,2420,2440,2460,2480] },
    reliability: { fail4xx: [1,0,0,0,1,0,2], fail5xx: [0,0,0,0,0,0,0], failRate: [1.2,0,0,0,1.0,0,0.3], rateLimit: [0,0,0,0,0,0,0], safety: [0,0,0,0,0,0,0], failTotal: 4, failRatePct: 0.6, rateLimitTotal: 0, safetyTotal: 0 },
    top10: [
      { name: "gpt-4o", count: 180, tokens: 2240000 }, { name: "claude-3.5", count: 140, tokens: 1730000 }, { name: "qwen-max", count: 110, tokens: 1380000 },
      { name: "deepseek-v3", count: 80, tokens: 990000 }, { name: "gpt-4o-code", count: 60, tokens: 760000 }, { name: "hunyuan-pro", count: 42, tokens: 500000 },
    ],
    models: [
      { name: "gpt-4o", tpm: 37300, rpm: 3.0, requests: 180, success: 178, successRate: 98.9, ttft: 215, latency: 0.78 },
      { name: "claude-3.5", tpm: 28800, rpm: 2.3, requests: 140, success: 139, successRate: 99.3, ttft: 220, latency: 0.82 },
      { name: "qwen-max", tpm: 23000, rpm: 1.8, requests: 110, success: 110, successRate: 100, ttft: 230, latency: 0.85 },
    ],
    keys: [
      { id: "sk-****9a1b", name: "测试", mask: "sk-****9a1b", tokens: 2100000, requests: 175, lastUsed: "07-11 20:35" },
      { id: "sk-****c3d4", name: "生产环境", mask: "sk-****c3d4", tokens: 4800000, requests: 395, lastUsed: "07-11 20:33" },
      { id: "sk-****8f2c", name: "数据分析", mask: "sk-****8f2c", tokens: 700000, requests: 42, lastUsed: "07-11 20:28" },
    ],
  },
  "6 小时": {
    kpi: { tokenTotal: 47735000, requestCount: 3722, avgToken: 12820, modelCount: 9, avgLatency: 0.85, ttft: 240, successRate: 99.4, delta: { tokenTotal: 254, requestCount: 114, avgToken: 66, modelCount: 25, avgLatency: -2, ttft: -5, successRate: 0.3 } },
    trend: { tokenTotal: [2200000,6800000,11400000,15200000,12800000,8200000,47735000], requestCount: [180,520,820,1140,920,640,3722], avgToken: [7700,8300,9300,11400,12500,12600,12820], avgLatency: [1.10,1.00,0.92,0.85,0.80,0.83,0.85], ttft: [280,265,250,235,225,238,240], successRate: [98.5,98.8,99.0,99.3,99.4,99.4,99.4] },
    avgComp: { total: [7700,8300,9300,11400,12500,12600,12820], input: [5390,5810,6510,7980,8750,8820,8974], output: [2310,2490,2790,3420,3750,3780,3846], cached: [1540,1660,1860,2280,2500,2520,2564] },
    reliability: { fail4xx: [3,2,4,2,3,2,5], fail5xx: [1,0,1,0,1,1,0], failRate: [2.2,0.4,0.6,0.2,0.4,0.5,0.1], rateLimit: [2,3,5,8,4,3,2], safety: [1,0,1,0,0,0,1], failTotal: 21, failRatePct: 0.6, rateLimitTotal: 27, safetyTotal: 3 },
    top10: [
      { name: "gpt-4o", count: 920, tokens: 11800000 }, { name: "claude-3.5", count: 760, tokens: 9750000 }, { name: "qwen-max", count: 640, tokens: 8210000 },
      { name: "deepseek-v3", count: 480, tokens: 6160000 }, { name: "gpt-4o-code", count: 360, tokens: 4620000 }, { name: "hunyuan-pro", count: 240, tokens: 3080000 },
      { name: "glm-4", count: 180, tokens: 2310000 }, { name: "doubao-pro", count: 92, tokens: 1180000 }, { name: "mistral", count: 50, tokens: 640000 },
    ],
    models: [
      { name: "gpt-4o", tpm: 32800, rpm: 2.6, requests: 920, success: 914, successRate: 99.3, ttft: 230, latency: 0.80 },
      { name: "claude-3.5", tpm: 27100, rpm: 2.1, requests: 760, success: 758, successRate: 99.7, ttft: 235, latency: 0.85 },
      { name: "qwen-max", tpm: 22800, rpm: 1.8, requests: 640, success: 638, successRate: 99.7, ttft: 245, latency: 0.88 },
      { name: "deepseek-v3", tpm: 17100, rpm: 1.3, requests: 480, success: 478, successRate: 99.6, ttft: 240, latency: 0.82 },
    ],
    keys: [
      { id: "sk-****9a1b", name: "测试", mask: "sk-****9a1b", tokens: 12550000, requests: 1040, lastUsed: "07-11 20:15" },
      { id: "sk-****c3d4", name: "生产环境", mask: "sk-****c3d4", tokens: 29420000, requests: 2410, lastUsed: "07-11 20:10" },
      { id: "sk-****8f2c", name: "数据分析", mask: "sk-****8f2c", tokens: 5765000, requests: 272, lastUsed: "07-11 19:55" },
    ],
  },
  "12 小时": {
    kpi: { tokenTotal: 86000000, requestCount: 6800, avgToken: 12640, modelCount: 11, avgLatency: 0.88, ttft: 248, successRate: 99.1, delta: { tokenTotal: 175, requestCount: 82, avgToken: 8, modelCount: 22, avgLatency: -1, ttft: -3, successRate: 0.2 } },
    trend: { tokenTotal: [10000000,15000000,22000000,28000000,19500000,14000000,86000000], requestCount: [800,1200,1800,2200,1500,1100,6800], avgToken: [7800,8500,9400,11000,12100,12400,12640], avgLatency: [1.05,1.00,0.95,0.90,0.85,0.86,0.88], ttft: [285,270,260,250,240,245,248], successRate: [98.2,98.5,98.8,99.0,99.1,99.1,99.1] },
    avgComp: { total: [7800,8500,9400,11000,12100,12400,12640], input: [5460,5950,6580,7700,8470,8680,8848], output: [2340,2550,2820,3300,3630,3720,3792], cached: [1560,1700,1880,2200,2420,2480,2528] },
    reliability: { fail4xx: [5,4,6,3,4,3,8], fail5xx: [2,1,2,1,2,2,1], failRate: [2.5,0.7,0.8,0.4,0.5,0.6,0.2], rateLimit: [5,6,10,15,8,5,4], safety: [2,1,2,1,0,0,2], failTotal: 41, failRatePct: 0.9, rateLimitTotal: 53, safetyTotal: 8 },
    top10: [
      { name: "gpt-4o", count: 1700, tokens: 21500000 }, { name: "claude-3.5", count: 1400, tokens: 17700000 }, { name: "qwen-max", count: 1180, tokens: 14900000 },
      { name: "deepseek-v3", count: 880, tokens: 11100000 }, { name: "gpt-4o-code", count: 660, tokens: 8350000 }, { name: "hunyuan-pro", count: 440, tokens: 5560000 },
      { name: "glm-4", count: 330, tokens: 4170000 }, { name: "doubao-pro", count: 170, tokens: 2150000 }, { name: "mistral", count: 90, tokens: 1140000 },
      { name: "llama-3", count: 50, tokens: 630000 },
    ],
    models: [
      { name: "gpt-4o", tpm: 29900, rpm: 2.4, requests: 1700, success: 1685, successRate: 99.1, ttft: 235, latency: 0.85 },
      { name: "claude-3.5", tpm: 24600, rpm: 1.9, requests: 1400, success: 1393, successRate: 99.5, ttft: 240, latency: 0.87 },
      { name: "qwen-max", tpm: 20700, rpm: 1.6, requests: 1180, success: 1175, successRate: 99.6, ttft: 250, latency: 0.90 },
    ],
    keys: [
      { id: "sk-****9a1b", name: "测试", mask: "sk-****9a1b", tokens: 22800000, requests: 1900, lastUsed: "07-11 20:15" },
      { id: "sk-****c3d4", name: "生产环境", mask: "sk-****c3d4", tokens: 52800000, requests: 4350, lastUsed: "07-11 20:10" },
      { id: "sk-****8f2c", name: "数据分析", mask: "sk-****8f2c", tokens: 10400000, requests: 550, lastUsed: "07-11 19:55" },
    ],
  },
  "24 小时": {
    kpi: { tokenTotal: 158000000, requestCount: 12450, avgToken: 12690, modelCount: 14, avgLatency: 0.86, ttft: 245, successRate: 99.3, delta: { tokenTotal: 210, requestCount: 84, avgToken: 5, modelCount: 18, avgLatency: -2, ttft: -2, successRate: 0.2 } },
    trend: { tokenTotal: [15000000,30000000,40000000,51000000,35000000,27000000,158000000], requestCount: [1200,2400,3200,4100,2800,2200,12450], avgToken: [8000,8800,9500,11500,12200,12400,12690], avgLatency: [1.05,0.98,0.92,0.85,0.80,0.82,0.86], ttft: [280,265,255,245,235,240,245], successRate: [98.5,98.8,99.0,99.2,99.3,99.3,99.3] },
    avgComp: { total: [8000,8800,9500,11500,12200,12400,12690], input: [5600,6160,6650,8050,8540,8680,8883], output: [2400,2640,2850,3450,3660,3720,3807], cached: [1600,1760,1900,2300,2440,2480,2538] },
    reliability: { fail4xx: [10,8,12,6,8,6,15], fail5xx: [4,2,4,2,4,3,2], failRate: [2.5,0.8,0.8,0.4,0.5,0.6,0.2], rateLimit: [8,12,18,28,15,10,7], safety: [4,2,3,2,1,1,3], failTotal: 75, failRatePct: 0.7, rateLimitTotal: 98, safetyTotal: 16 },
    top10: [
      { name: "gpt-4o", count: 3100, tokens: 39200000 }, { name: "claude-3.5", count: 2540, tokens: 32100000 }, { name: "qwen-max", count: 2120, tokens: 26800000 },
      { name: "deepseek-v3", count: 1600, tokens: 20300000 }, { name: "gpt-4o-code", count: 1180, tokens: 15000000 }, { name: "hunyuan-pro", count: 800, tokens: 10100000 },
      { name: "glm-4", count: 600, tokens: 7600000 }, { name: "doubao-pro", count: 320, tokens: 4050000 }, { name: "mistral", count: 160, tokens: 2030000 },
      { name: "llama-3", count: 90, tokens: 1140000 },
    ],
    models: [
      { name: "gpt-4o", tpm: 27100, rpm: 2.2, requests: 3100, success: 3080, successRate: 99.4, ttft: 235, latency: 0.83 },
      { name: "claude-3.5", tpm: 22300, rpm: 1.8, requests: 2540, success: 2532, successRate: 99.7, ttft: 240, latency: 0.85 },
      { name: "qwen-max", tpm: 18600, rpm: 1.5, requests: 2120, success: 2110, successRate: 99.5, ttft: 250, latency: 0.88 },
    ],
    keys: [
      { id: "sk-****9a1b", name: "测试", mask: "sk-****9a1b", tokens: 41800000, requests: 3480, lastUsed: "07-11 20:15" },
      { id: "sk-****c3d4", name: "生产环境", mask: "sk-****c3d4", tokens: 96800000, requests: 7980, lastUsed: "07-11 20:10" },
      { id: "sk-****8f2c", name: "数据分析", mask: "sk-****8f2c", tokens: 19400000, requests: 990, lastUsed: "07-11 19:55" },
    ],
  },
  "7 天": {
    kpi: { tokenTotal: 1080000000, requestCount: 85400, avgToken: 12650, modelCount: 18, avgLatency: 0.82, ttft: 230, successRate: 99.5, delta: { tokenTotal: 320, requestCount: 105, avgToken: 3, modelCount: 12, avgLatency: -4, ttft: -8, successRate: 0.5 } },
    trend: { tokenTotal: [100000000,150000000,190000000,230000000,175000000,130000000,1080000000], requestCount: [8000,12000,15000,18000,14000,10000,85400], avgToken: [8000,8500,9400,11000,12000,12500,12650], avgLatency: [0.95,0.90,0.85,0.80,0.78,0.80,0.82], ttft: [265,255,240,230,225,228,230], successRate: [98.8,99.0,99.2,99.4,99.5,99.5,99.5] },
    avgComp: { total: [8000,8500,9400,11000,12000,12500,12650], input: [5600,5950,6580,7700,8400,8750,8855], output: [2400,2550,2820,3300,3600,3750,3795], cached: [1600,1700,1880,2200,2400,2500,2530] },
    reliability: { fail4xx: [60,50,80,40,60,40,100], fail5xx: [20,15,25,15,20,18,12], failRate: [2.0,0.6,0.6,0.3,0.4,0.5,0.1], rateLimit: [40,55,90,140,70,50,30], safety: [20,10,15,10,5,5,15], failTotal: 469, failRatePct: 0.5, rateLimitTotal: 475, safetyTotal: 80 },
    top10: [
      { name: "gpt-4o", count: 22000, tokens: 278000000 }, { name: "claude-3.5", count: 17500, tokens: 221000000 }, { name: "qwen-max", count: 14800, tokens: 187000000 },
      { name: "deepseek-v3", count: 11200, tokens: 142000000 }, { name: "gpt-4o-code", count: 8200, tokens: 104000000 }, { name: "hunyuan-pro", count: 5600, tokens: 71000000 },
      { name: "glm-4", count: 4200, tokens: 53000000 }, { name: "doubao-pro", count: 2200, tokens: 28000000 }, { name: "mistral", count: 1100, tokens: 14000000 },
      { name: "llama-3", count: 600, tokens: 7600000 },
    ],
    models: [
      { name: "gpt-4o", tpm: 27400, rpm: 2.2, requests: 22000, success: 21890, successRate: 99.5, ttft: 225, latency: 0.78 },
      { name: "claude-3.5", tpm: 21800, rpm: 1.7, requests: 17500, success: 17447, successRate: 99.7, ttft: 230, latency: 0.82 },
    ],
    keys: [
      { id: "sk-****9a1b", name: "测试", mask: "sk-****9a1b", tokens: 285000000, requests: 23700, lastUsed: "07-11 20:15" },
      { id: "sk-****c3d4", name: "生产环境", mask: "sk-****c3d4", tokens: 660000000, requests: 54000, lastUsed: "07-11 20:10" },
      { id: "sk-****8f2c", name: "数据分析", mask: "sk-****8f2c", tokens: 132000000, requests: 7700, lastUsed: "07-11 19:55" },
    ],
  },
  "30 天": {
    kpi: { tokenTotal: 4800000000, requestCount: 380000, avgToken: 12630, modelCount: 22, avgLatency: 0.80, ttft: 225, successRate: 99.6, delta: { tokenTotal: 540, requestCount: 198, avgToken: 2, modelCount: 10, avgLatency: -6, ttft: -12, successRate: 0.8 } },
    trend: { tokenTotal: [440000000,700000000,950000000,1200000000,950000000,560000000,4800000000], requestCount: [35000,55000,75000,95000,75000,45000,380000], avgToken: [8000,8500,9400,11500,12200,12400,12630], avgLatency: [0.92,0.85,0.80,0.75,0.72,0.74,0.80], ttft: [260,245,230,220,215,218,225], successRate: [99.0,99.3,99.5,99.7,99.7,99.7,99.6] },
    avgComp: { total: [8000,8500,9400,11500,12200,12400,12630], input: [5600,5950,6580,8050,8540,8680,8841], output: [2400,2550,2820,3450,3660,3720,3789], cached: [1600,1700,1880,2300,2440,2480,2526] },
    reliability: { fail4xx: [220,180,300,160,250,160,420], fail5xx: [80,60,100,55,75,70,50], failRate: [1.8,0.5,0.5,0.3,0.4,0.4,0.1], rateLimit: [160,230,380,580,290,210,130], safety: [85,40,65,40,25,20,60], failTotal: 2014, failRatePct: 0.5, rateLimitTotal: 1980, safetyTotal: 335 },
    top10: [
      { name: "gpt-4o", count: 98000, tokens: 1240000000 }, { name: "claude-3.5", count: 78000, tokens: 985000000 }, { name: "qwen-max", count: 66000, tokens: 834000000 },
      { name: "deepseek-v3", count: 50000, tokens: 632000000 }, { name: "gpt-4o-code", count: 37000, tokens: 467000000 }, { name: "hunyuan-pro", count: 25000, tokens: 316000000 },
      { name: "glm-4", count: 19000, tokens: 240000000 }, { name: "doubao-pro", count: 10000, tokens: 126000000 }, { name: "mistral", count: 4800, tokens: 61000000 },
      { name: "llama-3", count: 2200, tokens: 28000000 },
    ],
    models: [
      { name: "gpt-4o", tpm: 27900, rpm: 2.3, requests: 98000, success: 97608, successRate: 99.6, ttft: 220, latency: 0.78 },
      { name: "claude-3.5", tpm: 22200, rpm: 1.8, requests: 78000, success: 77844, successRate: 99.8, ttft: 225, latency: 0.80 },
    ],
    keys: [
      { id: "sk-****9a1b", name: "测试", mask: "sk-****9a1b", tokens: 1270000000, requests: 106000, lastUsed: "07-11 20:15" },
      { id: "sk-****c3d4", name: "生产环境", mask: "sk-****c3d4", tokens: 2950000000, requests: 240000, lastUsed: "07-11 20:10" },
      { id: "sk-****8f2c", name: "数据分析", mask: "sk-****8f2c", tokens: 580000000, requests: 34000, lastUsed: "07-11 19:55" },
    ],
  },
};

/* ================================================================
   Helpers
   ================================================================ */
export function formatTokens(v: number): string {
  if (v >= 1000) return `${Math.round(v / 1000).toLocaleString()}K`;
  return `${Math.round(v)}`;
}
export function formatTokensBig(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

/* Unified: all token quantities render as M tokens */
export function formatMTokens(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  return `${(v / 1_000_000).toFixed(2)}M`;
}
export function deltaColor(d: number, inverse = false): string {
  const up = d >= 0;
  const good = inverse ? !up : up;
  return good ? "#dc2626" : "#059669";
}
export function deltaArrow(d: number): string {
  return d >= 0 ? "↑" : "↓";
}

/* ================================================================
   Main component
   ================================================================ */
export interface TokenFilters {
  timeRange: typeof TIME_RANGES[number];
  precision: typeof PRECISIONS[number];
  inference: typeof INFERENCE_TYPES[number];
  keys: string[];
  models: string[];
}

export function buildFilterQuery(f: TokenFilters): string {
  const p = new URLSearchParams();
  p.set("t", f.timeRange);
  p.set("p", f.precision);
  p.set("i", f.inference);
  if (f.keys.length) p.set("k", f.keys.join(","));
  if (f.models.length) p.set("m", f.models.join(","));
  return p.toString();
}

export default function TokenAnalysisView() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>("6 小时");
  const [precision, setPrecision] = useState<typeof PRECISIONS[number]>("按分钟");
  const [inference, setInference] = useState<typeof INFERENCE_TYPES[number]>("全部");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const [mainMetric, setMainMetric] = useState<MainMetric>("tokenTotal");
  const [comparePrev, setComparePrev] = useState(false);
  const [topMetric, setTopMetric] = useState<"count" | "tokens">("count");
  const [mainHover, setMainHover] = useState<number | null>(null);

  const [avgCompVisible, setAvgCompVisible] = useState({ total: true, input: true, output: true, cached: true });
  const [avgCompHover, setAvgCompHover] = useState<number | null>(null);

  const [modelCompSort, setModelCompSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "requests", dir: "desc" });
  const [expandedModelRow, setExpandedModelRow] = useState<string | null>(null);
  const [expandedMiniTab, setExpandedMiniTab] = useState<"rpm" | "quality">("rpm");

  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const data = PERIOD_DATA[timeRange];
  const labels = TIME_LABELS[timeRange];
  const prevRange = PREV_PERIOD[timeRange];
  const prevData = prevRange ? PERIOD_DATA[prevRange] : null;
  const compareAvailable = prevData !== null;
  const effectiveComparePrev = comparePrev && compareAvailable;
  const reset = () => {
    setTimeRange("6 小时");
    setPrecision("按分钟");
    setInference("全部");
    setSelectedKeys([]);
    setSelectedModels([]);
  };

  const filteredKeys = selectedKeys.length === 0 ? data.keys : data.keys.filter((k) => selectedKeys.includes(k.name));
  const keyNameList = data.keys.map((k) => k.name);
  const modelNameList = Array.from(new Set(data.top10.map((m) => m.name)));

  const buildDrillHref = (modelName: string) =>
    `/analytics/usage/model/${encodeURIComponent(modelName)}?${buildFilterQuery({ timeRange, precision, inference, keys: selectedKeys, models: selectedModels })}`;

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, padding: "8px 16px", backgroundColor: "#111827", color: "#fff", fontSize: 13, fontWeight: 500, borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* 1. Filter bar */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)", overflow: "hidden" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: collapsed ? "none" : "1px solid var(--color-hairline-soft)" }}>
          <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>筛选</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={reset} style={{ height: 28, padding: "0 12px", fontSize: "var(--text-caption)", color: "var(--color-body)", backgroundColor: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>重置</button>
            <button onClick={() => setCollapsed((v) => !v)} style={{ height: 28, padding: "0 12px", fontSize: "var(--text-caption)", color: "var(--color-body)", backgroundColor: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              {collapsed ? "展开" : "收起"}
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6L8 10L12 6" /></svg>
            </button>
          </div>
        </div>
        {!collapsed && (
          <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <FilterSelect label="选择时间" value={timeRange} options={TIME_RANGES as unknown as string[]} onChange={(v) => { setTimeRange(v as typeof TIME_RANGES[number]); setPrecision(GRANULARITY_PRECISION[v as typeof TIME_RANGES[number]]); }} />
            <FilterSelect label="时间精度" value={precision} options={PRECISIONS as unknown as string[]} onChange={(v) => setPrecision(v as typeof PRECISIONS[number])} />
            <FilterSelect label="推理类型" value={inference} options={INFERENCE_TYPES as unknown as string[]} onChange={(v) => setInference(v as typeof INFERENCE_TYPES[number])} />
            <MultiSelectFilter label="Key" options={keyNameList} selected={selectedKeys} onChange={setSelectedKeys} />
            <MultiSelectFilter label="模型" options={modelNameList} selected={selectedModels} onChange={setSelectedModels} />
          </div>
        )}
      </div>

      {/* 2. KPI Group A — Token metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <KpiMetric label="Token 总量" value={formatMTokens(data.kpi.tokenTotal)} unit="M tokens" delta={data.kpi.delta.tokenTotal} tooltip="Token 总量 = Σ(prompt_tokens + completion_tokens)" />
        <KpiMetric label="请求总次数" value={data.kpi.requestCount.toLocaleString()} unit="次" delta={data.kpi.delta.requestCount} tooltip="成功请求 + 失败请求的总和" />
        <KpiMetric label="平均单次请求 Token 量" value={formatMTokens(data.kpi.avgToken)} unit="M tokens" delta={data.kpi.delta.avgToken} tooltip="Token 总量 / 成功请求数" />
        <KpiMetric label="调用模型数" value={`${data.kpi.modelCount}`} unit="个" delta={data.kpi.delta.modelCount} tooltip="期内参与调用的去重模型数" />
      </div>

      {/* 3. KPI Group B — Performance & quality */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <KpiMetric label="平均延迟" value={data.kpi.avgLatency.toFixed(2)} unit="s" delta={data.kpi.delta.avgLatency} tooltip="所有请求从发出到收到完整响应的平均耗时" inverse />
        <KpiMetric label="平均首包时长 TTFT" value={data.kpi.ttft.toFixed(0)} unit="ms" delta={data.kpi.delta.ttft} tooltip="流式请求首字节返回的平均时间" inverse />
        <KpiMetric label="成功率" value={data.kpi.successRate.toFixed(1)} unit="%" delta={data.kpi.delta.successRate} tooltip="成功请求数 / 总请求数" />
        <KpiMetric label="错误率" value={(100 - data.kpi.successRate).toFixed(1)} unit="%" delta={-data.kpi.delta.successRate} tooltip="1 - 成功率" inverse />
      </div>

      {/* 4. Main trend panel */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ display: "inline-flex", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {MAIN_METRICS.map((m) => (
              <button key={m.key} onClick={() => setMainMetric(m.key)} style={{
                height: 32, paddingLeft: 12, paddingRight: 12, fontSize: "var(--text-caption)",
                fontWeight: mainMetric === m.key ? 600 : 500,
                color: mainMetric === m.key ? "#fff" : "var(--color-body)",
                backgroundColor: mainMetric === m.key ? "#000" : "transparent",
                border: "none", borderLeft: m === MAIN_METRICS[0] ? "none" : "1px solid var(--color-hairline)",
                cursor: "pointer", whiteSpace: "nowrap",
              }}>{m.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: "var(--text-caption)", color: compareAvailable ? "var(--color-muted)" : "var(--color-muted-soft)", display: "inline-flex", alignItems: "center", gap: 4, cursor: compareAvailable ? "pointer" : "not-allowed" }} title={compareAvailable ? `与上一期 (${prevRange}) 对比` : "无更小时间范围可对比"}>
              <input type="checkbox" checked={effectiveComparePrev} disabled={!compareAvailable} onChange={(e) => setComparePrev(e.target.checked)} />
              对比上一期 {prevRange ? `(${prevRange})` : ""}
            </label>
            <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
            <IconBtn title="下载"><DownloadIcon /></IconBtn>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)" }}>
          <SingleLineChart points={data.trend[mainMetric]} labels={labels} unit={MAIN_METRICS.find((m) => m.key === mainMetric)!.unit} valueFormat={MAIN_METRICS.find((m) => m.key === mainMetric)!.precision} hover={mainHover} setHover={setMainHover} metricLabel={MAIN_METRICS.find((m) => m.key === mainMetric)!.label} compare={effectiveComparePrev} comparePoints={prevData ? prevData.trend[mainMetric] : []} />
        </div>
      </div>

      {/* 5. Average request composition */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>平均单次请求调用量</div>
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
            <IconBtn title="下载"><DownloadIcon /></IconBtn>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            <SmallMetric label="平均全部 Token 总量" value={formatMTokens(data.avgComp.total.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
            <SmallMetric label="平均输入 Token 总数（不含缓存）" value={formatMTokens(data.avgComp.input.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
            <SmallMetric label="平均输出 Tokens 总量" value={formatMTokens(data.avgComp.output.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
            <SmallMetric label="平均隐式缓存命中 Token 总量" value={formatMTokens(data.avgComp.cached.reduce((s, v) => s + v, 0) / 7)} unit="M tokens" />
          </div>
          <MultiLineChart
            series={[
              { key: "total", label: "全部 Token", color: "#000", points: data.avgComp.total, visible: avgCompVisible.total },
              { key: "input", label: "输入（不含缓存）", color: "#374151", points: data.avgComp.input, visible: avgCompVisible.input },
              { key: "output", label: "输出", color: "#9ca3af", points: data.avgComp.output, visible: avgCompVisible.output },
              { key: "cached", label: "缓存命中", color: "#d1d5db", points: data.avgComp.cached, visible: avgCompVisible.cached },
            ]}
            labels={labels}
            unit="tokens"
            hover={avgCompHover}
            setHover={setAvgCompHover}
            onToggle={(key) => setAvgCompVisible((v) => ({ ...v, [key]: !v[key as keyof typeof v] }))}
          />
        </div>
      </div>

      {/* 6. Reliability & Governance 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <ReliabilityCard
          title="失败次数"
          mainValue={data.reliability.failTotal.toLocaleString()}
          mainUnit="次"
          series={[
            { key: "4xx", label: "4xx", color: "#000", points: data.reliability.fail4xx, visible: true },
            { key: "5xx", label: "5xx", color: "#9ca3af", points: data.reliability.fail5xx, visible: true },
          ]}
          labels={labels}
        />
        <ReliabilityCard
          title="失败率"
          mainValue={data.reliability.failRatePct.toFixed(1)}
          mainUnit="%"
          mainColor="#dc2626"
          series={[
            { key: "rate", label: "失败率", color: "#000", points: data.reliability.failRate, visible: true },
            { key: "4xx", label: "4xx", color: "#9ca3af", points: data.reliability.fail4xx.map((v) => +(v / 100).toFixed(2)), visible: true },
            { key: "5xx", label: "5xx", color: "#d1d5db", points: data.reliability.fail5xx.map((v) => +(v / 100).toFixed(2)), visible: true },
          ]}
          labels={labels}
          warn={data.reliability.failRatePct > 5}
        />
        <ReliabilityCard
          title="限流错误次数"
          mainValue={data.reliability.rateLimitTotal.toLocaleString()}
          mainUnit="次"
          series={[{ key: "limit", label: "429", color: "#000", points: data.reliability.rateLimit, visible: true }]}
          labels={labels}
          warn={data.reliability.rateLimitTotal > 50}
          warnHint="建议提升配额或启用重试/排队"
        />
        <ReliabilityCard
          title="内容安全拦截次数"
          mainValue={data.reliability.safetyTotal.toLocaleString()}
          mainUnit="次"
          series={[{ key: "safe", label: "安全拦截", color: "#000", points: data.reliability.safety, visible: true }]}
          labels={labels}
        />
      </div>

      {/* 7. Top 10 models */}
      <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{topMetric === "count" ? "总调用成功次数" : "总 Token 消耗"} Top 10 模型</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "inline-flex", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <button onClick={() => setTopMetric("count")} style={{ height: 28, padding: "0 12px", fontSize: "var(--text-caption)", fontWeight: topMetric === "count" ? 600 : 500, color: topMetric === "count" ? "#fff" : "var(--color-body)", backgroundColor: topMetric === "count" ? "#000" : "transparent", border: "none", cursor: "pointer" }}>调用成功次数</button>
              <button onClick={() => setTopMetric("tokens")} style={{ height: 28, padding: "0 12px", fontSize: "var(--text-caption)", fontWeight: topMetric === "tokens" ? 600 : 500, color: topMetric === "tokens" ? "#fff" : "var(--color-body)", backgroundColor: topMetric === "tokens" ? "#000" : "transparent", borderLeft: "1px solid var(--color-hairline)", border: "none", cursor: "pointer" }}>Token 总量</button>
            </div>
            <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
            <IconBtn title="下载"><DownloadIcon /></IconBtn>
          </div>
        </div>
        <div style={{ padding: "var(--spacing-lg)", display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "center" }}>
          <DonutChart data={data.top10.map((m) => ({ name: m.name, count: topMetric === "count" ? m.count : m.tokens }))} total={data.top10.reduce((s, m) => s + (topMetric === "count" ? m.count : m.tokens), 0)} onClick={(name) => router.push(buildDrillHref(name))} />
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            {data.top10.map((m, i) => {
              const value = topMetric === "count" ? m.count : m.tokens;
              const total = data.top10.reduce((s, x) => s + (topMetric === "count" ? x.count : x.tokens), 0);
              const pct = ((value / total) * 100).toFixed(1);
              return (
                <li key={m.name} onClick={() => router.push(buildDrillHref(m.name))} style={{ display: "grid", gridTemplateColumns: "32px 1fr 100px 60px 70px", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--color-hairline-soft)", cursor: "pointer" }}>
                  <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: i < 3 ? "var(--color-ink)" : "var(--color-muted)" }}>{i + 1}</span>
                  <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>{m.name}</span>
                  <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{topMetric === "count" ? value.toLocaleString() + " 次" : formatMTokens(value) + " M tokens"}</span>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", textAlign: "right" }}>{pct}%</span>
                  <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)", textAlign: "right" }}>查看详情 →</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* 8. Model comparison report */}
      <ModelComparisonTable models={data.models} sort={modelCompSort} onSort={setModelCompSort} expanded={expandedModelRow} setExpanded={setExpandedModelRow} miniTab={expandedMiniTab} setMiniTab={setExpandedMiniTab} onDrill={(name) => router.push(buildDrillHref(name))} />

      {/* 9. Key consumption table */}
      <KeyConsumptionTable keys={filteredKeys} onExport={(k) => {
        const csv = [["时间", "Key 名称", "Key ID", "Token 总量", "请求成功总次数", "平均单次 Token 量", "推理类型"].join(","), ...Array.from({ length: 5 }, (_, i) => [`2026-07-${(11 - i).toString().padStart(2, "0")} ${(20 - i).toString().padStart(2, "0")}:${(i * 7).toString().padStart(2, "0")}`, k.name, k.id, Math.round(k.tokens / 5), Math.round(k.requests / 5), Math.round(k.tokens / k.requests), inference].join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${k.name}-调用日志.csv`; a.click();
        showToast("日志已导出");
      }} />
    </div>
  );
}

/* ================================================================
   Sub-components
   ================================================================ */
export function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={filterSelectStyle}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function MultiSelectFilter({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const display = selected.length === 0 ? "全部" : `已选 ${selected.length} 项`;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{label}</span>
      <button onClick={() => setOpen((v) => !v)} style={{ ...filterSelectStyle, height: 36, paddingLeft: 14, paddingRight: 32, position: "relative", textAlign: "left", cursor: "pointer", color: selected.length ? "var(--color-ink)" : "var(--color-body)", fontWeight: selected.length ? 500 : 400 }}>
        {display}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}><path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 60, marginTop: 4, minWidth: 160, backgroundColor: "#fff", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 20, padding: 4 }}>
          <button onClick={() => onChange([])} style={{ display: "block", width: "100%", padding: "6px 10px", fontSize: "var(--text-caption)", color: "var(--color-body)", background: "none", border: "none", borderRadius: "var(--radius-xs)", cursor: "pointer", textAlign: "left" }}>全部</button>
          {options.map((o) => (
            <label key={o} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", fontSize: "var(--text-caption)", color: "var(--color-body)", cursor: "pointer" }}>
              <input type="checkbox" checked={selected.includes(o)} onChange={() => onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])} />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function KpiMetric({ label, value, unit, delta, tooltip, inverse }: { label: string; value: string; unit: string; delta: number; tooltip?: string; inverse?: boolean }) {
  const color = deltaColor(delta, inverse);
  return (
    <div title={tooltip} style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)", position: "relative" }}>
      <div style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", marginBottom: "var(--spacing-sm)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: "var(--text-display-sm)", fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>{value}</span>
        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-muted)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: "var(--text-caption)", color, marginTop: 6 }}>
        <span style={{ marginRight: 4 }}>{deltaArrow(delta)}</span>环比 {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
      </div>
    </div>
  );
}

export function SmallMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{ padding: "12px 14px", backgroundColor: "var(--color-surface-soft)", borderRadius: "var(--radius-md)" }}>
      <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{value}</span>
        <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{unit}</span>
      </div>
    </div>
  );
}

export function IconBtn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button title={title} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", color: "var(--color-muted)", cursor: "pointer" }}>
      {children}
    </button>
  );
}

export function FullscreenIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>; }
export function DownloadIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }


/* ================================================================
   Charts
   ================================================================ */
const filterSelectStyle: React.CSSProperties = {
  height: 36, paddingLeft: 14, paddingRight: 32,
  fontSize: "var(--text-body-sm)", color: "var(--color-body)",
  backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)",
  borderRadius: "var(--radius-md)", cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
};

export function SingleLineChart({ points, labels, unit, valueFormat, hover, setHover, metricLabel, compare, comparePoints }: { points: number[]; labels: string[]; unit: string; valueFormat: (v: number) => string; hover: number | null; setHover: (i: number | null) => void; metricLabel: string; compare: boolean; comparePoints: number[] }) {
  const W = 1100; const H = 220;
  const padding = { top: 16, right: 24, bottom: 32, left: 60 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const allVals = compare ? [...points, ...comparePoints] : points;
  const maxV = Math.max(...allVals, 1);
  const yMax = Math.ceil(maxV * 1.1 / 10) * 10 || 10;
  const x = (i: number) => padding.left + (i / Math.max(points.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - (v / yMax) * innerH;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`).join(" ");
  const comparePath = comparePoints.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`).join(" ");
  const ticks = Array.from({ length: 5 }, (_, i) => (yMax * (4 - i)) / 4);
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 240, overflow: "visible" }} onMouseLeave={() => setHover(null)}>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={padding.left} y1={y(v)} x2={W - padding.right} y2={y(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padding.left - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#6b7280">{valueFormat(v)}</text>
          </g>
        ))}
        {compare && <path d={comparePath} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" />}
        <path d={path} fill="none" stroke="#000" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <rect x={x(i) - innerW / points.length / 2} y={padding.top} width={innerW / points.length} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
            <circle cx={x(i)} cy={y(p)} r={hover === i ? 4 : 2.5} fill="#000" />
            {hover === i && <line x1={x(i)} y1={padding.top} x2={x(i)} y2={H - padding.bottom} stroke="#000" strokeWidth="0.5" strokeDasharray="2 2" />}
          </g>
        ))}
        {labels.map((l, i) => <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7280">{l}</text>)}
      </svg>
      {hover !== null && (
        <div style={{ position: "absolute", left: `${(x(hover) / W) * 100}%`, top: 8, transform: "translateX(-50%)", backgroundColor: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 12, whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{labels[hover]}</div>
          <div>{metricLabel}: {valueFormat(points[hover])} {unit}</div>
          {compare && <div style={{ color: "#d1d5db" }}>上一期: {valueFormat(comparePoints[hover])} {unit}</div>}
        </div>
      )}
    </div>
  );
}

export interface MultiSeries { key: string; label: string; color: string; points: number[]; visible: boolean }
export function MultiLineChart({ series, labels, unit, hover, setHover, onToggle }: { series: MultiSeries[]; labels: string[]; unit: string; hover: number | null; setHover: (i: number | null) => void; onToggle: (key: string) => void }) {
  const W = 1100; const H = 220;
  const padding = { top: 16, right: 24, bottom: 32, left: 60 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const visibleSeries = series.filter((s) => s.visible);
  const maxV = Math.max(...visibleSeries.flatMap((s) => s.points), 1);
  const yMax = Math.ceil(maxV * 1.1 / 10) * 10 || 10;
  const x = (i: number) => padding.left + (i / Math.max(labels.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - (v / yMax) * innerH;
  const ticks = Array.from({ length: 5 }, (_, i) => (yMax * (4 - i)) / 4);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: "var(--text-caption)" }}>
        {series.map((s) => (
          <label key={s.key} onClick={() => onToggle(s.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: s.visible ? "var(--color-ink)" : "var(--color-muted)" }}>
            <span style={{ width: 16, height: 2, backgroundColor: s.color, opacity: s.visible ? 1 : 0.3, display: "inline-block" }} />
            <span style={{ textDecoration: s.visible ? "none" : "line-through" }}>{s.label}</span>
          </label>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 220, overflow: "visible" }} onMouseLeave={() => setHover(null)}>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={padding.left} y1={y(v)} x2={W - padding.right} y2={y(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padding.left - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#6b7280">{formatMTokens(v)}</text>
          </g>
        ))}
        {visibleSeries.map((s) => (
          <path key={s.key} d={s.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="1.8" />
        ))}
        {labels.map((l, i) => <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7280">{l}</text>)}
        {labels.map((_, i) => (
          <rect key={i} x={x(i) - innerW / labels.length / 2} y={padding.top} width={innerW / labels.length} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover !== null && (
        <div style={{ position: "absolute", left: `${(x(hover) / W) * 100}%`, top: 8, transform: "translateX(-50%)", backgroundColor: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 12, whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{labels[hover]}</div>
          {visibleSeries.map((s) => <div key={s.key} style={{ color: s.color === "#000" ? "#fff" : "#d1d5db" }}>{s.label}: {formatMTokens(s.points[hover])} {unit}</div>)}
        </div>
      )}
    </div>
  );
}

export function ReliabilityCard({ title, mainValue, mainUnit, mainColor, series, labels, warn, warnHint }: { title: string; mainValue: string; mainUnit: string; mainColor?: string; series: MultiSeries[]; labels: string[]; warn?: boolean; warnHint?: string }) {
  const W = 500; const H = 180;
  const padding = { top: 12, right: 16, bottom: 24, left: 36 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const maxV = Math.max(...series.flatMap((s) => s.points), 1);
  const yMax = Math.ceil(maxV * 1.1 / 10) * 10 || 10;
  const x = (i: number) => padding.left + (i / Math.max(labels.length - 1, 1)) * innerW;
  const y = (v: number) => padding.top + innerH - (v / yMax) * innerH;
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-lg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>{title}</div>
        <div style={{ display: "flex", gap: 4 }}>
          <IconBtn title="全屏"><FullscreenIcon /></IconBtn>
          <IconBtn title="下载"><DownloadIcon /></IconBtn>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: mainColor || "var(--color-ink)", fontFamily: "var(--font-display)" }}>{mainValue}</span>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{mainUnit}</span>
        {warn && <span title={warnHint} style={{ fontSize: 11, padding: "1px 6px", background: "#fef3c7", color: "#b45309", borderRadius: 4, fontWeight: 500 }}>!</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140 }}>
        {[0, 0.5, 1].map((p) => (
          <line key={p} x1={padding.left} y1={padding.top + innerH * p} x2={W - padding.right} y2={padding.top + innerH * p} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {series.map((s) => (
          <path key={s.key} d={s.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`).join(" ")} fill="none" stroke={s.color} strokeWidth={s.key === "rate" ? 2 : 1} />
        ))}
      </svg>
    </div>
  );
}

export function DonutChart({ data, total, onClick }: { data: { name: string; count: number }[]; total: number; onClick?: (name: string) => void }) {
  const size = 200; const r = 75; const stroke = 22;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const colors = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6", "#9ca3af", "#6b7280", "#374151"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((m, i) => {
          const len = (m.count / total) * c;
          const seg = (
            <circle
              key={m.name}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={colors[i] || "#9ca3af"} strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              onClick={() => onClick?.(m.name)}
              style={{ cursor: "pointer" }}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>总调用</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>{total.toLocaleString()}</div>
      </div>
    </div>
  );
}

function ModelComparisonTable({ models, sort, onSort, expanded, setExpanded, miniTab, setMiniTab, onDrill }: { models: { name: string; tpm: number; rpm: number; requests: number; success: number; successRate: number; ttft: number; latency: number }[]; sort: { key: string; dir: "asc" | "desc" }; onSort: (s: { key: string; dir: "asc" | "desc" }) => void; expanded: string | null; setExpanded: (s: string | null) => void; miniTab: "rpm" | "quality"; setMiniTab: (t: "rpm" | "quality") => void; onDrill: (name: string) => void }) {
  const cols: { key: string; label: string; align?: "right"; numeric?: boolean }[] = [
    { key: "name", label: "模型名" },
    { key: "tpm", label: "平均 TPM", align: "right", numeric: true },
    { key: "rpm", label: "平均 RPM", align: "right", numeric: true },
    { key: "requests", label: "总请求数", align: "right", numeric: true },
    { key: "success", label: "成功请求数", align: "right", numeric: true },
    { key: "successRate", label: "平均成功率 (%)", align: "right", numeric: true },
    { key: "ttft", label: "平均首包 (ms)", align: "right", numeric: true },
    { key: "latency", label: "平均延迟 (s)", align: "right", numeric: true },
  ];
  const sorted = [...models].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.key];
    const bv = (b as Record<string, unknown>)[sort.key];
    if (typeof av === "number" && typeof bv === "number") {
      return sort.dir === "asc" ? av - bv : bv - av;
    }
    return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  const handleSort = (key: string) => {
    if (sort.key === key) onSort({ key, dir: sort.dir === "asc" ? "desc" : "asc" });
    else onSort({ key, dir: "desc" });
  };
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)", marginBottom: "var(--spacing-lg)", overflow: "hidden" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>模型对比报表</span>
      </div>
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F9FAFB" }}>
              {cols.map((c) => (
                <th key={c.key} onClick={() => c.numeric && handleSort(c.key)} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: c.align || "left", cursor: c.numeric ? "pointer" : "default", whiteSpace: "nowrap" }}>
                  {c.label} {c.numeric && <span style={{ marginLeft: 4 }}>{sort.key === c.key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>}
                </th>
              ))}
              <th style={{ padding: "10px 14px" }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <RowExpandable key={m.name} m={m} cols={cols} expanded={expanded === m.name} setExpanded={() => setExpanded(expanded === m.name ? null : m.name)} miniTab={miniTab} setMiniTab={setMiniTab} onDrill={onDrill} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowExpandable({ m, cols, expanded, setExpanded, miniTab, setMiniTab, onDrill }: { m: { name: string; tpm: number; rpm: number; requests: number; success: number; successRate: number; ttft: number; latency: number }; cols: { key: string; label: string; align?: "right"; numeric?: boolean }[]; expanded: boolean; setExpanded: () => void; miniTab: "rpm" | "quality"; setMiniTab: (t: "rpm" | "quality") => void; onDrill: (name: string) => void }) {
  return (
    <>
      <tr style={{ borderBottom: expanded ? "none" : "1px solid var(--color-hairline-soft)" }}>
        {cols.map((c) => {
          const v = (m as Record<string, unknown>)[c.key];
          return (
            <td key={c.key} style={{ padding: "12px 14px", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", textAlign: c.align || "left", fontVariantNumeric: c.numeric ? "tabular-nums" : undefined, fontFamily: !c.numeric ? "var(--font-mono)" : undefined }}>
              {c.numeric ? (typeof v === "number" ? (v.toFixed(c.key === "successRate" ? 1 : c.key === "latency" ? 2 : 0)) : "-") : String(v)}
              {c.key === "name" && <span style={{ marginLeft: 8, cursor: "pointer", color: "var(--color-muted)" }} onClick={(e) => { e.stopPropagation(); setExpanded(); }}>{expanded ? "▲" : "▼"}</span>}
            </td>
          );
        })}
        <td style={{ padding: "12px 14px" }}>
          <button onClick={() => onDrill(m.name)} style={{ fontSize: 11, fontWeight: 500, color: "var(--color-ink)", background: "transparent", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "var(--radius-xs)" }}>查看详情 →</button>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: "var(--color-surface-soft)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
          <td colSpan={cols.length + 1} style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => setMiniTab("rpm")} style={{ height: 26, padding: "0 10px", fontSize: 11, fontWeight: miniTab === "rpm" ? 600 : 500, color: miniTab === "rpm" ? "#fff" : "var(--color-body)", backgroundColor: miniTab === "rpm" ? "#000" : "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>RPM / TPM</button>
              <button onClick={() => setMiniTab("quality")} style={{ height: 26, padding: "0 10px", fontSize: 11, fontWeight: miniTab === "quality" ? 600 : 500, color: miniTab === "quality" ? "#fff" : "var(--color-body)", backgroundColor: miniTab === "quality" ? "#000" : "transparent", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>成功率 / TTFT / 延迟</button>
            </div>
            <MiniSparkline
              data={miniTab === "rpm" ? Array.from({ length: 24 }, (_, i) => Math.max(0, m.rpm + Math.sin(i / 2) * m.rpm * 0.2 + Math.random() * m.rpm * 0.1)) : Array.from({ length: 24 }, (_, i) => Math.max(50, 100 - i * 0.5 + Math.random() * 5))}
              labels={Array.from({ length: 24 }, (_, i) => `${i}h`)}
              color="#000"
            />
          </td>
        </tr>
      )}
    </>
  );
}

function MiniSparkline({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const W = 1000; const H = 80;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const x = (i: number) => (i / Math.max(data.length - 1, 1)) * W;
  const y = (v: number) => H - ((v - min) / range) * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }}>
      <path d={data.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`).join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function KeyConsumptionTable({ keys, onExport }: { keys: { id: string; name: string; mask: string; tokens: number; requests: number; lastUsed: string }[]; onExport: (k: { id: string; name: string; mask: string; tokens: number; requests: number; lastUsed: string }) => void }) {
  return (
    <div style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", borderBottom: "1px solid var(--color-hairline-soft)" }}>
        <span style={{ fontSize: "var(--text-title-sm)", fontWeight: 600, color: "var(--color-ink)" }}>Key 消耗明细</span>
      </div>
      <div style={{ overflow: "auto", padding: "0 var(--spacing-lg) var(--spacing-lg)" }}>
        <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", marginTop: "var(--spacing-sm)" }}>
          <thead>
            <tr style={{ backgroundColor: "#F9FAFB" }}>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "left" }}>Key 名称</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "left" }}>Key ID</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "right" }}>Token 总量</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "right" }}>请求成功总次数</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "right" }}>平均单次 Token 量</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "right" }}>最后调用时间</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--color-muted)", textAlign: "right" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}>
                <td style={{ padding: "12px 14px", fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--color-ink)" }}>{k.name}</td>
                <td style={{ padding: "12px 14px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-body)" }}>{k.mask}</td>
                <td style={{ padding: "12px 14px", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatMTokens(k.tokens)} M tokens</td>
                <td style={{ padding: "12px 14px", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{k.requests.toLocaleString()} 次</td>
                <td style={{ padding: "12px 14px", fontSize: "var(--text-body-sm)", color: "var(--color-ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatMTokens(k.tokens / k.requests)} M tokens</td>
                <td style={{ padding: "12px 14px", fontSize: 11, color: "var(--color-muted)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{k.lastUsed}</td>
                <td style={{ padding: "12px 14px", textAlign: "right" }}>
                  <button onClick={() => onExport(k)} style={{ fontSize: "var(--text-caption)", fontWeight: 500, color: "var(--color-muted)", background: "transparent", border: "none", cursor: "pointer", padding: "2px 4px" }}>导出日志</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}