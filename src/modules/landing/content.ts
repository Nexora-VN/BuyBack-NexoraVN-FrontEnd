import type { Locale } from "@/i18n/config";

const vi = {
  title: "Piggy Back — Mua sắm Shopee, nhận hoàn tiền",
  description:
    "Khám phá Piggy Back: tạo liên kết mua sắm Shopee, xem hoa hồng dự kiến và tìm hiểu cách nhận hoàn tiền từ đơn hàng đủ điều kiện.",
  skip: "Đến nội dung chính",
  nav: ["Cách hoạt động", "Vì sao Piggy?", "Hỏi đáp"],
  login: "Đăng nhập",
  start: "Bắt đầu cùng Piggy",
  eyebrow: "MUA SẮM THÔNG MINH HƠN MỖI NGÀY",
  headline: ["Mua sắm vui hơn.", "Tiền về ví nhỏ."],
  intro:
    "Món đồ bạn thích, thêm một niềm vui. Tạo link mua sắm Shopee cùng Piggy Back và nhận lại một phần hoa hồng từ đơn hàng đủ điều kiện.",
  howLink: "Khám phá cách hoạt động",
  heroNote: "Mua trên Shopee. Bắt đầu từ Piggy.",
  mascotAlt: "Piggy ôm giỏ mua sắm và đồng xu",
  little: ["Một bước nhỏ.", "Thêm một khoản vui."],
  preview: "MINH HỌA TRẢI NGHIỆM",
  paste: "Dán link món bạn thích",
  previewLink: "Link sản phẩm Shopee",
  previewResult: "Xem hoa hồng dự kiến",
  platformLabel: "SÀN MUA SẮM ĐANG HỖ TRỢ",
  platformNote: "Vẫn sàn quen. Thêm cách tiết kiệm.",
  platformSub: "Piggy Back là nền tảng độc lập với Shopee.",
  stepsLabel: "01 / THẬT DỄ ĐỂ BẮT ĐẦU",
  stepsTitle: "Thêm một bước.\nThêm một niềm vui.",
  stepsIntro: "Từ link món đồ yêu thích đến khoản hoàn trong ví — cùng Piggy đi từng bước nhé.",
  steps: [
    {
      title: "Mang link đến Piggy",
      text: "Sao chép link sản phẩm Shopee, đăng nhập Piggy Back và tạo liên kết mua sắm. Xem hoa hồng dự kiến khi có dữ liệu sản phẩm.",
      tag: "SAO CHÉP & DÁN",
    },
    {
      title: "Mua món bạn thích",
      text: "Mở liên kết do Piggy tạo để tiếp tục mua trên Shopee. Làm theo hướng dẫn ghi nhận trước khi đặt hàng.",
      tag: "MỞ LINK & MUA SẮM",
    },
    {
      title: "Chờ xác nhận hoàn tiền",
      text: "Khoản hoàn phụ thuộc vào trạng thái đơn hàng và kết quả đối soát. Tiền đủ điều kiện mới được ghi nhận để rút theo chính sách áp dụng.",
      tag: "XÁC NHẬN & NHẬN HOÀN",
    },
  ],
  benefitsLabel: "02 / CÓ PIGGY ĐỒNG HÀNH",
  benefitsTitle: "Tiết kiệm một chút.\nHiểu rõ từng chút.",
  benefitsIntro: "Một trải nghiệm dễ hiểu, từ lúc bạn mở link đến khi đơn hàng được xác nhận.",
  benefits: [
    {
      title: "Biết trước khi mua",
      text: "Xem thông tin sản phẩm và hoa hồng dự kiến khi dữ liệu có sẵn, trước khi mở link sang sàn.",
    },
    {
      title: "Bắt đầu ngay trên web",
      text: "Dùng Piggy trên điện thoại hay máy tính. Đăng nhập và tạo link ngay trong trình duyệt.",
    },
    {
      title: "Điều kiện rõ ràng",
      text: "Tiền hoàn được tính từ hoa hồng đủ điều kiện. Con số dự kiến chưa phải khoản tiền đã được xác nhận.",
    },
  ],
  transparencyLabel: "HIỂU ĐÚNG VỀ CASHBACK",
  transparencyTitle: "Tiền hoàn\nđến từ đâu?",
  transparencyText:
    "Khi một đơn mua qua liên kết Piggy đủ điều kiện, nền tảng có thể nhận hoa hồng tiếp thị liên kết. Một phần hoa hồng đó được chia lại cho bạn.",
  flow: ["Bạn mua hàng", "Sàn xác nhận", "Piggy chia sẻ hoa hồng"],
  transparencyNote:
    "Tiền hoàn không đồng nghĩa với toàn bộ giá trị đơn hàng. Mức nhận thực tế phụ thuộc vào chính sách và kết quả đối soát.",
  faqLabel: "03 / PIGGY GIẢI ĐÁP",
  faqTitle: "Bạn hỏi,\nPiggy trả lời.",
  faqIntro: "Những điều nên biết trước khi bắt đầu mua sắm hoàn tiền.",
  faqs: [
    {
      question: "Piggy Back là gì?",
      answer:
        "Piggy Back là nền tảng hỗ trợ mua sắm hoàn tiền qua liên kết tiếp thị liên kết. Bạn tạo link sản phẩm Shopee trên Piggy, mua hàng qua link đó và có thể nhận một phần hoa hồng khi đơn hàng đáp ứng điều kiện ghi nhận và đối soát.",
    },
    {
      question: "Bắt đầu mua sắm với Piggy như thế nào?",
      answer:
        "Đăng nhập Piggy Back, dán link sản phẩm Shopee và tạo liên kết mua sắm. Mở liên kết do Piggy tạo, làm theo hướng dẫn ghi nhận rồi đặt hàng trên Shopee. Nếu sản phẩm đã nằm trong giỏ, hãy kiểm tra hướng dẫn xóa và thêm lại trước khi mua.",
    },
    {
      question: "Piggy đang hỗ trợ sàn nào?",
      answer:
        "Luồng tạo liên kết hiện tại của Piggy Back hỗ trợ Shopee. Thông tin về các sàn khác sẽ được cập nhật khi tính năng tương ứng sẵn sàng.",
    },
    {
      question: "Hoa hồng dự kiến có phải số tiền chắc chắn nhận được?",
      answer:
        "Không. Hoa hồng dự kiến chỉ mang tính tham khảo tại thời điểm kiểm tra. Tiền hoàn thực tế phụ thuộc vào điều kiện của chương trình, trạng thái đơn hàng, hoa hồng được xác nhận và chính sách chia sẻ áp dụng.",
    },
    {
      question: "Khi nào tôi nhận được tiền hoàn?",
      answer:
        "Đơn hàng cần được ghi nhận, xác nhận đủ điều kiện và hoàn tất đối soát trước khi tiền hoàn có thể được sử dụng để rút. Thời gian phụ thuộc vào sàn và từng đơn hàng; Piggy không cam kết một thời hạn chung cho mọi đơn.",
    },
    {
      question: "Vì sao đơn hàng có thể không được ghi nhận?",
      answer:
        "Đơn hàng có thể không đủ điều kiện nếu không mua qua liên kết Piggy, liên kết ghi nhận bị thay thế, đơn bị hủy hoặc hoàn trả, hoặc không đáp ứng điều kiện của sàn. Hãy đọc hướng dẫn tại bước tạo link trước khi đặt hàng.",
    },
    {
      question: "Piggy có phải ứng dụng chính thức của Shopee không?",
      answer:
        "Không. Piggy Back là nền tảng hoàn tiền độc lập, không phải sản phẩm chính thức của Shopee. Việc đặt hàng, thanh toán và xử lý đơn mua sắm diễn ra trên Shopee.",
    },
  ],
  ctaLabel: "MÓN ĐỒ TIẾP THEO, NHỚ PIGGY NHÉ",
  ctaTitle: "Giỏ hàng có thêm đồ.\nVí nhỏ có thêm vui.",
  ctaText: "Bắt đầu bằng link món đồ bạn đang ngắm.",
  footerText: "Một người bạn nhỏ cho mỗi lần mua sắm.",
  footerNote:
    "Piggy Back là nền tảng hoàn tiền độc lập. Shopee là thương hiệu của chủ sở hữu tương ứng. Khoản hoàn phụ thuộc điều kiện của chương trình và kết quả đối soát.",
  footerCopyright: "Piggy Back. Mua sắm có thêm niềm vui.",
};

