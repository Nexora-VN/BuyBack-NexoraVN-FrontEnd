import type { Locale } from "@/i18n/config";

const vi = {
  title: "Cách tạo link hoàn tiền Shopee | Hướng dẫn Piggy Back",
  description:
    "Hướng dẫn tạo link mua sắm Shopee trên Piggy Back, mở link để đặt hàng, kiểm tra tiền hoàn dự kiến và theo dõi đơn sau khi mua.",
  home: "Trang chủ",
  label: "Hướng dẫn mua sắm",
  heading: "Cách tạo link hoàn tiền Shopee trên Piggy Back",
  intro:
    "Trước khi đặt hàng, bạn cần tạo và mở liên kết mua sắm trên Piggy Back. Hướng dẫn dưới đây mô tả các bước trong ứng dụng, từ lúc sao chép link đến khi kiểm tra trạng thái đơn.",
  notice:
    "Piggy Back đang được phát triển và chưa ra mắt chính thức. Nội dung hướng dẫn có thể được cập nhật trước khi phát hành.",
  contents: "Trong hướng dẫn này",
  stepsHeading: "Chuẩn bị và tạo liên kết mua sắm",
  steps: [
    {
      title: "1. Chuẩn bị link sản phẩm Shopee",
      text: "Mở trang sản phẩm bạn muốn mua trên Shopee, chọn Chia sẻ rồi Sao chép đường dẫn. Nếu sản phẩm đã nằm trong giỏ, thực hiện hướng dẫn xóa sản phẩm khỏi giỏ trước khi tạo link và thêm lại sau khi mở liên kết Piggy.",
      note: "Dùng đường dẫn sản phẩm bạn định mua. Việc tự tìm lại sản phẩm trên sàn không thay thế bước mở liên kết do Piggy tạo.",
    },
    {
      title: "2. Dán link vào Piggy Back",
      text: "Đăng nhập, mở mục tạo link và dán đường dẫn sản phẩm Shopee. Chọn Tạo link hoàn tiền. Khi có dữ liệu sản phẩm, ứng dụng hiển thị thông tin giá và khoản hoàn dự kiến để bạn kiểm tra trước khi tiếp tục.",
      note: "Nếu chưa có dữ liệu ước tính, không tự suy ra rằng sản phẩm chắc chắn có hoặc không có tiền hoàn. Kiểm tra thông tin trả về trong ứng dụng.",
    },
    {
      title: "3. Mở liên kết và đặt hàng trên Shopee",
      text: "Chọn Mua ngay trong kết quả tạo link để chuyển sang Shopee. Thêm lại sản phẩm vào giỏ hoặc tiếp tục mua, áp dụng ưu đãi phù hợp và hoàn tất đặt hàng theo hướng dẫn đang hiển thị.",
      note: "Việc thanh toán, vận chuyển và xử lý đơn mua sắm diễn ra trên Shopee. Đọc điều kiện ưu đãi trước khi dùng voucher; số ước tính trên Piggy chưa phải xác nhận cuối cùng.",
    },
    {
      title: "4. Theo dõi đơn và tiền hoàn",
      text: "Sau khi mua, kiểm tra mục Đơn hàng và Ví trong Piggy Back. Đơn cần được ghi nhận, xác nhận đủ điều kiện và đối soát. Khoản dự kiến hoặc đang chờ xác nhận chưa phải số dư có thể rút.",
      note: "Không có thời gian ghi nhận hoặc chi trả chung được công bố trong hướng dẫn này. Trạng thái thực tế và chính sách áp dụng quyết định khả năng nhận hoàn.",
    },
  ],
  estimateHeading: "Đọc đúng số tiền hoàn dự kiến",
  estimate:
    "Giá sản phẩm, tỷ lệ hoa hồng và khoản người mua nhận được là những thông tin khác nhau. Trong ứng dụng, phần giải thích giá phân biệt hoa hồng từ sàn và khoản bổ sung từ người bán khi có dữ liệu. Không lấy tổng tỷ lệ hoa hồng hiển thị làm cam kết về số tiền cuối cùng trong ví.",
  estimateNote:
    "Giá sau ưu đãi, điều kiện chương trình, trạng thái đơn và kết quả đối soát có thể làm khoản xác nhận khác con số ban đầu. Đơn bị hủy hoặc hoàn trả có thể không đủ điều kiện nhận cashback.",
  troubleshootingHeading: "Khi chưa thấy đơn hoặc chưa rút được tiền",
  checks: [
    "Kiểm tra bạn đã mở đúng link Piggy tạo trước khi đặt hàng và đã làm theo hướng dẫn xử lý giỏ hàng.",
    "Kiểm tra trạng thái đơn trên Shopee và trong Piggy; không coi một đơn chưa xuất hiện là bằng chứng chắc chắn đã bị từ chối.",
    "Phân biệt tiền hoàn dự kiến, tiền đang chờ xử lý và số dư khả dụng trước khi tạo yêu cầu rút.",
    "Để gửi yêu cầu rút, cần tài khoản nhận tiền đã được duyệt và số dư khả dụng đáp ứng số tiền yêu cầu cùng hạn mức được kiểm tra trong ứng dụng.",
  ],
  checksNote:
    "Piggy Back là nền tảng độc lập. Tiền được Shopee hoàn lại do hủy hoặc trả hàng được xử lý theo quy trình của Shopee, khác khoản cashback Piggy chia từ hoa hồng đủ điều kiện.",
  nextHeading: "Tìm hiểu trước khi bắt đầu",
  next: "Xem phần hỏi đáp để hiểu nguồn tiền hoàn và điều kiện ghi nhận. Trước khi mua, đọc hướng dẫn và điều kiện đang hiển thị tại bước tạo link trong ứng dụng.",
  faqLink: "Điều kiện nhận hoàn và câu hỏi thường gặp",
  login: "Đăng nhập Piggy Back",
  back: "Tìm hiểu nền tảng hoàn tiền Piggy Back",
};

