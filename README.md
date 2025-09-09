## AI Portal v2 (gpt3)

แพลตฟอร์มแชท AI สำหรับองค์กร รองรับสตรีมผลลัพธ์แบบเรียลไทม์ มีหน้าผู้ใช้สำหรับแชทและแผงผู้ดูแลระบบ (Admin) เพื่อจัดการผู้ใช้ สิทธิ์ โมเดล และตรวจสอบสถิติการใช้งาน

### ภาพรวม
- ส่วนผู้ใช้ (Chat): ประสบการณ์คล้าย ChatGPT พิมพ์คำถาม/คำสั่งแล้วรับคำตอบแบบสตรีมทีละส่วน (NDJSON) มีประวัติแชท สลับ Light/Dark และคีย์ลัดพื้นฐาน
- ส่วนผู้ดูแล (Admin): จัดการบัญชีผู้ใช้ บทบาท/สิทธิ์ โมเดล AI ตลอดจนดูข้อมูลการใช้งาน เพื่อปรับปรุงประสิทธิภาพระบบ

### โครงสร้างและเทคโนโลยี
- Next.js App Router (Server/Client Components)
- TypeScript, React 19
- Tailwind CSS (UI) + next-themes (ธีม Light/Dark)
- NextAuth (Credentials) + Middleware ป้องกันเส้นทาง (เช่น `/admin`, `/chat`)
- Prisma ORM + SQLite (ดีฟอลต์เพื่อ Dev) — สามารถย้ายเป็น PostgreSQL ได้
- Ollama สำหรับรันโมเดล AI ภายในองค์กร (ปรับที่ตัวแปร `OLLAMA_BASE_URL`)
- Playwright สำหรับทดสอบ E2E

โครงสร้างโปรเจกต์ (ย่อ):

```
src/
  app/
    admin/                 # Admin panel (protected)
    api/
      auth/[...nextauth]/  # NextAuth routes
      chat/[id]/message/   # POST: ส่งข้อความ -> สตรีมผลลัพธ์กลับ (NDJSON)
    chat/                  # หน้าห้องแชท
    login/                 # หน้าเข้าสู่ระบบ
  lib/
    auth.ts                # NextAuth options
    prisma.ts              # Prisma client
prisma/
  schema.prisma            # โครงสร้างฐานข้อมูล
  seed.ts                  # สร้างข้อมูลเริ่มต้น (admin, roles, models)
tests/
  chat.spec.ts             # ตัวอย่าง Playwright test
```

### เริ่มต้นใช้งาน (Local Dev)
1) ติดตั้ง dependencies
```
npm ci
```

2) ตั้งค่า Environment (ตัวอย่างไฟล์ `.env.local`)
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=ใส่ค่าแบบสุ่มยาวๆ
NEXTAUTH_URL=http://localhost:3000
OLLAMA_BASE_URL=http://localhost:11434
```
หมายเหตุ: สำหรับคำสั่ง Prisma CLI ให้มีไฟล์ `.env` ด้วย (คัดลอกจาก `.env.local` ได้)

3) สร้าง Prisma Client / Migrate / Seed
```
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
```

4) รัน Dev Server
```
npm run dev
```
เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### การเข้าสู่ระบบ (ดีฟอลต์ที่ seed ไว้)
- อีเมล: `admin@example.com`
- รหัสผ่าน: `admin123`

### การเชื่อมต่อกับ Ollama
- ตั้งค่า `OLLAMA_BASE_URL` เป็นที่อยู่ Ollama server (ค่าเริ่มต้น `http://localhost:11434`)
- เส้นทางส่งข้อความไปยัง AI: `POST /api/chat/[id]/message` (ฟอร์ม `content`)
- เซิร์ฟเวอร์จะสตรีมผลลัพธ์กลับมาแบบ NDJSON และบันทึกข้อความลงฐานข้อมูล

ตัวอย่างเรียกใช้งานด้วย curl (สมมุติว่า `chatId` มีอยู่แล้ว):
```
curl -N -X POST \
  -F "content=สวัสดี" \
  http://localhost:3000/api/chat/<chatId>/message
```

คำตอบจะเป็นบรรทัด JSON ต่อเนื่อง เช่น
```
{"type":"start"}
{"type":"delta","data":"..."}
{"type":"done","id":"...","tokens":{"prompt":0,"completion":0,"total":0}}
```

### ฐานข้อมูล: Dev (SQLite) และการเตรียม Production (PostgreSQL)
- ค่าเริ่มต้นเป็น SQLite เพื่อความสะดวกในการพัฒนา (`DATABASE_URL="file:./dev.db"` และ `provider = "sqlite"` ใน `prisma/schema.prisma`)
- หากต้องการใช้ PostgreSQL:
  - แก้ `prisma/schema.prisma` ส่วน datasource:
    ```
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
  - ตั้งค่า `DATABASE_URL` ให้เป็นรูปแบบ Postgres เช่น
    `postgresql://user:password@host:5432/dbname?schema=public`
  - รันคำสั่งปรับฐานข้อมูลใหม่ (เช่น `npx prisma migrate deploy` บนโปรดักชัน หรือ `prisma migrate dev` บน dev)

หมายเหตุ: โค้ดปัจจุบันเป็น single-repo Next.js app; สามารถย้าย/ขยายเป็น Monorepo ได้ในอนาคตหากต้องการแยกแพ็กเกจ/บริการ

### สคริปต์ที่ใช้บ่อย
```
npm run dev               # รัน dev server (Turbopack)
npm run build             # สร้างโปรดักชันบิลด์
npm run start             # รันโปรดักชันเซิร์ฟเวอร์
npm run lint              # ตรวจโค้ดด้วย ESLint
npm run prisma:generate   # สร้าง Prisma Client
npm run prisma:migrate    # สร้าง/ปรับฐานข้อมูลใน dev
npm run db:seed           # สร้างข้อมูลตั้งต้น (admin, roles, models)
```

### การทดสอบ (Playwright)
```
npx playwright test
```

### เส้นทางสำคัญ
- `/login` — หน้าเข้าสู่ระบบ
- `/chat` และ `/chat/[id]` — หน้าห้องแชท (ต้องล็อกอิน)
- `/admin` — แผงผู้ดูแลระบบ (ต้องมีสิทธิ์)
- `/api/chat/[id]/message` — ส่งข้อความไปยังโมเดล (สตรีมผลลัพธ์กลับ)

### อ้างอิง
- ซอร์สโค้ด: https://github.com/ton-apicha/gpt3