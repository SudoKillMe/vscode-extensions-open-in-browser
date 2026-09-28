# 开放 Issue 分类与修复难度评估

查询日期：2026-09-28。范围：[SudoKillMe/vscode-extensions-open-in-browser 的开放 issue](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues?q=is%3Aissue%20is%3Aopen)，共 **51 条**；逐条阅读了 issue 正文与现有评论。下表每条 issue 只归入一个难度档位，因此可以按编号核对总数。分类是基于当前仓库源码的预估，并不表示已在相应操作系统上复现或验证修复。

## 分类标准

| 档位 | 判定标准 | 数量 |
| --- | --- | ---: |
| 低 | 文档、配置、单一浏览器条目或 issue 清理；实现或核实范围较小 | 12 |
| 中 | 需修改启动参数、路径处理、菜单条件或浏览器映射，并针对相关平台验证 | 17 |
| 高 | 涉及跨系统路径、远程环境、临时文件、服务地址映射或扩展架构调整 | 8 |
| 待补充信息 | 只有通用错误或现象，缺少区分根因所需的环境、操作步骤、日志；暂不宜承诺具体修复 | 14 |

当前启动链路见 [`src/index.ts`](src/index.ts)、[`src/util.ts`](src/util.ts)：命令从编辑器或资源菜单取得 `fsPath`，经 `opn` 打开；失败时只显示统一错误文案，丢失底层异常。浏览器名称与平台列表写在 [`src/config.ts`](src/config.ts)；右键菜单限定 `resourceLangId == html`，快捷键写在 [`package.json`](package.json)。这些是下面工作量判断的主要代码依据。

## 问题类型索引

下表按主要问题类型给每条 issue 一个归属；难度和具体处理意见见后文。相似报错不一定有相同根因。

| 类型 | Issue | 数量 |
| --- | --- | ---: |
| 浏览器兼容与命令映射 | #19、#23、#29、#34、#41、#44、#65、#82、#89、#90、#93、#99 | 12 |
| 本地路径与进程启动 | #37、#45、#58、#85、#94 | 5 |
| 命令、快捷键与菜单 | #26、#30、#31、#49、#52、#59、#63、#72、#78 | 9 |
| 新功能请求 | #14、#61、#68、#69、#86 | 5 |
| 远程开发环境 | #53、#71、#76 | 3 |
| 通用故障，需先取得诊断信息 | #28、#38、#54、#66、#81、#84、#95、#97 | 8 |
| 使用咨询、经验分享与无效报告 | #50、#56、#70、#73、#74、#75、#98、#100、#102 | 9 |

## 低：配置、文档和清理

