# Game LMS — cấu hình FE v1

Trang `/admin/games` dùng `demo-games.json`. File này là ví dụ JSON đầy đủ cho cả ba loại game; hình mẫu nằm ở `public/lms-games`. Không có API hoặc localStorage cho game. Auth của trang vẫn dùng cơ chế admin hiện tại.

## Hợp đồng cấu hình

`types.ts` định nghĩa `GameDefinition` (discriminated union theo `type`). Mỗi cấu hình có `id` ổn định, `version` nguyên dương, `title`, `instructions`, `config`. Chỉ chứa dữ liệu JSON. Tăng `version` khi sửa nội dung và dùng key `${id}:${version}` khi render để bắt đầu trạng thái mới.

- `matching`: `defaultMode` là `memory` hoặc `columns`; `pairs` là danh sách cặp có ID duy nhất, mỗi cặp có `left` và `right`. Nội dung là `{ "kind": "text", "text": "Thỏ" }` hoặc `{ "kind": "image", "src": "/lms-games/rabbit.svg", "alt": "Thỏ" }`. Hai phía có thể khác hình/chữ nhưng ghép theo ID cặp, không theo URL hay nhãn. Hai chế độ dùng cùng bộ cặp, không cố định 5 cặp trong logic.
- `drag`: `board.width/height` xác định tỷ lệ bảng; mỗi vật có ID duy nhất, `content`, `position: {x,y}` và `size: {width,height}`. Vị trí là góc trên trái; vị trí/kích thước vật là tỷ lệ 0–1 của bảng. Kích thước vật phải dương và không vượt bảng. Demo dùng vật đủ lớn để thao tác cảm ứng ở 375px.
- `drawing`: `board` xác định tỷ lệ bảng và hệ đơn vị độ dày; `background` chứa `src/alt`; `colors`, `brushSizes`, `defaultColor`, `defaultBrushSize` cấu hình thanh công cụ. Màu mặc định và cỡ mặc định phải thuộc danh sách tương ứng. Độ dày px được hiểu theo chiều rộng thiết kế `board.width`, rồi chuyển sang tỷ lệ khi lưu nét.

Asset dùng URL cùng origin hoặc HTTPS có thể truy cập; không chứa HTML/script. Nền nên có cùng tỷ lệ với bảng. Hiện dữ liệu mẫu được tin cậy và ép kiểu tại điểm nhập JSON; khi nối API, cần kiểm tra cấu trúc ở lớp nạp dữ liệu, bao gồm ID duy nhất, kích thước dương, URL hợp lệ và ít nhất một cặp/màu/cỡ bút. Không thêm quy tắc chấm đúng sai cho kéo thả/vẽ.

## Nhúng và nối admin về sau

Các component `MatchingGame`, `DragGame`, `DrawingGame` nhận `config` và callback `onChange(state)` tùy chọn; `MatchingGame` có thêm `onComplete(state)` khi ghép đủ cặp. Không component nào gọi router, auth hoặc Notebook API.

`MatchingState` chứa thứ tự ID thẻ, lựa chọn và ID cặp đã ghép. `DragState` chứa vị trí theo ID và thứ tự xếp lớp. `DrawingState` chứa các nét bút/tẩy, màu, độ dày và điểm chuẩn hóa 0–1. Nét tẩy dùng phép `destination-out` trên lớp nét vẽ riêng. Callback vẽ phát khi hoàn tất/hủy nét, hoàn tác hoặc xóa; callback kéo thả phát theo thay đổi. Muốn lưu qua API sau này, throttle/debounce tại lớp tích hợp, không trong engine.

State callback chỉ đọc; không sửa trực tiếp dữ liệu nhận được. Config được coi là bất biến trong một lượt; khi thay config, remount bằng key ID/version. Chơi lại, đổi chế độ hoặc rời tab hủy lượt và timer cũ. Chưa nhận state khôi phục hoặc lưu kết quả lâu dài.

Admin tương lai chỉ cần tạo/cập nhật JSON theo hợp đồng, quản lý asset và cung cấp cấu hình cho các component. Không phải viết lại logic game. Đợt này không sửa renderer hoặc API của Notebook.

## Kiểm tra

`npm test -- src/modules/lms-games` chạy kiểm tra ghép cặp, chống bấm liên tục, timer, callback hoàn thành và tọa độ responsive. Kiểm tra thêm bằng trình duyệt thật cho Pointer Events, Canvas, tẩy/hoàn tác và thay đổi mật độ điểm ảnh; jsdom không thay thế được các kiểm tra này.