const en: typeof vi = {
  title: "Piggy Back — Shopee shopping with cashback",
  description:
    "Meet Piggy Back: create Shopee shopping links, preview estimated commissions and learn how cashback works on eligible orders.",
  skip: "Skip to main content",
  nav: ["How it works", "Why Piggy?", "FAQs"],
  login: "Sign in",
  start: "Get started with Piggy",
  eyebrow: "A LITTLE SMARTER, EVERY SHOPPING DAY",
  headline: ["Happy shopping.", "Happy little wallet."],
  intro:
    "The things you love, with a little extra joy. Create a Shopee shopping link with Piggy Back and receive a share of the commission on eligible orders.",
  howLink: "See how it works",
  heroNote: "Shop on Shopee. Start with Piggy.",
  mascotAlt: "Piggy holding a shopping basket and a coin",
  little: ["One little step.", "A little extra joy."],
  preview: "EXPERIENCE PREVIEW",
  paste: "Paste a link you love",
  previewLink: "Shopee product link",
  previewResult: "Preview estimated commission",
  platformLabel: "CURRENTLY SUPPORTED MARKETPLACE",
  platformNote: "Your usual shop. A little more back.",
  platformSub: "Piggy Back is independent of Shopee.",
  stepsLabel: "01 / EASY FROM THE START",
  stepsTitle: "One extra step.\nA little extra joy.",
  stepsIntro:
    "From your favourite product link to eligible cashback — take it one step at a time with Piggy.",
  steps: [
    {
      title: "Bring your link to Piggy",
      text: "Copy a Shopee product link, sign in to Piggy Back and create your shopping link. Preview estimated commission when product data is available.",
      tag: "COPY & PASTE",
    },
    {
      title: "Shop for what you love",
      text: "Open the link created by Piggy to continue on Shopee. Follow the tracking instructions before placing your order.",
      tag: "OPEN & SHOP",
    },
    {
      title: "Wait for confirmation",
      text: "Cashback depends on order status and reconciliation. Only eligible, confirmed amounts become available for withdrawal under the applicable policy.",
      tag: "CONFIRM & EARN",
    },
  ],
  benefitsLabel: "02 / YOUR LITTLE SHOPPING COMPANION",
  benefitsTitle: "Save a little.\nUnderstand every bit.",
  benefitsIntro:
    "A clear experience, from the moment you open a link to the moment your order is confirmed.",
  benefits: [
    {
      title: "Know before you shop",
      text: "See product details and estimated commission when data is available, before opening your marketplace link.",
    },
    {
      title: "Start right on the web",
      text: "Use Piggy on your phone or computer. Sign in and create a link directly in your browser.",
    },
    {
      title: "Clear conditions",
      text: "Cashback comes from eligible commission. An estimated amount is not yet a confirmed payment.",
    },
  ],
  transparencyLabel: "CASHBACK, EXPLAINED",
  transparencyTitle: "Where does\ncashback come from?",
  transparencyText:
    "When an order placed through a Piggy link qualifies, the platform may earn an affiliate commission. A share of that commission is passed back to you.",
  flow: ["You shop", "Marketplace confirms", "Piggy shares commission"],
  transparencyNote:
    "Cashback is not the full order value. Actual amounts depend on the applicable policy and reconciliation results.",
  faqLabel: "03 / A LITTLE HELP FROM PIGGY",
  faqTitle: "You ask.\nPiggy answers.",
  faqIntro: "A few things to know before your first cashback shopping trip.",
  faqs: [
    {
      question: "What is Piggy Back?",
      answer:
        "Piggy Back is a platform that supports cashback shopping through affiliate links. Create a Shopee product link on Piggy, shop through that link and you may receive a share of commission when your order meets tracking and reconciliation requirements.",
    },
    {
      question: "How do I start shopping with Piggy?",
      answer:
        "Sign in to Piggy Back, paste a Shopee product link and create your shopping link. Open the link created by Piggy, follow the tracking instructions and place your order on Shopee. If the product is already in your cart, check the instructions for removing and adding it again before purchasing.",
    },
    {
      question: "Which marketplaces does Piggy support?",
      answer:
        "The current Piggy Back link creation flow supports Shopee. Information about other marketplaces will be updated when the corresponding features are available.",
    },
    {
      question: "Is the estimated commission a guaranteed payment?",
      answer:
        "No. Estimated commission is a reference at the time of checking. Actual cashback depends on program conditions, order status, confirmed commission and the applicable sharing policy.",
    },
    {
      question: "When will I receive my cashback?",
      answer:
        "An order must be tracked, confirmed as eligible and reconciled before cashback can become available for withdrawal. Timing depends on the marketplace and each order; Piggy does not promise one fixed timeframe for every order.",
    },
    {
      question: "Why might an order not be tracked?",
      answer:
        "An order may be ineligible if it was not placed through a Piggy link, tracking was replaced, the order was cancelled or returned, or marketplace conditions were not met. Read the instructions at the link creation step before placing an order.",
    },
    {
      question: "Is Piggy an official Shopee app?",
      answer:
        "No. Piggy Back is an independent cashback platform, not an official Shopee product. Shopping, payment and order handling take place on Shopee.",
    },
  ],
  ctaLabel: "NEXT TIME YOU SHOP, THINK PIGGY",
  ctaTitle: "A happier basket.\nA happier little wallet.",
  ctaText: "Start with a link to something you have your eye on.",
  footerText: "A little companion for every shopping trip.",
  footerNote:
    "Piggy Back is an independent cashback platform. Shopee is a trademark of its respective owner. Cashback is subject to program conditions and reconciliation results.",
  footerCopyright: "Piggy Back. A little more joy in every shop.",
};

export const landingContent: Record<Locale, typeof vi> = { vi, en };
