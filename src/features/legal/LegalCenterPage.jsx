import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "Thông tin chủ thể kinh doanh",
    content: [
      "Tên thương mại: Cing Hu Tang Kinh Bắc.",
      "Chủ thể kinh doanh: Hộ kinh doanh Nguyễn Duy Mạnh.",
      "Mã số đăng ký hộ kinh doanh: 21E8026948.",
      "Chủ hộ/Người đại diện: Nguyễn Duy Mạnh.",
      "Địa chỉ cửa hàng: 576 Đường Trần Phú, Từ Sơn, Bắc Ninh.",
      "Hotline: 0989585355.",
      "Email: cing.app.vn@gmail.com.",
      "Cing Hu Tang Kinh Bắc là tên thương mại được sử dụng để cung cấp các sản phẩm, dịch vụ, chương trình thành viên, ưu đãi, trò chơi và các tiện ích dành cho khách hàng trên ứng dụng Cing.",
    ],
  },
  {
    title: "Điều khoản sử dụng",
    content: [
      "Khi sử dụng ứng dụng Cing, khách hàng có trách nhiệm cung cấp thông tin chính xác, bảo vệ thông tin tài khoản và sử dụng tài khoản đúng mục đích.",
      "Điểm tích lũy, lượt chơi, voucher, phần thưởng, ưu đãi và các quyền lợi thành viên được áp dụng theo điều kiện hoặc thể lệ của từng chương trình hiển thị trên ứng dụng.",
      "Các hành vi gian lận, can thiệp trái phép vào hệ thống, lợi dụng lỗi kỹ thuật, tạo giao dịch giả hoặc cố tình thực hiện giao dịch không hợp lệ có thể bị từ chối ghi nhận quyền lợi hoặc hạn chế sử dụng tính năng liên quan.",
      "Cing Hu Tang Kinh Bắc có thể cập nhật tính năng, chính sách và điều kiện chương trình để phù hợp với hoạt động thực tế và quy định pháp luật. Những thay đổi quan trọng ảnh hưởng trực tiếp đến quyền lợi khách hàng sẽ được thông báo phù hợp trên ứng dụng.",
    ],
  },
  {
    title: "Thông tin sản phẩm, giá và đặt hàng",
    content: [
      "Thông tin sản phẩm, lựa chọn sản phẩm, số lượng, mức giá và các tùy chọn liên quan được hiển thị trên ứng dụng để khách hàng xem trước khi đặt hàng.",
      "Giá sản phẩm hiển thị trên ứng dụng là giá áp dụng tại thời điểm khách hàng thực hiện giao dịch. Các khoản ưu đãi, giảm giá, phí giao hàng và tổng giá trị phải thanh toán được thể hiện trong quá trình thanh toán khi áp dụng.",
      "Trước khi thực hiện thanh toán, khách hàng có thể rà soát và điều chỉnh các nội dung liên quan như sản phẩm, số lượng, hình thức nhận hàng, thông tin nhận hàng, phương thức thanh toán và tổng số tiền phải thanh toán.",
      "Khách hàng có trách nhiệm kiểm tra lại thông tin đơn hàng trước khi bấm nút thanh toán hoặc hoàn tất giao dịch.",
    ],
  },
  {
    title: "Thanh toán",
    content: [
      "Ứng dụng có thể cung cấp các phương thức thanh toán được hỗ trợ tại từng thời điểm, bao gồm Cing Wallet và các phương thức thanh toán điện tử được tích hợp trên ứng dụng.",
      "Đơn hàng chỉ được ghi nhận đã thanh toán khi hệ thống nhận được kết quả thanh toán hợp lệ từ phương thức thanh toán tương ứng hoặc từ hệ thống đối soát có thẩm quyền.",
      "Nếu tài khoản thanh toán của khách hàng đã bị trừ tiền nhưng đơn hàng chưa được ghi nhận chính xác, khách hàng không nên thanh toán lặp lại mà nên liên hệ Cing Hu Tang Kinh Bắc để được kiểm tra và đối soát.",
      "Khi cần đối soát giao dịch, khách hàng có thể liên hệ qua chức năng “Chat với admin”, hotline 0989585355 hoặc email cing.app.vn@gmail.com.",
    ],
  },
  {
    title: "Hủy đơn, đổi sản phẩm & hoàn tiền",
    content: [
      "Khách hàng nên yêu cầu hủy đơn càng sớm càng tốt. Yêu cầu hủy được xem xét dựa trên trạng thái xử lý thực tế của đơn hàng.",
      "Đối với đồ uống hoặc sản phẩm được pha chế theo yêu cầu, đơn hàng đã bắt đầu pha chế hoặc đã được bàn giao cho khách hàng/đơn vị giao hàng có thể không còn đủ điều kiện hủy chỉ vì khách hàng thay đổi nhu cầu.",
      "Nếu cửa hàng chưa bắt đầu chuẩn bị đơn hàng, Cing Hu Tang Kinh Bắc sẽ kiểm tra và có thể chấp nhận yêu cầu hủy theo tình trạng thực tế của đơn.",
      "Các trường hợp có thể được xem xét hoàn tiền bao gồm: thanh toán thành công nhưng hệ thống không tạo được đơn hàng hợp lệ; cửa hàng không thể thực hiện đơn hàng; giao dịch bị ghi nhận trùng hoặc thu thừa; đơn hàng được hủy và được xác nhận đủ điều kiện hoàn; hoặc các lỗi giao dịch khác được Cing Hu Tang Kinh Bắc xác minh.",
      "Nếu sản phẩm bị giao sai, thiếu sản phẩm hoặc có vấn đề về chất lượng được xác minh, Cing Hu Tang Kinh Bắc sẽ trao đổi với khách hàng để áp dụng phương án phù hợp như bổ sung sản phẩm, đổi sản phẩm, pha lại hoặc hoàn tiền toàn bộ/một phần tùy trường hợp.",
      "Sau khi xác minh giao dịch đủ điều kiện hoàn tiền, Cing Hu Tang Kinh Bắc thực hiện xử lý hoặc khởi tạo yêu cầu hoàn tiền trong vòng 24 giờ.",
      "Thời điểm tiền hoàn thực tế được ghi có vào tài khoản, ví điện tử hoặc phương tiện thanh toán của khách hàng có thể phụ thuộc vào thời gian xử lý của ngân hàng, tổ chức trung gian thanh toán hoặc đơn vị cung cấp phương thức thanh toán tương ứng.",
    ],
  },
  {
    title: "Hỗ trợ, khiếu nại & giải quyết tranh chấp",
    content: [
      "Khách hàng có thể gửi yêu cầu hỗ trợ hoặc khiếu nại qua chức năng “Chat với admin” tại trang Tài khoản, hotline 0989585355 hoặc email cing.app.vn@gmail.com.",
      "Khi gửi yêu cầu liên quan đến đơn hàng hoặc giao dịch, khách hàng nên cung cấp các thông tin cần thiết như số điện thoại sử dụng trên ứng dụng, mã đơn hàng hoặc mã giao dịch, thời điểm giao dịch và nội dung cần hỗ trợ. Không gửi mật khẩu, mã OTP hoặc thông tin bảo mật không cần thiết.",
      "Cing Hu Tang Kinh Bắc tiếp nhận và phản hồi ban đầu đối với khiếu nại trong vòng 24 giờ kể từ khi nhận được yêu cầu có đủ thông tin để xác định vụ việc.",
      "Sau khi tiếp nhận, Cing Hu Tang Kinh Bắc sẽ kiểm tra thông tin, đối soát dữ liệu liên quan và trao đổi với khách hàng về kết quả hoặc các thông tin bổ sung cần thiết.",
      "Thời gian giải quyết hoàn toàn có thể thay đổi tùy mức độ phức tạp và việc cần phối hợp với ngân hàng, đơn vị thanh toán, vận chuyển hoặc bên cung cấp dịch vụ liên quan. Khách hàng sẽ được thông tin về tình trạng xử lý trong quá trình giải quyết.",
      "Cing Hu Tang Kinh Bắc ưu tiên giải quyết tranh chấp thông qua trao đổi và thỏa thuận thiện chí với khách hàng. Trường hợp hai bên không thể đạt được thỏa thuận, mỗi bên có quyền yêu cầu cơ quan nhà nước có thẩm quyền hoặc cơ chế giải quyết tranh chấp phù hợp theo quy định pháp luật.",
    ],
  },
  {
    title: "Chính sách bảo mật & dữ liệu cá nhân",
    content: [
      "Tùy tính năng khách hàng sử dụng, ứng dụng có thể xử lý các dữ liệu như số điện thoại, tên hiển thị, ảnh đại diện, email, ngày sinh, thông tin thành viên, địa chỉ giao hàng, lịch sử đơn hàng, thông tin giao dịch, hoạt động sử dụng ứng dụng và các dữ liệu cần thiết khác do khách hàng cung cấp hoặc phát sinh trong quá trình sử dụng dịch vụ.",
      "Dữ liệu được xử lý nhằm các mục đích như xác thực khách hàng, vận hành tài khoản, cung cấp chức năng ứng dụng, xử lý đơn hàng và thanh toán, giao hàng, quản lý chương trình thành viên, điểm tích lũy, lượt chơi, voucher và phần thưởng, hỗ trợ khách hàng, phòng chống gian lận, bảo đảm an toàn hệ thống, đối soát giao dịch và cải thiện chất lượng dịch vụ.",
      "Cing Hu Tang Kinh Bắc không bán dữ liệu cá nhân của khách hàng.",
      "Trong phạm vi cần thiết để cung cấp dịch vụ, dữ liệu có thể được chia sẻ hoặc xử lý bởi các đơn vị cung cấp hạ tầng kỹ thuật, nền tảng tích hợp, thanh toán, quản lý bán hàng, giao hàng hoặc các đối tác dịch vụ liên quan. Việc chia sẻ chỉ được thực hiện trong phạm vi cần thiết cho mục đích tương ứng hoặc theo yêu cầu của pháp luật.",
      "Dữ liệu được lưu trữ trong thời gian cần thiết để thực hiện các mục đích đã thông báo, giải quyết giao dịch, khiếu nại, bảo đảm an toàn hệ thống và đáp ứng nghĩa vụ lưu trữ theo quy định pháp luật. Khi không còn cần thiết, dữ liệu sẽ được xử lý theo chính sách và quy định pháp luật áp dụng.",
      "Khách hàng có thể yêu cầu được hỗ trợ xem xét, chỉnh sửa, cập nhật, hạn chế xử lý hoặc xóa dữ liệu cá nhân trong phạm vi pháp luật và khả năng kỹ thuật cho phép. Cing Hu Tang Kinh Bắc có thể yêu cầu xác minh chủ tài khoản trước khi thực hiện yêu cầu nhằm bảo vệ dữ liệu của khách hàng.",
      "Đối với hoạt động xử lý dữ liệu dựa trên sự đồng ý của khách hàng, khách hàng có thể yêu cầu rút lại sự đồng ý. Việc rút lại không làm ảnh hưởng đến tính hợp pháp của hoạt động xử lý đã được thực hiện trước thời điểm rút lại và có thể làm cho một số tính năng không thể tiếp tục cung cấp nếu dữ liệu đó là cần thiết để vận hành tính năng.",
      "Để gửi yêu cầu liên quan đến dữ liệu cá nhân, khách hàng có thể sử dụng “Chat với admin”, hotline 0989585355 hoặc email cing.app.vn@gmail.com.",
    ],
  },
  {
    title: "Thông báo và cập nhật chính sách",
    content: [
      "Các chính sách trên có thể được cập nhật khi tính năng, phương thức thanh toán, quy trình vận hành hoặc quy định pháp luật thay đổi.",
      "Phiên bản chính sách được hiển thị trên ứng dụng là phiên bản áp dụng tại thời điểm khách hàng truy cập. Những thay đổi quan trọng ảnh hưởng trực tiếp đến quyền và lợi ích của khách hàng sẽ được thông báo bằng hình thức phù hợp.",
    ],
  },
];

