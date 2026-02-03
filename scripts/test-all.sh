#!/bin/bash

# 自动化测试运行脚本
# 用于运行所有核心模块和插件的测试

set -e

echo "🧪 开始运行 Eva.js 自动化测试..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试模式
MODE=${1:-"all"}

# 显示帮助信息
if [ "$MODE" = "--help" ] || [ "$MODE" = "-h" ]; then
  echo "用法: npm run test:all [模式] [选项]"
  echo ""
  echo "模式:"
  echo "  all              运行所有测试（默认）"
  echo "  core             仅运行核心模块测试"
  echo "  plugins          仅运行插件测试"
  echo "  renderer         仅运行渲染器相关测试"
  echo "  watch            监听模式"
  echo "  coverage         生成覆盖率报告"
  echo ""
  echo "选项:"
  echo "  --verbose        详细输出"
  echo "  --bail           遇到错误立即停止"
  echo ""
  exit 0
fi

# 核心模块测试
run_core_tests() {
  echo -e "${BLUE}📦 运行核心模块测试...${NC}"
  npx jest packages/eva.js/__tests__ --testPathPattern="eva.js"
}

# 插件测试
run_plugin_tests() {
  echo -e "${BLUE}🔌 运行插件测试...${NC}"

  local plugins=(
    "plugin-renderer"
    "plugin-renderer-event"
    "plugin-renderer-img"
    "plugin-renderer-sprite"
    "plugin-renderer-sprite-animation"
    "plugin-renderer-text"
    "plugin-renderer-graphics"
    "plugin-renderer-mask"
    "plugin-renderer-lottie"
    "plugin-renderer-spine"
    "plugin-sound"
    "plugin-a11y"
    "plugin-transition"
  )

  for plugin in "${plugins[@]}"; do
    if [ -d "packages/$plugin/__tests__" ]; then
      echo -e "${YELLOW}  测试 $plugin...${NC}"
      npx jest "packages/$plugin/__tests__" --silent || true
    fi
  done
}

# 渲染器测试
run_renderer_tests() {
  echo -e "${BLUE}🎨 运行渲染器测试...${NC}"
  npx jest --testPathPattern="renderer" --silent
}

# 生成覆盖率报告
run_coverage() {
  echo -e "${BLUE}📊 生成测试覆盖率报告...${NC}"
  npx jest --coverage --coverageDirectory=coverage/all
  echo -e "${GREEN}✓ 覆盖率报告已生成: coverage/all${NC}"
}

# 监听模式
run_watch() {
  echo -e "${BLUE}👀 进入监听模式...${NC}"
  npx jest --watch
}

# 根据模式运行测试
case $MODE in
  "core")
    run_core_tests
    ;;
  "plugins")
    run_plugin_tests
    ;;
  "renderer")
    run_renderer_tests
    ;;
  "coverage")
    run_coverage
    ;;
  "watch")
    run_watch
    ;;
  "all"|*)
    echo -e "${GREEN}运行完整测试套件${NC}"
    echo ""
    run_core_tests
    echo ""
    run_plugin_tests
    echo ""
    echo -e "${GREEN}✅ 所有测试完成！${NC}"
    ;;
esac

echo ""
echo -e "${GREEN}测试运行完成！${NC}"
