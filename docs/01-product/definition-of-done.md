# Tiêu chuẩn Hoàn thành (Definition of Done & Ready)

Với tư cách là Product Owner/Scrum Master, tôi quy định chặt chẽ các cam kết sau để đảm bảo chất lượng đồ án và tránh việc Code Conflict sát ngày nộp:

## 1. Definition of Ready (DoR) - Tiêu chuẩn để Dev bắt đầu code
Một User Story/Task ở file Backlog chỉ được Dev đưa sang trạng thái `In Progress` khi đáp ứng:
- [ ] Task phải có mô tả rõ ràng, DEV phải hiểu rõ mình định làm gì chứ không phỏng đoán.
- [ ] Interface Frontend/Backend phải chốt xong hợp đồng (API Contract) trên giấy/Postman trước khi viết Code. Tránh BE viết một kiểu nhưng FE lấy Data 1 kiểu.
- [ ] Không có Blocker. Nếu Task A phải chờ Task B, thì Task B phải ở trạng thái `Done` trước.

## 2. Definition of Done (DoD) - Tiêu chuẩn để hoàn tất Task
Một Task (hoặc User Story) chỉ được đánh dấu là `Done` và đưa vào Sprint Review khi ĐẦY ĐỦ các tiêu chí:
- [ ] **Code Runs:** Code chạy thành công trên máy Local (không có build error, không compile lỗi Java Spring Boot hoặc React).
- [ ] **Review (Git):** Pull Request (PR) phải có ít nhất 1 thành viên khác (hoặc Tech Lead) review nhanh qua. Tuyệt đối không Push đè code lộn xộn lên nhánh `main`.
- [ ] **Testing:** API phải được test trên Postman (thành công + lỗi). Frontend phải bấm click thử UI không chết.
- [ ] **Clean Code Framework:** Tuân thủ Java Spring Boot Clean Architecture (Logic không nhét vào Controller, Domain Service tách biệt).
- [ ] **PO/SM Verify:** Product Owner nghiệm thu bằng mắt hoặc kiểm tra trực tiếp qua màn hình chia sẻ (Screen share).