const en: typeof vi = {
  title: "How to Create Shopee Cashback Links | Piggy Back Guide",
  description:
    "Learn how to create a Shopee shopping link with Piggy Back, open it to place an order, understand cashback estimates and check order progress.",
  home: "Home",
  label: "Shopping guide",
  heading: "How to create Shopee cashback links with Piggy Back",
  intro:
    "Before placing an order, create and open a shopping link through Piggy Back. This guide describes the steps in the application, from copying a product link to checking your order status.",
  notice:
    "Piggy Back is in development and has not officially launched. This guide may be updated before release.",
  contents: "In this guide",
  stepsHeading: "Prepare and create your shopping link",
  steps: [
    {
      title: "1. Copy a Shopee product link",
      text: "Open the product you want on Shopee, select Share and copy its link. If the product is already in your cart, follow the application's instructions to remove it before creating a link and add it again after opening the Piggy link.",
      note: "Use the link for the product you intend to buy. Searching for the product yourself does not replace opening the link created by Piggy.",
    },
    {
      title: "2. Paste the link into Piggy Back",
      text: "Sign in, open the link creation screen and paste the Shopee product URL. Select the option to create a cashback link. When product data is available, the application shows price information and estimated cashback for you to review.",
      note: "Missing estimate data does not confirm that cashback is available or unavailable. Check the information returned by the application.",
    },
    {
      title: "3. Open the link and order on Shopee",
      text: "Select Buy now in the generated result to continue to Shopee. Add the product back to your cart or continue purchasing, apply eligible offers and complete your order using the current instructions.",
      note: "Payment, delivery and shopping order handling take place on Shopee. Review voucher conditions; the estimate in Piggy is not a final confirmation.",
    },
    {
      title: "4. Check the order and cashback status",
      text: "After shopping, check Orders and Wallet in Piggy Back. An order must be tracked, confirmed as eligible and reconciled. Estimated or pending cashback is not yet available to withdraw.",
      note: "This guide does not publish a universal tracking or payout timeframe. Actual status and applicable policies determine cashback eligibility.",
    },
  ],
  estimateHeading: "Understand the estimated cashback amount",
  estimate:
    "Product price, commission rates and the amount shared with a shopper are different figures. The application's price explanation distinguishes marketplace commission from additional seller commission when data is available. Do not treat a displayed total commission rate as a guaranteed final wallet amount.",
  estimateNote:
    "The price after discounts, program conditions, order status and reconciliation may change the confirmed amount. Cancelled or returned orders may not qualify for cashback.",
  troubleshootingHeading: "When an order is missing or a withdrawal is unavailable",
  checks: [
    "Check that you opened the link generated by Piggy before ordering and followed the cart instructions.",
    "Check the order status on Shopee and Piggy. An order that has not appeared yet is not conclusive evidence of rejection.",
    "Distinguish estimated cashback, pending amounts and available balance before requesting a withdrawal.",
    "Withdrawal requests require an approved payout account and enough available balance for the requested amount, subject to limits checked in the application.",
  ],
  checksNote:
    "Piggy Back is independent of Shopee. A refund from Shopee for a cancellation or return follows Shopee's process and is different from cashback shared by Piggy from eligible commission.",
  nextHeading: "Learn more before you begin",
  next: "Read the FAQs to understand where cashback comes from and the tracking conditions. Before shopping, read the instructions and conditions shown when creating a link in the application.",
  faqLink: "Cashback eligibility and frequently asked questions",
  login: "Sign in to Piggy Back",
  back: "Explore the Piggy Back cashback platform",
};

export const guideContent: Record<Locale, typeof vi> = { vi, en };
