# Docker 部署指南 / Docker Deployment Guide

[English](#english) | [中文](#中文)

---

## English

### Overview

This project supports Docker deployment using a multi-stage build approach optimized for Next.js applications. The Docker configuration produces a lightweight production image (~150MB) with the Next.js standalone output.

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (optional, for easier management)

### Quick Start

#### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

#### Option 2: Using Docker CLI

```bash
# Build the Docker image
docker build -t trans-avatar-flag-adder:latest .

# Run the container
docker run -d \
  --name trans-avatar-flag-adder \
  -p 3000:3000 \
  -e NODE_ENV=production \
  trans-avatar-flag-adder:latest

# View logs
docker logs -f trans-avatar-flag-adder

# Stop and remove the container
docker stop trans-avatar-flag-adder
docker rm trans-avatar-flag-adder
```

### Configuration

#### Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `production` for production builds (default: production)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry (default: 1)
- `PORT`: Port to run the application on (default: 3000)
- `HOSTNAME`: Hostname to bind to (default: 0.0.0.0)

Example with custom environment variables:

```bash
docker run -d \
  --name trans-avatar-flag-adder \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  trans-avatar-flag-adder:latest
```

#### Port Mapping

By default, the application runs on port 3000. You can map it to a different host port:

```bash
# Run on host port 8080
docker run -d -p 8080:3000 trans-avatar-flag-adder:latest

# Access at http://localhost:8080
```

### Alternative: Using npm instead of pnpm

If you encounter issues with pnpm during the Docker build (e.g., network issues), you can use the npm-based Dockerfile:

```bash
# Build using the npm Dockerfile
docker build -f Dockerfile.npm -t trans-avatar-flag-adder:latest .

# Run the container
docker run -d -p 3000:3000 trans-avatar-flag-adder:latest
```

### Docker Compose Configuration

The `docker-compose.yml` file includes:

- Automatic container restart (`restart: unless-stopped`)
- Resource limits (CPU and memory constraints)
- Environment variable configuration
- Port mapping

To customize the docker-compose configuration, edit the `docker-compose.yml` file:

```yaml
services:
  trans-avatar-flag-adder:
    # ... other configurations
    ports:
      - "8080:3000"  # Change host port
    environment:
      - NODE_ENV=production
      - CUSTOM_VAR=value  # Add custom variables
```

### Troubleshooting

#### Build Fails with Network Errors

If you encounter network issues during the build (especially with pnpm), try:

1. Using the npm-based Dockerfile: `docker build -f Dockerfile.npm -t trans-avatar-flag-adder:latest .`
2. Building with network mode: `docker build --network=host -t trans-avatar-flag-adder:latest .`
3. Checking your Docker daemon's DNS settings

#### Container Exits Immediately

Check the logs to see the error:

```bash
docker logs trans-avatar-flag-adder
```

Common issues:
- Port already in use: Change the host port in your `docker run` command
- Missing environment variables: Ensure all required environment variables are set

#### Cannot Access the Application

1. Verify the container is running: `docker ps`
2. Check the logs: `docker logs trans-avatar-flag-adder`
3. Verify port mapping: `docker port trans-avatar-flag-adder`
4. Test locally: `curl http://localhost:3000`

### Production Deployment

For production deployments, consider:

1. **Using a reverse proxy** (nginx, Caddy, Traefik) for SSL/TLS termination
2. **Setting up health checks** in your orchestration platform
3. **Configuring resource limits** appropriate for your workload
4. **Setting up log aggregation** for monitoring
5. **Using container orchestration** (Kubernetes, Docker Swarm) for scaling

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Image Details

- **Base Image**: node:20-alpine
- **Final Image Size**: ~150MB
- **Architecture**: Multi-stage build (deps → builder → runner)
- **Security**: Runs as non-root user (nextjs:nodejs)
- **Optimization**: Uses Next.js standalone output for minimal image size

---

## 中文

### 概述

本项目支持 Docker 部署，采用针对 Next.js 应用优化的多阶段构建方式。Docker 配置可生成轻量级生产镜像（约 150MB），使用 Next.js standalone 输出。

### 前置要求

- Docker（版本 20.10 或更高）
- Docker Compose（可选，用于更简便的管理）

### 快速开始

#### 方式一：使用 Docker Compose（推荐）

```bash
# 后台构建并启动容器
docker compose up -d

# 查看日志
docker compose logs -f

# 停止容器
docker compose down
```

#### 方式二：使用 Docker CLI

```bash
# 构建 Docker 镜像
docker build -t trans-avatar-flag-adder:latest .

# 运行容器
docker run -d \
  --name trans-avatar-flag-adder \
  -p 3000:3000 \
  -e NODE_ENV=production \
  trans-avatar-flag-adder:latest

# 查看日志
docker logs -f trans-avatar-flag-adder

# 停止并删除容器
docker stop trans-avatar-flag-adder
docker rm trans-avatar-flag-adder
```

### 配置

#### 环境变量

可以配置以下环境变量：

- `NODE_ENV`：设置为 `production` 用于生产构建（默认：production）
- `NEXT_TELEMETRY_DISABLED`：禁用 Next.js 遥测（默认：1）
- `PORT`：应用运行的端口（默认：3000）
- `HOSTNAME`：绑定的主机名（默认：0.0.0.0）

自定义环境变量示例：

```bash
docker run -d \
  --name trans-avatar-flag-adder \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  trans-avatar-flag-adder:latest
```

#### 端口映射

默认情况下，应用运行在 3000 端口。您可以将其映射到不同的主机端口：

```bash
# 在主机 8080 端口运行
docker run -d -p 8080:3000 trans-avatar-flag-adder:latest

# 通过 http://localhost:8080 访问
```

### 备选方案：使用 npm 替代 pnpm

如果在 Docker 构建过程中遇到 pnpm 问题（例如网络问题），可以使用基于 npm 的 Dockerfile：

```bash
# 使用 npm Dockerfile 构建
docker build -f Dockerfile.npm -t trans-avatar-flag-adder:latest .

# 运行容器
docker run -d -p 3000:3000 trans-avatar-flag-adder:latest
```

### Docker Compose 配置

`docker-compose.yml` 文件包含：

- 自动容器重启（`restart: unless-stopped`）
- 资源限制（CPU 和内存约束）
- 环境变量配置
- 端口映射

要自定义 docker-compose 配置，编辑 `docker-compose.yml` 文件：

```yaml
services:
  trans-avatar-flag-adder:
    # ... 其他配置
    ports:
      - "8080:3000"  # 更改主机端口
    environment:
      - NODE_ENV=production
      - CUSTOM_VAR=value  # 添加自定义变量
```

### 故障排除

#### 构建时出现网络错误

如果在构建过程中遇到网络问题（特别是 pnpm），请尝试：

1. 使用基于 npm 的 Dockerfile：`docker build -f Dockerfile.npm -t trans-avatar-flag-adder:latest .`
2. 使用主机网络模式构建：`docker build --network=host -t trans-avatar-flag-adder:latest .`
3. 检查 Docker daemon 的 DNS 设置

#### 容器立即退出

查看日志以了解错误：

```bash
docker logs trans-avatar-flag-adder
```

常见问题：
- 端口已被占用：在 `docker run` 命令中更改主机端口
- 缺少环境变量：确保设置所有必需的环境变量

#### 无法访问应用

1. 验证容器正在运行：`docker ps`
2. 检查日志：`docker logs trans-avatar-flag-adder`
3. 验证端口映射：`docker port trans-avatar-flag-adder`
4. 本地测试：`curl http://localhost:3000`

### 生产部署

对于生产部署，请考虑：

1. **使用反向代理**（nginx、Caddy、Traefik）进行 SSL/TLS 终止
2. **在编排平台中设置健康检查**
3. **配置适合工作负载的资源限制**
4. **设置日志聚合**以进行监控
5. **使用容器编排**（Kubernetes、Docker Swarm）进行扩展

nginx 配置示例：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 镜像详情

- **基础镜像**：node:20-alpine
- **最终镜像大小**：约 150MB
- **架构**：多阶段构建（deps → builder → runner）
- **安全性**：以非 root 用户运行（nextjs:nodejs）
- **优化**：使用 Next.js standalone 输出以最小化镜像大小
