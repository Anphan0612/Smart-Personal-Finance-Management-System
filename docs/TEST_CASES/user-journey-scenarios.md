# User Journey Scenarios

Tai lieu nay chua 11 kich ban End-to-End (E2E) bam sat trai nghiem nguoi dung thuc te.
Moi kich ban co the duoc chay doc lap, sau do ket hop thanh live demo flow.

## 1) Danh sach scenario

| ID | Scenario Name | Description | Priority |
|---|---|---|---|
| UJ-01 | Onboarding & Thiet lap | Dang ky -> Tao vi -> Tao ngan sach dau tien | P0 |
| UJ-02 | Ghi nhan chi tieu thu cong | Them giao dich tay -> Kiem tra so du va budget | P0 |
| UJ-03 | Quet hoa don OCR | Chup hoa don -> AI OCR -> Xac nhan -> Luu giao dich | P0 |
| UJ-04 | Tuong tac Chatbot AI | Hoi dap chi tieu -> Tra ve insight -> Mo Dashboard | P0 |
| UJ-05 | Canh bao vuot ngan sach | Tao giao dich vuot han muc -> Nhanh canh bao vuot budget | P1 |
| UJ-06 | Dang nhap & Session | Token het han -> Auto refresh hoac yeu cau dang nhap lai | P0 |
| UJ-07 | CRUD Giao dich | Sua/Xoa giao dich -> So lieu tong hop cap nhat dung | P1 |
| UJ-08 | Chuyen tien noi bo | Chuyen tien giua 2 vi -> So du hai vi cap nhat dung | P1 |
| UJ-09 | Quan ly thu nhap | Them thu nhap dinh ky -> Tong thu nhap duoc cap nhat | P1 |
| UJ-10 | Bao cao tong hop | Xem thong ke theo thang/nam -> Export (neu co) | P1 |
| UJ-11 | Ngoai le he thong | Mat mang/API loi -> Hien thi loading va retry hop ly | P2 |

## 2) Tieu chuan ghi ket qua

- Ket qua: `Pass` / `Fail` / `Blocked`.
- Neu `Fail`: ghi bug id, mo ta ngan gon, buoc tai hien, muc do uu tien.
- Neu `Blocked`: ghi ro ly do (env, data, service down) va owner xu ly.

## 2.1) Execution tracking (batch 2026-05-06)

| Scenario ID | Status | Note |
|---|---|---|
| UJ-01 | In Progress | Da xac nhan login vao app thanh cong; chua verify day du buoc tao vi + tao budget trong batch nay. |
| UJ-02 | In Progress | Chua ghi nhan giao dich thu cong day du trong batch nay. |
| UJ-03 | Not Run | Chua chay OCR trong batch nay. |
| UJ-04 | In Progress | Da co API du lieu dashboard/transactions sau login; chua chay hoi-dap chat end-to-end. |
| UJ-05 | Not Run | Chua thuc thi. |
| UJ-06 | In Progress | Da xac nhan login API thanh cong, chua test token expire/refresh thuc te. |
| UJ-07 | Not Run | Chua thuc thi. |
| UJ-08 | Not Run | Chua thuc thi. |
| UJ-09 | Not Run | Chua thuc thi. |
| UJ-10 | Not Run | Chua thuc thi. |
| UJ-11 | Not Run | Chua thuc thi. |

## 3) Chi tiet scenario

### UJ-01: Onboarding & Thiet lap (P0)
- **Muc tieu:** Nguoi dung moi co the khoi tao tai khoan va du lieu tai chinh co ban.
- **Tien dieu kien:** Chua co tai khoan voi email test.
- **Test data:** `qa.demo+01@mail.com`, mat khau hop le, vi "Tien mat", budget "An uong".
- **Buoc test:**
  1. Mo app -> Dang ky tai khoan moi.
  2. Dang nhap vao he thong.
  3. Tao vi "Tien mat" voi so du khoi tao.
  4. Tao budget "An uong" theo thang hien tai.
- **Expected result:**
  - Dang ky va dang nhap thanh cong.
  - Vi moi hien dung trong danh sach vi.
  - Budget moi hien dung category va han muc.

### UJ-02: Ghi nhan chi tieu thu cong (P0)
- **Muc tieu:** Kiem tra logic them giao dich va cap nhat so du/budget.
- **Tien dieu kien:** Da co it nhat 1 vi va 1 budget.
- **Test data:** Expense 120000 VND, category An uong, wallet Tien mat.
- **Buoc test:**
  1. Mo man hinh tao giao dich.
  2. Nhap so tien, category, ngay gio, ghi chu.
  3. Luu giao dich.
  4. Mo lai Wallet/Budget/Dashboard.
- **Expected result:**
  - Giao dich duoc luu dung du lieu.
  - So du vi giam dung theo so tien giao dich.
  - Budget da dung tang theo muc chi.

