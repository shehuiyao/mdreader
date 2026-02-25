# MD Reader - 项目规范

## 发版流程

当用户说"发新版本"时，按以下流程执行：

1. **更新版本号** — 4 处同步修改：
   - `package.json` → `"version": "x.y.z"`
   - `src-tauri/tauri.conf.json` → `"version": "x.y.z"`
   - `src/components/layout/StatusBar.tsx` → `const APP_VERSION = 'x.y.z'`
   - `src-tauri/src/commands/update_ops.rs` → `const APP_VERSION: &str = "x.y.z"`

2. **提交推送** — commit + push + tag
   ```
   git add -A && git commit -m "release: vx.y.z" && git push
   git tag vx.y.z && git push origin vx.y.z
   ```

3. **构建 DMG** — `npm run tauri build`

4. **创建 Release** — 用 gh CLI 上传 DMG
   ```
   gh release create vx.y.z ./src-tauri/target/release/bundle/dmg/*.dmg --title "vx.y.z" --notes "..."
   ```

5. **验证** — curl GitHub API 确认 release 已发布
   ```
   curl -s https://api.github.com/repos/shehuiyao/mdreader/releases/latest | grep tag_name
   ```
