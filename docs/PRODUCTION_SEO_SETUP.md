# Piggy Back — setup ngoài code sau khi hoàn tất thay đổi SEO

Cập nhật 14/10/2026. Domain `piggyback.vn` đã được chủ dự án xác minh thành công bằng Domain property trong Google Search Console. Giữ bản ghi TXT ở Cloudflare. Code trong hai repo frontend/backend hiện được chuẩn bị tại workspace; thay đổi local **chưa tự đưa lên website**. Trang live kiểm tra trước đợt này vẫn `noindex`, sitemap trống. Làm theo thứ tự để nội dung công khai khớp chính sách giao dịch.

## 1. Xem nội dung và cấu hình kinh doanh

Các giá trị chủ dự án xác nhận: tên công khai `theanh`, email hỗ trợ `theanh.nguyen2039@gmail.com`, rút tối thiểu **10.000đ**, không thu thêm phí rút, yêu cầu hợp lệ xử lý trong **12–48 giờ kể cả cuối tuần**. Bên thứ ba đối soát **thứ Ba và thứ Năm**; Piggy Back đối soát tiếp trước khi cộng ví. Tỷ lệ chia **cấu hình được trong admin**; mặc định mới đề xuất là người dùng 80%, nền tảng 20%.

Đọc và duyệt nội dung các trang `/gioi-thieu`, `/lien-he`, `/chinh-sach-hoan-tien`, `/dieu-khoan`, `/bao-mat` ở [content.json](../src/modules/resources/content.json) trước khi phát hành. Kiểm tra tên pháp lý nếu sẽ dùng khác `theanh`, thông tin còn thiếu trong chính sách quyền riêng tư như thời hạn lưu giữ, đơn vị cung cấp hạ tầng và cách xử lý yêu cầu dữ liệu. Có thể bổ sung sau khi chốt chính sách vận hành, nhưng nội dung đang công bố phải đúng thực tế.

Backend đã có migration mới: thay mặc định code thành 80%/10.000đ; chỉ đổi bản ghi production nếu nó còn **đúng cặp mặc định cũ 85%/50.000đ**. Giá trị đã chỉnh riêng được giữ nguyên. Sau khi triển khai backend:

1. Đăng nhập tài khoản quản trị Piggy Back.
2. Mở **Admin → Cấu hình hệ thống** (`/admin/system`), mục **Chính sách & Cấu hình tỷ lệ hoa hồng**.
3. Đọc hai giá trị `Tỷ lệ hoàn tiền khách hàng` và `Rút tối thiểu`.
4. Nếu giá trị hiện khác chính sách đã chốt, nhập `80` (%) và `10000` (VND), lưu. Lưu ý: thay đổi tỷ lệ có thể ảnh hưởng cách tính giao dịch mới; không dùng để tự sửa các khoản đã đối soát.
5. Đăng nhập tài khoản người dùng để kiểm tra trang **Rút tiền** đọc tối thiểu `10.000đ` từ backend. Dùng dữ liệu thử/kiểm tra hiển thị; không tạo lệnh rút thật chỉ để QA.

Kiểm tra quy trình xử lý yêu cầu rút 12–48 giờ của đội vận hành. Đây là cam kết nghiệp vụ do chủ dự án cung cấp, không có bộ đếm giờ tự động trong code.

## 2. Phát hành hai repository

Backend và frontend là hai repository Git riêng. Đẩy bản đã review lên branch release phù hợp, qua CI rồi triển khai **backend trước, frontend sau**. Backend migration được workflow backend áp dụng trong lúc deploy. Theo dõi kết quả CI và log ứng dụng; không chạy migration SQL thủ công trên production. Với frontend, workflow `Frontend Production` hiện hỗ trợ chạy tay bằng `workflow_dispatch` sau khi biến môi trường được điền. Không bật index khi nghiệp vụ hoặc thông tin công khai chưa sẵn sàng.

Trong repository **frontend** trên GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**. [Hướng dẫn GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables).

