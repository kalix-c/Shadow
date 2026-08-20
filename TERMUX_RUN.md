# تشغيل Shadow في Termux

لا يُرفع ملف `ShadowSetUp/ShadowState.json` إلى GitHub. احتفظ به محليًا على الهاتف داخل مجلد **Download** باسم `ShadowState.json`، ثم افتح Termux ونفذ الكتلة التالية مرة واحدة:

```bash
pkg update -y && pkg install nodejs git -y && termux-setup-storage
git clone https://github.com/kalix-c/Shadow.git
cd Shadow
bash scripts/run-termux.sh "$HOME/storage/downloads/ShadowState.json"
```

سيطلب Termux إذن الوصول للتخزين عند أول تشغيل؛ وافق عليه فقط. السكربت ينسخ ملف الجلسة من الهاتف إلى `ShadowSetUp/ShadowState.json` محليًا، يطبق أذونات خاصة عليه، يثبت الحزم عند الحاجة، ثم يشغل وضع Core. لا يطبع محتوى الملف ولا يرفعه ولا يضيفه إلى Git.

إذا كان ملف الجلسة في مسار مختلف، مرر المسار بدلاً من المسار الافتراضي:

```bash
bash scripts/run-termux.sh "/sdcard/Download/ShadowState.json"
```
