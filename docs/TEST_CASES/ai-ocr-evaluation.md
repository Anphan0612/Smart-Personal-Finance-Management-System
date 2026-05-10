# AI / OCR Mini-Evaluation Dataset

Tai lieu nay quy dinh cach danh gia module OCR va AI chat theo huong metric-based,
khong danh gia cam tinh va khong test kieu dung/sai tuyet doi.

## 1) Muc tieu va pham vi

- Danh gia do on dinh OCR khi anh hoa don co chat luong khac nhau.
- Danh gia do chinh xac AI khi trich xuat intent va tra loi theo context tai chinh.
- Kiem soat rui ro hallucination, do tre phan hoi, va tinh nhat quan JSON output.

## 2) Pass/Fail criteria bat buoc

| Metric | Nguong dat |
|---|---|
| Amount accuracy | >= 90% |
| Date/Merchant accuracy | >= 80% |
| Category suggestion acceptable | >= 75% |
| Response latency | <= 5 giay |
| Hallucination rate | 0% |

**Rule chung:**
- Dat khi tat ca metric deu dat nguong.
- Neu 1 metric khong dat -> ket qua "Fail" va can action plan.

## 3) OCR dataset (20-30 anh)

| Group | Dieu kien anh | So mau de xuat |
|---|---|---|
| G1 | Anh ro, du sang, mat phang | 10 |
| G2 | Anh mo/nhieu/noise/thieu sang | 10 |
| G3 | Anh gay meo, nhaunat, mat 1 phan thong tin | 5-10 |

### 3.1 Truong can doi soat ground truth
- `amount`
- `date`
- `merchant`
- `currency` (neu co)
- `category` (nhan de xuat)

### 3.2 Mau bang ghi ket qua OCR

| Sample ID | Group | Amount GT | Amount Pred | Date GT | Date Pred | Merchant GT | Merchant Pred | Category Pred | Latency (s) | Pass/Fail |
|---|---|---|---|---|---|---|---|---|---|---|
| OCR-001 | G1 | ... | ... | ... | ... | ... | ... | ... | ... | ... |

## 4) NLP prompt dataset (20-30 prompt)

| Group | Muc tieu | So mau de xuat |
|---|---|---|
| N1 | Nhap lieu bang ngon ngu tu nhien | 8-10 |
| N2 | Hoi dap lich su chi tieu/thu nhap | 8-10 |
| N3 | Xin goi y, insight, canh bao | 8-10 |

### 4.1 Intent taxonomy de cham
- `QUERY` (truy van du lieu)
- `SUMMARY` (tong hop theo ky)
- `INSIGHT` (phan tich/xu huong/de xuat)
- `DEFAULT` (ngoai pham vi, fallback)

### 4.2 Mau bang ghi ket qua NLP

| Prompt ID | Prompt | Intent GT | Intent Pred | JSON format valid | Grounded answer | Hallucination | Latency (s) | Pass/Fail |
|---|---|---|---|---|---|---|---|---|
| NLP-001 | ... | QUERY | ... | Yes/No | Yes/No | Yes/No | ... | ... |

## 5) Quy trinh chay evaluation

1. Chot bo dataset va gan ID cho tung sample.
2. Chay OCR/NLP voi cung mot phien ban model.
3. Luu raw output de truy vet.
4. Cham ket qua theo bang mau o tren.
5. Tong hop metric va so voi nguong.
6. Lap danh sach cac case fail + nguyen nhan + de xuat fix.

## 6) Action plan neu fail

- **Fail amount/date/merchant accuracy:** bo sung preprocessing anh, bo loc OCR confidence.
- **Fail category acceptability:** cap nhat mapping category dictionary va prompt template.
- **Fail latency:** toi uu pipeline, cache ket qua, giam payload.
- **Co hallucination:** them rang buoc grounding, schema guard, va tu choi tra loi khi thieu du lieu.