| Tên biến | Giá trị | Khi nào đặt |
| --- | --- | --- |
| `SEO_INDEXABLE` | `false` trong giai đoạn chuẩn bị; `true` khi ra mắt | Bắt buộc để mở index; workflow truyền vào cả verify và Docker build |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-...` lấy từ GA4 | Tùy chọn; bỏ trống thì không có GA4 |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ID OAuth Web đang dùng | Giữ đúng giá trị hiện hành để đăng nhập Google hoạt động |

Biến `NEXT_PUBLIC_SITE_URL` được workflow cố định `https://piggyback.vn`. Không thêm token xác minh Search Console vào source. Khi đổi `SEO_INDEXABLE`, phải tạo **image/frontend build mới** rồi deploy; đổi biến trong GitHub không làm container đang chạy tự thay đổi. Workflow giờ chạy audit HTTP trên đúng production build trước publish; có thể tải `seo-audit` artifact trong run để xem báo cáo. Nếu CI báo lỗi, xem cụ thể canonical, noindex, sitemap, redirect, link hoặc metadata rồi sửa trước khi deploy.

## 3. Tạo Google Analytics 4 (tùy chọn nhưng nên làm trước launch)

1. Truy cập [Google Analytics](https://analytics.google.com/), dùng tài khoản quản lý dự án. Vào **Admin → Create → Property** nếu chưa có property; đặt tên `Piggy Back`, múi giờ Việt Nam, tiền tệ VND. [Hướng dẫn Google](https://support.google.com/analytics/answer/14183469?hl=en).
2. Trong property, vào **Data streams → Add stream → Web**, nhập `https://piggyback.vn` và tên `Piggy Back Web`. Sao chép **Measurement ID** dạng `G-...` từ stream.
3. Trong **Enhanced measurement** của Web stream, tắt tự đo **Page views** nếu đang bật. Code đã gửi `page_view` thủ công sau khi người dùng đồng ý, để tránh đếm hai lần trong Next.js. Những mục tự đo khác chỉ để bật nếu phù hợp dữ liệu muốn thu thập. [Google về `send_page_view: false`](https://developers.google.com/tag-platform/gtagjs/configure).
4. Trong repository frontend GitHub, thêm variable `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...`, rồi chạy/deploy frontend build mới. Không cần tạo tag riêng trong Google Tag Manager. Nếu website hiện đã gắn GA4 từ Cloudflare hoặc tag manager ngoài code, gỡ một đường đo trùng trước khi dùng đường đo mới.
5. Mở website bằng cửa sổ mới. Trước khi chọn **Đồng ý**, kiểm tra không có script `googletagmanager.com/gtag/js` từ Piggy Back; sau khi chọn, kiểm tra script xuất hiện và `page_view` trong **Realtime/DebugView**. Thử **Từ chối** và **Cài đặt đo lường**. Kiểm tra một đăng ký OTP thành công, tạo link thành công và mở link Shopee; sự kiện tương ứng là `sign_up`, `generate_cashback_link`, `outbound_shopee_click`. Tránh dùng tài khoản thật của khách để QA.
6. Trong **Admin → Data display → Events**, đánh dấu `sign_up` và `generate_cashback_link` là **key events** sau khi xác nhận dữ liệu. `outbound_shopee_click` là hành vi trung gian; có thể xem như event thường. [Hướng dẫn Google về key events](https://support.google.com/analytics/answer/13128484?hl=en).

Code chỉ gửi `sign_up` sau xác minh OTP email; đăng nhập Google chưa phân biệt tài khoản mới/cũ nên chưa gửi sự kiện này. `first_qualified_order` cũng chưa gửi qua GA4: cần backend attribution và cơ chế tôn trọng consent xuyên phiên/thiết bị trước khi triển khai. Dùng số liệu order thật trong admin/backend để đối chiếu, không coi lượt bấm Shopee là đơn hợp lệ.

## 4. Ra mắt và gửi sitemap Search Console

Khi chức năng cốt lõi, chính sách và liên hệ đã được QA, đổi biến frontend `SEO_INDEXABLE=true`, chạy workflow `Frontend Production` từ commit chứa code SEO và kiểm tra deployment thành công. Sau đó:

1. Mở `https://piggyback.vn/`, `/huong-dan`, `/chinh-sach-hoan-tien`, `/kien-thuc` và `/bao-mat` ở cửa sổ ẩn danh. Tất cả cần trả trang 200, title/H1 đúng, không còn thông báo “chưa ra mắt”, có canonical về `https://piggyback.vn/...`, và meta robots `index, follow`. Trang `/login`, `/app`, `/admin` không xuất hiện trong sitemap.
2. Mở [sitemap live](https://piggyback.vn/sitemap.xml): cần có **12 URL tiếng Việt** theo danh sách hiện tại. Các URL `/en` chuyển hướng vĩnh viễn về trang tiếng Việt tương ứng và không nằm trong sitemap. Bài `/kien-thuc/tien-hoan-la-gi` thay cho đường dẫn cũ `/kien-thuc/cashback-la-gi`, có chuyển hướng vĩnh viễn. Mở [robots live](https://piggyback.vn/robots.txt) và thấy dòng `Sitemap: https://piggyback.vn/sitemap.xml`.
3. Kiểm tra `http://piggyback.vn/` chuyển sang HTTPS, `https://www.piggyback.vn/huong-dan?utm_source=qa` chuyển bằng 308 về `https://piggyback.vn/huong-dan?utm_source=qa`. Code Next.js có redirect www; nếu tầng Cloudflare/nginx thay đổi Host trước khi đến Next.js, thêm **Redirect Rule** tương ứng ở Cloudflare rồi kiểm tra lại. [Hướng dẫn Cloudflare Redirect Rules](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/).
4. Vào [Search Console](https://search.google.com/search-console) → chọn Domain property `piggyback.vn` đã xác minh → menu **Sơ đồ trang web / Sitemaps** → nhập `https://piggyback.vn/sitemap.xml` → **Gửi**. Việc gửi sitemap hỗ trợ Google tìm URL; không tự bảo đảm index.
5. Dùng **Kiểm tra URL / URL Inspection** với homepage và các trang ưu tiên (`/huong-dan`, `/chinh-sach-hoan-tien`, một bài kiến thức). Chọn **Kiểm tra URL đang hoạt động / Test live URL**, xem Google đọc được trang, canonical và trạng thái index, rồi **Yêu cầu lập chỉ mục / Request indexing** một lần cho trang quan trọng. Theo dõi **Lập chỉ mục → Trang / Page indexing** và báo cáo Sitemap sau vài ngày. Nếu URL còn `noindex`, sửa build/deploy trước khi gửi lại.

## 5. Kiểm tra chất lượng và theo dõi hằng tuần

- Chạy [PageSpeed Insights](https://pagespeed.web.dev/) trên trang chủ và hai trang nội dung, ưu tiên mobile. Lưu ngày, URL, LCP/INP/CLS và phân biệt **field data** với lab data; nếu chưa đủ người dùng, field data có thể chưa xuất hiện. Chỉ tối ưu theo vấn đề được đo.
- Chạy [Rich Results Test](https://search.google.com/test/rich-results) và [Schema.org Validator](https://validator.schema.org/) trên URL live quan trọng. Bài viết có Article/BreadcrumbList; FAQPage hiện không tạo FAQ rich result trên Google. [Google Search changelog](https://developers.google.com/search/updates).
- Mỗi tuần xem **GSC → Hiệu suất / Performance**: clicks, impressions, CTR, position theo query/page, lọc Việt Nam và mobile. Chú ý branded và non-branded; so cùng khoảng thời gian 28 ngày khi có đủ dữ liệu. Đối chiếu GA4 `sign_up`/`generate_cashback_link` và số đơn thật trong backend. [Lộ trình SEO](SEO_ROADMAP_2026-10-14.md) có bản đồ từ khóa và lịch nội dung.

Không xóa TXT xác minh GSC trên Cloudflare. Với chính sách 10.000đ/80% và thời gian 12–48 giờ, duy trì một người chịu trách nhiệm cập nhật nội dung public khi cấu hình admin hoặc quy trình vận hành thay đổi.
