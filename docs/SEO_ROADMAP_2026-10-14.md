# Kế hoạch SEO Piggy Back — 14/10/2026

**Cập nhật sau rà soát ngôn ngữ:** Website công khai chỉ giữ tiếng Việt. Các đường dẫn `/en` chuyển về bản tiếng Việt; sitemap dự kiến có 12 URL. Bài giới thiệu khái niệm dùng `/kien-thuc/tien-hoan-la-gi`; đường dẫn `/kien-thuc/cashback-la-gi` chuyển hướng sang địa chỉ mới. Các mốc audit bên dưới mô tả trạng thái ban đầu trước thay đổi này.

## Mục tiêu và phạm vi

Chủ dự án xác nhận ngày 14/10/2026: domain chính thức `piggyback.vn`, chưa setup Google Search Console. Kiểm tra NS công khai trả `jill.ns.cloudflare.com` và `zahir.ns.cloudflare.com`; thực hiện xác minh Domain property bằng TXT tại Cloudflare DNS.

Đưa người có nhu cầu **mua Shopee nhận cashback** đến Piggy Back, rồi đo đăng ký thành công, tạo link thành công và đơn đủ điều kiện. Ưu tiên Việt Nam, tiếng Việt, thương hiệu Piggy Back và nhóm truy vấn dài trước; mở rộng cạnh tranh từ khóa thương mại theo dữ liệu.

90 ngày bên dưới tính từ ngày bắt đầu triển khai. Đây là lịch công việc, không phải thời hạn cam kết TOP 1. Google không bảo đảm thứ hạng bằng một bộ cấu hình SEO. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

Đã cài skill `seo-audit` v2.2.1 từ `coreyhaines31/marketingskills`, thư mục `skills/seo-audit`, vào `/Users/agn-imac003/.codex/skills/seo-audit`. Máy có sẵn một bản v2.0.0 tại `.agents/skills`; bản cũ được giữ nguyên.

Phạm vi lần này: rà source frontend commit `279bdb0`, đọc audit cũ ngày 07/10, HTTP GET 11 URL production, đối chiếu hướng dẫn Google và khảo sát một số website cashback. Bằng chứng HTTP lưu ở [live-audit-2026-10-14.json](seo/live-audit-2026-10-14.json). Phần này ghi lại trạng thái trước khi thực hiện thay đổi code trong ngày 14/10; xem `PRODUCTION_SEO_SETUP.md` để biết các bước triển khai hiện tại. Chưa bật index production.

Chưa có quyền/dữ liệu Search Console, GA4, volume/KD, ngân sách, lịch ra mắt hay field Core Web Vitals. Không lấy kết quả tìm kiếm `site:` làm số trang được Google index. Dữ liệu index thực tế cần xác nhận trong Search Console; dữ liệu HTTP chỉ phản ánh lần kiểm tra này.

## Kết luận audit

