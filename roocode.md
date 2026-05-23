Chức năng: Khởi tạo/Nâng cấp một Single-Page Mobile Web-App (100% Pure Client-Side) tối tân mang tên "mrtungtrade" (mrtungtrade.vercel.app).
Tác giả hệ thống: NGUYỄN HOÀNG TÙNG (MrTungTrade2011).
Ngôn ngữ hiển thị UI: 100% Tiếng Việt chuyên môn tài chính cao cấp, cấu trúc rõ ràng, trực quan.

HÃY THIẾT KẾ VÀ VIẾT MÃ NGUỒN (HTML, CSS, JAVASCRIPT/TYPESCRIPT-REACT) KHÉP KÍN, ĐỒNG BỘ QUA ZUSTAND STATE MACHINE VỚI HỆ THỐNG QUÈT BÀO DỮ LIỆU ĐA TẦNG VÀ MA TRẬN PHÂN TÍCH CHUẨN 10 BƯỚC ĐỘC QUYỀN SAU:

---

## ⚡ 1. HỆ THỐNG BÀO TÌM KIẾM TIN TỨC VÀ VĨ MÔ KHÔNG BACKEND (WEB SCRAPER ENGINE)
Để cung cấp đủ chất liệu cho Ma trận 10 bước, hãy xây dựng một module ngầm chuyên "bào" dữ liệu trực thời từ internet qua Client-Side Fetch bọc qua các Proxy chống chặn CORS công cộng (như allorigins.win hoặc cors-anywhere):

### A. PHÂN HỆ CHỨNG KHOÁN VN (TOÀN BỘ SÀN HOSE, HNX, UPCOM)
- Tin tức & Vĩ mô: Fetch luồng tin tức trực tiếp từ RSS Feed của CafeF (`https://cafef.vn/thi-truong-chung-khoan.rss`) hoặc Vietstock. Tự động lọc các từ khóa liên quan đến mã đang quét (Ví dụ: "FPT", "cổ tức", "lợi nhuận", "ĐHĐCĐ") để trích xuất sự kiện.
- Hồ sơ doanh nghiệp & Nội lực 3T: Sử dụng API mở từ TCBS (`https://apipubcks.tcbs.com.vn/api/v1/ticker/...`) để cào các thông số tài chính cơ bản: Doanh thu, Lợi nhuận ròng (Check tăng trưởng > 15%), Nợ vay, và lịch sử giao dịch nội bộ/chia cổ tức.

### B. PHÂN HỆ CRYPTO (TOÀN BỘ SÀN BINANCE)
- Tin tức & Narrative: Fetch dữ liệu tin tức từ CryptoPanels hoặc RSS của CoinDesk. Tự động quét từ khóa để định hình Trend (AI, RWA, DePIN, L2, Layer1, Meme).
- Dấu vết On-chain & Cá mập: Tích hợp dữ liệu từ các API công cộng (như Binance Ticker 24h, CoinGecko Open API) để bóc tách:
  * Xu hướng dòng tiền: Phân tích khối lượng mua/bán chủ động dựa trên Delta Volume.
  * Lịch Vesting & Mở khóa: Cào thông tin cơ bản về cung lưu hành (Circulating Supply) và tổng cung để phát hiện áp lực xả nếu cung lưu hành < 20%.

---

## 🧠 2. MA TRẬN PHÂN TÍCH THUẬT TOÁN 10 BƯỚC (MR TUNG PROTOCOL ENGINE)
Mỗi mã tài sản sau khi được hàng đợi quét ngầm thu thập đủ dữ liệu Kỹ thuật + Vĩ mô + On-chain/Nội lực sẽ được chấm điểm tự động thông qua 10 bước nghiêm ngặt sau:

