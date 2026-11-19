@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 心屿 - AI 心理咨询式对话助手

rem 服务已经运行时，直接打开浏览器
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if not errorlevel 1 goto :already_running

echo.
echo  正在启动「心屿」，请稍候...
echo.

if not exist "node_modules" (
  echo  [1/3] 首次运行：安装依赖...
  call corepack pnpm install
  if errorlevel 1 goto :failed
)

if not exist "prisma\dev.db" (
  echo  [2/3] 初始化数据库...
  call corepack pnpm db:setup
  if errorlevel 1 goto :failed
)

if not exist ".next" (
  echo  [3/3] 首次运行：构建页面...
  call corepack pnpm build
  if errorlevel 1 goto :failed
)

rem 延迟 3 秒再打开浏览器，等服务就绪
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

echo  服务启动后会自动打开浏览器：http://localhost:3000
echo  关闭本窗口即可停止服务。
echo.
call corepack pnpm start
goto :eof

:already_running
echo  心屿已经在运行，正在为你打开浏览器...
start "" http://localhost:3000
timeout /t 2 >nul
goto :eof

:failed
echo.
echo  启动失败，请检查上面的错误信息。
echo  常见原因：Node.js 未安装、网络无法下载依赖、端口 3000 被占用。
pause
exit /b 1