export default function LegalCenterPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        color: "#1a1a1a",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(135deg,#D4531C,#E8622A)",
          padding:
            "max(env(safe-area-inset-top,0px) + 12px, 52px) 16px 18px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
            style={{
              width: 38,
              height: 38,
              border: "none",
              borderRadius: 12,
              background: "rgba(255,255,255,0.18)",
              color: "white",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              Thông tin & chính sách
            </h1>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: 11,
                opacity: 0.78,
              }}
            >
              Cing Hu Tang Kinh Bắc
            </p>
          </div>
        </div>
      </header>

      <main
        style={{
          padding: "16px 16px 36px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#FFF7F2",
            border: "1px solid #F4D5C5",
            borderRadius: 18,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.65,
              color: "#6D3A24",
            }}
          >
            Trung tâm thông tin dành cho khách hàng sử dụng ứng dụng
            Cing. Vui lòng đọc các nội dung về giao dịch, thanh toán,
            quyền riêng tư và hỗ trợ trước khi sử dụng các tính năng
            liên quan.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section
            key={section.title}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "18px 16px",
              marginBottom: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: 15,
                fontWeight: 900,
                color: "#D4531C",
              }}
            >
              {section.title}
            </h2>

            {section.content.map((paragraph) => (
              <p
                key={paragraph}
                style={{
                  margin: "0 0 10px",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "#555",
                }}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div
          style={{
            textAlign: "center",
            padding: "10px 8px 0",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#aaa",
            }}
          >
            Cing Hu Tang Kinh Bắc
          </p>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 10,
              color: "#bbb",
            }}
          >
            Chủ thể kinh doanh: Hộ kinh doanh Nguyễn Duy Mạnh
          </p>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 10,
              color: "#bbb",
            }}
          >
            Cập nhật: 12/09/2026
          </p>
        </div>
      </main>
    </div>
  );
}
