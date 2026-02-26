# MD Reader - 项目规范

## 发版流程

当用户说"发新版本"时，按以下流程执行：

1. **更新版本号** — 3 处同步修改：
   - `package.json` → `"version": "x.y.z"`
   - `src-tauri/tauri.conf.json` → `"version": "x.y.z"`
   - `src/components/layout/StatusBar.tsx` → `const APP_VERSION = 'x.y.z'`

2. **提交推送** — commit + push + tag
   ```
   git add -A && git commit -m "release: vx.y.z" && git push
   git tag vx.y.z && git push origin vx.y.z
   ```

3. **签名构建** — 带签名密钥构建
   ```bash
   TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/mdreader_v3.key)" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="mdreader123" npm run tauri build
   ```

4. **创建 Release** — 上传 DMG + tar.gz + sig + latest.json
   ```bash
   # 生成 latest.json（signature 从 .sig 文件读取）
   # 上传 4 个文件：
   gh release create vx.y.z \
     ./src-tauri/target/release/bundle/dmg/*.dmg \
     "./src-tauri/target/release/bundle/macos/MD Reader.app.tar.gz" \
     "./src-tauri/target/release/bundle/macos/MD Reader.app.tar.gz.sig" \
     /tmp/latest.json \
     --title "vx.y.z" --notes "..."
   ```

5. **验证** — curl GitHub API 确认 release + latest.json
   ```bash
   curl -s https://api.github.com/repos/shehuiyao/mdreader/releases/latest | grep tag_name
   curl -sL https://github.com/shehuiyao/mdreader/releases/latest/download/latest.json
   ```

6. **本地安装**（可选）— 将构建产物安装到 /Applications
   ```bash
   rm -rf "/Applications/MD Reader.app"
   cp -R "./src-tauri/target/release/bundle/macos/MD Reader.app" /Applications/
   open -a "MD Reader"
   ```

## 签名密钥

- 私钥路径: `~/.tauri/mdreader_v3.key`
- 密码: `mdreader123`
- 公钥已配置在 `src-tauri/tauri.conf.json` 的 `plugins.updater.pubkey`
