# 声境 Sonora

一个支持中文和英文、适配桌面和手机的实时环境噪声监测应用，使用 React、TypeScript、Vite 与 Web Audio API。现已通过 Capacitor 8 接入 Android，可将页面和字体打包为离线运行的 APK。

## Android APK

```sh
npm install
npm run android:apk
```

需要 JDK 21、Android SDK Platform 36 和 Build Tools 36.0.0。构建成功后，安装包位于 `artifacts/sonora-1.1.0-debug.apk`，同目录包含 SHA-256 校验文件。这是由开发签名签署、可直接安装的测试版，正式商店发布需要独立的发布签名。

将 APK 传到 Android 手机安装，打开「声境」，点击「开始监测」并允许麦克风权限。应用不依赖电脑服务器或互联网，Android 7.0+ 可安装，并需要可用且及时更新的 Android System WebView。

完整构建、USB 安装、发布签名和排错说明见 [Android 使用与构建指南](docs/ANDROID.md)。

## 本地运行

需要 Node.js 22.12+（推荐 Node.js 24）与 npm。

```sh
npm install
npm run dev
```

打开终端输出的 localhost 地址（默认 http://localhost:5173），点击「开始监测」并允许麦克风权限。点击「试用演示」可体验明确标注的模拟数据。

```sh
npm test       # 音频计算及麦克风生命周期测试（使用模拟音频设备）
npm run build # TypeScript 检查并生成 dist
npm run preview
```

将 `dist` 部署至任意 HTTPS 静态站点即可使用。手机访问局域网 HTTP 地址通常不能启用麦克风，必须使用 HTTPS；localhost 是安全上下文的例外。

## 功能

- 中英文切换：右上角 EN / 中文，或「偏好设置 → 界面语言」。首次启动跟随设备首选语言（中文使用简体中文，其余使用英文），手动选择后保存在本机。切换立即生效，不中断测量；历史日期、提示和导出 CSV 跟随所选语言。Android 桌面名称跟随系统语言。
- 实时数字声量显示、等级提示、30/60 秒趋势。
- 平均、最低、最高声量与有效测量时长。
- 暂停、继续、结束并保存；页面进入后台自动暂停，避免后台采样限制造成误读。
- 最近 100 条测量摘要保存在当前浏览器，支持来源筛选、CSV 导出、删除和撤销。
- 可调声量提醒、设备参考偏移、Fast/Slow 能量平滑。
- 麦克风权限拒绝、设备缺失、设备中断和不安全连接提示。
- 独立演示模式，模拟数据在界面、记录和导出中明确标识。
- 音频不上传、不录制，仅在本机处理。字体随应用打包，不会请求外部字体服务。
- Android 版本使用系统麦克风授权、原生返回键与后台生命周期处理；导出 CSV 时通过应用私有缓存和系统分享面板交给用户选择的应用，不需要额外存储权限。

## English quick start

Install `artifacts/sonora-1.1.0-debug.apk` on an Android 7.0+ phone, or run `npm install` and `npm run dev` for the web app. Keep Android System WebView up to date. Tap **EN** in the top bar, or choose **English** under **Preferences → Language**. Your choice is saved on this device.

Tap **Start monitoring** and allow microphone access. Use **Pause / Resume** during a session and the square **Stop and save** button to save it. View saved summaries and export a CSV under **History**. **Try demo** uses simulated readings. Audio is processed locally and is never recorded or uploaded. Readings are unweighted, device-dependent estimates, not calibrated sound pressure levels or dB(A); calibrate against a professional sound level meter.

## 读数与校准

应用先消除时域信号 DC 偏置，计算 RMS，再进行能量指数平滑（Fast 125 ms、Slow 1 s）。数字电平为 `20 × log10(RMS)`，单位 dBFS；显示值为数字电平加上设备参考偏移，低于 0 的估算值显示为 0。默认偏移 94 dB **不是经过验证的设备校准值**。平均值按采样时间进行能量平均，而非分贝算术平均。

**这里的分贝是未计权的设备估算值，不是 dB(A)，也不是专业声级计测得的准确声压级。** 在稳定声场下，与放在同一位置的专业声级计比对：

`新偏移 = 当前偏移 + 参考声级计读数 − 本应用读数`

更换麦克风、系统输入增益或声音处理设置后应重新校准。应用请求关闭降噪、回声消除、自动增益，但设备或驱动不一定遵循这些请求。单点校准无法补偿频率响应和硬件限制，不能用于听力安全、职业噪声或法规合规判断。

使用每 100 ms 读取一次的 2048 点分析窗口，统计基于采样窗口，因此可能遗漏极短的脉冲，不等同于连续积分的声级计。趋势图纵轴为 0–120 dB，超出范围时图形被截到轴边界，数值统计保留实际估算值。原始音频不写入历史；关闭或刷新页面前请结束测量以保存摘要。