### UJ-03: Quet hoa don OCR (P0)
- **Muc tieu:** Kiem tra luong OCR -> AI suggest -> luu giao dich.
- **Tien dieu kien:** Da dang nhap, camera permission da cap.
- **Test data:** 1 anh hoa don mau (ro chu), co so tien va ngay.
- **Buoc test:**
  1. Mo tinh nang quet hoa don.
  2. Chup/nhap anh hoa don.
  3. Cho AI OCR xu ly.
  4. Kiem tra field amount/date/merchant/category goi y.
  5. Chinh sua neu can va bam luu.
- **Expected result:**
  - OCR tra ve du lieu co cau truc.
  - Nguoi dung co the sua truoc khi luu.
  - Giao dich tao thanh cong va hien trong lich su.

### UJ-04: Tuong tac Chatbot AI (P0)
- **Muc tieu:** Kiem tra AI tra loi dung context du lieu nguoi dung.
- **Tien dieu kien:** Da co giao dich lich su.
- **Test data:** Prompt "Tuan nay toi tieu bao nhieu cho an uong?".
- **Buoc test:**
  1. Mo man hinh AI chat.
  2. Nhap cau hoi ve chi tieu.
  3. Gui yeu cau va cho phan hoi.
  4. Bam action "Xem Dashboard" neu co.
- **Expected result:**
  - AI tra loi co so lieu phu hop du lieu hien co.
  - Khong tao thong tin tai chinh khong ton tai.
  - Chuyen huong sang dashboard hoat dong dung.

### UJ-05: Canh bao vuot ngan sach (P1)
- **Muc tieu:** Kiem tra canh bao khi chi tieu vuot limit.
- **Tien dieu kien:** Da co budget con lai thap.
- **Buoc test:**
  1. Tao giao dich moi vuot phan con lai budget.
  2. Luu giao dich.
  3. Kiem tra thong bao/canh bao tren giao dien.
- **Expected result:**
  - He thong danh dau budget vuot han muc.
  - Canh bao hien ro rang, khong crash giao dien.

### UJ-06: Dang nhap & Session (P0)
- **Muc tieu:** Xac minh co che refresh token/session resilience.
- **Tien dieu kien:** Da dang nhap hop le.
- **Buoc test:**
  1. Thuc hien hanh dong can goi API sau khi access token het han.
  2. Kiem tra app tu refresh token.
  3. Neu refresh fail, app dieu huong ve dang nhap.
- **Expected result:**
  - Refresh thanh cong: request duoc thuc thi lai.
  - Refresh that bai: user duoc dang xuat an toan.

### UJ-07: CRUD Giao dich (P1)
- **Muc tieu:** Kiem tra tinh nhat quan khi sua/xoa giao dich.
- **Tien dieu kien:** Da co it nhat 2 giao dich.
- **Buoc test:**
  1. Chon 1 giao dich -> sua so tien/category.
  2. Kiem tra Wallet/Budget/Dashboard cap nhat.
  3. Xoa 1 giao dich khac.
  4. Kiem tra lai tong chi va lich su.
- **Expected result:**
  - Sua/xoa thanh cong, du lieu tong hop cap nhat dung.
  - Khong con item ghost sau khi xoa.

### UJ-08: Chuyen tien noi bo (P1)
- **Muc tieu:** Kiem tra nghiep vu transfer giua vi.
- **Tien dieu kien:** Co 2 vi va vi nguon du so du.
- **Buoc test:**
  1. Mo tinh nang chuyen tien.
  2. Chon vi nguon, vi dich, so tien, ghi chu.
  3. Xac nhan giao dich.
- **Expected result:**
  - Vi nguon giam, vi dich tang cung mot so tien.
  - Tao lich su transfer/day buoc doi ung neu co.

### UJ-09: Quan ly thu nhap (P1)
- **Muc tieu:** Kiem tra luong them khoan thu nhap va thong ke.
- **Tien dieu kien:** Da co vi nhan thu nhap.
- **Buoc test:**
  1. Tao thu nhap moi (luong/thuong/freelance).
  2. Neu co recurrence: dat lap lai hang thang.
  3. Kiem tra dashboard va lich su.
- **Expected result:**
  - Thu nhap duoc luu dung.
  - Tong thu nhap cap nhat dung trong bao cao.

### UJ-10: Bao cao tong hop (P1)
- **Muc tieu:** Kiem tra thong ke theo ky va kha nang export.
- **Tien dieu kien:** Da co du lieu giao dich >= 1 thang.
- **Buoc test:**
  1. Mo man hinh bao cao.
  2. Loc theo thang va nam.
  3. Doi qua lai cac bo loc.
  4. Export bao cao (neu co).
- **Expected result:**
  - So lieu tong hop khop voi lich su giao dich.
  - Export thanh cong, file khong loi.

### UJ-11: Ngoai le he thong (P2)
- **Muc tieu:** Kiem tra kha nang chiu loi cua app.
- **Tien dieu kien:** App dang hoat dong binh thuong.
- **Buoc test:**
  1. Tat mang truoc khi goi API.
  2. Kiem tra thong bao loi va nut retry.
  3. Bat lai mang, bam retry.
- **Expected result:**
  - Hien thi loading/error state dung.
  - Retry thanh cong khi co mang tro lai.
  - App khong bi treo/crash.
