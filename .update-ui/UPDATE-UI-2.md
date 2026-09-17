# Chuẩn hóa UI/UX Piggy Buy Back trên desktop và mobile

## 1. Định hướng và phạm vi đã chốt

Làm lại toàn bộ **đăng nhập, user app và admin** dựa trên chức năng hiện có. Trang chủ user ưu tiên **dán link → xem sản phẩm → mua sắm**; admin dùng đầy đủ chức năng trên điện thoại theo quyền hiện tại. Đồng bộ cả **VI/EN**.

Tuân theo [AWESOME_DESIGN.md](/Users/agn-imac003/Documents/theanh/nexora/BuyBack-NexoraVN-FrontEnd/.agents/skills/AWESOME_DESIGN.md) và hướng dẫn `.agents`:

- Giữ primary **#a8245e**, nền hồng nhạt **#fff8f8**, font **Be Vietnam Pro**, icon Lucide.
- Lấy cảm hứng từ [ShopBack](https://www.goshopback.vn/) cho hành trình mua sắm và theo dõi hoàn tiền; giữ nguyên chính sách cashback của BuyBack.
- Tham khảo [Wise List Item](https://wise.design/components/list-item) cho danh sách và thao tác trên mobile; [Shopify Polaris Index](https://shopify.dev/docs/api/app-home/latest/patterns/templates/resource-index) cho tìm kiếm, bộ lọc, bảng và lựa chọn nhiều bản ghi ở admin.
- Không thêm danh mục deal, cửa hàng, landing công khai, native app, PWA/offline hoặc dark mode trong đợt này.

## 2. Hệ thống thiết kế và điều hướng

### Chuẩn chung

- Chuẩn hóa spacing 4/8px, radius, typography, trạng thái tương tác và độ cao control. Mobile input tối thiểu 16px; vùng chạm tối thiểu 44×44px.
- Dùng nền trắng, đường phân cách và nhóm nội dung để tạo phân cấp; giảm card lồng card, bóng đổ và khoảng trống không cần thiết.
- Màu hồng tập trung ở CTA chính, số tiền nổi bật và mục được chọn.
- Một bộ component dùng chung cho tiền, trạng thái, form, danh sách, loading/empty/error và xác nhận thao tác.

### Hai cách trình bày theo thiết bị

| Khu vực        | Desktop ≥1024px                                                    | Mobile <768px                                                                         |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| User           | Header ngang, nội dung tối đa 1280px, bố cục nhiều cột khi hữu ích | App bar gọn; bottom navigation: **Trang chủ, Đơn hàng, Ví, Tài khoản**                |
| Admin          | Sidebar chia nhóm; nội dung tối đa 1440px; bảng có mật độ phù hợp  | App bar; bottom navigation: **Tổng quan, Đơn hàng, Đối soát, Rút tiền, Menu**         |
| Danh sách      | Bảng với cột, bộ lọc và thao tác rõ ràng                           | Danh sách theo nghiệp vụ: tên/đơn, số tiền, trạng thái, ngày; mở chi tiết để xem thêm |
| Bộ lọc         | Toolbar trực tiếp                                                  | Nút lọc mở bottom sheet; hiển thị số bộ lọc đang áp dụng                              |
| Form           | Trang hoặc dialog có chiều rộng phù hợp                            | Form dài toàn màn hình; bottom sheet cho lựa chọn ngắn                                |
| Thao tác chính | Trong header hoặc khu vực nội dung liên quan                       | Thanh hành động dưới màn hình ở bước cần xác nhận                                     |

Tablet 768–1023px giữ điều hướng kiểu app; dùng hai cột khi đủ chỗ. Danh sách vẫn dùng bố cục mobile để tránh bảng bị ép ngang.

- Màn chi tiết có nút quay lại; giữ bộ lọc, trang và vị trí danh sách khi quay về.
- Màn nhập liệu/xác nhận toàn màn hình thay bottom navigation bằng thanh hành động.
- Tính khoảng trống cho safe area, bàn phím và thanh cố định; không che trường nhập hoặc nút gửi.
- Admin Menu gom toàn bộ mục còn lại theo **Quản lý, Tài chính, Vận hành, Hệ thống**. Menu và CTA phản ánh đúng quyền ADMIN/SUPER_ADMIN.

## 3. Thiết kế lại các luồng hiện có

### User

- **Đăng nhập:** mobile tập trung logo, form và thông báo lỗi; desktop giữ phần giới thiệu gọn. Giữ đăng nhập, duy trì phiên và điều hướng theo vai trò.
- **Trang chủ:** form tạo link là nội dung chính; bên dưới là số dư khả dụng, cashback đang chờ và đơn gần đây. Tách logic tạo link thành component dùng chung với `/app/links/new`.
- **Tạo link:** giữ thẻ sản phẩm, giá, **hoa hồng dự kiến từ API**, nhắc giỏ hàng và hai nút mua/chia sẻ đã chốt. Không đổi hoa hồng nguồn thành “cashback bạn nhận”.
- **Đơn hàng:** danh sách ưu tiên sản phẩm, mã đơn, trạng thái đơn và cashback; chi tiết phân biệt trạng thái đơn với trạng thái hoa hồng. Chỉ hiện mốc thời gian có dữ liệu thật.
- **Ví:** số dư khả dụng và nút rút tiền nổi bật; tách cashback chờ xác nhận, tiền đang giữ cho yêu cầu rút và lịch sử giao dịch. Giữ các route cashback/lịch sử hiện có và đặt lối vào trong Ví.
- **Rút tiền:** chọn ngân hàng + số tiền → kiểm tra lại → gửi → kết quả. Hiện rõ số dư và điều kiện hiện hành; lỗi đặt cạnh trường nhập; giữ cơ chế chống gửi trùng.
- **Tài khoản:** chia thành thông tin cá nhân, ngân hàng, ngôn ngữ và đăng xuất. Danh sách ngân hàng có trạng thái duyệt; thêm/sửa dùng form riêng thay vì luôn chiếm đầu trang.

### Admin

- **Tổng quan:** ưu tiên yêu cầu rút, ngân hàng chờ duyệt, vấn đề đối soát và lần đồng bộ gần nhất; số liệu dẫn tới danh sách tương ứng.
- **Người dùng, sản phẩm, affiliate link:** thống nhất tìm kiếm, phân trang, xem chi tiết, chỉnh sửa và xác nhận xóa. Sửa màn affiliate link đang cố định trang đầu.
- **Đơn, hoa hồng, ledger:** ưu tiên số tiền, user, trạng thái và mã tham chiếu; dữ liệu kỹ thuật nằm trong phần chi tiết có thể mở rộng.
- **Đối soát:** danh sách batch → kết quả/import lỗi → vấn đề cụ thể → form xử lý có bằng chứng. Trình bày lý do chặn bằng ngôn ngữ dễ hiểu, giữ mã kỹ thuật cho admin tra cứu.
- **Kỳ thanh toán:** chọn khoản đủ điều kiện → xem tổng tiền/khấu trừ/phân bổ → tạo nháp → xem chi tiết → xác nhận. Mobile hỗ trợ chọn nhiều dòng và thanh tổng đã chọn; giữ lựa chọn khi chuyển trang, xóa lựa chọn khi đổi bộ lọc.
- **Rút tiền, duyệt ngân hàng, điều chỉnh ví:** màn xử lý thể hiện đối tượng, số tiền, trạng thái trước/sau và xác nhận cụ thể.
- **Provider Sync, cấu hình, nhật ký:** nhóm thông tin theo tác vụ; giữ che dữ liệu nhạy cảm và quyền truy cập. Thay `window.confirm` và dialog lồng nhau bằng luồng xác nhận thống nhất.

## 4. Kiến trúc FE và thay đổi API

- Giữ Next.js, Tailwind, Radix, React Query và cấu trúc routing hiện có; không thêm thư viện UI.
- Tách các file `user-pages`/`admin-pages` lớn thành màn và component nghiệp vụ; chia sẻ hooks, validation và mutation giữa desktop/mobile.
- Mở rộng `Page`, `DataTable` và `FinanceTable` để hỗ trợ app bar, renderer danh sách mobile và action bar. Không dùng việc giấu cột hoặc cuộn ngang làm giải pháp mobile chính.
- Đưa tìm kiếm, trạng thái, sort và page vào URL; hỗ trợ reload, deep link và Back. Chỉ một nguồn query/mutation cho mỗi màn, không gọi API hai lần vì hai layout.
- Dùng state riêng theo nghiệp vụ cho badge: trạng thái đơn, hoa hồng, cashback, rút tiền và đối soát; tránh một nhãn `VALIDATED` mang nhiều nghĩa.
- Chuyển toàn bộ copy UI, validation, toast và nhãn trạng thái sang `next-intl` VI/EN. Enum gửi BE giữ nguyên; thông báo lỗi có bản dịch và fallback rõ ràng.

**Bổ sung API theo hướng tương thích:**

- Dashboard user trả thêm tổng cashback theo trạng thái, tính từ phần phân bổ cho user ở BE; không lấy tổng commission nguồn làm số tiền user chờ nhận.
- Danh sách đơn trả thêm tóm tắt sản phẩm từ snapshot: tên, ảnh nếu có, số dòng sản phẩm. Không cần gọi detail riêng cho từng dòng.
- Danh sách hoa hồng admin trả điều kiện quyết toán và lý do chặn, dùng chung quy tắc với service thanh toán.
- Thêm DTO FE cụ thể cho các màn được sửa; giữ field và endpoint hiện tại, chỉ bổ sung dữ liệu cần thiết.

Giữ nguyên tracking, phân quyền, cách tính tiền, điều kiện cộng/trừ ví và đối soát AddLiveTag. UI không tự chuyển “chờ trả” thành tiền khả dụng. Không cần migration database cho các bổ sung trình bày trên.

## 5. Trình tự triển khai và nghiệm thu

**Thứ tự:** tokens/component chung → user/admin shell → user flows → admin flows → API bổ sung và hoàn thiện VI/EN → kiểm thử toàn luồng. Mỗi nhóm phải dùng component chung trước khi chuyển sang nhóm tiếp theo.

**Tiêu chí nghiệm thu:**

- Kiểm tra mọi route ở **375, 768, 1024, 1280px**; thêm 320px, điện thoại ngang và chữ phóng lớn cho các màn nhiều thông tin.
- Kiểm tra loading, chưa có dữ liệu, không có kết quả lọc, lỗi API, ảnh hỏng, tên dài, số tiền lớn, quyền hạn và phiên hết hạn.
- Mobile thực hiện được tất cả chức năng theo quyền, gồm chọn nhiều hoa hồng, quyết toán và cấu hình; không mất thao tác do đổi layout.
- Keyboard, focus, đóng/mở dialog, Back, safe area, bàn phím mobile, reduced motion và độ tương phản hoạt động đúng.
- Test các flow tạo link, đơn hủy có UTM, đơn thiếu attribution, hoa hồng chờ trả, rút tiền gửi lại, quyết toán bị chặn và giới hạn quyền.
- Chạy lint, typecheck, unit/component test, build; chạy E2E trên database test riêng. Dùng fixture cho kiểm tra hình ảnh, không tạo giao dịch tiền thật.
- Bàn giao ma trận màn hình đã kiểm tra cùng ảnh desktop/mobile; ghi rõ phần nào chưa xác minh nếu môi trường test bị chặn.
