export type Language = "zh-CN" | "en";

// Chinese is the source language. Keep complete sentences together so English
// can use its own word order, including messages with interpolated values.
export const english: Record<string, string> = {
  声境: "Sonora",
  实时监测: "Live monitor",
  测量记录: "History",
  使用指南: "Guide",
  轻声的自然: "Quiet nature",
  "树叶沙沙、安静卧室": "Rustling leaves, a quiet bedroom",
  专注的空间: "A space to focus",
  "图书馆、安静办公室": "A library, a quiet office",
  日常的热闹: "Everyday sounds",
  "正常交谈、背景音乐": "Conversation, background music",
  繁忙的城市: "A busy city",
  "繁忙街道、吸尘器": "Busy streets, a vacuum cleaner",
  强烈的声音: "Loud sounds",
  "施工现场、大音量音乐": "Construction, loud music",
  关闭设置: "Close settings",
  声音的刻度: "The sound scale",
  找到此刻声量的位置: "Put your sound level in context",
  环境声量参考: "Sound level reference",
  "范围仅供感知参考；实际声量受距离、设备与环境影响，不能用于职业噪声或听力安全判定。":
    "These ranges are illustrative. Actual levels depend on distance, equipment and surroundings. Do not use them to assess occupational noise or hearing safety.",
  测量时间: "Measured at",
  来源: "Source",
  时长: "Duration",
  平均声量: "Average",
  "最低 / 最高": "Min / Max",
  环境状态: "Sound level",
  操作: "Actions",
  模拟演示: "Demo",
  麦克风: "Microphone",
  "删除 {time} 的记录": "Delete the record from {time}",
  "CSV 文件已生成": "CSV file created",
  "已交给所选应用，请在该应用中完成保存":
    "Sent to your chosen app. Finish saving it there.",
  "导出失败，请检查可用存储空间后重试":
    "Export failed. Check available storage and try again.",
  本次测量已保存到记录: "Measurement saved to history",
  "记录暂存在本页面，本地存储不可用，请及时导出":
    "Local storage is unavailable. This record is only on this page; export it before leaving.",
  测量记录已删除: "Measurement deleted",
  "页面记录已删除，但无法更新本地存储":
    "Record removed from this page, but local storage could not be updated.",
  关闭导航: "Close navigation",
  声境首页: "Sonora home",
  你的声音空间: "YOUR SOUND SPACE",
  主导航: "Main navigation",
  "留一点安静，": "A little quiet,",
  "给自己。": "just for you.",
  "感知声音，也关照生活。": "Listen well. Live well.",
  偏好设置: "Preferences",
  "声音留在本机，隐私始终在线": "Your audio stays on your device",
  打开导航: "Open navigation",
  工作空间: "Workspace",
  打开使用指南: "Open guide",
  "感知声音，寻回宁静。": "Hear your world. Find your calm.",
  "每一次聆听，都有记录。": "Every listening moment, saved.",
  "从聆听开始，了解你的环境。": "Get to know your soundscape.",
  "实时了解身边的声量，为专注与生活找到舒适的空间。":
    "Explore the sounds around you and find a comfortable space to focus and unwind.",
  "回看环境声量的变化，发现属于你的安静时刻。":
    "Look back at changing sound levels and discover your quieter moments.",
  "几个简单步骤，让看不见的声音清晰可见。":
    "Make the sounds around you visible in a few simple steps.",
  查看记录: "View history",
  "导出 CSV": "Export CSV",
  开始体验: "Get started",
  关闭提示: "Dismiss message",
  "正在体验演示模式 · 所有数值均为模拟数据，未使用麦克风。":
    "Demo mode · All readings are simulated. The microphone is not in use.",
  结束演示: "End demo",
  实时声量: "Live sound level",
  连接中: "Connecting",
  已暂停: "Paused",
  监测中: "Listening",
  待机: "Ready",
  继续监测: "Resume",
  暂停监测: "Pause",
  结束并保存测量: "Stop and save measurement",
  结束并保存: "Stop and save",
  "等待麦克风授权…": "Waiting for permission…",
  开始监测: "Start monitoring",
  取消连接麦克风: "Cancel microphone connection",
  测量设置: "Measurement settings",
  本次测量: "Session",
  声音采集已暂停: "Audio paused",
  等待授权: "Awaiting permission",
  模拟信号: "Simulated signal",
  实时采集中: "Listening live",
  音频仅在本机处理: "Audio processed on device",
  试用演示: "Try demo",
  声量趋势: "Sound trend",
  捕捉声音的每一次起伏: "Follow the rise and fall of sound",
  趋势时间范围: "Trend time range",
  "{seconds} 秒": "{seconds} s",
  模拟声量: "Simulated level",
  环境声量: "Ambient level",
  "最近 {seconds} 秒": "Last {seconds} s",
  "单位 dB": "Unit: dB",
  本次能量平均: "Session energy average",
  最低声量: "Minimum",
  捕捉安静时刻: "Quietest moment",
  最高声量: "Maximum",
  关注声量高点: "Loudest moment",
  "当前声量已超过 {threshold} dB 提醒值":
    "Sound level is above your {threshold} dB alert",
  "给生活调低一点音量。": "Turn down the volume of life.",
  "好的环境，从听见开始。": "A better space starts with listening.",
  "可以尝试远离声源，或降低设备音量。此提醒依据估算值。":
    "Try moving away from the source or turning down its volume. This alert uses estimated readings.",
  "安静的空间，让思绪更清晰。开启监测，感受你与环境的距离。":
    "A quieter space makes room for clearer thoughts. Start listening to your surroundings.",
  提醒设置: "Set alert",
  最近的聆听: "Recent sessions",
  你的环境声量足迹: "Your sound level history",
  全部记录: "View all",
  "安静的故事，等待开始": "Your quiet story starts here",
  "结束一次测量后，记录会自动保存在这里。":
    "Stop a measurement to save its summary here.",
  已保存测量: "Saved sessions",
  " 次": "",
  麦克风测量: "Microphone sessions",
  累计测量时长: "Total listening time",
  全部: "All",
  演示: "Demo",
  这里还没有这类记录: "No records of this type yet",
  留住每一个安静时刻: "Keep your quieter moments",
  "完成并结束一次测量，环境声量记录就会出现在这里。":
    "Stop and save a measurement to see its summary here.",
  去监测声音: "Start listening",
  "仅在此设备保存最近 100 条摘要记录，不保存原始音频。清除应用数据或卸载应用会移除记录。":
    "The latest 100 summaries are stored on this device. Raw audio is never saved. Clearing app data or uninstalling the app removes these records.",
  "仅在当前浏览器保存最近 100 条摘要记录，不保存原始音频。清除浏览器数据会移除记录。":
    "The latest 100 summaries are stored in this browser. Raw audio is never saved. Clearing browser data removes these records.",
  开启你的麦克风: "Enable your microphone",
  "点击「开始监测」，在系统提示中允许录制音频权限。麦克风只用于计算声量，不会保存录音。让麦克风远离遮挡和摩擦。":
    "Tap Start monitoring and allow microphone access when prompted by Android. Audio is used only to calculate sound levels; no recordings are saved. Keep the microphone clear of obstructions and rubbing.",
  "点击「开始监测」，在浏览器提示中允许麦克风权限。让麦克风远离衣物遮挡和手部摩擦。":
    "Tap Start monitoring and allow microphone access in your browser. Keep clothing and hands from covering or rubbing against the microphone.",
  观察环境的声量: "Watch your sound levels",
  "大号读数显示当前估算分贝，趋势图保留最近 60 秒。暂停后可以继续，切换到后台会自动暂停。":
    "The main reading shows the current estimated decibels. The chart keeps the latest 60 seconds. You can pause and resume; switching to the background pauses automatically.",
  记录你的声音空间: "Save your soundscape",
  "点击方形结束按钮保存测量摘要。在「测量记录」查看最低、最高与平均声量，也可导出 CSV。":
    "Tap the square stop button to save a summary. Open History to view minimum, maximum and average sound levels, or export a CSV file.",
  关于读数与校准: "Readings and calibration",
  打开设置: "Open settings",
  "这里的分贝数代表什么？": "What do these decibels mean?",
  "应用读取麦克风的数字幅度（dBFS），加上设备参考偏移后得到估算分贝。默认偏移为 94 dB，未经设备校准，不能视为准确的声压级，也不是 A 计权 dB(A)。":
    "The app reads digital microphone amplitude (dBFS) and adds a device reference offset to estimate decibels. The default offset is 94 dB and is not calibrated for your device. Readings are not accurate sound pressure levels or A-weighted dB(A).",
  "如何让数值更接近实际？": "How can I improve accuracy?",
  "在稳定的声音环境下，把专业声级计与麦克风放在同一位置。新参考偏移 = 当前偏移 + 声级计读数 − 本应用读数。在设置中输入新值，再重新测量。":
    "Compare with a professional sound level meter at the same position in a steady sound field. New offset = current offset + reference meter reading − app reading. Enter the new offset in settings, then start a new measurement.",
  "为什么不同设备的读数不同？": "Why do devices give different readings?",
  "麦克风灵敏度、系统增益和驱动音频处理都会影响结果。应用会请求关闭自动增益、降噪与回声消除，但部分设备仍可能自行处理音频。更换设备后需要重新校准。":
    "Microphone sensitivity, system gain and audio processing all affect readings. The app requests that automatic gain, noise suppression and echo cancellation be disabled, but some devices may still process the audio. Recalibrate when changing devices.",
  "音频会被保存或上传吗？": "Is my audio saved or uploaded?",
  "不会。音频在设备本地实时计算，不录音、不上传。测量摘要和偏好设置保存在此设备，应用无需联网即可运行。切换到后台或锁屏会自动暂停。":
    "No. Audio is processed live on your device without recording or uploading it. Summaries and preferences stay on this device, and the app works offline. Backgrounding the app or locking the screen pauses measurement.",
  "不会。音频在设备本地实时计算，不录音、不上传。仅测量摘要和偏好设置保存在当前浏览器。请在 localhost 或 HTTPS 下使用；后台运行会自动暂停。":
    "No. Audio is processed live on your device without recording or uploading it. Only summaries and preferences are saved in this browser. Use localhost or HTTPS; measurement pauses in the background.",
  "本地处理，安心聆听": "Processed locally. Listen with peace of mind.",
  "测量结果为估算值，仅供环境声量参考，不能替代专业声级计。":
    "Readings are estimates for ambient sound reference and do not replace a professional sound level meter.",
  让测量更适合你: "Make it yours",
  测量设置已保存: "Measurement settings saved",
  "设置已应用，但本地存储不可用":
    "Settings applied, but local storage is unavailable.",
  "请先结束本次测量，再修改设置，保证同一次测量使用一致的参数。":
    "Stop this measurement before changing measurement settings so each session uses consistent parameters.",
  声量提醒: "Sound level alert",
  "40 dB · 较安静": "40 dB · Quiet",
  "100 dB · 较响亮": "100 dB · Loud",
  "超过此估算值时，在页面中显示提醒；不会播放提示音。":
    "Show a visual alert above this estimated level. No alert sound is played.",
  校准参考偏移: "Calibration offset",
  "估算分贝 = 麦克风 dBFS + 参考偏移。默认 94 dB，需要与专业声级计对照校准。":
    "Estimated dB = microphone dBFS + reference offset. The default is 94 dB; calibrate against a professional sound level meter.",
  最近数字电平: "Latest digital level",
  模拟数据: "Simulated data",
  麦克风数据: "Microphone data",
  读数响应速度: "Response speed",
  平稳: "Steady",
  适合观察环境声量: "Follow ambient sound levels",
  灵敏: "Responsive",
  适合捕捉短时变化: "Follow short-term changes",
  输入设备: "Input device",
  本机处理: "On device",
  恢复默认: "Reset defaults",
  保存设置: "Save settings",
  记录已恢复: "Record restored",
  "记录已恢复到页面，但无法更新本地存储":
    "Record restored on this page, but local storage could not be updated.",
  撤销: "Undo",
  关闭通知: "Dismiss notification",
  测量已暂停: "Measurement paused",
  本次最终读数: "Final session reading",
  当前环境声量: "Current ambient level",
  "dB · 模拟数值": "dB · simulated",
  "dB · 估算分贝": "dB · estimated",
  准备聆听: "Ready to listen",
  "开启麦克风，感知此刻的环境":
    "Turn on your microphone to explore your soundscape",
  "最近 {seconds} 秒声量趋势，{source}":
    "Sound level over the last {seconds} seconds, {source}",
  麦克风估算数据: "Estimated microphone data",
  "声量趋势图，等待开始测量": "Sound level chart, waiting for a measurement",
  "提醒值 {threshold} dB": "Alert {threshold} dB",
  "每一刻的声音，都有迹可循": "Every sound has a story",
  "开始监测后，实时趋势将在这里呈现":
    "Start monitoring to see the live trend here",
  非常安静: "Very quiet",
  "轻声细语，享受安静时刻": "Enjoy a moment of quiet",
  安静舒适: "Quiet and comfortable",
  "适合专注，也适合放松": "A space to focus or unwind",
  日常声量: "Everyday sound",
  周围的声音渐渐热闹起来: "Your surroundings are getting livelier",
  有些嘈杂: "Getting noisy",
  可以换一个更安静的地方: "Consider finding a quieter spot",
  声音较大: "Loud",
  "建议降低声源音量，减少暴露":
    "Consider lowering the volume and limiting exposure",
  "麦克风权限未开启。请在手机「设置 → 应用 → 声境 → 权限」中允许使用麦克风，再重新开始。":
    "Microphone permission is off. On your phone, open Settings → Apps → Sonora → Permissions and allow microphone access, then try again.",
  "麦克风权限未开启。请在浏览器地址栏的网站设置中允许使用麦克风，再重新开始。":
    "Microphone permission is off. Allow microphone access in the site settings beside your browser's address bar, then try again.",
  "没有找到麦克风。请连接麦克风后重试，或先体验演示模式。":
    "No microphone found. Connect one and try again, or explore demo mode.",
  "暂时无法读取麦克风。请检查设备连接，或关闭正在独占麦克风的应用后重试。":
    "The microphone is unavailable. Check its connection or close other apps using it, then try again.",
  "无法启动麦克风，请检查设备连接后重试。":
    "Could not start the microphone. Check its connection and try again.",
  默认麦克风: "Default microphone",
  模拟声音信号: "Simulated sound signal",
  "麦克风需要安全连接。请通过 localhost 或 HTTPS 打开此应用，并使用支持麦克风的现代浏览器。":
    "The microphone requires a secure connection. Open this app over localhost or HTTPS in a modern browser with microphone support.",
  "麦克风连接已中断。请结束本次测量，重新连接设备后再开始。":
    "The microphone was disconnected. Stop this measurement, reconnect the device and start again.",
  "麦克风连接已中断，请结束本次测量后重新开始。":
    "The microphone was disconnected. Stop this measurement and start again.",
  "已进入后台，测量已自动暂停。返回后可继续测量。":
    "Measurement paused automatically when the app entered the background. Resume when you return.",
  开始时间: "Start time",
  数据来源: "Data source",
  "测量时长(秒)": "Duration (s)",
  "平均估算分贝(dB)": "Average estimated level (dB)",
  "最低估算分贝(dB)": "Minimum estimated level (dB)",
  "最高估算分贝(dB)": "Maximum estimated level (dB)",
  "参考偏移(dB)": "Reference offset (dB)",
  "提醒阈值(dB)": "Alert threshold (dB)",
  "声境-测量记录-{date}.csv": "Sonora-measurements-{date}.csv",
  声境测量记录: "Sonora measurements",
  保存或分享测量记录: "Save or share measurements",
  界面语言: "Language",
  "语言切换立即生效，不影响正在进行的测量。":
    "Language changes apply immediately, including during a measurement.",
  "语言已切换，但本地存储不可用，下次启动可能需要重新选择。":
    "Language changed, but local storage is unavailable. You may need to choose it again next time.",
  "声境 Sonora · 实时噪声监测": "Sonora · Live sound level monitor",
  "声境 Sonora：通过麦克风实时了解环境声量，查看分贝趋势与测量记录。音频仅在设备本地处理。":
    "Sonora: monitor ambient sound levels, live decibel trends and measurement history. Audio is processed only on your device.",
};

export function translate(
  language: Language,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const message = language === "en" ? (english[key] ?? key) : key;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}

export function readLanguage(): Language {
  try {
    const saved = localStorage.getItem("sonora-language");
    if (saved === "zh-CN" || saved === "en") return saved;
  } catch {
    // A language can still be chosen for this visit if storage is unavailable.
  }
  const preferred = navigator.languages?.[0] || navigator.language || "zh-CN";
  return /^zh(?:-|$)/i.test(preferred) ? "zh-CN" : "en";
}
