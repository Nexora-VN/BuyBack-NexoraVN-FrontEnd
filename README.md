# BuyBack NexoraVN Frontend

Next.js frontend cho nền tảng cashback affiliate Shopee. Giao diện sử dụng design system Soft-Fintech, hỗ trợ user app mobile-first và admin dashboard responsive.

## Chạy local

Yêu cầu Node.js >= 20.9 và npm.

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3000`. Backend mặc định được gọi tại `http://localhost:8080` qua Next BFF.

```env
BACKEND_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MOCK_FUTURE_MODULES=true
```

## Kiến trúc

- `src/app`: routes, layouts và BFF route handlers.
- `src/modules`: auth, users, products, affiliate và các mock domain tương lai.
- `src/components/ui`: UI primitives dùng chung.
- `src/lib`: API client, formatter và server helpers.

JWT access/refresh được BFF giữ trong HttpOnly cookies. Browser chỉ gọi các endpoint nội bộ `/api/backend/*` và không lưu token trong localStorage.

## API và mock

Auth, users, products, affiliate links, generate-affiliate và health dùng backend thật. Orders, cashback, wallet, withdrawals, reconciliation, audit, provider sync, adjustments và system config dùng versioned localStorage mock cho tới khi backend tương ứng sẵn sàng.

Màn mock luôn có badge `Dữ liệu mẫu`. Đặt `NEXT_PUBLIC_MOCK_FUTURE_MODULES=false` để không hiển thị dữ liệu tài chính giả.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Mọi tiền tệ được xử lý dưới dạng integer VND và hiển thị theo locale `vi-VN`; thời gian dùng `Asia/Ho_Chi_Minh`.
