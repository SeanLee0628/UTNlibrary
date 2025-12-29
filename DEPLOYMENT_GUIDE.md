# DB 배포 및 영구 저장소 설정 가이드

현재 SQLite를 사용하고 계시므로, 배포 환경(Cloud)에서 파일 시스템이 초기화되면 데이터베이스 파일(`dev.db`)도 함께 삭제되어 데이터가 초기화되는 현상이 발생합니다. 이를 방지하기 위한 가이드입니다.

## 1. 배포 스크립트 수정 (Migration Command)

배포 시에는 개발용 명령어가 아닌 배포용 명령어를 사용해야 합니다.
`prisma migrate dev`는 개발 중 스키마 변경을 감지하고 마이그레이션 파일을 생성/초기화 하므로, 배포 시에는 **`prisma migrate deploy`**를 사용해야 합니다.

**변경 전:**
```bash
npx prisma migrate dev
# 또는 Python의 경우
py -m prisma migrate dev
```

**변경 후:**
```bash
npx prisma migrate deploy
# 또는 Python의 경우
py -m prisma migrate deploy
```

이 명령어는 기존 데이터를 보존하면서 새로운 마이그레이션만 적용합니다.

---

## 2. SQLite 데이터 영구 보존 (Persistent Volume) 가이드

대부분의 클라우드 플랫폼(Netlify, Vercel, Heroku, Render 등)은 배포할 때마다 파일 시스템을 새로 만듭니다(Ephemeral Filesystem). 따라서 SQLite 파일(`dev.db`)을 별도의 **영구 저장소(Persistent Volume)**에 저장해야 합니다.

### (옵션 A) Docker / Container 사용 시 (추천)
Docker를 사용한다면 볼륨을 마운트하여 DB 파일을 호스트나 별도 저장소에 연결합니다.

```yaml
# docker-compose.yml 예시
services:
  backend:
    image: my-backend-image
    volumes:
      - ./data:/app/data  # 로컬의 data 폴더를 컨테이너의 /app/data에 마운트
    environment:
      - DATABASE_URL="file:../data/dev.db" # DB 경로를 마운트된 볼륨으로 변경
```

### (옵션 B) Render / Railway 같은 PaaS 사용 시
이들 서비스는 **"Disk"** 또는 **"Volume"** 추가 기능을 제공합니다.

1.  **Disk 추가**: 서비스 설정에서 'Add Disk'를 클릭하여 디스크를 생성합니다. (예: `/data` 경로에 마운트)
2.  **환경변수 수정**: `DATABASE_URL`을 해당 디스크 경로로 변경합니다.
    *   기존: `file:./dev.db`
    *   변경: `file:/data/dev.db`

### (옵션 C) PostgreSQL / MySQL로 전환 (가장 권장)
프로덕션 환경에서는 파일 기반의 SQLite보다 서버 기반의 DB를 사용하는 것이 데이터 관리에 훨씬 안전하고 편리합니다.

1.  Supabase, Neon, Railway 등에서 무료 PostgreSQL DB를 생성합니다.
2.  `.env` 파일의 `DATABASE_URL`을 `postgres://...` 형식으로 변경합니다.
3.  `schema.prisma`의 `provider`를 `postgresql`로 변경합니다.
4.  `prisma migrate deploy`를 실행합니다.

---

## 3. 적용 예시 (package.json)

프로젝트 루트의 `package.json`에 배포용 DB 업데이트 스크립트를 추가해 두었습니다.

```json
"scripts": {
  "db:deploy": "cd backend && py -m prisma migrate deploy"
}
```
