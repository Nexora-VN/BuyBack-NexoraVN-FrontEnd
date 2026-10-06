# Piggy Buy Back Frontend

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
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-web-oauth-client-id.apps.googleusercontent.com
NEXT_PUBLIC_MOCK_FUTURE_MODULES=true
```

## Kiến trúc

- `src/app`: routes, layouts và BFF route handlers.
- `src/modules`: auth, users, products, affiliate và các mock domain tương lai.
- `src/components/ui`: UI primitives dùng chung.
- `src/lib`: API client, formatter và server helpers.

JWT access/refresh được BFF giữ trong HttpOnly cookies. Browser chỉ gọi các endpoint nội bộ `/api/backend/*` và không lưu token trong localStorage.

Đăng nhập Google trên web dùng Google Identity Services. Tạo OAuth client loại **Web application** trong Google Cloud và thêm địa chỉ web vào **Authorized JavaScript origins** (ví dụ `http://localhost:3000` cho local, domain HTTPS cho production). Đặt client ID vào `NEXT_PUBLIC_GOOGLE_CLIENT_ID` lúc build frontend, và thêm chính client ID đó vào `GOOGLE_OAUTH_CLIENT_IDS` của backend. Nếu mobile gửi Google ID token, thêm các client ID mobile vào danh sách backend, cách nhau bằng dấu phẩy. Workflow production đọc client ID từ GitHub repository variable `GOOGLE_WEB_CLIENT_ID`. Địa chỉ production cần HTTPS; Google không cho origin HTTP trên IP công khai.

## Thêm web vào màn hình chính

Trên điện thoại Android hoặc iOS, web hiển thị nút cố định ở góc trái dưới khi chưa chạy ở chế độ ứng dụng. Chrome Android mở hộp thoại cài đặt khi trình duyệt phát `beforeinstallprompt`; nếu chưa đủ điều kiện, nút chỉ cách thêm từ menu Chrome. Trên iOS, nút hướng dẫn thao tác Chia sẻ → Thêm vào Màn hình chính trong Safari vì trình duyệt không cho website tự thêm ứng dụng. Bản cài đặt mở `/app` ở chế độ standalone và dùng icon, màu từ manifest.

Trên thiết bị thật, dùng domain HTTPS để trình duyệt cho phép cài đặt. `localhost` là ngoại lệ khi kiểm tra trực tiếp trên máy phát triển; truy cập bằng IP HTTP từ điện thoại sẽ không kích hoạt lời mời cài PWA của Chrome.

## API và mock

Auth, users, products, affiliate links, generate-affiliate và health dùng backend thật. Orders, cashback, wallet, withdrawals, reconciliation, audit, provider sync, adjustments và system config dùng versioned localStorage mock cho tới khi backend tương ứng sẵn sàng.

Màn mock luôn có badge `Dữ liệu mẫu`. Đặt `NEXT_PUBLIC_MOCK_FUTURE_MODULES=false` để không hiển thị dữ liệu tài chính giả.

## Trang sản phẩm cho khách hàng

Trong chi tiết đơn hàng, **Xem sản phẩm** mở `/app/products/{itemId}`; ví dụ `/app/products/24093715534`. Trang yêu cầu đăng nhập và sử dụng `GET /api/backend/catalog/products/{itemId}` qua BFF. Backend lấy thông tin từ AddLiveTag bằng cấu hình `ADDLIVETAG_API_KEY` sẵn có; không cần thêm biến môi trường frontend hoặc migration.

Trang hiển thị ảnh, shop, giá tham khảo, đánh giá, lượt bán, thống kê giá và tiền hoàn dự kiến theo chính sách hiện tại. **Tạo link mua hoàn tiền** sử dụng luồng `generate-affiliate` hiện có, sau đó khách mở link Shopee hoặc sao chép. Nếu nguồn dữ liệu lỗi nhưng sản phẩm đã được lưu, trang báo rõ thông tin cũ và ẩn ước tính tiền hoàn/thống kê giá. Nếu chưa có dữ liệu, trang cho phép thử lại.

Kiểm tra local: chạy cả backend và frontend, đăng nhập, mở một đơn có sản phẩm Shopee rồi chọn **Xem sản phẩm**. API key phải được provider chấp nhận để kiểm tra dữ liệu mới; unit test dùng fixture và không xác minh quyền truy cập provider thật.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Mọi tiền tệ được xử lý dưới dạng integer VND và hiển thị theo locale `vi-VN`; thời gian dùng `Asia/Ho_Chi_Minh`.
