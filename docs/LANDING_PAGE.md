# Trang giới thiệu Piggy Back

Trang chủ `/` và hướng dẫn `/huong-dan` chỉ hiển thị tiếng Việt. Các đường dẫn cũ bắt đầu bằng `/en` chuyển hướng vĩnh viễn về trang tiếng Việt tương ứng. Các trang tài khoản và quản trị vẫn yêu cầu đăng nhập.

## Nội dung và giao diện

- `src/modules/landing/content.ts`: nội dung trang chủ, câu hỏi thường gặp và phần dùng cho dữ liệu có cấu trúc.
- `src/modules/landing/guide-content.ts`: hướng dẫn mua sắm và phân biệt tiền hoàn dự kiến với số dư có thể rút.
- `src/modules/resources/content.json`: giới thiệu, liên hệ, chính sách, điều khoản, quyền riêng tư và bài kiến thức.
- `src/modules/landing/device-preview.tsx`: hình minh họa bằng dữ liệu mẫu, không phải giao dịch của người dùng.
- `src/modules/landing/seo.ts`: tiêu đề, mô tả, địa chỉ chuẩn và dữ liệu có cấu trúc.

Nội dung chính có trong phản hồi từ máy chủ để người đọc và công cụ tìm kiếm truy cập được. Mỗi trang công khai có tiêu đề, mô tả và địa chỉ chuẩn riêng. Các trang tiếng Việt trong danh sách công khai được đưa vào `/sitemap.xml` sau khi bật lập chỉ mục. Đường dẫn cũ `/kien-thuc/cashback-la-gi` chuyển hướng sang `/kien-thuc/tien-hoan-la-gi`.

## Trước khi phát hành

1. Đọc lại chính sách, thông tin liên hệ và quy trình giao dịch; bảo đảm nội dung phản ánh đúng dịch vụ đang chạy.
2. Triển khai backend trước và kiểm tra cấu hình tỷ lệ chia hoa hồng, mức rút tối thiểu.
3. Khi sẵn sàng công bố, đặt `SEO_INDEXABLE=true` cho bản xây dựng frontend mới rồi triển khai. Trước đó, sitemap trống và các trang công khai giữ chỉ thị không lập chỉ mục.
4. Kiểm tra trang chủ, hướng dẫn, trang kiến thức, chính sách, chuyển hướng `/en`, chuyển hướng địa chỉ bài cũ và sitemap trên tên miền thật.
5. Gửi sitemap trong Google Search Console, sau đó theo dõi báo cáo lập chỉ mục và lượt truy cập.

Hướng dẫn thao tác chi tiết nằm trong [PRODUCTION_SEO_SETUP.md](PRODUCTION_SEO_SETUP.md). Có thể chạy `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` và `npm run audit:seo:build` để kiểm tra bản xây dựng. Audit kiểm tra phản hồi HTTP và nội dung HTML; vẫn cần xem giao diện trên điện thoại và kiểm tra kết quả thực tế trong Search Console.