| Issue | 概要与判断依据 | 建议方向 / 状态 |
| --- | --- | --- |
| [#29 Chrome Canary support](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/29) | 请求在浏览器列表加入 Canary；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/29#issuecomment-522851467)还提到开发版。列表集中定义于 `src/config.ts`。 | 查明各平台实际应用名并新增条目，做平台冒烟测试；范围小，但不同平台名称需确认。  **已增加 macOS/Windows Canary 条目，Linux 不提供 Canary；映射测试通过，安装与启动实机待验证；开发版不在本次范围；commit：`b9dd0ab`。** |
| [#50 VS Code insiders support](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/50) | 询问能否安装到 Insiders，未提供安装错误。 | 先用 VS Code Insiders 安装 VSIX 验证；若可用，补文档并答复；若失败再记录具体兼容问题。**使用咨询，待验证。** |
| [#56 Is this still being maintained?](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/56) | 维护状态询问；[后续评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/56#issuecomment-5842170723)提到旧 `vscode` 包安装 `vscode.d.ts` 失败。 | 答复维护计划。依赖安装问题已在本地 `codex/fix-vscode-install` 分支提交，仍需确认是否已进入 GitHub 默认分支或发布版。**非单独功能缺陷；部分修复待上游确认。** |
| [#59 Shortcut conflict](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/59) | `Alt+B` 与 GitLens 冲突；快捷键在 `package.json` 声明。 | 在 README 说明 VS Code 键盘快捷方式设置中可重绑命令，必要时重新评估默认绑定。与 #72 同组。  **已补充快捷键重绑、冲突排查和取消默认绑定示例；JSON 与命令 ID 测试通过，默认快捷键未改变；commit：`72d1fd5`。** |
| [#72 How can I changed Key Shortcuts](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/72) | 询问如何改快捷键。 | 与 #59 共用文档和答复。**重复主题 / 使用咨询。**  **已补充快捷键重绑、冲突排查和取消默认绑定示例；JSON 与命令 ID 测试通过，默认快捷键未改变；commit：`72d1fd5`。** |
| [#70 Open in browser failed!! FIX](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/70) | 正文只是手动保存 HTML 后从文件管理器打开的绕过方法，没有扩展内复现步骤。 | 可整理到 FAQ，明确这不能证明插件问题已修好。**解决办法分享，非独立修复项。**  **已整理手动保存/从文件管理器打开的诊断步骤；明确只是绕过方法，未宣称扩展故障修复；commit：待回填。** |
| [#73 Firefox PATH workaround](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/73) | 分享把 Firefox 可执行文件目录加入 Windows `PATH` 的办法。 | 整理为排障说明。与 #74、#75 正文相同；**重复 / 使用经验**。  **已整理 Windows Firefox PATH/绝对路径排障说明，强调重启 VS Code 和适用边界；重复报告共用文档提交，非通用故障修复；commit：`749e0f0`。** |
| [#74 Firefox PATH workaround](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/74) | 与 #73 相同的 Firefox `PATH` 说明。 | **#73 的重复 issue**；建议保留一个入口。  **已整理 Windows Firefox PATH/绝对路径排障说明，强调重启 VS Code 和适用边界；重复报告共用文档提交，非通用故障修复；commit：`749e0f0`。** |
| [#75 Firefox PATH workaround](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/75) | 与 #73、#74 相同的 Firefox `PATH` 说明。 | **#73 的重复 issue**；建议保留一个入口。  **已整理 Windows Firefox PATH/绝对路径排障说明，强调重启 VS Code 和适用边界；重复报告共用文档提交，非通用故障修复；commit：`749e0f0`。** |
| [#98 已解决：Windows 浏览器找不到](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/98) | 作者描述其 Windows 内置管理员模式导致权限问题，恢复系统设置后已正常；[维护者评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/98#issuecomment-2458705525)谈及后续维护。 | 归档为排障案例，询问是否可关闭。**作者自称已解决，待确认；不能推断其他同类报错也由权限造成。** |
| [#100 F](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/100) | 无正文，无法识别问题。 | 请求具体操作和错误；若无补充，可作为无效报告处理。**不可执行。** |
| [#102 new site](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/102) | 正文是 HTML 示例，没有扩展故障或功能请求。 | 请求说明与插件的关系；若无补充，可作为非项目问题处理。**不可执行。** |

## 中：局部代码修改与平台验证

| Issue | 概要与判断依据 | 建议修复方向 / 状态 |
| --- | --- | --- |
| [#14 Browser command-line arguments](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/14) | 希望传入 Chrome 等浏览器启动参数。现有 `open()` 只向 `opn` 传 `app`。 | 定义可配置参数的形式、适用范围与数组传递方式，并覆盖含空格参数；与 #69 可合并设计。  **已增加按浏览器配置的参数数组；覆盖空格、引号、空参数、无效设置及三平台分发，不向系统默认应用传参数；commit：`e603448`。** |
| [#23 Chromium on Linux](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/23) | 请求 Linux 的 `chromium-browser`；源码仅把 Chromium 放进 macOS 列表。 | 增加 Linux 浏览器条目并处理发行版可执行文件名差异；与 #89 的配置需求一同评估。  **已增加 Linux Chromium，支持配置 chromium 或 chromium-browser；命令映射测试覆盖两种名称，Linux 实机待验证；commit：`7cace10`。** |
| [#31 Other file extensions](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/31) | 希望 `.json`、`.xml`、`.md` 也能从菜单打开。当前菜单只显示于 HTML，快捷键已可用于其它已保存的编辑器文件。 | 设计允许的语言或扩展名配置，再调整菜单显示规则；与 #52、#63 合并规划。  **按用户确认，默认应用菜单支持所有本地文件并排除目录；指定浏览器仍限 HTML，保留名称；菜单声明测试通过，VS Code 桌面待验证；commit：`455092c`。** |
| [#37 Ampersand in path](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/37) | Windows 路径含 `&` 时失败。 | 针对 `opn` 到系统命令的转义链增加含 `&` 的路径测试，使用可靠的参数传递或升级启动实现；与 #45 是同一已知路径问题。  **已替换 Windows cmd/start 转义链，使用 PowerShell 字面量和独立参数引用；覆盖 &、引号、百分号、Unicode 及启动错误；Windows 实机待验证；commit：`0961e17`。** |
| [#41 Firefox Developer Edition](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/41) | 多条[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/41#issuecomment-700240630)指出 macOS 的 `standardName` 从 `FirefoxDeveloperEdition` 改为 `Firefox Developer Edition` 可用，后续有成功确认；Windows/Linux 另有请求。 | 先验证并修正 macOS 应用名，再决定是否扩展 Windows/Linux 的浏览器路径配置。**部分系统有社区 workaround，尚非正式修复。**  **已修复 macOS 应用名；增加映射回归测试，实机浏览器待验证；commit：`f113952`。** |
| [#44 Cent Browser opens instead of Chrome](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/44) | Windows 7 选择 Chrome 却启动 Cent Browser；当前 `standardName` 是泛称 `chrome`。 | 验证系统中命令解析与安装路径，提供显式可执行文件路径或浏览器映射；不宜只改标签名。  **已支持 default 使用绝对可执行文件路径，绕过 chrome 命令歧义；路径保真测试通过，原 Windows 7/Cent 环境待验证；commit：`8e382cc`。** |
| [#45 Ampersand in path](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/45) | `C:\OneDrive\repos\html & css\...` 失败，改目录名后成功；[后续评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/45#issuecomment-1011977199)仍确认存在。 | 与 #37 同一修复和回归测试。**高度疑似重复，且尚有未修复反馈。**  **已替换 Windows cmd/start 转义链，使用 PowerShell 字面量和独立参数引用；覆盖 &、引号、百分号、Unicode 及启动错误；Windows 实机待验证；commit：`0961e17`。** |
| [#52 Other file types in context menu](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/52) | 希望 `.psd` 等文件在 Explorer 右键菜单出现；源码菜单限定 HTML。 | 与 #31、#63 统一菜单规则，考虑「默认应用」文案和二进制文件场景。  **按用户确认，默认应用菜单支持所有本地文件并排除目录；指定浏览器仍限 HTML，保留名称；菜单声明测试通过，VS Code 桌面待验证；commit：`455092c`。** |
| [#58 Edge splits path with spaces](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/58) | Windows Edge 将含空格的本地 URI 拆成多个窗口。 | 检查 Windows 启动命令对文件路径/URI 的引号和编码；与 #85 共用回归用例。  **已向 Windows 指定浏览器传递编码后的单个 file URI，并映射现代 Edge 的 msedge；空格、连字符和保留字符用例通过，Windows Edge 实机待验证；commit：`5aae08a`。** |
| [#63 Open in Default App for non-HTML](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/63) | 希望非 HTML 文件也能通过默认应用打开。`opn` 已有该能力，但菜单隐藏。 | 先确定菜单文案和适用资源，再放宽显示条件；与 #31、#52 属同一功能组。  **按用户确认，默认应用菜单支持所有本地文件并排除目录；指定浏览器仍限 HTML，保留名称；菜单声明测试通过，VS Code 桌面待验证；commit：`455092c`。** |
| [#65 Chrome on Manjaro](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/65) | [评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/65#issuecomment-640703618)给出 `google-chrome-stable` 的 workaround，作者随后表示做到了；另有用户反馈仍失败。 | 与 #89 同组，支持发行版命令名或自定义绝对路径。**原报告可能已解决，其他环境待复现。**  **已支持显式 google-chrome-stable 配置，保留其它发行版默认映射；自动化测试通过，Arch/Manjaro 实机待验证；commit：`7de4295`。** |
| [#69 Incognito Chrome](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/69) | 希望无痕窗口可选；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/69#issuecomment-748483326)建议通用浏览器参数。 | 优先实现 #14 的参数能力，再为 Chrome 无痕模式提供易用配置或示例。  **已基于 #14 的参数能力补充 Chrome 无痕配置；--incognito 分发由参数测试覆盖，浏览器行为待实机验证；commit：`d13c75e`。** |
| [#82 Brave as default](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/82) | `brave` 设置无效；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/82#issuecomment-1356911546)指出源码没有 Brave 条目。 | 新增 Brave 映射，或允许用户提供可执行文件路径；覆盖 Linux/macOS/Windows 命名差异。  **已增加三平台 Brave 映射与别名测试；真实浏览器启动待验证；commit：`e404681`。** |
| [#85 Windows path contains ` - `](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/85) | 路径被拆成三段；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/85#issuecomment-1377560103)称 Chrome 可打开而 Edge 不行。 | 与 #58 合并处理 Windows/Edge 的路径和 URI 传参，测试空格、连字符及混合路径。  **已向 Windows 指定浏览器传递编码后的单个 file URI，并映射现代 Edge 的 msedge；空格、连字符和保留字符用例通过，Windows Edge 实机待验证；commit：`5aae08a`。** |
| [#89 Arch-like distros](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/89) | 引用 [#28 的评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/28#issuecomment-425792433)：Arch 上 Chrome 命令可能为 `google-chrome-stable`。 | 与 #65 同组，避免把某一个发行版的名称硬编码成所有 Linux 的名称。  **已支持显式 google-chrome-stable 配置，保留其它发行版默认映射；自动化测试通过，Arch/Manjaro 实机待验证；commit：`7de4295`。** |
| [#94 `open -W` processes remain](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/94) | 多次使用后残留多个 `open -W` 进程；项目用旧 `opn` 启动 macOS 应用。 | 先记录 `opn` 的实际调用和进程退出条件，再调整等待选项或替换启动方式；需 macOS 回归。  **已移除 macOS open -W，仍监听启动器退出及错误；成功/非零退出/spawn 错误回归测试通过，桌面进程观察待验证；commit：`1bfa122`。** |
| [#99 Default browser fails on Ubuntu 24.04](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/99) | 指定浏览器菜单可用，默认浏览器命令报错。默认命令走 `defaultBrowser()` 与 `standardizedBrowserName()`；空值与 Linux 默认应用路径需要区分。 | 复现默认配置和显式配置两种情况，保留底层错误，再修正默认启动路径；与 #34 可能同组，**根因未确认**。 |

## 高：需要设计或跨环境集成

| Issue | 概要与判断依据 | 建议修复方向 / 状态 |
| --- | --- | --- |
| [#26 Commands stopped working](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/26) | macOS 上快捷键与默认命令失效，但指定浏览器菜单部分可用；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/26#issuecomment-518262922)另出现“命令未找到”。症状跨激活、命令与浏览器启动。 | 用当前 VS Code/macOS 分别测试快捷键、命令面板、Explorer/编辑器菜单；记录 Extension Host 日志后拆成可验证的子问题。**历史环境较旧，修复前需重新复现。** |
| [#34 Linux KDE default browser](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/34) | KDE 默认浏览器失败、指定浏览器可用；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/34#issuecomment-1356912041)中有人发现自己实际是 Brave 映射问题。 | 在 KDE/GNOME 对比系统默认启动命令、浏览器配置和错误日志；区分 #82、#89 的浏览器映射与真正的桌面环境差异。**同症状可能多根因。** |
| [#53 WSL support](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/53) | WSL 路径被 Windows 浏览器当作 Windows 路径打开；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/53#issuecomment-764733516)提供临时路径转换方案。 | 明确扩展运行位置与浏览器位置，设计 WSL 到主机的路径转换及不可访问文件处理；跨 Windows/WSL 测试。 |
| [#61 Open localhost URL](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/61) | 希望从本地文件打开 `http://localhost/project/mypage.php`，现有实现只取 `fsPath`，不会映射项目根路径或启动服务器。 | 定义工作区路径到 URL 的映射配置、端口和多工作区行为；若要自动起服务则另立功能边界。 |
| [#68 Unsaved file](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/68) | 未保存文档没有可直接打开的磁盘路径；`currentPageUri()` 只把 URI 转为 `fsPath`。 | 设计临时文件生命周期、资源相对路径与清理策略，并提示临时预览的限制。 |
| [#71 Remote SSH](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/71) | 远程文件在本机浏览器不可直接访问；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/71#issuecomment-799002651)指出容器也受影响。 | 设计远程文件传输/临时预览或已有 Web 服务 URL 的映射；和 #76 共用远程资源方案。 |
| [#76 Docker/Remote Development](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/76) | 希望在宿主浏览器打开容器内 HTML，正文提议 `docker cp`；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/76#issuecomment-1243738803)也提及 WSL。 | 先确定宿主与容器中文件、相对资源和生命周期的语义，再选复制或 URL 转发方案；与 #53/#71 共用设计。 |
| [#86 Pin window position](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/86) | 希望页面刷新后保留滚动位置；当前插件只启动外部浏览器，不控制页面刷新或其窗口状态。 | 需要明确是否引入预览/自动刷新能力及浏览器通信机制；属于新增产品能力，建议先讨论范围。 |

## 待补充信息：先取得可区分根因的证据

这些报告不能仅凭相同的“Open browser failed”文案合并为同一 bug：该文案来自 [`src/util.ts`](src/util.ts)，任何 `opn` 拒绝都会被替换成它。优先加入诊断日志后，请报告者提供扩展版本、VS Code/操作系统版本、浏览器和安装方式、`open-in-browser.default` 值、文件路径示例、触发入口以及 Extension Host 错误。

| Issue | 已有信息 | 下一步 / 状态 |
| --- | --- | --- |
| [#19 macOS Chrome fails](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/19) | Chrome 不行、Firefox 可用，系统版本写作“11.13”，无法确认。 | 核对 macOS/Chrome/扩展版本与默认浏览器设置；复现后可能归到浏览器名称组。 |
| [#28 Generic launch failure](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/28) | 主帖仅有通用错误；36 条评论覆盖 Arch、Windows、`&` 路径等多种情境，其中 [Arch 线索](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/28#issuecomment-425792433)已被 #89 引用。 | 作为诊断总入口，按环境拆分/链接至 #37/#45、#65/#89 等；**不能认定所有评论是同一根因。** |
| [#30 Context menu missing](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/30) | 命令面板与快捷键可用，Kubuntu 上右键菜单不出现；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/30#issuecomment-469564684)称较新 VS Code/Linux 已正常。 | 核对是 HTML 资源、Explorer 还是编辑器菜单，以及语言模式；与 #78 可能重复。 |
| [#38 Windows 10 launch failure](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/38) | 主帖只给通用错误；一条[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/38#issuecomment-456727217)却是 Linux 的 `spawn EACCES`，不能解释 Windows 报告。 | 分别取得 Windows 底层错误、路径和浏览器信息；不要把 Linux 权限栈当作 Windows 根因。 |
| [#49 Shift+Alt+B fails](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/49) | Windows 10 / VS Code 1.37.1 中默认快捷键可用，指定浏览器快捷键失败，菜单可用。 | 检查快捷键冲突、键盘布局、命令日志与当前版本是否仍复现；可能与 #26 的命令现象相关，但未证实。 |
| [#54 HTML file not found](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/54) | 主帖为空；评论只称右键打开无效。 | 要求路径样例、截图/错误文本、保存状态及设置；疑似启动失败组，不能进一步定因。 |
| [#66 Chrome launch error](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/66) | 只有 Chrome 相关通用报错；评论称重装扩展仍失败、另一台设备正常。 | 收集平台、Chrome 可执行命令、设置和底层错误；可能与 #28 重复，根因未证实。 |
| [#78 Context menu disappeared](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/78) | 右键菜单消失；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/78#issuecomment-1030734460)称保存为相应文件类型后出现。 | 先核对文件是否保存以及 `resourceLangId == html`；与 #30、#31/#52 菜单范围问题相关。 |
| [#81 Windows machine cannot open browser](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/81) | 截图和 Windows 10 信息；评论中另一用户称 Windows 后来正常而 Ubuntu 不行。 | 请求可复制的错误文本、路径、浏览器和设置；不同用户环境分别跟踪。 |
| [#84 Open in browser error](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/84) | 主要是截图；[评论](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/84#issuecomment-1285416552)称回退扩展版本对其中一人有效，另有人无效。 | 索取错误文字与版本差异；避免把回退当作通用修复。 |
| [#90 Arc Browser](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/90) | 称 Arc 打不开，但未说明系统、默认/指定浏览器入口或配置；Arc 不在当前浏览器列表。 | 获取环境与复现路径；若只是新增浏览器映射，可转中等难度。 |
| [#93 Manjaro Snap Firefox](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/93) | 标题仅称 Manjaro、Snap VS Code 找不到 Firefox，无正文。 | 请求 Snap 沙箱环境、Firefox 安装形式和底层错误；可能涉及沙箱权限，也可能是命令名。 |
| [#95 Windows cannot find Edge/Chrome](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/95) | 正文仅列两个菜单，没有错误、版本或路径。 | 索取以上诊断信息；与 #28/#38 相似症状，未证实重复根因。 |
| [#97 Browser not working](https://github.com/SudoKillMe/vscode-extensions-open-in-browser/issues/97) | 只称以前可用、现在不可用，无环境和报错。 | 请求最近变更、扩展/系统版本及日志；暂不能归因。 |

## 建议的修复批次

1. **先改善诊断能力**：在 `src/util.ts` 保留底层异常并给出可操作的错误信息，区分找不到程序、权限、路径解析和远程路径。它会直接帮助 #19、#28、#38、#54、#66、#81、#84、#93、#95、#97 的后续判断。
2. **解决可复现的本地路径问题**：把 #37/#45 和 #58/#85 作为两组用例，覆盖 `&`、空格、连字符、Windows Edge 与默认浏览器。
3. **整理浏览器映射**：先处理 #41、#65/#89、#82、#23、#29；允许配置可执行文件路径可减少发行版硬编码，但应验证安全的参数传递方式。
4. **统一菜单与文件类型**：一起设计 #31/#52/#63；再检查 #30/#78 是否仍有独立的菜单消失问题。
5. **单独设计远程与新能力**：#53/#71/#76 共用远程资源方案；#61、#68、#86 各自需要明确产品边界。

本文件只是本地调查和排期依据，尚未改动 GitHub issue 的状态或标签。