**Ưu tiên đầu tiên là hoàn thành điều kiện ra mắt và mở index đúng luồng build/deploy.** Bản public hiện hoạt động nhưng vẫn công bố đang chuẩn bị ra mắt, cả bốn trang nội dung đều `noindex`, sitemap rỗng. Đây là hành vi đúng khi chưa launch nhưng sẽ chặn mục tiêu SEO nếu tiếp tục giữ sau launch. Google dùng `noindex` để loại trang khỏi kết quả khi crawl được chỉ thị đó. [Google về noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

| Ưu tiên / ảnh hưởng | Phát hiện và bằng chứng | Việc cần làm | Tiêu chí hoàn thành |
| --- | --- | --- | --- |
| P0 / cao | `/`, `/en`, `/huong-dan`, `/en/huong-dan`: HTTP 200 nhưng `noindex, follow`; `/sitemap.xml` không có URL | Khi sản phẩm sẵn sàng ra mắt, bật `SEO_INDEXABLE=true` ở build và runtime rồi tạo bản build mới | 4 URL trả 200, `index, follow`, không có header noindex; sitemap đủ 4 URL trước khi thêm nội dung |
| P0 / cao | `.github/workflows/production.yml:18,54–67` chưa khai báo/truyền flag SEO; `Dockerfile:18,36` mặc định false | Nối repository variable với job verify và Docker build args; kiểm tra runtime không ghi đè khác giá trị | Thay repository variable thực sự thay đổi output của image; kiểm tra cả false và true |
| P1 / cao | Workflow hiện không gọi `audit:seo`, dù tài liệu 07/10 nói đã tích hợp | Thêm bước khởi động production build, chờ health, chạy HTTP audit đúng mode trước publish; cập nhật tài liệu launch | CI thất bại nếu trang public ở sai mode hoặc sitemap/canonical sai |
| P1 / trung bình | `https://www.piggyback.vn/` trả 200; canonical đã trỏ non-www | Redirect vĩnh viễn www → non-www tại Cloudflare/reverse proxy, giữ path và query | `/huong-dan?utm_source=qa` về đúng URL trên non-www; không loop |
| P1 / cao | Route inventory chưa có trang giới thiệu, liên hệ, điều khoản, bảo mật, chính sách cashback; footer public chưa dẫn các trang này | Bổ sung thông tin doanh nghiệp/hỗ trợ và chính sách đã duyệt | Người mới hiểu ai vận hành, điều kiện ghi nhận/rút tiền, cách khiếu nại trước đăng ký |
| P1 / cao | Nội dung public hiện chỉ có hai chủ đề, mỗi chủ đề vi/en | Mở rộng theo nhóm intent trong bảng từ khóa bên dưới | Mỗi URL có mục đích riêng, nội dung gốc, link nội bộ và CTA phù hợp |
| P1 / cao đối với đo lường | Không tìm thấy tích hợp GA4/GTM qua tìm kiếm source; chưa xác minh analytics chèn từ hạ tầng hay tài khoản GSC | Kiểm tra tracking thực tế, thiết lập GSC và analytics nếu còn thiếu | Đọc được nguồn organic và sự kiện thành công; không tính nhấp nút thành đăng ký |
| P2 / cần đo thêm | HTML homepage live trả `private, no-cache, no-store`; chưa đo CWV | Đo mobile trước, chỉ tối ưu SSR/cache/font/ảnh/JS theo bottleneck | Có baseline và phép đo lại cùng điều kiện; không suy luận CWV xấu chỉ từ header |

Những phần đã có và cần giữ: canonical tự tham chiếu; hreflang vi/en/x-default đối ứng trên bốn trang; một H1 mỗi trang; title/description riêng; JSON-LD có sẵn trong HTML; HTTP → HTTPS 301; `/vi` → `/` 308; URL không tồn tại trả 404; login noindex. Đừng dành sprint đầu để làm lại các phần này.

JSON-LD quan sát được gồm Organization/WebSite/WebPage/FAQPage trên landing, Article/BreadcrumbList trên guide. Đây là kiểm tra source HTML, chưa phải xác thực DOM sau JavaScript hoặc Rich Results Test. FAQ rich results đã ngừng hiển thị từ 07/05/2026, nên thêm FAQ schema không phải một chiến thuật lấy rich result hiện tại. [Changelog Google](https://developers.google.com/search/updates).

## Giai đoạn 1 — Ngày 1–7: chuẩn bị ra mắt và khả năng index

Chủ sản phẩm xác nhận ngày launch, luồng tạo link → ghi nhận đơn → đối soát → yêu cầu rút chạy đúng, và nội dung chính sách đã duyệt. Nếu chưa sẵn sàng, tiếp tục noindex nhưng vẫn làm các việc chuẩn bị dưới đây.

1. **Dev:** nối `SEO_INDEXABLE` từ GitHub variable vào verify/build image; giữ mặc định false cho preview. Không chỉ đổi runtime vì sitemap được tạo lúc build.
2. **Dev:** khôi phục bước `npm run audit:seo` trong CI; chuẩn bị kiểm tra cả prelaunch và launch-candidate. Script hiện có là kiểm tra HTTP, không thay thế browser QA.
3. **Dev/infra:** thêm redirect www, kiểm tra HTTPS và đường dẫn/query; kiểm tra bot không bị challenge ngoài ý muốn. Giữ vùng tài khoản/admin được bảo vệ bởi auth; robots không phải cơ chế bảo mật.
4. **Chủ sản phẩm + nội dung:** hoàn thành giới thiệu, liên hệ/hỗ trợ, điều khoản, bảo mật và chính sách cashback. Chưa xác nhận mức chia, hạn mức/phí, thời gian xử lý thì không tự đưa thành cam kết.
5. **Chủ domain:** tạo hoặc kiểm tra Domain property `piggyback.vn` trong Search Console; xác minh TXT trên DNS theo token do Google cấp, giữ record sau xác minh. Không cần đưa mật khẩu vào repo. [Hướng dẫn xác minh Google](https://support.google.com/webmasters/answer/9008080).
6. **Sau launch:** kiểm tra HTML live, sitemap, canonical và header. Submit `/sitemap.xml` trong GSC, URL Inspection trang chủ và hướng dẫn; theo dõi Page Indexing và Google-selected canonical. Gửi sitemap là hỗ trợ khám phá URL, không bảo đảm index hay thứ hạng.

Kiểm tra local cho bản dự kiến launch, trong hai terminal:

```bash
# Terminal 1, thư mục frontend
SEO_INDEXABLE=true npm run build
SEO_INDEXABLE=true npm run start -- --port 3100
```

```bash
# Terminal 2
npm run audit:seo -- http://localhost:3100 --indexable
```

Sau deploy, chạy cùng audit với origin `https://piggyback.vn` và kiểm tra thủ công redirect www. Khi thêm URL public mới, cập nhật danh sách kỳ vọng trong script; hiện script hardcode bốn URL. Không bật index toàn bộ root layout vì auth/app cần tiếp tục nằm ngoài search.

## Giai đoạn 2 — Ngày 8–14: đo lường và cấu trúc nội dung

**GSC:** lưu baseline query + landing page, impressions, clicks, CTR và average position, tách branded/non-branded, Việt Nam, mobile/desktop. Với website mới, baseline có thể chưa đủ dữ liệu; không diễn giải thiếu dữ liệu là không có nhu cầu.

**Analytics:** kiểm tra có GA4 đang được chèn ngoài source hay chưa để tránh đếm đôi. Nếu chưa có, tạo property/web stream và tích hợp một lần. Ghi đúng sự kiện theo kết quả hệ thống:

| Event đề xuất | Khi nào phát | Mục đích |
| --- | --- | --- |
| `sign_up` | API xác nhận tạo tài khoản thành công | Chuyển đổi organic → tài khoản |
| `generate_cashback_link` | Tạo link thành công | Đo người đăng ký đã dùng chức năng cốt lõi |
| `outbound_shopee_click` | Người dùng mở link Shopee | Đo bước chuyển sang mua hàng |
| `first_qualified_order` | Backend xác nhận đơn đầu tiên đủ điều kiện, chống ghi trùng | Đánh giá chất lượng người dùng và đóng góp kinh doanh |

Các tên custom ở bảng là đề xuất chưa triển khai. Debug trên GA4 và đối chiếu tổng với backend. Không gửi email, số điện thoại, tài khoản ngân hàng hay URL có token vào analytics. Ghi nguồn truy cập theo cơ chế phù hợp với lựa chọn quyền riêng tư của người dùng. GA4 dùng để đo hiệu quả; cài GA4 tự nó không giúp tăng thứ hạng.

**Hiệu năng:** chạy PageSpeed Insights mobile cho homepage và guide, ghi rõ lab/field. Mục tiêu field p75: LCP ≤2,5 giây, INP ≤200 ms, CLS ≤0,1. Nếu chưa có CrUX thì ghi thiếu mẫu và dùng lab để chẩn đoán, không báo “đã pass field”. [Ngưỡng Core Web Vitals](https://web.dev/articles/defining-core-web-vitals-thresholds).

**Kiến trúc:** giữ `/` và `/huong-dan`; thêm `/kien-thuc` làm mục bài viết nếu cần. Mỗi bài liên kết về trang chủ/hướng dẫn, và đến 1–3 bài thực sự liên quan. Thêm trang hỗ trợ/chính sách vào footer. Giữ nội dung chính trong server HTML; thêm metadata/canonical/sitemap cho từng URL mới. Bản tiếng Việt ở `/` là hợp lệ; không cần đổi toàn site sang `/vi`.

## Bản đồ từ khóa ban đầu

Đây là giả thuyết ưu tiên dựa trên sản phẩm và search intent, **chưa có volume/KD hay thứ hạng Google Việt Nam được đo**. Trước khi viết, khảo sát SERP của từng cụm: loại trang được ưu tiên, 3–5 đối thủ, câu hỏi người đọc và nội dung thiếu. Mỗi intent có một URL chủ; tránh tạo nhiều bài chỉ khác cách viết từ khóa.

| Ưu tiên | Cụm truy vấn | URL chủ | Ý định / nội dung cần có |
| --- | --- | --- | --- |
| 1 | Piggy Back, Piggyback hoàn tiền | `/` | Thương hiệu, cách hoạt động, nền tảng hỗ trợ, đường vào app |
| 1 | mua sắm hoàn tiền Shopee, cashback Shopee | `/` | Giá trị dịch vụ, cách nhận cashback, điều kiện, minh bạch ước tính |
| 1 | cách tạo link hoàn tiền Shopee, lấy link hoàn tiền Shopee | `/huong-dan` đã có | Hướng dẫn thật trên mobile, ảnh chụp từng bước, lỗi thao tác thường gặp |
| 1 | không được ghi nhận hoàn tiền Shopee | `/kien-thuc/khong-ghi-nhan-hoan-tien-shopee` đề xuất | Checklist kiểm tra, phân biệt chờ đồng bộ và không đủ điều kiện, kênh hỗ trợ |
| 1 | điều kiện nhận cashback Shopee | `/chinh-sach-hoan-tien` đề xuất | Điều kiện đã duyệt, hủy/trả hàng, đối soát, hạn mức/phí và thời điểm cập nhật |
| 2 | cashback là gì, cashback khác hoàn tiền trả hàng | `/kien-thuc/cashback-la-gi` đề xuất | Phân biệt hoa hồng chia lại, refund và Shopee Xu bằng ví dụ |
| 2 | tiền hoàn dự kiến và được xác nhận | `/kien-thuc/tien-hoan-du-kien-va-xac-nhan` đề xuất | Ví dụ trạng thái thật, vì sao số tiền thay đổi, khi nào khả dụng |
| 2 | rút tiền Piggy Back | `/huong-dan/rut-tien` đề xuất | Thao tác, tài khoản nhận, trạng thái yêu cầu; dẫn chính sách hiện hành |
| 3 | app hoàn tiền Shopee, web hoàn tiền Shopee | Đánh giá `/` trước; chỉ tạo bài so sánh nếu intent khác | So sánh bằng tiêu chí kiểm chứng, công khai Piggy là bên cung cấp dịch vụ |

Không ưu tiên cụm chung “hoàn tiền Shopee” mà bỏ qua intent: người tìm có thể muốn refund do hủy đơn. Không mở trang TikTok/Lazada khi sản phẩm hiện chỉ xác nhận hỗ trợ Shopee. Không mở hàng nghìn trang sản phẩm chép mô tả Shopee để lấy số lượng URL.

Khảo sát cạnh tranh sơ bộ: [HoanTienApp](https://hoantienapp.com/) đặt công cụ dán link ngay trên trang chủ; [Hoàn Đồng](https://hoandong.com/) trình bày quy trình và bằng chứng vận hành. Đây là hai mẫu sản phẩm để so sánh trải nghiệm, không phải kết luận họ đang đứng TOP 1–3 hay xác nhận số liệu họ công bố. Cơ hội cho Piggy là hướng dẫn dễ làm, giải thích rõ trạng thái tiền và hỗ trợ dễ tìm. Khi muốn thử công cụ public, kiểm tra chi phí API/chống lạm dụng và đo tỷ lệ tạo link trước khi thay đổi luồng đăng nhập.

## Giai đoạn 3 — Ngày 15–45: xuất bản nội dung có ích

Năng lực dự kiến để lập lịch: một dev phối hợp với một người phụ trách nội dung/chủ sản phẩm; khoảng 1–2 nội dung tốt mỗi tuần. Điều chỉnh theo nguồn lực thực tế.

| Tuần | Đầu ra | Bằng chứng cần chuẩn bị | Người phụ trách |
| --- | --- | --- | --- |
| 3 | Nâng cấp `/huong-dan`; bài không ghi nhận cashback | Ảnh UI hiện tại, thao tác đã QA, quy trình hỗ trợ | Nội dung + QA |
| 4 | Chính sách cashback; bài giải thích cashback/refund/Xu | Điều kiện được duyệt, ví dụ không gây nhầm lẫn | Chủ sản phẩm + nội dung |
| 5 | Bài dự kiến/xác nhận; hướng dẫn rút tiền | Trạng thái thật, ảnh đã che dữ liệu cá nhân, quy định đang áp dụng | Nội dung + vận hành |
| 6 | Cập nhật các trang đã xuất bản theo truy vấn và phản hồi; chọn bài tiếp theo | GSC nếu đủ mẫu, câu hỏi hỗ trợ thực tế | SEO/nội dung |

Checklist mỗi trang: trả lời rõ câu hỏi chính ở đầu; title và H1 cùng intent; ví dụ/ảnh thao tác gốc; tên người chịu trách nhiệm hoặc nhóm biên tập thật; ngày cập nhật đúng; nguồn điều kiện khi cần; CTA phù hợp; canonical tự tham chiếu; không noindex; sitemap cập nhật; link từ ít nhất một trang đã có người truy cập. Không nhồi từ khóa hoặc ép đủ số chữ.

Schema dùng đúng nội dung: Organization/WebSite cho thương hiệu, Article cho bài viết, BreadcrumbList khớp đường dẫn hiển thị. Chỉ thêm thuộc tính người viết/ngày/contact/sameAs có dữ liệu xác thực. Kiểm tra browser DOM, Schema.org Validator và Rich Results Test cho loại được Google hỗ trợ. Không dùng Product/review giả cho trang affiliate cần đăng nhập.

## Giai đoạn 4 — Ngày 46–90: tăng độ tin cậy và tối ưu theo dữ liệu

- Hoàn thiện nhận diện Piggy Back thống nhất trên các kênh chính thức; liên kết từ website đến đúng tài khoản. Làm video thao tác đi cùng hướng dẫn.
- Sau khi có vận hành thật, xuất bản case study đã được cho phép và ẩn thông tin người dùng; mô tả cả thời gian chờ và điều kiện. Không tạo đánh giá hoặc số tiền đã chi giả.
- Tìm cơ hội hợp tác nội dung với cộng đồng mua sắm/tiết kiệm liên quan, dùng hướng dẫn có ích để nhận trích dẫn tự nhiên. Đo referral và chuyển đổi; không đặt KPI số lượng backlink rác. Link tài trợ dùng thuộc tính phù hợp. [Chính sách spam Google](https://developers.google.com/search/docs/essentials/spam-policies).
- Mỗi tuần kiểm tra query/page có impressions thực: nhóm vị trí 8–20 để bổ sung phần trả lời thiếu và internal link; nhóm có vị trí tốt nhưng CTR thấp để thử title/description. So CTR cùng nhóm vị trí, thiết bị, brand và search intent.
- Ghi ngày thay đổi, baseline 28 ngày; đánh giá sau khoảng 3–4 tuần nếu đủ mẫu. Hai URL cùng xuất hiện cho một query chưa đủ chứng minh cannibalization: xem intent và biến động trước khi gộp/redirect.
- Cuối tháng 3: giữ/mở rộng nhóm bài tạo người dùng có đơn đủ điều kiện; sửa hoặc hợp nhất nội dung trùng/không hữu ích. Nếu impressions thấp, kiểm tra index và intent trước khi tiếp tục tăng số bài.

## KPI và tiêu chí quyết định

| Mốc | Chỉ tiêu kiểm soát được | Kết quả theo dõi, không cam kết |
| --- | --- | --- |
| Ngày 7 hoặc ngày launch | Không có noindex nhầm trên URL cần SEO; sitemap đúng; CI có audit; chính sách/hỗ trợ sẵn sàng | GSC fetch được URL, nguyên nhân loại trừ rõ ràng |
| Ngày 14 | GSC được xác minh; tracking thành công không trùng; lưu baseline tốc độ và từ khóa | Trạng thái index, impressions đầu tiên nếu Google đã xử lý |
| Ngày 45 | Hoàn thành nhóm nội dung ưu tiên, link nội bộ và QA mobile | Click non-brand, đăng ký từ organic, tỷ lệ người đăng ký tạo link |
| Ngày 90 | Ít nhất hai vòng đánh giá/tối ưu có nhật ký thay đổi | Xu hướng 28 ngày clicks, conversions và đơn đủ điều kiện; query nào tiến vào top 20/10/3 |

Không đặt số traffic/TOP 10 tuyệt đối khi chưa có baseline. Sau 28 ngày có dữ liệu đủ dùng, chốt mục tiêu tháng sau dựa trên nguồn lực, độ cạnh tranh và tỷ lệ chuyển đổi. Tách KPI thứ hạng khỏi KPI kinh doanh: thứ hạng tốt nhưng sai nhu cầu sẽ không tạo người dùng hiệu quả.

## Thứ tự triển khai ngay

1. Sửa luồng flag SEO và bước audit trong CI; kiểm tra cả hai chế độ.
2. Hoàn thiện chính sách/hỗ trợ và QA chức năng cốt lõi.
3. Chuẩn hóa www, đo tốc độ, chuẩn bị GSC và analytics.
4. Khi launch: build/deploy với index bật, kiểm tra live rồi gửi sitemap.
5. Xuất bản nhóm hướng dẫn/lỗi/điều kiện; đo organic → đăng ký → tạo link → đơn đủ điều kiện.

Đầu vào còn cần để thực thi phần tài khoản/nội dung: trạng thái launch; tài khoản quản lý GSC/GA4 và DNS; thông tin đơn vị vận hành/hỗ trợ; chính sách cashback đã duyệt; nguồn lực mỗi tuần. Các đầu vào này không cản trở việc hoàn thành kế hoạch và sửa kỹ thuật chuẩn bị.