- Bước 1: Hồ sơ & Vĩ mô (Trọng số 10%) - Đánh giá sóng ngành, tin tức xúc tác tích cực, lịch sử chia cổ tức sòng phẳng (Stock) hoặc lịch Vesting/Lock-up an toàn (Crypto).
- Bước 2: Dấu vết Cá mập / On-chain (Trọng số 10%) - VN Stock: Lãnh đạo/Cổ đông lớn gom hàng. Crypto: Netflow rút sàn, ví Top tăng tích lũy, có Smart Money (Jump Crypto, Wintermute, Binance Labs...) nâng đỡ giá.
- Bước 3: Nội lực 3T (Trọng số 10%) - Tiền (Dòng tiền dương) | Tăng trưởng (Lợi nhuận > 15% hoặc Turnaround) | Tài sản (Nợ vay thấp, an toàn).
- Bước 4: Xu hướng & Sóng Elliott (Trọng số 10%) - Xác định vị thế Sóng 3 trên các khung lớn (Tháng/Tuần/Ngày), tìm kiếm tín hiệu BOS (Break of Structure) hoặc CHoCH (Change of Character) định hình xu hướng tăng vững chắc.
- Bước 5: Trục Định giá (Trọng số 10%) - So sánh giá hiện tại với Trục Anchored VWAP Năm và đường Basis 26. Nếu Basis 26 < Trục giá: Xác nhận giá đang rẻ/hợp lý để gom.
- Bước 6: Động lượng RSI/MFI (Trọng số 10%) - Kiểm tra vùng Quá mua/Quá bán và tín hiệu phân kỳ dương tạo đáy. Trừ điểm nặng nếu dính "Exhaustion Mode" (MFI > 80 và bắt đầu chúc đầu xuống khi giá tạo đỉnh ảo).
- Bước 7: Xu hướng đà HMA Slope (Trọng số 10%) - Tính toán độ dốc Hull Moving Average. HMA Slope > 0 (Đà tăng mạnh); HMA Slope <= 0 (Đà cạn, giảm giá).
- Bước 8: Cấu trúc Nến & Khối lượng (Trọng số 10%) - Thân nến tăng bắt buộc > 45% chiều dài nến và Khối lượng (Vol nến) phải vượt trung bình Vol MA26.
- Bước 9: Hành vi giá Hành động (Trọng số 10%) - Quét tìm sự xuất hiện của Breakaway Gap, Fair Value Gap (FVG), Price Trap (Quét thanh khoản đỉnh cũ rồi rút râu) hoặc Liquidity Sweep.
- Bước 10: Chiến thuật Vị thế (Trọng số 10%) - Tự động thiết lập vùng Entry (tại FVG/Gap), tính toán điểm dừng lỗ SL và chốt lời TP đảm bảo tỷ lệ Risk/Reward (R:R) luôn ≥ 1:2.

---

## 🎯 3. VIP RADAR COCKPIT - PHÂN TÁCH BIỆT LẬP & DUY TRÌ TỐI THIỂU 10 KÈO VÀNG
Nâng cấp giao diện Tab VIP Radar thành trung tâm lọc tối tân, chia làm 2 bảng độc lập: [KÈO VÀNG CHỨNG KHOÁN VN - TOÀN THỊ TRƯỜNG] và [KÈO VÀNG BINANCE CRYPTO - TOÀN CẦU].
- Bảng xếp hạng tự động sắp xếp theo tổng điểm 10 bước giảm dần. BẮT BUỘC duy trì hiển thị tối thiểu 10 mã mỗi bên.
- Nếu thị trường ảm đạm không đủ 10 mã đạt chuẩn Kèo Vàng (8.0 - 10.0), hệ thống sẽ tự động bốc các mã chấm điểm từ 7.0 - 7.9, gắn nhãn trạng thái "ĐANG NÉN / CHỜ KÍCH NỔ" để làm đầy bộ khung 10 vị thế.
- Tương tác nhanh: Người dùng chạm vào mã bất kỳ -> Hệ thống tự động chuyển sang Tab Dashboard, đồng bộ đồ thị Trading View Advanced và hiển thị bảng Check-list chi tiết trạng thái của từng bước trong 10 bước phân tích tại Tab Analysis.

---

## 📊 4. MÁY TÍNH P&L REAL-TIME & ĐỒNG BỘ SAO LƯU (TAB CALC & HISTORY)
- Tab Calc (Máy tính P&L): Tối giản tối đa thao tác nhập liệu. Người dùng chỉ cần điền Mã tài sản, Điểm vào lệnh (Entry Price) và chọn Đòn bẩy (Leverage nhanh: 1x, 5x, 10x, 20x). Hệ thống tự bốc giá thị trường real-time điền vào ô "Current Price" qua Binance WebSocket hoặc API giá để nhảy số P&L liên tục theo từng giây. Đơn vị: USD (Crypto), VND (VN Stock - tự động nhân 1,000 để chuẩn hóa).
- Tab History & Sao lưu JSON: Lưu giữ vị thế cá nhân qua LocalStorage, tự động chạy vòng lặp cập nhật giá danh mục sau mỗi 5 giây. Hiện cảnh báo "CẦN RÀ SOÁT LẠI THẾ NẾN" nếu vị thế ban đầu là Kèo Vàng nhưng hiện tại đang âm quá -5%.
- Sao lưu toàn diện: Tích hợp nút "Xuất dữ liệu Sao lưu (Export JSON)" đóng gói toàn bộ danh mục thành file `.json` tải về máy, và "Nhập dữ liệu Sao lưu (Import JSON)" để đọc file và nạp ngược lại bộ nhớ khi người dùng đổi thiết bị.

---

## 🔒 5. QUY TẮC ĐẦU RA BẮT BUỘC ĐỐI VỚI CORAL CODE
- Thực thi nghiêm ngặt định dạng thời gian thực [DD/MM/YYYY - HH:MM - UTC+7] trên mọi bảng hiển thị dữ liệu quét.
- Rà soát kỹ lưỡng toàn bộ lỗi cú pháp Javascript/Typescript trước khi xuất bản.
- Chèn cố định dòng bản quyền và kêu gọi hành động này dưới góc chân giao diện hệ thống:

"Like & Follow tài khoản MrTungTrade2011 trên Trading View, để liên tục cập nhật những đợt nâng cấp thuật toán tiếp theo, cũng như nhận thông báo sớm nhất về các bộ chỉ báo độc quyền khác đang được chia sẻ! 🔥"